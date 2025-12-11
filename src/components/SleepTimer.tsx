import { Moon, X, Plus, Clock } from 'lucide-react';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { cn } from '@/lib/utils';

interface SleepTimerProps {
  value: number | null; // minutes remaining, null if disabled
  onChange: (minutes: number | null) => void;
  className?: string;
}

const timerOptions = [5, 10, 15, 20, 30, 45, 60, 90, 120];

export function SleepTimer({ value, onChange, className }: SleepTimerProps) {
  const isActive = value !== null;

  const extendTimer = (extraMinutes: number) => {
    if (value !== null) {
      onChange(value + extraMinutes);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="playerGhost"
          size="sm"
          className={cn(
            'gap-1.5 text-sm',
            isActive && 'text-primary',
            className
          )}
        >
          <Moon className={cn('h-4 w-4', isActive && 'fill-primary')} />
          {isActive ? formatTime(value) : 'Sleep'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="center">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Sleep Timer
            </p>
            {isActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(null)}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            )}
          </div>

          {isActive ? (
            <>
              {/* Active timer display */}
              <div className="text-center py-3 rounded-lg bg-primary/10">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Clock className="h-5 w-5" />
                  <span className="text-2xl font-bold">{formatTime(value)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  until playback pauses
                </p>
              </div>

              {/* Extend buttons */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Extend timer:</p>
                <div className="flex gap-2">
                  {[5, 10, 15].map((mins) => (
                    <Button
                      key={mins}
                      variant="outline"
                      size="sm"
                      onClick={() => extendTimer(mins)}
                      className="flex-1"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {mins}m
                    </Button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Timer selection grid */}
              <div className="grid grid-cols-3 gap-1.5">
                {timerOptions.map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => onChange(minutes)}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      'bg-secondary hover:bg-secondary/80 text-foreground'
                    )}
                  >
                    {formatTime(minutes)}
                  </button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Automatically pause playback after the selected time
              </p>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
