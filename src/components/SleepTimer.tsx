import { Moon, X } from 'lucide-react';
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

const timerOptions = [5, 10, 15, 30, 45, 60];

export function SleepTimer({ value, onChange, className }: SleepTimerProps) {
  const isActive = value !== null;

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
          {isActive ? `${value}m` : 'Sleep'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="center">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Sleep Timer
            </p>
            {isActive && (
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() => onChange(null)}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-1 mt-1">
            {timerOptions.map((minutes) => (
              <button
                key={minutes}
                onClick={() => onChange(minutes)}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  value === minutes
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary text-foreground'
                )}
              >
                {minutes}m
              </button>
            ))}
          </div>

          {isActive && (
            <p className="mt-2 px-2 text-xs text-muted-foreground text-center">
              Playback will pause in {value} minutes
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
