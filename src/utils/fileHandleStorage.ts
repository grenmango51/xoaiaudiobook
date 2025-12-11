// File Handle Storage - stores references to files instead of copying data
// This is much more memory-efficient and won't crash mobile devices

// Use native browser types for File System Access API
declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>;
  }
}

const DB_NAME = 'audiobook-handles';
const DB_VERSION = 1;
const HANDLES_STORE = 'file-handles';

let dbInstance: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(HANDLES_STORE)) {
        db.createObjectStore(HANDLES_STORE, { keyPath: 'bookId' });
      }
    };
  });
}

export interface StoredFileHandle {
  bookId: string;
  directoryHandle: FileSystemDirectoryHandle;
  fileNames: string[]; // List of audio files in order
}

// Check if File System Access API with handle persistence is supported
export function supportsFileHandles(): boolean {
  return 'showDirectoryPicker' in window && 'indexedDB' in window;
}

// Store a directory handle for a book
export async function storeDirectoryHandle(
  bookId: string,
  directoryHandle: FileSystemDirectoryHandle,
  fileNames: string[]
): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLES_STORE, 'readwrite');
    const store = transaction.objectStore(HANDLES_STORE);

    const storedHandle: StoredFileHandle = {
      bookId,
      directoryHandle,
      fileNames,
    };

    const request = store.put(storedHandle);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Get stored handle for a book
export async function getStoredHandle(bookId: string): Promise<StoredFileHandle | null> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLES_STORE, 'readonly');
    const store = transaction.objectStore(HANDLES_STORE);
    const request = store.get(bookId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result || null);
    };
  });
}

// Delete stored handle
export async function deleteStoredHandle(bookId: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLES_STORE, 'readwrite');
    const store = transaction.objectStore(HANDLES_STORE);
    const request = store.delete(bookId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Request permission for a stored handle (needed after app reload)
export async function requestHandlePermission(
  handle: FileSystemDirectoryHandle
): Promise<boolean> {
  try {
    // Check current permission state
    const permission = await (handle as any).queryPermission({ mode: 'read' });
    if (permission === 'granted') return true;

    // Request permission
    const newPermission = await (handle as any).requestPermission({ mode: 'read' });
    return newPermission === 'granted';
  } catch (error) {
    console.error('Permission request failed:', error);
    return false;
  }
}

// Get a file from a directory handle by name
export async function getFileFromHandle(
  dirHandle: FileSystemDirectoryHandle,
  fileName: string
): Promise<File | null> {
  try {
    const fileHandle = await dirHandle.getFileHandle(fileName);
    return await fileHandle.getFile();
  } catch (error) {
    console.error(`Failed to get file ${fileName}:`, error);
    return null;
  }
}

// Create an object URL for on-demand playback (doesn't copy to storage)
export async function createPlaybackUrl(
  bookId: string,
  chapterIndex: number = 0
): Promise<string | null> {
  const stored = await getStoredHandle(bookId);
  if (!stored) return null;

  // Request permission if needed
  const hasPermission = await requestHandlePermission(stored.directoryHandle);
  if (!hasPermission) return null;

  const fileName = stored.fileNames[chapterIndex];
  if (!fileName) return null;

  const file = await getFileFromHandle(stored.directoryHandle, fileName);
  if (!file) return null;

  // Create temporary URL for playback - this doesn't copy data to memory
  return URL.createObjectURL(file);
}

// Get all audio files from a directory handle
export async function getAudioFilesFromHandle(
  dirHandle: FileSystemDirectoryHandle
): Promise<File[]> {
  const audioExtensions = ['.mp3', '.m4a', '.m4b', '.ogg', '.wav', '.opus', '.aac', '.flac'];
  const files: File[] = [];

  try {
    // Use entries() method which is more widely supported
    const entries = (dirHandle as any).entries ? 
      (dirHandle as any).entries() : 
      (dirHandle as any).values();
    
    for await (const entry of entries) {
      // Handle both [name, handle] tuple and direct handle formats
      const handle = Array.isArray(entry) ? entry[1] : entry;
      const name = Array.isArray(entry) ? entry[0] : handle.name;
      
      if (handle.kind === 'file') {
        const ext = name.toLowerCase().slice(name.lastIndexOf('.'));
        if (audioExtensions.includes(ext)) {
          const file = await handle.getFile();
          files.push(file);
        }
      }
    }

    // Sort naturally (Chapter 1, Chapter 2, etc.)
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    return files;
  } catch (error) {
    console.error('Failed to read files from handle:', error);
    return [];
  }
}

// Get all stored book IDs
export async function getAllStoredBookIds(): Promise<string[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HANDLES_STORE, 'readonly');
    const store = transaction.objectStore(HANDLES_STORE);
    const request = store.getAllKeys();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result as string[]);
    };
  });
}
