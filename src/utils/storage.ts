import type { LogoQuestion, MovieQuestion } from '@/types';
import { logoQuestions as defaultLogoQuestions } from '@/data/logoQuestions';
import { movieQuestions as defaultMovieQuestions } from '@/data/movieQuestions';

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const SETTINGS_KEY = 'fresher_arena_settings';
const LOGOS_KEY    = 'fresher_arena_logos';
const MOVIES_KEY   = 'fresher_arena_movies';

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

/**
 * Ensures any question with brand name matching "sunstone" (case-insensitive)
 * is ALWAYS moved to the very last position in the array.
 */
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
  try {
    const raw = localStorage.getItem(LOGOS_KEY);
    if (raw) {
      const parsed: LogoQuestion[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return pinSunstoneLast(parsed);
      }
    }
  } catch (err) {
    console.warn('Failed to read logos from localStorage', err);
  }
  return pinSunstoneLast(defaultLogoQuestions);
}

export function saveStoredLogos(logos: LogoQuestion[]): void {
  try {
    const pinned = pinSunstoneLast(logos);
    localStorage.setItem(LOGOS_KEY, JSON.stringify(pinned));
  } catch (err) {
    console.error('Failed to save logos to localStorage', err);
  }
}

// ─── Movie Questions Storage ─────────────────────────────────────────────────

export function getStoredMovies(): MovieQuestion[] {
  try {
    const raw = localStorage.getItem(MOVIES_KEY);
    if (raw) {
      const parsed: MovieQuestion[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read movies from localStorage', err);
  }
  return defaultMovieQuestions;
}

export function saveStoredMovies(movies: MovieQuestion[]): void {
  try {
    localStorage.setItem(MOVIES_KEY, JSON.stringify(movies));
  } catch (err) {
    console.error('Failed to save movies to localStorage', err);
  }
}

// ─── Reset Data ──────────────────────────────────────────────────────────────

export function resetToDefaults(): void {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(LOGOS_KEY);
  localStorage.removeItem(MOVIES_KEY);
}
