/**
 * cn — Class Name utility
 *
 * Merges class names, filtering out falsy values.
 * Lightweight alternative to clsx for this project.
 *
 * @example
 * cn('base-class', isActive && 'active', undefined)
 * // → 'base-class active'
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a duration in milliseconds to "m:ss" string.
 *
 * @example
 * formatDuration(65000) // → "1:05"
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Shuffles an array in place using Fisher-Yates and returns it.
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Waits for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamps a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a deterministic UUID-like string from a seed.
 * Not cryptographically secure — only for IDs.
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Formats a score as a percentage string.
 *
 * @example
 * formatScore(7, 10) // → "70%"
 */
export function formatScore(correct: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((correct / total) * 100)}%`;
}

/**
 * Returns an accessibility-friendly result label based on score.
 */
export function getScoreLabel(correct: number, total: number): string {
  const pct = total > 0 ? correct / total : 0;
  if (pct === 1) return 'Perfect!';
  if (pct >= 0.8) return 'Excellent!';
  if (pct >= 0.6) return 'Good job!';
  if (pct >= 0.4) return 'Not bad!';
  return 'Keep trying!';
}
