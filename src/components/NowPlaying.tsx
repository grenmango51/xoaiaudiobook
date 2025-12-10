import { Audiobook } from '@/types/audiobook';
import { PlayerControls } from './PlayerControls';
import { SpeedControl } from './SpeedControl';
import { SleepTimer } from './SleepTimer';
import { BookmarkButton } from './BookmarkButton';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { formatTime, formatDuration } from '@/utils/formatTime';
import { ChevronDown, List, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface NowPlayingProps {
  book: Audiobook;
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  sleepTimer: number | null;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onSpeedChange: (speed: number) => void;
  onSleepTimerChange: (minutes: number | null) => void;
  onAddBookmark: (note: string) => void;
  onGoToBookmark: (position: number) => void;
  onRemoveBookmark: (id: string) => void;
  onClose: () => void;
}

export function NowPlaying({
  book,
  isPlaying,
  currentTime,
  playbackSpeed,
  sleepTimer,
  onTogglePlay,
  onSeek,
  onSkipForward,
  onSkipBackward,
  onSpeedChange,
  onSleepTimerChange,
  onAddBookmark,
  onGoToBookmark,
  onRemoveBookmark,
  onClose,
}: NowPlayingProps) {
  const [showChapters, setShowChapters] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Find current chapter
  const currentChapter = book.chapters.find(
    (ch) => currentTime >= ch.startTime && currentTime < ch.endTime
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background animate-slide-up">
      {/* Background with Cover Art Blur */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={book.coverUrl}
          alt=""
          className="h-full w-full object-cover opacity-20 blur-3xl scale-110"
        />
        <div className="absolute inset-0 player-gradient" />
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="playerGhost"
            size="icon"
            onClick={onClose}
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Now Playing
            </p>
          </div>

          <Button
            variant="playerGhost"
            size="icon"
            onClick={() => setShowChapters(!showChapters)}
          >
            <List className="h-5 w-5" />
          </Button>
        </div>

        {/* Cover Art */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="relative max-w-xs md:max-w-sm w-full aspect-square">
            <img
              src={book.coverUrl}
              alt={book.title}
              className={cn(
                'h-full w-full rounded-2xl object-cover card-shadow transition-all duration-500',
                isPlaying && 'glow-shadow scale-[1.02]'
              )}
            />
          </div>
        </div>

        {/* Book Info */}
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {book.title}
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">{book.author}</p>
          {currentChapter && (
            <p className="mt-2 text-sm text-primary">{currentChapter.title}</p>
          )}
        </div>

        {/* Progress Slider */}
        <div className="mb-6">
          <Slider
            value={[currentTime]}
            max={book.duration}
            step={1}
            onValueChange={([value]) => onSeek(value)}
            className="mb-2"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(book.duration - currentTime)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <PlayerControls
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onSkipForward={onSkipForward}
          onSkipBackward={onSkipBackward}
          onNextChapter={book.chapters.length > 0 ? () => {} : undefined}
          onPrevChapter={book.chapters.length > 0 ? () => {} : undefined}
          className="mb-6"
        />

        {/* Secondary Controls */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <SpeedControl value={playbackSpeed} onChange={onSpeedChange} />
          <SleepTimer value={sleepTimer} onChange={onSleepTimerChange} />
          <BookmarkButton
            bookmarks={book.bookmarks}
            currentTime={currentTime}
            onAddBookmark={onAddBookmark}
            onGoToBookmark={onGoToBookmark}
            onRemoveBookmark={onRemoveBookmark}
          />
          <Button
            variant="playerGhost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="gap-1.5"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Chapters Panel */}
      {showChapters && (
        <div className="absolute bottom-0 left-0 right-0 max-h-[60%] bg-card/95 backdrop-blur-xl rounded-t-3xl p-6 animate-slide-up border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Chapters</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowChapters(false)}>
              Close
            </Button>
          </div>
          <div className="space-y-2 overflow-auto max-h-[calc(100%-60px)]">
            {book.chapters.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No chapters available</p>
            ) : (
              book.chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => {
                    onSeek(chapter.startTime);
                    setShowChapters(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                    currentChapter?.id === chapter.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-secondary'
                  )}
                >
                  <span className="text-sm font-medium">{chapter.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(chapter.startTime)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
