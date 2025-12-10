import { Bookmark, BookmarkPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Bookmark as BookmarkType } from '@/types/audiobook';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { formatTime } from '@/utils/formatTime';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Input } from './ui/input';

interface BookmarkButtonProps {
  bookmarks: BookmarkType[];
  currentTime: number;
  onAddBookmark: (note: string) => void;
  onGoToBookmark: (position: number) => void;
  onRemoveBookmark: (id: string) => void;
  className?: string;
}

export function BookmarkButton({
  bookmarks,
  currentTime,
  onAddBookmark,
  onGoToBookmark,
  onRemoveBookmark,
  className,
}: BookmarkButtonProps) {
  const [note, setNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddBookmark = () => {
    onAddBookmark(note || `Bookmark at ${formatTime(currentTime)}`);
    setNote('');
    setIsAdding(false);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="playerGhost"
          size="sm"
          className={cn('gap-1.5 text-sm', className)}
        >
          <Bookmark className={cn('h-4 w-4', bookmarks.length > 0 && 'fill-primary text-primary')} />
          {bookmarks.length > 0 ? bookmarks.length : 'Bookmark'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="center">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Bookmarks</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              className="h-8 gap-1"
            >
              <BookmarkPlus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {isAdding && (
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddBookmark()}
              />
              <Button size="sm" className="h-8" onClick={handleAddBookmark}>
                Save
              </Button>
            </div>
          )}

          {bookmarks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No bookmarks yet
            </p>
          ) : (
            <div className="max-h-48 overflow-auto space-y-1 mt-2">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary group cursor-pointer"
                  onClick={() => onGoToBookmark(bookmark.position)}
                >
                  <Bookmark className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{bookmark.note}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(bookmark.position)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBookmark(bookmark.id);
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
