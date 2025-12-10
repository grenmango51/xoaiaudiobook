export type BookStatus = 'new' | 'started' | 'finished';

export interface Bookmark {
  id: string;
  position: number; // in seconds
  note: string;
  createdAt: Date;
}

export interface Chapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
}

export interface Audiobook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description?: string;
  duration: number; // in seconds
  currentPosition: number; // in seconds
  status: BookStatus;
  dateAdded: Date;
  lastPlayed?: Date;
  dateFinished?: Date;
  chapters: Chapter[];
  bookmarks: Bookmark[];
  playbackSpeed: number;
  audioUrl?: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  isMuted: boolean;
  sleepTimer: number | null; // minutes remaining, null if disabled
}

export interface Character {
  id: string;
  name: string;
  description: string;
  bookId: string;
}

export interface Note {
  id: string;
  content: string;
  timestamp: number;
  bookId: string;
  createdAt: Date;
}
