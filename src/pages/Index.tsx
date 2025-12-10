import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Library } from '@/components/Library';
import { NowPlaying } from '@/components/NowPlaying';
import { MiniPlayer } from '@/components/MiniPlayer';
import { useLibrary } from '@/hooks/useLibrary';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Audiobook } from '@/types/audiobook';

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
    stats,
    updateBookProgress,
    addBookmark,
    removeBookmark,
    setPlaybackSpeed,
  } = useLibrary();

  const {
    playerState,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    setPlaybackSpeed: setPlayerSpeed,
    setSleepTimer,
  } = useAudioPlayer();

  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState(0);

  // Simulate playback progress
  useEffect(() => {
    if (!currentBook) return;
    setSimulatedTime(currentBook.currentPosition);
  }, [currentBook?.id]);

  useEffect(() => {
    if (!playerState.isPlaying || !currentBook) return;

    const interval = setInterval(() => {
      setSimulatedTime((prev) => {
        const newTime = prev + playerState.playbackSpeed;
        if (newTime >= currentBook.duration) {
          togglePlay();
          return currentBook.duration;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [playerState.isPlaying, playerState.playbackSpeed, currentBook, togglePlay]);

  // Save progress periodically
  useEffect(() => {
    if (!currentBook) return;
    
    const saveInterval = setInterval(() => {
      updateBookProgress(currentBook.id, simulatedTime);
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [currentBook, simulatedTime, updateBookProgress]);

  const handlePlayBook = useCallback((book: Audiobook) => {
    setCurrentBook(book);
    setSimulatedTime(book.currentPosition);
    setPlayerSpeed(book.playbackSpeed);
    setIsPlayerExpanded(true);
  }, [setCurrentBook, setPlayerSpeed]);

  const handleSeek = useCallback((time: number) => {
    setSimulatedTime(time);
    seek(time);
  }, [seek]);

  const handleSkipForward = useCallback(() => {
    setSimulatedTime((prev) => Math.min(prev + 15, currentBook?.duration || 0));
    skipForward(15);
  }, [skipForward, currentBook]);

  const handleSkipBackward = useCallback(() => {
    setSimulatedTime((prev) => Math.max(prev - 15, 0));
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
      addBookmark(currentBook.id, { position: simulatedTime, note });
    }
  }, [currentBook, simulatedTime, addBookmark]);

  const handleGoToBookmark = useCallback((position: number) => {
    handleSeek(position);
  }, [handleSeek]);

  const handleRemoveBookmark = useCallback((bookmarkId: string) => {
    if (currentBook) {
      removeBookmark(currentBook.id, bookmarkId);
    }
  }, [currentBook, removeBookmark]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
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
      />

      {/* Mini Player */}
      {currentBook && !isPlayerExpanded && (
        <MiniPlayer
          book={currentBook}
          isPlaying={playerState.isPlaying}
          currentTime={simulatedTime}
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
          currentTime={simulatedTime}
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
