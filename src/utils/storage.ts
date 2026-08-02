import type { LogoQuestion, MovieQuestion } from '@/types';
import { logoQuestions as defaultLogoQuestions } from '@/data/logoQuestions';
import { movieQuestions as defaultMovieQuestions } from '@/data/movieQuestions';

// ─── Extended Type ────────────────────────────────────────────────────────────

export interface ExtendedMovieQuestion extends MovieQuestion {
  _rawFile?: File | Blob;
  videoBlob?: Blob;
  videoFile?: File;
  videoPath?: string;
  video?: string;
  file?: File | Blob;
  src?: string;
  media?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_SAMPLE_VIDEOS = [
  'https://vjs.zencdn.net/v/oceans.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
];

const SETTINGS_KEY = 'fresher_arena_settings';
const LOGOS_KEY    = 'fresher_arena_logos';
const MOVIES_KEY   = 'fresher_arena_movies';

// ─── IndexedDB ───────────────────────────────────────────────────────────────

const DB_NAME         = 'FresherArenaMediaDB_v3';
const DB_VERSION      = 1;
const STORE_NAME      = 'app_metadata';
const BLOB_STORE_NAME = 'media_blobs';

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
      if (!db.objectStoreNames.contains(STORE_NAME))      db.createObjectStore(STORE_NAME);
      if (!db.objectStoreNames.contains(BLOB_STORE_NAME)) db.createObjectStore(BLOB_STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror   = () => reject(request.error);
  });

  return dbPromise;
}

export async function getFromDB<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx    = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req   = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror   = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveToDB<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  } catch (err) {
    console.error(`[IndexedDB] saveToDB "${key}":`, err);
  }
}

export async function saveMediaBlob(key: string, blob: Blob): Promise<void> {
  if (!blob || blob.size === 0) {
    console.warn(`[IndexedDB] saveMediaBlob: skipping empty blob for key "${key}"`);
    return;
  }
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(BLOB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(BLOB_STORE_NAME);
      store.put(blob, key);
      tx.oncomplete = () => {
        console.log(`[IndexedDB] ✅ Saved blob for key="${key}" size=${blob.size} bytes`);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error(`[IndexedDB] saveMediaBlob "${key}":`, err);
  }
}

export async function getMediaBlob(key: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx    = db.transaction(BLOB_STORE_NAME, 'readonly');
      const store = tx.objectStore(BLOB_STORE_NAME);
      const req   = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror   = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deleteMediaBlob(key: string): Promise<void> {
  // Revoke cached Object URL
  const existingUrl = cachedObjectUrls.get(key);
  if (existingUrl) {
    URL.revokeObjectURL(existingUrl);
    cachedObjectUrls.delete(key);
  }

  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx    = db.transaction(BLOB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(BLOB_STORE_NAME);
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => resolve();
    });
  } catch {
    // ignore
  }
}

function dataURItoBlob(dataURI: string): Blob {
  const parts       = dataURI.split(',');
  const byteString  = atob(parts[1]);
  const mimeString  = parts[0].split(':')[1].split(';')[0];
  const ab          = new ArrayBuffer(byteString.length);
  const ia          = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: mimeString });
}

// ─── Session-Level Object URL Cache ──────────────────────────────────────────
// Maps question id → valid blob:// URL for the current browser session.
// Never revoke these until the question is deleted — they're safe for the entire session.

const cachedObjectUrls = new Map<string, string>();

/** Look up a cached Object URL (may be stale after page refresh — always validate). */
export function getCachedObjectUrl(id: string): string | undefined {
  return cachedObjectUrls.get(id);
}

/** Store an Object URL in the session cache. */
export function setCachedObjectUrl(id: string, url: string): void {
  cachedObjectUrls.set(id, url);
}

// ─── In-Memory Movie/Logo Cache ───────────────────────────────────────────────

