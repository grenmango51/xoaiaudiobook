import { FilterOption } from '@/hooks/useLibrary';
import { cn } from '@/lib/utils';

interface FilterTabsProps {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
  stats: {
    total: number;
    new: number;
    started: number;
    finished: number;
  };
}

export function FilterTabs({ value, onChange, stats }: FilterTabsProps) {
  const tabs: { id: FilterOption; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'started', label: 'In Progress', count: stats.started },
    { id: 'new', label: 'New', count: stats.new },
    { id: 'finished', label: 'Finished', count: stats.finished },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200',
            value === tab.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          )}
        >
          {tab.label}
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-xs',
              value === tab.id
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
