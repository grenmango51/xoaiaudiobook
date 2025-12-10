// IndexedDB storage for audio files to enable offline playback

const DB_NAME = 'audiobook-player';
const DB_VERSION = 1;
const AUDIO_STORE = 'audio-files';

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
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
      }
    };
  });
}

export interface StoredAudio {
  id: string;
  data: ArrayBuffer;
  mimeType: string;
  fileName: string;
}

export async function storeAudioFile(id: string, file: File): Promise<void> {
  const db = await getDB();
  const arrayBuffer = await file.arrayBuffer();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(AUDIO_STORE, 'readwrite');
    const store = transaction.objectStore(AUDIO_STORE);

    const storedAudio: StoredAudio = {
      id,
      data: arrayBuffer,
      mimeType: file.type || 'audio/mpeg',
      fileName: file.name,
    };

    const request = store.put(storedAudio);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getAudioFile(id: string): Promise<Blob | null> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(AUDIO_STORE, 'readonly');
    const store = transaction.objectStore(AUDIO_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result as StoredAudio | undefined;
      if (result) {
        const blob = new Blob([result.data], { type: result.mimeType });
        resolve(blob);
      } else {
        resolve(null);
      }
    };
  });
}

export async function deleteAudioFile(id: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(AUDIO_STORE, 'readwrite');
    const store = transaction.objectStore(AUDIO_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function hasAudioFile(id: string): Promise<boolean> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(AUDIO_STORE, 'readonly');
    const store = transaction.objectStore(AUDIO_STORE);
    const request = store.getKey(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result !== undefined);
  });
}

export function createAudioUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeAudioUrl(url: string): void {
  URL.revokeObjectURL(url);
}
