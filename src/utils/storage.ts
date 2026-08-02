import type { LogoQuestion, MovieQuestion } from '@/types';
import { logoQuestions as defaultLogoQuestions } from '@/data/logoQuestions';
import { movieQuestions as defaultMovieQuestions } from '@/data/movieQuestions';

export interface ExtendedMovieQuestion extends MovieQuestion {
  _rawFile?: File | Blob;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const SETTINGS_KEY = 'fresher_arena_settings';
const LOGOS_KEY    = 'fresher_arena_logos';
const MOVIES_KEY   = 'fresher_arena_movies';

// ─── IndexedDB Persistent Storage (Stores Raw Video & Image Blobs) ────────────

const DB_NAME = 'FresherArenaMediaDB_v3';
const DB_VERSION = 1;
const STORE_NAME = 'app_metadata';
const BLOB_STORE_NAME = 'media_blobs';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser environment'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(BLOB_STORE_NAME)) {
        db.createObjectStore(BLOB_STORE_NAME);
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
      req.onerror = (err) => {
        console.error(`[IndexedDB Error] Failed fetching key "${key}":`, err);
        resolve(null);
      };
    });
  } catch (err) {
    console.error(`[IndexedDB Exception] getFromDB "${key}":`, err);
    return null;
  }
}

export async function saveToDB<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error(`[IndexedDB Exception] saveToDB "${key}":`, err);
  }
}

export async function saveMediaBlob(key: string, blob: Blob): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(BLOB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(BLOB_STORE_NAME);
      store.put(blob, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error(`[IndexedDB Exception] saveMediaBlob for key "${key}":`, err);
  }
}

export async function getMediaBlob(key: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(BLOB_STORE_NAME, 'readonly');
      const store = tx.objectStore(BLOB_STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deleteMediaBlob(key: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(BLOB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(BLOB_STORE_NAME);
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

function dataURItoBlob(dataURI: string): Blob {
  const parts = dataURI.split(',');
  const byteString = atob(parts[1]);
  const mimeString = parts[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

// ─── In-Memory Cache (Instant Synchronous Access) ────────────────────────────

let cachedMovies: MovieQuestion[] | null = null;
let cachedLogos: LogoQuestion[] | null  = null;

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

// ─── Movie Questions Storage (Binary Blob + IndexedDB Strategy) ──────────────

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
  try {
    let movies = cachedMovies;
    if (!movies || movies.length === 0) {
      movies = await getFromDB<MovieQuestion[]>(MOVIES_KEY);
    }
    if (!movies || movies.length === 0) {
      movies = getStoredMovies();
    }

    if (movies && Array.isArray(movies) && movies.length > 0) {
      // Re-hydrate video Blob URLs from IndexedDB for each movie clip
      const resolved = await Promise.all(
        movies.map(async (m) => {
          const blob = await getMediaBlob(m.id);
          if (blob) {
            const objectUrl = URL.createObjectURL(blob);
            return {
              ...m,
              dialogueSrc: objectUrl,
              videoUrl: objectUrl,
            };
          }
          const validSrc = m.dialogueSrc && !m.dialogueSrc.startsWith('blob:') ? m.dialogueSrc : '';
          return {
            ...m,
            dialogueSrc: validSrc,
            videoUrl: validSrc,
          };
        }),
      );

      cachedMovies = resolved;
      return resolved;
    }
  } catch (err) {
    console.error('[Storage Error] Failed to load movies from IndexedDB:', err);
  }

  return defaultMovieQuestions;
}

export function saveStoredMovies(movies: ExtendedMovieQuestion[]): void {
  cachedMovies = movies;

  // Execute async persistence pipeline in background
  saveStoredMoviesAsync(movies).catch((err) => {
    console.error('[Storage Error] saveStoredMoviesAsync failed:', err);
  });
}

export async function saveStoredMoviesAsync(movies: ExtendedMovieQuestion[]): Promise<void> {
  cachedMovies = movies;

  // 1. Save all raw binary video Blobs into IndexedDB BLOB_STORE_NAME
  for (const m of movies) {
    if (m._rawFile) {
      await saveMediaBlob(m.id, m._rawFile);
    } else if (m.dialogueSrc && m.dialogueSrc.startsWith('data:')) {
      try {
        const blob = dataURItoBlob(m.dialogueSrc);
        await saveMediaBlob(m.id, blob);
      } catch (err) {
        console.warn(`Failed converting data URI blob for movie ${m.id}`, err);
      }
    }
  }

  // 2. Clean metadata representation (strip out expired blob: URLs & huge base64 strings)
  const cleanMetadata: MovieQuestion[] = movies.map((m) => {
    const isBlobUrl = m.dialogueSrc && m.dialogueSrc.startsWith('blob:');
    const isHuge = m.dialogueSrc && m.dialogueSrc.length > 50000;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _rawFile, ...rest } = m;
    const srcToStore = isBlobUrl || isHuge ? '' : rest.dialogueSrc;
    return {
      ...rest,
      dialogueSrc: srcToStore,
      videoUrl: srcToStore,
    };
  });

  // 3. Save lightweight metadata to IndexedDB
  await saveToDB(MOVIES_KEY, cleanMetadata);

  // 4. Try saving lightweight metadata to localStorage as fallback
  try {
    localStorage.setItem(MOVIES_KEY, JSON.stringify(cleanMetadata));
  } catch (err) {
    console.warn('localStorage quota exceeded; metadata persisted cleanly in IndexedDB.', err);
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
