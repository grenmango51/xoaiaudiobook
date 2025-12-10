import { Audiobook } from '@/types/audiobook';
import { Play, Pause, SkipForward } from 'lucide-react';
import { Button } from './ui/button';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';

interface MiniPlayerProps {
  book: Audiobook;
  isPlaying: boolean;
  currentTime: number;
  onTogglePlay: () => void;
  onSkipForward: () => void;
  onExpand: () => void;
  className?: string;
}

export function MiniPlayer({
  book,
  isPlaying,
  currentTime,
  onTogglePlay,
  onSkipForward,
  onExpand,
  className,
}: MiniPlayerProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom',
        className
      )}
    >
      {/* Progress Bar */}
      <ProgressBar
        current={currentTime}
        total={book.duration}
        className="absolute top-0 left-0 right-0"
      />

      <div className="flex items-center gap-4 p-3">
        {/* Cover Art */}
        <button
          onClick={onExpand}
          className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg"
        >
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        </button>

        {/* Book Info */}
        <button
          onClick={onExpand}
          className="flex-1 min-w-0 text-left"
        >
          <h3 className="text-sm font-medium truncate text-foreground">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {book.author}
          </p>
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="playerGhost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>
          <Button
            variant="playerGhost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onSkipForward();
            }}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
