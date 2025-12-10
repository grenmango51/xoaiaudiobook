import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Gauge } from 'lucide-react';

interface SpeedControlProps {
  value: number;
  onChange: (speed: number) => void;
  className?: string;
}

const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export function SpeedControl({ value, onChange, className }: SpeedControlProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="playerGhost"
          size="sm"
          className={cn('gap-1.5 font-mono text-sm', className)}
        >
          <Gauge className="h-4 w-4" />
          {value}x
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="center">
        <div className="flex flex-col gap-1">
          <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Playback Speed
          </p>
          {speeds.map((speed) => (
            <button
              key={speed}
              onClick={() => onChange(speed)}
              className={cn(
                'w-full rounded-md px-3 py-2 text-sm font-medium transition-colors text-left',
                value === speed
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary text-foreground'
              )}
            >
              {speed}x {speed === 1.0 && <span className="text-muted-foreground">(Normal)</span>}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
