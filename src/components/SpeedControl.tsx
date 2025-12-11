import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Slider } from './ui/slider';
import { Gauge, Minus, Plus } from 'lucide-react';

interface SpeedControlProps {
  value: number;
  onChange: (speed: number) => void;
  className?: string;
}

// Preset speeds for quick selection
const presetSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];

export function SpeedControl({ value, onChange, className }: SpeedControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Round to nearest 0.05
  const roundSpeed = (speed: number) => Math.round(speed * 20) / 20;

  const handleSliderChange = (values: number[]) => {
    onChange(roundSpeed(values[0]));
  };

  const incrementSpeed = () => {
    const newSpeed = Math.min(3.0, roundSpeed(value + 0.05));
    onChange(newSpeed);
  };

  const decrementSpeed = () => {
    const newSpeed = Math.max(0.5, roundSpeed(value - 0.05));
    onChange(newSpeed);
  };

  const formatSpeed = (speed: number) => {
    return speed.toFixed(2).replace(/\.?0+$/, '') + 'x';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="playerGhost"
          size="sm"
          className={cn('gap-1.5 font-mono text-sm', className)}
        >
          <Gauge className="h-4 w-4" />
          {formatSpeed(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="center">
        <div className="space-y-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Playback Speed
          </p>

          {/* Current speed display with +/- buttons */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementSpeed}
              disabled={value <= 0.5}
              className="h-10 w-10 rounded-full"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-3xl font-bold font-mono min-w-[80px] text-center">
              {formatSpeed(value)}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={incrementSpeed}
              disabled={value >= 3.0}
              className="h-10 w-10 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Slider for fine control */}
          <div className="px-2">
            <Slider
              value={[value]}
              onValueChange={handleSliderChange}
              min={0.5}
              max={3.0}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>2.0x</span>
              <span>3.0x</span>
            </div>
          </div>

          {/* Preset buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {presetSpeeds.map((speed) => (
              <button
                key={speed}
                onClick={() => onChange(speed)}
                className={cn(
                  'rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                  Math.abs(value - speed) < 0.01
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80 text-foreground'
                )}
              >
                {formatSpeed(speed)}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
