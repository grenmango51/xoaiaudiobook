import { Audiobook } from '@/types/audiobook';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { formatDuration, formatProgress } from '@/utils/formatTime';
import { Play, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { BookOptionsMenu } from './BookOptionsMenu';

interface AudiobookCardProps {
  book: Audiobook;
  onPlay: (book: Audiobook) => void;
  onDelete: (bookId: string) => void;
  onChangeCover: (bookId: string, coverUrl: string) => void;
  onStatusChange?: (bookId: string, status: Audiobook['status']) => void;
  className?: string;
}

export function AudiobookCard({ book, onPlay, onDelete, onChangeCover, className }: AudiobookCardProps) {
  const progress = formatProgress(book.currentPosition, book.duration);
  const remainingTime = book.duration - book.currentPosition;

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl bg-card border border-border/50 transition-all duration-300 hover:border-primary/30 hover:card-shadow cursor-pointer',
        className
      )}
      onClick={() => onPlay(book)}
    >
      {/* Cover Art */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="playerCircle"
            size="iconLg"
            className="shadow-2xl"
            onClick={(e) => {
              e.stopPropagation();
              onPlay(book);
            }}
          >
            <Play className="ml-1" />
          </Button>
        </div>

        {/* Status Badge */}
        <div className="absolute left-3 top-3">
          <StatusBadge status={book.status} />
        </div>

        {/* More Options */}
        <BookOptionsMenu
          book={book}
          onDelete={onDelete}
          onChangeCover={onChangeCover}
        >
          <Button
            variant="ghost"
            size="iconSm"
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 bg-background/50 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </BookOptionsMenu>
      </div>

      {/* Book Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-semibold leading-tight line-clamp-2 text-foreground">
          {book.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
          {book.author}
        </p>

        <div className="mt-auto pt-4">
          {/* Progress */}
          {book.status === 'started' && (
            <div className="mb-2">
              <ProgressBar current={book.currentPosition} total={book.duration} />
              <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>{progress}% complete</span>
                <span>{formatDuration(remainingTime)} left</span>
              </div>
            </div>
          )}

          {/* Duration */}
          {book.status !== 'started' && (
            <p className="text-xs text-muted-foreground">
              {formatDuration(book.duration)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
