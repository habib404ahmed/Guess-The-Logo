import type { LogoQuestion, MovieQuestion } from '@/types';
import { logoQuestions as defaultLogoQuestions } from '@/data/logoQuestions';
import { movieQuestions as defaultMovieQuestions } from '@/data/movieQuestions';

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const SETTINGS_KEY = 'fresher_arena_settings';
const LOGOS_KEY    = 'fresher_arena_logos';
const MOVIES_KEY   = 'fresher_arena_movies';

// ─── IndexedDB Persistent Storage (Handles 100MB+ Large Video Clips) ─────────

const DB_NAME = 'FresherArenaMediaDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_media';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

export async function getFromDB<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveToDB<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

// ─── In-Memory Cache (Instant Synchronous Access) ────────────────────────────

let cachedMovies: MovieQuestion[] | null = null;
let cachedLogos: LogoQuestion[] | null  = null;

// Pre-hydrate memory cache from IndexedDB asynchronously on load
if (typeof window !== 'undefined') {
  getFromDB<MovieQuestion[]>(MOVIES_KEY).then((data) => {
    if (data && Array.isArray(data) && data.length > 0) {
      cachedMovies = data;
    }
  });

  getFromDB<LogoQuestion[]>(LOGOS_KEY).then((data) => {
    if (data && Array.isArray(data) && data.length > 0) {
      cachedLogos = data;
    }
  });
}

// ─── Settings Interface ──────────────────────────────────────────────────────

export interface AppSettings {
  questionTimer: number; // 10, 15, 20, 30
  shuffleLogos: boolean;
  shuffleMovies: boolean;
  backgroundMusic: boolean;
  soundEffects: boolean;
  fullscreenByDefault: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  questionTimer: 20,
  shuffleLogos: false,
  shuffleMovies: false,
  backgroundMusic: true,
  soundEffects: true,
  fullscreenByDefault: false,
};

// ─── Helpers: Sunstone Pinning ───────────────────────────────────────────────

export function pinSunstoneLast(questions: LogoQuestion[]): LogoQuestion[] {
  const sunstoneItems = questions.filter(
    (q) => q.brandName.trim().toLowerCase() === 'sunstone',
  );
  const otherItems = questions.filter(
    (q) => q.brandName.trim().toLowerCase() !== 'sunstone',
  );

  return [...otherItems, ...sunstoneItems];
}

// ─── Settings Storage ────────────────────────────────────────────────────────

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Failed to read settings from localStorage', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

// ─── Logo Questions Storage ──────────────────────────────────────────────────

export function getStoredLogos(): LogoQuestion[] {
  if (cachedLogos && cachedLogos.length > 0) {
    return pinSunstoneLast(cachedLogos);
  }

  try {
    const raw = localStorage.getItem(LOGOS_KEY);
    if (raw) {
      const parsed: LogoQuestion[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedLogos = parsed;
        return pinSunstoneLast(parsed);
      }
    }
  } catch (err) {
    console.warn('Failed to read logos from localStorage', err);
  }
  return pinSunstoneLast(defaultLogoQuestions);
}

export async function getStoredLogosAsync(): Promise<LogoQuestion[]> {
  if (cachedLogos && cachedLogos.length > 0) {
    return pinSunstoneLast(cachedLogos);
  }

  const fromDB = await getFromDB<LogoQuestion[]>(LOGOS_KEY);
  if (fromDB && Array.isArray(fromDB) && fromDB.length > 0) {
    cachedLogos = fromDB;
    return pinSunstoneLast(fromDB);
  }

  return getStoredLogos();
}

export function saveStoredLogos(logos: LogoQuestion[]): void {
  const pinned = pinSunstoneLast(logos);
  cachedLogos = pinned;

  saveToDB(LOGOS_KEY, pinned);

  try {
    localStorage.setItem(LOGOS_KEY, JSON.stringify(pinned));
  } catch (err) {
    console.warn('localStorage quota exceeded for logos; persisted in IndexedDB.', err);
  }
}

// ─── Movie Questions Storage ─────────────────────────────────────────────────

export function getStoredMovies(): MovieQuestion[] {
  if (cachedMovies && cachedMovies.length > 0) {
    return cachedMovies;
  }

  try {
    const raw = localStorage.getItem(MOVIES_KEY);
    if (raw) {
      const parsed: MovieQuestion[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedMovies = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read movies from localStorage', err);
  }
  return defaultMovieQuestions;
}

export async function getStoredMoviesAsync(): Promise<MovieQuestion[]> {
  if (cachedMovies && cachedMovies.length > 0) {
    return cachedMovies;
  }

  const fromDB = await getFromDB<MovieQuestion[]>(MOVIES_KEY);
  if (fromDB && Array.isArray(fromDB) && fromDB.length > 0) {
    cachedMovies = fromDB;
    return fromDB;
  }

  return getStoredMovies();
}

export function saveStoredMovies(movies: MovieQuestion[]): void {
  cachedMovies = movies;

  // 1. Save to IndexedDB (Handles unlimited MBs of video Data URLs without quota limits)
  saveToDB(MOVIES_KEY, movies);

  // 2. Try saving to localStorage as lightweight fallback
  try {
    localStorage.setItem(MOVIES_KEY, JSON.stringify(movies));
  } catch (err) {
    console.warn('localStorage quota exceeded for movies; persisted in IndexedDB.', err);
  }
}

// ─── Reset Data ──────────────────────────────────────────────────────────────

export function resetToDefaults(): void {
  cachedMovies = null;
  cachedLogos  = null;
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(LOGOS_KEY);
  localStorage.removeItem(MOVIES_KEY);
  saveToDB(MOVIES_KEY, null);
  saveToDB(LOGOS_KEY, null);
}