let cachedMovies: MovieQuestion[] | null = null;
let cachedLogos: LogoQuestion[] | null   = null;

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AppSettings {
  questionTimer: number;
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

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

// ─── Logo Storage ─────────────────────────────────────────────────────────────

export function pinSunstoneLast(questions: LogoQuestion[]): LogoQuestion[] {
  const sunstone = questions.filter((q) => q.brandName.trim().toLowerCase() === 'sunstone');
  const others   = questions.filter((q) => q.brandName.trim().toLowerCase() !== 'sunstone');
  return [...others, ...sunstone];
}

export function getStoredLogos(): LogoQuestion[] {
  if (cachedLogos && cachedLogos.length > 0) return pinSunstoneLast(cachedLogos);
  try {
    const raw = localStorage.getItem(LOGOS_KEY);
    if (raw) {
      const parsed: LogoQuestion[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedLogos = parsed;
        return pinSunstoneLast(parsed);
      }
    }
  } catch {}
  return pinSunstoneLast(defaultLogoQuestions);
}

export async function getStoredLogosAsync(): Promise<LogoQuestion[]> {
  if (cachedLogos && cachedLogos.length > 0) return pinSunstoneLast(cachedLogos);
  const fromDB = await getFromDB<LogoQuestion[]>(LOGOS_KEY);
  if (fromDB && Array.isArray(fromDB) && fromDB.length > 0) {
    cachedLogos = fromDB;
    return pinSunstoneLast(fromDB);
  }
  return getStoredLogos();
}

export function saveStoredLogos(logos: LogoQuestion[]): void {
  const pinned = pinSunstoneLast(logos);
  cachedLogos  = pinned;
  saveToDB(LOGOS_KEY, pinned);
  try {
    localStorage.setItem(LOGOS_KEY, JSON.stringify(pinned));
  } catch {}
}

// ─── Movie Storage ────────────────────────────────────────────────────────────
//
// ARCHITECTURE:
//   • Raw video binary  → IndexedDB BLOB_STORE_NAME (keyed by question id)
//   • Metadata (title, dialogueText, options etc.) → IndexedDB STORE_NAME + localStorage
//   • Metadata NEVER stores blob: URLs — they expire when the browser session ends.
//     Instead metadata stores '' for uploaded videos, or https:// for sample videos.
//   • Session-level Object URLs → cachedObjectUrls Map (in-memory, recreated each session)
//
// LOAD FLOW (getStoredMoviesAsync):
//   1. Load metadata from IndexedDB (or localStorage fallback)
//   2. For each question: check cachedObjectUrls → getMediaBlob → create fresh Object URL
//   3. If blob not found: use https:// URL from metadata, or sample video fallback
//   4. Never use blob: URLs from stored metadata — they are always expired

/**
 * Sync metadata reader. Returns movies with SAMPLE video URLs only —
 * uploaded video URLs must come from getStoredMoviesAsync() (async).
 *
 * FIX BUG #3: Only use non-blob URLs from localStorage. Expired blob:
 * URLs are replaced with sample videos so the UI never gets a dead URL.
 */
export function getStoredMovies(): MovieQuestion[] {
  if (cachedMovies && cachedMovies.length > 0) return cachedMovies;

  try {
    const raw = localStorage.getItem(MOVIES_KEY);
    if (raw) {
      const parsed: MovieQuestion[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const enriched = parsed.map((m, idx) => {
          // FIX BUG #3: never use stored blob: URLs — they are expired in a new session
          const fallback   = DEFAULT_SAMPLE_VIDEOS[idx % DEFAULT_SAMPLE_VIDEOS.length];
          const storedSrc  = m.dialogueSrc && !m.dialogueSrc.startsWith('blob:') ? m.dialogueSrc
                           : m.videoUrl    && !m.videoUrl.startsWith('blob:')    ? m.videoUrl
                           : fallback;
          return { ...m, dialogueSrc: storedSrc, videoUrl: storedSrc };
        });
        cachedMovies = enriched;
        return enriched;
      }
    }
  } catch (err) {
    console.warn('[Storage] Failed to read movies from localStorage:', err);
  }

  return defaultMovieQuestions;
}

/**
 * Async movie loader. Re-hydrates binary blobs from IndexedDB for each question,
 * creating fresh session-scoped Object URLs. This is the only correct way to get
 * valid video URLs for uploaded clips.
 *
 * FIX BUG #1 + BUG #3: Does not rely on stored blob: URLs. Always reads
 * binary from IndexedDB blob store and creates a fresh Object URL.
 */
export async function getStoredMoviesAsync(): Promise<MovieQuestion[]> {
  try {
    // 1. Load raw metadata (question ids, titles, etc.) from IndexedDB
    let rawMovies = await getFromDB<MovieQuestion[]>(MOVIES_KEY);
    if (!rawMovies || rawMovies.length === 0) {
      // Fallback: read from localStorage (sync path)
      rawMovies = getStoredMovies();
    }

    if (!rawMovies || rawMovies.length === 0) {
      console.warn('[Storage] No movies found in IndexedDB or localStorage. Using defaults.');
      return defaultMovieQuestions;
    }

    // 2. Hydrate each question with a valid video URL
    const hydrated = await Promise.all(
      rawMovies.map(async (m, idx) => {
        // ── Path A: Already have a valid Object URL in session cache ──────────
        const cached = cachedObjectUrls.get(m.id);
        if (cached) {
          console.log(`[Storage] ✅ CACHE HIT  | id=${m.id}`);
          return {
            ...m,
            dialogueSrc: cached,
            videoUrl: cached,
            video: cached,
            src: cached,
            media: cached,
          } as ExtendedMovieQuestion;
        }

        // ── Path B: Fetch binary blob from IndexedDB and create Object URL ───
        const t0   = performance.now();
        const blob = await getMediaBlob(m.id);
        const dt   = (performance.now() - t0).toFixed(1);

        if (blob && blob.size > 0) {
          const objectUrl = URL.createObjectURL(blob);
          cachedObjectUrls.set(m.id, objectUrl);
          console.log(`[Storage] ✅ BLOB FOUND | id=${m.id} size=${blob.size} bytes dt=${dt}ms url=${objectUrl.slice(0, 40)}`);
          return {
            ...m,
            dialogueSrc: objectUrl,
            videoUrl: objectUrl,
            videoBlob: blob,
            videoFile: blob as File,
            file: blob,
            videoPath: m.fileName || `${m.movieTitle}.mp4`,
            video: objectUrl,
            src: objectUrl,
            media: objectUrl,
          } as ExtendedMovieQuestion;
        }

        // ── Path C: No blob in store — use a non-expired URL ─────────────────
        // Never use stored blob: URLs — they are always expired in a new session.
        const fallbackSrc   = DEFAULT_SAMPLE_VIDEOS[idx % DEFAULT_SAMPLE_VIDEOS.length];
        const httpsUrl      = m.dialogueSrc && !m.dialogueSrc.startsWith('blob:') ? m.dialogueSrc
                            : m.videoUrl    && !m.videoUrl.startsWith('blob:')    ? m.videoUrl
                            : null;
        const validSrc      = httpsUrl || fallbackSrc;

        console.warn(`[Storage] ⚠ NO BLOB    | id=${m.id} dt=${dt}ms fallback="${validSrc}"`);

        return {
          ...m,
          dialogueSrc: validSrc,
          videoUrl: validSrc,
          videoPath: m.fileName || `${m.movieTitle}.mp4`,
          video: validSrc,
          src: validSrc,
          media: validSrc,
        } as ExtendedMovieQuestion;
      }),
    );

    cachedMovies = hydrated;
    console.log(`[Storage] Loaded ${hydrated.length} movies. IDs: ${hydrated.map((m) => m.id).join(', ')}`);
    return hydrated;
  } catch (err) {
    console.error('[Storage] getStoredMoviesAsync failed:', err);
    return defaultMovieQuestions;
  }
}

/**
 * Save movies metadata + blobs to IndexedDB.
 * FIX BUG #1: NEVER stores blob: URLs in metadata. Metadata only keeps:
 *   • '' (empty string)  — uploaded video (binary lives in blob store)
 *   • https:// URL       — sample video (no binary in blob store)
 *
 * This means on next session, getStoredMoviesAsync correctly goes to the blob
 * store for uploaded videos instead of using an expired blob: URL.
 */
export function saveStoredMovies(movies: ExtendedMovieQuestion[]): void {
  cachedMovies = movies;
  // Fire-and-forget async save
  saveStoredMoviesAsync(movies).catch((err) => {
    console.error('[Storage] saveStoredMoviesAsync failed:', err);
  });
}

export async function saveStoredMoviesAsync(movies: ExtendedMovieQuestion[]): Promise<void> {
  cachedMovies = movies;

  // STEP 1: Persist binary blobs for all movies that have them
  for (const m of movies) {
    // Prefer raw file/blob fields set during import
    const candidateBlob = m._rawFile || m.videoBlob || m.videoFile || m.file;
    if (candidateBlob && candidateBlob.size > 0) {
      await saveMediaBlob(m.id, candidateBlob);
      continue;
    }

    // If dialogueSrc is a blob: URL from the current session, fetch its binary
    if (m.dialogueSrc && m.dialogueSrc.startsWith('blob:')) {
      try {
        const response = await fetch(m.dialogueSrc);
        const blob     = await response.blob();
        if (blob && blob.size > 0) {
          await saveMediaBlob(m.id, blob);
        }
      } catch {
        // Blob URL already expired or inaccessible — binary already in store from import
      }
    } else if (m.dialogueSrc && m.dialogueSrc.startsWith('data:')) {
      try {
        const blob = dataURItoBlob(m.dialogueSrc);
        await saveMediaBlob(m.id, blob);
      } catch {}
    }
  }

  // STEP 2: Build CLEAN metadata — strip all binary data and blob: URLs
  //
  // FIX BUG #1: blob: URLs are session-scoped. Storing them makes metadata
  // useless on next session. We store '' for uploaded videos (binary in blob store),
  // and keep https:// URLs for sample/remote videos.
  const cleanMetadata: MovieQuestion[] = movies.map((m) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _rawFile, videoBlob, videoFile, file, ...rest } = m as ExtendedMovieQuestion & Record<string, unknown>;

    const isBlob    = rest.dialogueSrc && (rest.dialogueSrc as string).startsWith('blob:');
    const isDataUri = rest.dialogueSrc && (rest.dialogueSrc as string).startsWith('data:');

    // For uploaded videos (blob: or data:) → clear from metadata (binary is in blob store)
    // For remote videos (https://) → keep the URL so they still work without blob store
    const srcToStore = (isBlob || isDataUri)
      ? ''  // ← Uploaded videos: binary in blob store, no URL needed in metadata
      : (rest.dialogueSrc as string) || '';

    return {
      id:           rest.id as string,
      type:         'movie' as const,
      movieTitle:   rest.movieTitle as string,
      dialogueText: rest.dialogueText as string | undefined,
      dialogueSrc:  srcToStore,
      videoUrl:     srcToStore,
      releaseYear:  rest.releaseYear as number,
      genre:        rest.genre as string,
      difficulty:   rest.difficulty as 'easy' | 'medium' | 'hard',
      points:       rest.points as number,
      hint:         rest.hint as string | undefined,
      optionalHint: rest.optionalHint as string | undefined,
      fileName:     rest.fileName as string | undefined,
      thumbnail:    rest.thumbnail as string | undefined,
      options:      rest.options as MovieQuestion['options'],
    };
  });

  // STEP 3: Persist lightweight metadata to IndexedDB
  await saveToDB(MOVIES_KEY, cleanMetadata);

  // STEP 4: Also try localStorage (may fail if quota exceeded for large datasets)
  try {
    localStorage.setItem(MOVIES_KEY, JSON.stringify(cleanMetadata));
  } catch {
    console.warn('[Storage] localStorage quota exceeded. Metadata is safely in IndexedDB.');
  }

  console.log(`[Storage] ✅ Saved ${movies.length} movies. Binary blobs in blob store, clean metadata in IndexedDB.`);
}

// ─── Reset ────────────────────────────────────────────────────────────────────

export function resetToDefaults(): void {
  cachedMovies = null;
  cachedLogos  = null;
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(LOGOS_KEY);
  localStorage.removeItem(MOVIES_KEY);
  saveToDB(MOVIES_KEY, null);
  saveToDB(LOGOS_KEY, null);
}
