// File System Access API type declarations
interface DirectoryPickerOptions {
  mode?: 'read' | 'readwrite';
}

interface FSDirectoryHandle {
  values(): AsyncIterableIterator<FSHandle>;
  getDirectoryHandle(name: string): Promise<FSDirectoryHandle>;
  getFileHandle(name: string): Promise<FSFileHandle>;
}

interface FSFileHandle {
  getFile(): Promise<File>;
}

interface FSHandle {
  readonly kind: 'file' | 'directory';
  readonly name: string;
}

declare global {
  interface Window {
    showDirectoryPicker(options?: DirectoryPickerOptions): Promise<FSDirectoryHandle>;
  }
}

// Folder scanner utility - similar to Smart Audiobook Player approach
// Scans a selected folder for audiobook files, grouping by subfolder

export interface ScannedBook {
  folderName: string;
  files: File[];
  totalDuration?: number;
}

export interface ScanResult {
  books: ScannedBook[];
  totalFiles: number;
}

const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.m4b', '.ogg', '.wav', '.opus', '.aac', '.flac'];

function isAudioFile(fileName: string): boolean {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
  return AUDIO_EXTENSIONS.includes(ext);
}

// Check if File System Access API is supported
export function supportsDirectoryPicker(): boolean {
  return 'showDirectoryPicker' in window && 
    (() => {
      try {
        return window.self === window.top;
      } catch {
        return false;
      }
    })();
}

// Recursively scan directory for audio files
async function scanDirectory(
  dirHandle: FSDirectoryHandle,
  path: string = ''
): Promise<Map<string, File[]>> {
  const bookMap = new Map<string, File[]>();
  
  for await (const entry of dirHandle.values()) {
    const currentPath = path ? `${path}/${entry.name}` : entry.name;
    
    if (entry.kind === 'directory') {
      // Recursively scan subdirectories
      const subDirHandle = await dirHandle.getDirectoryHandle(entry.name);
      const subFiles = await scanDirectory(subDirHandle, currentPath);
      
      // Merge results
      for (const [folder, files] of subFiles) {
        const existing = bookMap.get(folder) || [];
        bookMap.set(folder, [...existing, ...files]);
      }
    } else if (entry.kind === 'file') {
      if (isAudioFile(entry.name)) {
        const fileHandle = await dirHandle.getFileHandle(entry.name);
        const file = await fileHandle.getFile();
        
        // Group by parent folder (or root if no parent)
        const folderName = path || 'Root';
        const existing = bookMap.get(folderName) || [];
        bookMap.set(folderName, [...existing, file]);
      }
    }
  }
  
  return bookMap;
}

// Main function to scan folder using File System Access API
export async function scanFolderForAudiobooks(): Promise<ScanResult | null> {
  if (!supportsDirectoryPicker()) {
    return null;
  }
  
  try {
    const dirHandle = await window.showDirectoryPicker({
      mode: 'read',
    }) as unknown as FSDirectoryHandle;
    
    const bookMap = await scanDirectory(dirHandle, '');
    
    // Convert map to array of ScannedBook objects
    const books: ScannedBook[] = [];
    let totalFiles = 0;
    
    for (const [folderName, files] of bookMap) {
      if (files.length > 0) {
        // Sort files naturally (Chapter 1, Chapter 2, etc.)
        files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        books.push({ folderName, files });
        totalFiles += files.length;
      }
    }
    
    // Sort books by folder name
    books.sort((a, b) => a.folderName.localeCompare(b.folderName));
    
    return { books, totalFiles };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return null; // User cancelled
    }
    console.error('Folder scan error:', err);
    throw err;
  }
}

// Group files from webkitdirectory by their relative path
export function groupFilesByFolder(files: File[]): ScannedBook[] {
  const bookMap = new Map<string, File[]>();
  
  for (const file of files) {
    if (!isAudioFile(file.name)) continue;
    
    // webkitRelativePath format: "FolderName/SubFolder/file.mp3"
    const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || '';
    const parts = relativePath.split('/');
    
    // Use the first subfolder as the book name, or filename if no subfolder
    let folderName: string;
    if (parts.length > 2) {
      // Has subfolder structure: use first subfolder
      folderName = parts[1];
    } else if (parts.length === 2) {
      // Direct child of selected folder
      folderName = parts[0];
    } else {
      // Just the file
      folderName = file.name.replace(/\.[^/.]+$/, '');
    }
    
    const existing = bookMap.get(folderName) || [];
    bookMap.set(folderName, [...existing, file]);
  }
  
  const books: ScannedBook[] = [];
  for (const [folderName, files] of bookMap) {
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    books.push({ folderName, files });
  }
  
  return books.sort((a, b) => a.folderName.localeCompare(b.folderName));
}
