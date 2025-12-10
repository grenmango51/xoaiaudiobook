import { Audiobook } from '@/types/audiobook';

const LIBRARY_KEY = 'audiobook-library';
const INITIALIZED_KEY = 'audiobook-library-initialized';

interface SerializedAudiobook extends Omit<Audiobook, 'dateAdded' | 'lastPlayed' | 'dateFinished' | 'bookmarks'> {
  dateAdded: string;
  lastPlayed: string | null;
  dateFinished: string | null;
  bookmarks: Array<{
    id: string;
    position: number;
    note: string;
    createdAt: string;
  }>;
}

function serializeBook(book: Audiobook): SerializedAudiobook {
  return {
    ...book,
    audioUrl: undefined, // Exclude blob URLs - they're recreated from IndexedDB
    dateAdded: book.dateAdded.toISOString(),
    lastPlayed: book.lastPlayed?.toISOString() ?? null,
    dateFinished: book.dateFinished?.toISOString() ?? null,
    bookmarks: book.bookmarks.map(b => ({
      ...b,
      createdAt: b.createdAt.toISOString(),
    })),
  };
}

function deserializeBook(data: SerializedAudiobook): Audiobook {
  return {
    ...data,
    dateAdded: new Date(data.dateAdded),
    lastPlayed: data.lastPlayed ? new Date(data.lastPlayed) : undefined,
    dateFinished: data.dateFinished ? new Date(data.dateFinished) : undefined,
    bookmarks: data.bookmarks.map(b => ({
      ...b,
      createdAt: new Date(b.createdAt),
    })),
  };
}

export function saveLibrary(books: Audiobook[]): void {
  try {
    const serialized = books.map(serializeBook);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error('Failed to save library to localStorage:', error);
  }
}

export function loadLibrary(): Audiobook[] | null {
  try {
    const data = localStorage.getItem(LIBRARY_KEY);
    if (!data) return null;
    
    const parsed: SerializedAudiobook[] = JSON.parse(data);
    return parsed.map(deserializeBook);
  } catch (error) {
    console.error('Failed to load library from localStorage:', error);
    return null;
  }
}

export function isFirstInstall(): boolean {
  return !localStorage.getItem(INITIALIZED_KEY);
}

export function markInitialized(): void {
  localStorage.setItem(INITIALIZED_KEY, 'true');
}
