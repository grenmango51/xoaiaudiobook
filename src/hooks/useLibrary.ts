import { useState, useCallback, useMemo } from 'react';
import { Audiobook, BookStatus, Bookmark } from '@/types/audiobook';
import { sampleBooks } from '@/data/sampleBooks';

export type SortOption = 'title' | 'author' | 'dateAdded' | 'duration' | 'dateFinished' | 'recentlyPlayed';
export type FilterOption = 'all' | 'new' | 'started' | 'finished';

export function useLibrary() {
  const [books, setBooks] = useState<Audiobook[]>(sampleBooks);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recentlyPlayed');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [currentBook, setCurrentBook] = useState<Audiobook | null>(null);

  const updateBookStatus = useCallback((bookId: string, status: BookStatus) => {
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        return {
          ...book,
          status,
          dateFinished: status === 'finished' ? new Date() : book.dateFinished,
        };
      }
      return book;
    }));
  }, []);

  const updateBookProgress = useCallback((bookId: string, position: number) => {
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        const newStatus: BookStatus = 
          position === 0 ? 'new' : 
          position >= book.duration ? 'finished' : 
          'started';
        
        return {
          ...book,
          currentPosition: position,
          lastPlayed: new Date(),
          status: newStatus,
          dateFinished: newStatus === 'finished' ? new Date() : book.dateFinished,
        };
      }
      return book;
    }));
  }, []);

  const addBookmark = useCallback((bookId: string, bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        const newBookmark: Bookmark = {
          ...bookmark,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        return {
          ...book,
          bookmarks: [...book.bookmarks, newBookmark],
        };
      }
      return book;
    }));
  }, []);

  const removeBookmark = useCallback((bookId: string, bookmarkId: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        return {
          ...book,
          bookmarks: book.bookmarks.filter(b => b.id !== bookmarkId),
        };
      }
      return book;
    }));
  }, []);

  const setPlaybackSpeed = useCallback((bookId: string, speed: number) => {
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        return { ...book, playbackSpeed: speed };
      }
      return book;
    }));
  }, []);

  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.description?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterBy !== 'all') {
      result = result.filter(book => book.status === filterBy);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'dateAdded':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case 'duration':
          return b.duration - a.duration;
        case 'dateFinished':
          if (!a.dateFinished) return 1;
          if (!b.dateFinished) return -1;
          return new Date(b.dateFinished).getTime() - new Date(a.dateFinished).getTime();
        case 'recentlyPlayed':
          if (!a.lastPlayed) return 1;
          if (!b.lastPlayed) return -1;
          return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [books, searchQuery, sortBy, filterBy]);

  const stats = useMemo(() => ({
    total: books.length,
    new: books.filter(b => b.status === 'new').length,
    started: books.filter(b => b.status === 'started').length,
    finished: books.filter(b => b.status === 'finished').length,
  }), [books]);

  return {
    books: filteredAndSortedBooks,
    allBooks: books,
    currentBook,
    setCurrentBook,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    updateBookStatus,
    updateBookProgress,
    addBookmark,
    removeBookmark,
    setPlaybackSpeed,
    stats,
  };
}
