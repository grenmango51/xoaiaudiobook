import { Audiobook } from '@/types/audiobook';
import { AudiobookCard } from './AudiobookCard';
import { SearchBar } from './SearchBar';
import { FilterTabs } from './FilterTabs';
import { SortDropdown } from './SortDropdown';
import { SortOption, FilterOption } from '@/hooks/useLibrary';
import { BookOpen } from 'lucide-react';

interface LibraryProps {
  books: Audiobook[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filterBy: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  stats: {
    total: number;
    new: number;
    started: number;
    finished: number;
  };
  onPlayBook: (book: Audiobook) => void;
  onDeleteBook: (bookId: string) => void;
  onChangeCover: (bookId: string, coverUrl: string) => void;
}

export function Library({
  books,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  stats,
  onPlayBook,
  onDeleteBook,
  onChangeCover,
}: LibraryProps) {
  return (
    <div className="flex-1 container mx-auto px-4 py-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            className="w-full sm:w-80"
          />
          <div className="flex items-center gap-3 ml-auto">
            <SortDropdown value={sortBy} onChange={onSortChange} />
          </div>
        </div>
        
        <FilterTabs value={filterBy} onChange={onFilterChange} stats={stats} />
      </div>

      {/* Book Grid */}
      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-secondary p-6 mb-4">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">No books found</h3>
          <p className="text-muted-foreground max-w-sm">
            {searchQuery
              ? 'Try adjusting your search or filter to find what you\'re looking for.'
              : 'Start building your library by adding some audiobooks.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {books.map((book, index) => (
            <div
              key={book.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <AudiobookCard 
                book={book} 
                onPlay={onPlayBook} 
                onDelete={onDeleteBook}
                onChangeCover={onChangeCover}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
