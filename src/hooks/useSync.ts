import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Audiobook, Bookmark } from '@/types/audiobook';
import { useToast } from '@/hooks/use-toast';

const SYNC_CODE_KEY = 'audiobook-sync-code';
const DEVICE_ID_KEY = 'audiobook-device-id';

// Generate a secure UUID-based sync code (much harder to guess than 6 chars)
function generateSyncCode(): string {
  return crypto.randomUUID();
}

// Generate a unique device ID
function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export function useSync() {
  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const { toast } = useToast();

  // Load sync code from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SYNC_CODE_KEY);
    if (saved) {
      setSyncCode(saved);
      setIsConnected(true);
    }
  }, []);

  // Generate a new sync code
  const createSyncCode = useCallback(async () => {
    const newCode = generateSyncCode();
    const deviceId = getOrCreateDeviceId();
    
    try {
      // Register this device
      const { error } = await supabase.from('sync_devices').insert({
        sync_code: newCode,
        device_name: navigator.userAgent.includes('Android') ? 'Android Phone' : 
                     navigator.userAgent.includes('iPhone') ? 'iPhone' : 
                     navigator.userAgent.includes('iPad') ? 'iPad' : 'Computer',
      });

      if (error) throw error;

      localStorage.setItem(SYNC_CODE_KEY, newCode);
      setSyncCode(newCode);
      setIsConnected(true);

      toast({
        title: 'Sync code created',
        description: `Your sync code is: ${newCode}`,
      });

      return newCode;
    } catch (err) {
      console.error('Failed to create sync code:', err);
      toast({
        title: 'Failed to create sync code',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  // Join with an existing sync code
  const joinWithCode = useCallback(async (code: string) => {
    const normalizedCode = code.toLowerCase().trim();
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(normalizedCode)) {
      toast({
        title: 'Invalid code',
        description: 'Please enter a valid sync code',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Check if code exists using secure RPC function (prevents enumeration)
      const { data: exists, error: checkError } = await supabase
        .rpc('check_sync_code_exists', { p_sync_code: normalizedCode });

      if (checkError) throw checkError;

      if (!exists) {
        toast({
          title: 'Code not found',
          description: 'No devices are using this sync code yet',
          variant: 'destructive',
        });
        return false;
      }

      // Register this device
      await supabase.from('sync_devices').insert({
        sync_code: normalizedCode,
        device_name: navigator.userAgent.includes('Android') ? 'Android Phone' : 
                     navigator.userAgent.includes('iPhone') ? 'iPhone' : 
                     navigator.userAgent.includes('iPad') ? 'iPad' : 'Computer',
      });

      localStorage.setItem(SYNC_CODE_KEY, normalizedCode);
      setSyncCode(normalizedCode);
      setIsConnected(true);

      toast({
        title: 'Connected!',
        description: 'Your library will now sync across devices',
      });

      return true;
    } catch (err) {
      console.error('Failed to join sync:', err);
      toast({
        title: 'Failed to connect',
        description: 'Please check the code and try again',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  // Disconnect from sync
  const disconnect = useCallback(() => {
    localStorage.removeItem(SYNC_CODE_KEY);
    setSyncCode(null);
    setIsConnected(false);
    setLastSynced(null);
    
    toast({
      title: 'Disconnected',
      description: 'Sync has been disabled',
    });
  }, [toast]);

  // Push library to cloud
  const pushLibrary = useCallback(async (books: Audiobook[]) => {
    if (!syncCode) return;
    
    setIsSyncing(true);
    try {
      for (const book of books) {
        // Upsert book data
        await supabase.from('sync_library').upsert({
          sync_code: syncCode,
          book_id: book.id,
          title: book.title,
          author: book.author,
          cover_url: book.coverUrl,
          duration: book.duration,
          current_position: book.currentPosition,
          playback_speed: book.playbackSpeed,
          status: book.status,
          date_added: book.dateAdded.toISOString(),
          last_played: book.lastPlayed?.toISOString() || null,
          date_finished: book.dateFinished?.toISOString() || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'sync_code,book_id',
        });

        // Sync bookmarks
        for (const bookmark of book.bookmarks) {
          await supabase.from('sync_bookmarks').upsert({
            sync_code: syncCode,
            book_id: book.id,
            bookmark_id: bookmark.id,
            position: bookmark.position,
            note: bookmark.note,
            created_at: bookmark.createdAt.toISOString(),
          }, {
            onConflict: 'sync_code,book_id,bookmark_id',
          });
        }
      }

      setLastSynced(new Date());
    } catch (err) {
      console.error('Failed to push library:', err);
      toast({
        title: 'Sync failed',
        description: 'Could not upload library data',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  }, [syncCode, toast]);

  // Pull library from cloud
  const pullLibrary = useCallback(async (): Promise<Partial<Audiobook>[] | null> => {
    if (!syncCode) return null;
    
    setIsSyncing(true);
    try {
      // Fetch library
      const { data: libraryData, error: libError } = await supabase
        .from('sync_library')
        .select('*')
        .eq('sync_code', syncCode);

      if (libError) throw libError;

      // Fetch all bookmarks
      const { data: bookmarksData, error: bmError } = await supabase
        .from('sync_bookmarks')
        .select('*')
        .eq('sync_code', syncCode);

      if (bmError) throw bmError;

      // Group bookmarks by book
      const bookmarksByBook = new Map<string, Bookmark[]>();
      for (const bm of bookmarksData || []) {
        const existing = bookmarksByBook.get(bm.book_id) || [];
        existing.push({
          id: bm.bookmark_id,
          position: Number(bm.position),
          note: bm.note || '',
          createdAt: new Date(bm.created_at),
        });
        bookmarksByBook.set(bm.book_id, existing);
      }

      // Convert to Audiobook format
      const books: Partial<Audiobook>[] = (libraryData || []).map(item => ({
        id: item.book_id,
        title: item.title,
        author: item.author || 'Unknown Author',
        coverUrl: item.cover_url || '',
        duration: Number(item.duration),
        currentPosition: Number(item.current_position),
        playbackSpeed: Number(item.playback_speed),
        status: item.status as 'new' | 'started' | 'finished',
        dateAdded: new Date(item.date_added),
        lastPlayed: item.last_played ? new Date(item.last_played) : undefined,
        dateFinished: item.date_finished ? new Date(item.date_finished) : undefined,
        bookmarks: bookmarksByBook.get(item.book_id) || [],
      }));

      setLastSynced(new Date());
      return books;
    } catch (err) {
      console.error('Failed to pull library:', err);
      toast({
        title: 'Sync failed',
        description: 'Could not download library data',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [syncCode, toast]);

  // Update a single book's progress
  const syncProgress = useCallback(async (book: Audiobook) => {
    if (!syncCode) return;
    
    try {
      await supabase.from('sync_library').upsert({
        sync_code: syncCode,
        book_id: book.id,
        title: book.title,
        author: book.author,
        cover_url: book.coverUrl,
        duration: book.duration,
        current_position: book.currentPosition,
        playback_speed: book.playbackSpeed,
        status: book.status,
        date_added: book.dateAdded.toISOString(),
        last_played: book.lastPlayed?.toISOString() || null,
        date_finished: book.dateFinished?.toISOString() || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'sync_code,book_id',
      });
    } catch (err) {
      console.error('Failed to sync progress:', err);
    }
  }, [syncCode]);

  return {
    syncCode,
    isConnected,
    isSyncing,
    lastSynced,
    createSyncCode,
    joinWithCode,
    disconnect,
    pushLibrary,
    pullLibrary,
    syncProgress,
  };
}
