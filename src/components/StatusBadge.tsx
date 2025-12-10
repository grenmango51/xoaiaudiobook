import { BookStatus } from '@/types/audiobook';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: BookStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    new: {
      label: 'New',
      className: 'bg-status-new/20 text-status-new border-status-new/30',
    },
    started: {
      label: 'In Progress',
      className: 'bg-status-started/20 text-status-started border-status-started/30',
    },
    finished: {
      label: 'Finished',
      className: 'bg-status-finished/20 text-status-finished border-status-finished/30',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
