import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ current, total, className, showPercentage = false }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-progress-track">
        <div
          className="absolute left-0 top-0 h-full bg-progress-fill transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <span className="mt-1 text-xs text-muted-foreground">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
