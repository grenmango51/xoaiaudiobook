import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/Header';
import { Library } from '@/components/Library';
import { NowPlaying } from '@/components/NowPlaying';
import { MiniPlayer } from '@/components/MiniPlayer';
import { UploadDialog } from '@/components/UploadDialog';
import { AudioElement } from '@/components/AudioElement';
import { useLibrary } from '@/hooks/useLibrary';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Audiobook } from '@/types/audiobook';
import { toast } from '@/hooks/use-toast';
import { getAudioFile, createAudioUrl, revokeAudioUrl } from '@/utils/audioStorage';

const Index = () => {
  const {
    books,
    currentBook,
    setCurrentBook,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    addBooks,
    stats,
    updateBookProgress,
    addBookmark,
    removeBookmark,
    setPlaybackSpeed,
    deleteBook,
    updateBookCover,
  } = useLibrary();

  const {
    playerState,
    initAudio,
    loadAudio,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    setPlaybackSpeed: setPlayerSpeed,
    setSleepTimer,
    getCurrentTime,
  } = useAudioPlayer();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const currentAudioUrlRef = useRef<string | null>(null);

  // Handle audio element initialization
  const handleAudioInit = useCallback((audio: HTMLAudioElement) => {
    initAudio(audio);
    setAudioReady(true);
  }, [initAudio]);

  // Load audio when book changes
  useEffect(() => {
    if (!currentBook || !audioReady) return;

    const loadBookAudio = async () => {
      // Revoke previous URL if exists
      if (currentAudioUrlRef.current) {
        revokeAudioUrl(currentAudioUrlRef.current);
        currentAudioUrlRef.current = null;
      }

      // Try to get audio from IndexedDB first
      const storedAudio = await getAudioFile(currentBook.id);
      
      if (storedAudio) {
        const url = createAudioUrl(storedAudio);
        currentAudioUrlRef.current = url;
        loadAudio(url, currentBook.currentPosition, currentBook.playbackSpeed);
      } else if (currentBook.audioUrl) {
        // Fallback to audioUrl (for freshly uploaded files before page reload)
        loadAudio(currentBook.audioUrl, currentBook.currentPosition, currentBook.playbackSpeed);
      } else {
        // Sample book without audio
        toast({
          title: "No audio file",
          description: "This is a sample book. Upload your own audiobooks to listen!",
          variant: "destructive",
        });
      }
    };

    loadBookAudio();
  }, [currentBook?.id, audioReady, loadAudio]);

  // Save progress periodically
  useEffect(() => {
    if (!currentBook) return;
    
    const saveInterval = setInterval(() => {
      const currentTime = getCurrentTime();
      if (currentTime > 0) {
        updateBookProgress(currentBook.id, currentTime);
      }
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [currentBook, getCurrentTime, updateBookProgress]);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (currentAudioUrlRef.current) {
        revokeAudioUrl(currentAudioUrlRef.current);
      }
    };
  }, []);

  const handlePlayBook = useCallback((book: Audiobook) => {
    setCurrentBook(book);
    setPlayerSpeed(book.playbackSpeed);
    setIsPlayerExpanded(true);
  }, [setCurrentBook, setPlayerSpeed]);

  const handleSeek = useCallback((time: number) => {
    seek(time);
  }, [seek]);

  const handleSkipForward = useCallback(() => {
    skipForward(15);
  }, [skipForward]);

  const handleSkipBackward = useCallback(() => {
    skipBackward(15);
  }, [skipBackward]);

  const handleSpeedChange = useCallback((speed: number) => {
    if (currentBook) {
      setPlaybackSpeed(currentBook.id, speed);
    }
    setPlayerSpeed(speed);
  }, [currentBook, setPlaybackSpeed, setPlayerSpeed]);

  const handleAddBookmark = useCallback((note: string) => {
    if (currentBook) {
      const currentTime = getCurrentTime();
      addBookmark(currentBook.id, { position: currentTime, note });
    }
  }, [currentBook, getCurrentTime, addBookmark]);

  const handleGoToBookmark = useCallback((position: number) => {
    handleSeek(position);
  }, [handleSeek]);

  const handleRemoveBookmark = useCallback((bookmarkId: string) => {
    if (currentBook) {
      removeBookmark(currentBook.id, bookmarkId);
    }
  }, [currentBook, removeBookmark]);

  const handleDeleteBook = useCallback(async (bookId: string) => {
    // If deleting the currently playing book, stop and clear it
    if (currentBook?.id === bookId) {
      // Revoke audio URL
      if (currentAudioUrlRef.current) {
        revokeAudioUrl(currentAudioUrlRef.current);
        currentAudioUrlRef.current = null;
      }
      setCurrentBook(null);
      setIsPlayerExpanded(false);
    }
    await deleteBook(bookId);
    toast({
      title: 'Book deleted',
      description: 'The audiobook has been removed from your library.',
    });
  }, [currentBook?.id, deleteBook, setCurrentBook]);

  const handleUploadFiles = useCallback(async (files: File[]) => {
    await addBooks(files);
    toast({
      title: 'Books added!',
      description: `Successfully added ${files.length} audiobook${files.length !== 1 ? 's' : ''} to your library.`,
    });
  }, [addBooks]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hidden audio element for playback */}
      <AudioElement onInit={handleAudioInit} />

      <Header onUpload={() => setIsUploadOpen(true)} />
      
      <Library
        books={books}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterBy={filterBy}
        onFilterChange={setFilterBy}
        stats={stats}
        onPlayBook={handlePlayBook}
        onDeleteBook={handleDeleteBook}
        onChangeCover={updateBookCover}
      />

      {/* Upload Dialog */}
      <UploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUpload={handleUploadFiles}
      />

      {/* Mini Player */}
      {currentBook && !isPlayerExpanded && (
        <MiniPlayer
          book={currentBook}
          isPlaying={playerState.isPlaying}
          currentTime={playerState.currentTime}
          onTogglePlay={togglePlay}
          onSkipForward={handleSkipForward}
          onExpand={() => setIsPlayerExpanded(true)}
        />
      )}

      {/* Full Player */}
      {currentBook && isPlayerExpanded && (
        <NowPlaying
          book={currentBook}
          isPlaying={playerState.isPlaying}
          currentTime={playerState.currentTime}
          playbackSpeed={playerState.playbackSpeed}
          sleepTimer={playerState.sleepTimer}
          onTogglePlay={togglePlay}
          onSeek={handleSeek}
          onSkipForward={handleSkipForward}
          onSkipBackward={handleSkipBackward}
          onSpeedChange={handleSpeedChange}
          onSleepTimerChange={setSleepTimer}
          onAddBookmark={handleAddBookmark}
          onGoToBookmark={handleGoToBookmark}
          onRemoveBookmark={handleRemoveBookmark}
          onClose={() => setIsPlayerExpanded(false)}
        />
      )}

      {/* Bottom padding when mini player is visible */}
      {currentBook && !isPlayerExpanded && <div className="h-20" />}
    </div>
  );
};

export default Index;
