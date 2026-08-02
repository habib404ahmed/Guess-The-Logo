// ─── Types ─────────────────────────────────────────────────────────────────

/**
 * Route paths used throughout the app.
 * Centralizing them here prevents typos and makes refactoring easy.
 */
export const ROUTES = {
  HOME: '/',
  GUESS_LOGO: '/guess-logo',
  GUESS_MOVIE: '/guess-movie',
  ADMIN: '/admin',
  NOT_FOUND: '*',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Challenge types supported by the application.
 */
export type ChallengeType = 'logo' | 'movie';

/**
 * Difficulty levels for challenges.
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Generic answer option used in any challenge.
 */
export interface AnswerOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

/**
 * Result of a single question attempt.
 */
export interface AttemptResult {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  timeSpentMs: number;
}

/**
 * Shared shape for a challenge question.
 * Extended per-challenge with specific fields.
 */
export interface BaseQuestion {
  id: string;
  difficulty: Difficulty;
  options: AnswerOption[];
  hint?: string;
  points: number;
}

/**
 * A logo challenge question.
 */
export interface LogoQuestion extends BaseQuestion {
  type: 'logo';
  logoSrc: string;
  brandName: string;
  category: string;
}

/**
 * A movie challenge question.
 */
export interface MovieQuestion extends BaseQuestion {
  type: 'movie';
  dialogueSrc: string;
  videoUrl?: string;
  movieTitle: string;
  dialogueText?: string;
  releaseYear: number;
  genre: string;
  fileName?: string;
  thumbnail?: string;
  optionalHint?: string;
}

/**
 * Union of all question types.
 */
export type Question = LogoQuestion | MovieQuestion;

/**
 * Session-level game state.
 */
export interface GameSession {
  id: string;
  challengeType: ChallengeType;
  startedAt: number;
  endedAt?: number;
  totalQuestions: number;
  currentIndex: number;
  score: number;
  attempts: AttemptResult[];
}

/**
 * Navigation direction used for page transition animations.
 */
export type NavigationDirection = 'forward' | 'backward' | 'none';

/**
 * Shared props accepted by every page component.
 */
export interface PageProps {
  className?: string;
}

/**
 * Generic size variants used across the design system.
 */
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Semantic color variants used across components.
 */
export type ColorVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'ghost';

/**
 * Visual style variants for buttons.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
