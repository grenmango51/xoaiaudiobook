import { Play, Pause, SkipBack, SkipForward, Rewind, FastForward } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface PlayerControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  skipDuration?: number;
  className?: string;
}

export function PlayerControls({
  isPlaying,
  onTogglePlay,
  onSkipForward,
  onSkipBackward,
  onNextChapter,
  onPrevChapter,
  skipDuration = 15,
  className,
}: PlayerControlsProps) {
  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      {/* Previous Chapter */}
      {onPrevChapter && (
        <Button
          variant="playerGhost"
          size="iconLg"
          onClick={onPrevChapter}
          className="text-muted-foreground hover:text-foreground"
        >
          <SkipBack className="h-6 w-6" />
        </Button>
      )}

      {/* Rewind */}
      <Button
        variant="playerGhost"
        size="iconLg"
        onClick={onSkipBackward}
        className="relative"
      >
        <Rewind className="h-7 w-7" />
        <span className="absolute -bottom-1 text-[10px] font-medium text-muted-foreground">
          {skipDuration}
        </span>
      </Button>

      {/* Play/Pause */}
      <Button
        variant="playerCircle"
        size="iconPlayer"
        onClick={onTogglePlay}
        className={cn(
          'transition-all duration-300',
          isPlaying && 'animate-pulse-glow'
        )}
      >
        {isPlaying ? (
          <Pause className="h-10 w-10" />
        ) : (
          <Play className="h-10 w-10 ml-1" />
        )}
      </Button>

      {/* Fast Forward */}
      <Button
        variant="playerGhost"
        size="iconLg"
        onClick={onSkipForward}
        className="relative"
      >
        <FastForward className="h-7 w-7" />
        <span className="absolute -bottom-1 text-[10px] font-medium text-muted-foreground">
          {skipDuration}
        </span>
      </Button>

      {/* Next Chapter */}
      {onNextChapter && (
        <Button
          variant="playerGhost"
          size="iconLg"
          onClick={onNextChapter}
          className="text-muted-foreground hover:text-foreground"
        >
          <SkipForward className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
