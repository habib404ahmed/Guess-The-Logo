import type { MovieQuestion } from '@/types';

/**
 * Movie Questions
 * ─────────────────────────────────────────────────────────────────────────────
 * Each question shows a video clip / dialogue on screen.
 * Students guess which movie it's from.
 * Mix of Bollywood and Hollywood for freshers audience.
 */
export const movieQuestions: MovieQuestion[] = [
  {
    id: 'movie-01',
    type: 'movie',
    dialogueSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    movieTitle: 'The Dark Knight',
    releaseYear: 2008,
    genre: 'Superhero',
    difficulty: 'easy',
    points: 10,
    hint: 'DC Comics villain',
    dialogueText: '"Why so serious? Let\'s put a smile on that face!"',
    options: [
      { id: 'a', label: 'Batman Begins',    isCorrect: false },
      { id: 'b', label: 'The Dark Knight',  isCorrect: true  },
      { id: 'c', label: 'Joker',            isCorrect: false },
      { id: 'd', label: 'Avengers',         isCorrect: false },
    ],
  },
  {
    id: 'movie-02',
    type: 'movie',
    dialogueSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    movieTitle: 'Sholay',
    releaseYear: 1975,
    genre: 'Bollywood Action',
    difficulty: 'easy',
    points: 10,
    hint: 'Iconic Bollywood classic',
    dialogueText: '"Kitne aadmi the? Jo darr gaya, samjho mar gaya."',
    options: [
      { id: 'a', label: 'Deewar',    isCorrect: false },
      { id: 'b', label: 'Mughal-E-Azam', isCorrect: false },
      { id: 'c', label: 'Sholay',    isCorrect: true  },
      { id: 'd', label: 'Don',       isCorrect: false },
    ],
  },
  {
    id: 'movie-03',
    type: 'movie',
    dialogueSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    movieTitle: 'Forrest Gump',
    releaseYear: 1994,
    genre: 'Drama',
    difficulty: 'easy',
    points: 10,
    dialogueText: '"Life is like a box of chocolates... you never know what you\'re gonna get."',
    options: [
      { id: 'a', label: 'Cast Away',     isCorrect: false },
      { id: 'b', label: 'Forrest Gump',  isCorrect: true  },
      { id: 'c', label: 'The Green Mile', isCorrect: false },
      { id: 'd', label: 'Big Fish',       isCorrect: false },
    ],
  },
  {
    id: 'movie-04',
    type: 'movie',
    dialogueSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    movieTitle: '3 Idiots',
    releaseYear: 2009,
    genre: 'Bollywood Comedy',
    difficulty: 'easy',
    points: 10,
    dialogueText: '"All is well! Aal izz well!"',
    options: [
      { id: 'a', label: 'PK',          isCorrect: false },
      { id: 'b', label: 'Munna Bhai',  isCorrect: false },
      { id: 'c', label: 'Dangal',      isCorrect: false },
      { id: 'd', label: '3 Idiots',    isCorrect: true  },
    ],
  },
  {
    id: 'movie-05',
    type: 'movie',
    dialogueSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    movieTitle: 'Titanic',
    releaseYear: 1997,
    genre: 'Romance',
    difficulty: 'easy',
    points: 10,
    dialogueText: '"I\'m the king of the world!"',
    options: [
      { id: 'a', label: 'The Notebook',  isCorrect: false },
      { id: 'b', label: 'Titanic',       isCorrect: true  },
      { id: 'c', label: 'Romeo + Juliet',isCorrect: false },
      { id: 'd', label: 'Ghost',         isCorrect: false },
    ],
  },
  {
    id: 'movie-06',
    type: 'movie',
    dialogueSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    movieTitle: 'Avengers: Endgame',
    releaseYear: 2019,
    genre: 'Superhero',
    difficulty: 'medium',
    points: 15,
    dialogueText: '"Part of the journey is the end. I am Iron Man."',
    options: [
      { id: 'a', label: 'Avengers: Infinity War', isCorrect: false },
      { id: 'b', label: 'Iron Man 3',              isCorrect: false },
      { id: 'c', label: 'Avengers: Endgame',       isCorrect: true  },
      { id: 'd', label: 'Captain America',          isCorrect: false },
    ],
  },
  {
    id: 'movie-07',
    type: 'movie',
    dialogueSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreet.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreet.mp4',
    movieTitle: 'KGF: Chapter 2',
    releaseYear: 2022,
    genre: 'Indian Action',
    difficulty: 'easy',
    points: 10,
    dialogueText: '"My name is Rocky. Namma Rocky Bhai."',
    options: [
      { id: 'a', label: 'Pushpa',           isCorrect: false },
      { id: 'b', label: 'RRR',              isCorrect: false },
      { id: 'c', label: 'KGF: Chapter 2',   isCorrect: true  },
      { id: 'd', label: 'Baahubali',        isCorrect: false },
    ],
  },
];

/**
 * Famous dialogues mapped by movie ID.
 * Displayed as text on-screen during the challenge.
 */
export const movieDialogues: Record<string, { lines: string[]; speaker: string }> = {
  'movie-01': {
    speaker: 'The Joker',
    lines: [
      '"Why so serious?"',
      '"Let\'s put a smile on that face!"',
    ],
  },
  'movie-02': {
    speaker: 'Gabbar Singh',
    lines: [
      '"Kitne aadmi the?"',
      '"Jo darr gaya, samjho mar gaya."',
    ],
  },
  'movie-03': {
    speaker: 'Forrest',
    lines: [
      '"Life is like a box of chocolates..."',
      '"...you never know what you\'re gonna get."',
    ],
  },
  'movie-04': {
    speaker: 'Rancho',
    lines: [
      '"All is well!"',
      '"Aal izz well!"',
    ],
  },
  'movie-05': {
    speaker: 'Jack',
    lines: [
      '"I\'m the king of the world!"',
    ],
  },
  'movie-06': {
    speaker: 'Tony Stark',
    lines: [
      '"Part of the journey is the end."',
      '"I am Iron Man."',
    ],
  },
  'movie-07': {
    speaker: 'Rocky',
    lines: [
      '"My name is Rocky."',
      '"Namma Rocky Bhai."',
    ],
  },
};
