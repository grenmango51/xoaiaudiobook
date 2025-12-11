import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FolderOpen, Music, Check, Loader2, AlertCircle, FolderSync } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  supportsFileHandles, 
  storeDirectoryHandle,
  getAudioFilesFromHandle 
} from '@/utils/fileHandleStorage';
import { getAudioDuration, generateCoverUrl, parseFileName } from '@/utils/audioUtils';
import { Audiobook } from '@/types/audiobook';

interface ScannedFolder {
  name: string;
  handle: FileSystemDirectoryHandle;
  fileCount: number;
  fileNames: string[];
  selected: boolean;
}

// Helper to get directory handle with proper typing
async function getDirectoryHandle(parent: FileSystemDirectoryHandle, name: string): Promise<FileSystemDirectoryHandle> {
  return (parent as any).getDirectoryHandle(name);
}

interface FolderAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBooksAdded: (books: Audiobook[]) => void;
}

export function FolderAccessDialog({ open, onOpenChange, onBooksAdded }: FolderAccessDialogProps) {
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [scannedFolders, setScannedFolders] = useState<ScannedFolder[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0, bookName: '' });
  const [error, setError] = useState<string | null>(null);

  const isSupported = supportsFileHandles();

  const handleSelectFolder = async () => {
    if (!isSupported) return;
    
    setScanning(true);
    setError(null);
    setScannedFolders([]);

    try {
      const dirHandle = await (window as any).showDirectoryPicker({ mode: 'read' }) as FileSystemDirectoryHandle;
      const folders: ScannedFolder[] = [];

      // Scan for subfolders containing audio files using entries()
      const entries = (dirHandle as any).entries ? 
        (dirHandle as any).entries() : 
        (dirHandle as any).values();

      for await (const entry of entries) {
        const handle = Array.isArray(entry) ? entry[1] : entry;
        const name = Array.isArray(entry) ? entry[0] : handle.name;
        
        if (handle.kind === 'directory') {
          const subDirHandle = await getDirectoryHandle(dirHandle, name);
          const files = await getAudioFilesFromHandle(subDirHandle);
          
          if (files.length > 0) {
            folders.push({
              name,
              handle: subDirHandle,
              fileCount: files.length,
              fileNames: files.map(f => f.name),
              selected: true,
            });
          }
        }
      }

      // Also check root folder for audio files
      const rootFiles = await getAudioFilesFromHandle(dirHandle);
      if (rootFiles.length > 0) {
        folders.unshift({
          name: (dirHandle as any).name || 'Root',
          handle: dirHandle,
          fileCount: rootFiles.length,
          fileNames: rootFiles.map(f => f.name),
          selected: true,
        });
      }

      if (folders.length === 0) {
        setError('No audiobook folders found. Make sure your folders contain audio files (MP3, M4A, M4B, etc.)');
      }

      setScannedFolders(folders);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError('Failed to access folder. Please try again.');
        console.error('Folder access error:', err);
      }
    } finally {
      setScanning(false);
    }
  };

  const toggleFolder = (index: number) => {
    setScannedFolders(prev => prev.map((folder, i) => 
      i === index ? { ...folder, selected: !folder.selected } : folder
    ));
  };

  const handleImport = async () => {
    const selectedFolders = scannedFolders.filter(f => f.selected);
    if (selectedFolders.length === 0) return;

    setImporting(true);
    setProgress({ current: 0, total: selectedFolders.length, bookName: '' });

    const newBooks: Audiobook[] = [];

    for (let i = 0; i < selectedFolders.length; i++) {
      const folder = selectedFolders[i];
      setProgress({ current: i + 1, total: selectedFolders.length, bookName: folder.name });

      try {
        const bookId = `handle-${crypto.randomUUID()}`;
        
        // Store just the handle reference (not the file data!)
        await storeDirectoryHandle(bookId, folder.handle, folder.fileNames);

        // Get first file to extract duration (quick read, not stored)
        const files = await getAudioFilesFromHandle(folder.handle);
        let totalDuration = 0;
        const chapters: { id: string; title: string; startTime: number; endTime: number }[] = [];

        // Get durations for chapters
        for (let j = 0; j < files.length; j++) {
          const file = files[j];
          const duration = await getAudioDuration(file);
          chapters.push({
            id: `ch-${j + 1}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            startTime: totalDuration,
            endTime: totalDuration + duration,
          });
          totalDuration += duration;
        }

        const { title, author } = parseFileName(folder.name);

        const book: Audiobook = {
          id: bookId,
          title: title || folder.name,
          author,
          coverUrl: generateCoverUrl(folder.name),
          description: `${folder.fileCount} file${folder.fileCount !== 1 ? 's' : ''} • Direct access`,
          duration: totalDuration,
          currentPosition: 0,
          status: 'new',
          dateAdded: new Date(),
          chapters,
          bookmarks: [],
          playbackSpeed: 1.0,
          // No audioUrl stored - will be created on-demand during playback
        };

        newBooks.push(book);
      } catch (err) {
        console.error(`Failed to import ${folder.name}:`, err);
      }
    }

    if (newBooks.length > 0) {
      onBooksAdded(newBooks);
    }

    setImporting(false);
    setScannedFolders([]);
    onOpenChange(false);
  };

  const selectedCount = scannedFolders.filter(f => f.selected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderSync className="h-5 w-5 text-primary" />
            Access Audiobook Folders
          </DialogTitle>
        </DialogHeader>

        {!isSupported ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="text-sm">
                <p className="font-medium">Not Supported</p>
                <p className="text-muted-foreground">
                  Your browser doesn't support direct file access. Try using Chrome on Android.
                </p>
              </div>
            </div>
          </div>
        ) : importing ? (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 font-medium">Linking audiobooks...</p>
              <p className="text-sm text-muted-foreground">
                {progress.current} of {progress.total}
              </p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {progress.bookName}
              </p>
            </div>
          </div>
        ) : scannedFolders.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {scannedFolders.length} audiobook folder{scannedFolders.length !== 1 ? 's' : ''}. 
              Select which ones to add:
            </p>

            <ScrollArea className="h-64 rounded-md border">
              <div className="p-2 space-y-1">
                {scannedFolders.map((folder, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer"
                    onClick={() => toggleFolder(index)}
                  >
                    <Checkbox checked={folder.selected} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{folder.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {folder.fileCount} file{folder.fileCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {folder.selected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleSelectFolder}>
                Rescan
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleImport}
                disabled={selectedCount === 0}
              >
                Add {selectedCount} Book{selectedCount !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">No files copied</p>
                <p className="text-sm text-muted-foreground">
                  Audio stays on your device. The app just reads it when you play.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleSelectFolder}
              disabled={scanning}
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Select Audiobooks Folder
                </>
              )}
            </Button>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Tip:</strong> Organize your audiobooks with each book in its own folder. 
                Multiple audio files in a folder become chapters.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
