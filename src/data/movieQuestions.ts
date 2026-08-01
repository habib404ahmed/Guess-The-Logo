import type { MovieQuestion } from '@/types';

/**
 * Movie Questions
 * ─────────────────────────────────────────────────────────────────────────────
 * Each question shows a famous movie dialogue on screen.
 * Students guess which movie it's from.
 * Mix of Bollywood and Hollywood for freshers audience.
 */
export const movieQuestions: MovieQuestion[] = [
  {
    id: 'movie-01',
    type: 'movie',
    dialogueSrc: '',
    movieTitle: 'The Dark Knight',
    releaseYear: 2008,
    genre: 'Superhero',
    difficulty: 'easy',
    points: 10,
    hint: 'DC Comics villain',
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
    dialogueSrc: '',
    movieTitle: 'Sholay',
    releaseYear: 1975,
    genre: 'Bollywood Action',
    difficulty: 'easy',
    points: 10,
    hint: 'Iconic Bollywood classic',
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
    dialogueSrc: '',
    movieTitle: 'Forrest Gump',
    releaseYear: 1994,
    genre: 'Drama',
    difficulty: 'easy',
    points: 10,
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
    dialogueSrc: '',
    movieTitle: '3 Idiots',
    releaseYear: 2009,
    genre: 'Bollywood Comedy',
    difficulty: 'easy',
    points: 10,
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
    dialogueSrc: '',
    movieTitle: 'Titanic',
    releaseYear: 1997,
    genre: 'Romance',
    difficulty: 'easy',
    points: 10,
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
    dialogueSrc: '',
    movieTitle: 'Avengers: Endgame',
    releaseYear: 2019,
    genre: 'Superhero',
    difficulty: 'medium',
    points: 15,
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
    dialogueSrc: '',
    movieTitle: 'KGF: Chapter 2',
    releaseYear: 2022,
    genre: 'Indian Action',
    difficulty: 'easy',
    points: 10,
    options: [
      { id: 'a', label: 'Pushpa',           isCorrect: false },
      { id: 'b', label: 'RRR',              isCorrect: false },
      { id: 'c', label: 'KGF: Chapter 2',   isCorrect: true  },
      { id: 'd', label: 'Baahubali',        isCorrect: false },
    ],
  },
  {
    id: 'movie-08',
    type: 'movie',
    dialogueSrc: '',
    movieTitle: 'Spider-Man: No Way Home',
    releaseYear: 2021,
    genre: 'Superhero',
    difficulty: 'medium',
    points: 15,
    options: [
      { id: 'a', label: 'Spider-Man: Homecoming',   isCorrect: false },
      { id: 'b', label: 'Spider-Man: No Way Home',  isCorrect: true  },
      { id: 'c', label: 'Doctor Strange',            isCorrect: false },
      { id: 'd', label: 'Into the Spider-Verse',     isCorrect: false },
    ],
  },
  {
    id: 'movie-09',
    type: 'movie',
    dialogueSrc: '',
    movieTitle: 'Dilwale Dulhania Le Jayenge',
    releaseYear: 1995,
    genre: 'Bollywood Romance',
    difficulty: 'medium',
    points: 15,
    hint: 'DDLJ',
    options: [
      { id: 'a', label: 'Kuch Kuch Hota Hai', isCorrect: false },
      { id: 'b', label: 'Kabhi Khushi Kabhie Gham', isCorrect: false },
      { id: 'c', label: 'DDLJ',               isCorrect: true  },
      { id: 'd', label: 'Dil To Pagal Hai',   isCorrect: false },
    ],
  },
  {
    id: 'movie-10',
    type: 'movie',
    dialogueSrc: '',
    movieTitle: 'Inception',
    releaseYear: 2010,
    genre: 'Sci-Fi Thriller',
    difficulty: 'hard',
    points: 20,
    options: [
      { id: 'a', label: 'Interstellar', isCorrect: false },
      { id: 'b', label: 'The Matrix',   isCorrect: false },
      { id: 'c', label: 'Inception',    isCorrect: true  },
      { id: 'd', label: 'Tenet',        isCorrect: false },
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
  'movie-08': {
    speaker: 'Peter Parker',
    lines: [
      '"With great power comes great responsibility."',
      '"I\'m... different. We\'re all different."',
    ],
  },
  'movie-09': {
    speaker: 'Raj',
    lines: [
      '"Bade bade deshon mein..."',
      '"...aisi choti choti baatein hoti rehti hain, Senorita."',
    ],
  },
  'movie-10': {
    speaker: 'Cobb',
    lines: [
      '"You\'re waiting for a train..."',
      '"A train that will take you far away."',
      '"You know where you hope this train will take you..."',
      '"But you can\'t know for sure."',
    ],
  },
};
