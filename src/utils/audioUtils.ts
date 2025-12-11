import { Audiobook } from '@/types/audiobook';
import { storeAudioFile } from './audioStorage';

// Extract audio duration from a file
export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    const blobUrl = URL.createObjectURL(file);
    
    // 5-second timeout for mobile browsers that may hang
    const timeout = setTimeout(() => {
      console.warn('Audio metadata loading timed out, using default duration');
      cleanup();
      resolve(3600); // Default to 1 hour
    }, 5000);

    const cleanup = () => {
      clearTimeout(timeout);
      audio.onloadedmetadata = null;
      audio.onerror = null;
      URL.revokeObjectURL(blobUrl);
    };
    
    audio.onloadedmetadata = () => {
      cleanup();
      resolve(Math.floor(audio.duration) || 3600);
    };

    audio.onerror = () => {
      console.warn('Audio metadata loading error, using default duration');
      cleanup();
      resolve(3600); // Default to 1 hour if can't read duration
    };

    audio.src = blobUrl;
  });
}

// Parse filename to extract title and author
export function parseFileName(fileName: string): { title: string; author: string } {
  // Remove file extension
  const nameWithoutExt = fileName.replace(/\.(mp3|m4a|m4b|ogg|wav|opus)$/i, '');
  
  // Common patterns: "Author - Title", "Title - Author", "Title (Author)"
  const dashPattern = nameWithoutExt.match(/^(.+?)\s*[-–—]\s*(.+)$/);
  const parenPattern = nameWithoutExt.match(/^(.+?)\s*\(([^)]+)\)$/);
  
  if (dashPattern) {
    // Assume "Author - Title" format (most common for audiobooks)
    return {
      author: dashPattern[1].trim(),
      title: dashPattern[2].trim(),
    };
  }
  
  if (parenPattern) {
    return {
      title: parenPattern[1].trim(),
      author: parenPattern[2].trim(),
    };
  }
  
  // Just use filename as title
  return {
    title: nameWithoutExt.trim(),
    author: 'Unknown Author',
  };
}

// Generate a placeholder cover based on the book title
export function generateCoverUrl(title: string): string {
  // Use a deterministic color based on title
  const colors = [
    '1a1a2e', '16213e', '0f3460', '1f4068', '162447',
    '1b262c', '0d1b2a', '1b2838', '2d3436', '2c3e50',
  ];
  
  const colorIndex = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];
  
  // Create initials from title
  const initials = title
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
  
  // Use a placeholder service or return a data URL
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bgColor}&color=f5f5f5&size=400&bold=true&font-size=0.4`;
}

// Create an audiobook object from an uploaded file
export async function createAudiobookFromFile(file: File): Promise<Audiobook> {
  const duration = await getAudioDuration(file);
  const { title, author } = parseFileName(file.name);
  const id = `upload-${crypto.randomUUID()}`;
  
  // Store the audio file in IndexedDB for persistent offline access
  try {
    await storeAudioFile(id, file);
  } catch (error) {
    console.error('Failed to store audio in IndexedDB:', error);
    // Continue anyway - blob URL will work for this session
  }
  
  // Also create a temporary blob URL for immediate playback
  const audioUrl = URL.createObjectURL(file);
  
  return {
    id,
    title,
    author,
    coverUrl: generateCoverUrl(title),
    description: `Uploaded from: ${file.name}`,
    duration,
    currentPosition: 0,
    status: 'new',
    dateAdded: new Date(),
    chapters: [],
    bookmarks: [],
    playbackSpeed: 1.0,
    audioUrl,
  };
}

// Create an audiobook from a folder (multiple files = chapters)
// Similar to Smart Audiobook Player approach
export async function createAudiobookFromFolder(folderName: string, files: File[]): Promise<Audiobook> {
  const id = `folder-${crypto.randomUUID()}`;
  
  // Calculate total duration and create chapters
  let totalDuration = 0;
  const chapters: { id: string; title: string; startTime: number; endTime: number }[] = [];
  
  // Process files to get durations (with timeout protection)
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const chapterDuration = await getAudioDuration(file);
    const startTime = totalDuration;
    totalDuration += chapterDuration;
    
    chapters.push({
      id: `ch-${i + 1}`,
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      startTime,
      endTime: totalDuration,
    });
  }
  
  // Store all audio files - combine into single blob for simpler playback
  // For now, store the first file and create a combined audioUrl
  const firstFile = files[0];
  try {
    await storeAudioFile(id, firstFile);
  } catch (error) {
    console.error('Failed to store audio in IndexedDB:', error);
  }
  
  // Create blob URL from first file for immediate playback
  // TODO: Implement proper multi-file chapter support
  const audioUrl = URL.createObjectURL(firstFile);
  
  // Parse folder name for title/author
  const { title, author } = parseFileName(folderName);
  
  return {
    id,
    title: title || folderName,
    author,
    coverUrl: generateCoverUrl(folderName),
    description: `${files.length} file${files.length !== 1 ? 's' : ''} from folder: ${folderName}`,
    duration: totalDuration,
    currentPosition: 0,
    status: 'new',
    dateAdded: new Date(),
    chapters,
    bookmarks: [],
    playbackSpeed: 1.0,
    audioUrl,
  };
}
