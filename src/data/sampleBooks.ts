import { Audiobook } from '@/types/audiobook';

export const sampleBooks: Audiobook[] = [
  {
    id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    description: 'Between life and death there is a library, and within that library, the shelves go on forever.',
    duration: 32400, // 9 hours
    currentPosition: 14400, // 4 hours in
    status: 'started',
    dateAdded: new Date('2024-01-15'),
    lastPlayed: new Date('2024-03-10'),
    chapters: [
      { id: '1-1', title: 'Chapter 1: The Beginning', startTime: 0, endTime: 3600 },
      { id: '1-2', title: 'Chapter 2: The Library', startTime: 3600, endTime: 7200 },
      { id: '1-3', title: 'Chapter 3: Other Lives', startTime: 7200, endTime: 10800 },
    ],
    bookmarks: [
      { id: 'b1', position: 1800, note: 'Great quote about regret', createdAt: new Date() },
    ],
    playbackSpeed: 1.0,
  },
  {
    id: '2',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
    description: 'An easy and proven way to build good habits and break bad ones.',
    duration: 19800, // 5.5 hours
    currentPosition: 0,
    status: 'new',
    dateAdded: new Date('2024-02-20'),
    chapters: [
      { id: '2-1', title: 'Introduction', startTime: 0, endTime: 1800 },
      { id: '2-2', title: 'The Fundamentals', startTime: 1800, endTime: 5400 },
    ],
    bookmarks: [],
    playbackSpeed: 1.0,
  },
  {
    id: '3',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    coverUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop',
    description: 'A lone astronaut must save the earth from disaster in this incredible new science-based thriller.',
    duration: 57600, // 16 hours
    currentPosition: 57600,
    status: 'finished',
    dateAdded: new Date('2023-11-01'),
    lastPlayed: new Date('2024-01-05'),
    dateFinished: new Date('2024-01-05'),
    chapters: [
      { id: '3-1', title: 'Chapter 1', startTime: 0, endTime: 3600 },
      { id: '3-2', title: 'Chapter 2', startTime: 3600, endTime: 7200 },
    ],
    bookmarks: [
      { id: 'b2', position: 28800, note: 'Rocky introduction!', createdAt: new Date() },
    ],
    playbackSpeed: 1.25,
  },
  {
    id: '4',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    coverUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop',
    description: 'Timeless lessons on wealth, greed, and happiness.',
    duration: 18000, // 5 hours
    currentPosition: 9000,
    status: 'started',
    dateAdded: new Date('2024-03-01'),
    lastPlayed: new Date('2024-03-12'),
    chapters: [],
    bookmarks: [],
    playbackSpeed: 1.5,
  },
  {
    id: '5',
    title: 'Educated',
    author: 'Tara Westover',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop',
    description: 'A memoir about a young girl who leaves her survivalist family and goes on to earn a PhD from Cambridge University.',
    duration: 43200, // 12 hours
    currentPosition: 0,
    status: 'new',
    dateAdded: new Date('2024-03-08'),
    chapters: [],
    bookmarks: [],
    playbackSpeed: 1.0,
  },
  {
    id: '6',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    coverUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop',
    description: 'A brief history of humankind, exploring how we came to be the dominant species.',
    duration: 54000, // 15 hours
    currentPosition: 54000,
    status: 'finished',
    dateAdded: new Date('2023-09-15'),
    dateFinished: new Date('2023-10-20'),
    chapters: [],
    bookmarks: [],
    playbackSpeed: 1.0,
  },
];
