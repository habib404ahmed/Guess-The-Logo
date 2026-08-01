import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { GameSession, ChallengeType, AttemptResult } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GameContextValue {
  session: GameSession | null;
  startSession: (type: ChallengeType, totalQuestions: number) => void;
  recordAttempt: (attempt: AttemptResult) => void;
  nextQuestion: () => void;
  endSession: () => void;
  resetSession: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const GameContext = createContext<GameContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

interface GameProviderProps {
  children: ReactNode;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function GameProvider({ children }: GameProviderProps) {
  const [session, setSession] = useState<GameSession | null>(null);

  const startSession = useCallback((type: ChallengeType, totalQuestions: number) => {
    setSession({
      id: generateId(),
      challengeType: type,
      startedAt: Date.now(),
      totalQuestions,
      currentIndex: 0,
      score: 0,
      attempts: [],
    });
  }, []);

  const recordAttempt = useCallback((attempt: AttemptResult) => {
    setSession((prev) => {
      if (!prev) return prev;
      const question = prev.attempts.find((a) => a.questionId === attempt.questionId);
      if (question) return prev; // already recorded

      return {
        ...prev,
        score: attempt.isCorrect ? prev.score + 1 : prev.score,
        attempts: [...prev.attempts, attempt],
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, currentIndex: prev.currentIndex + 1 };
    });
  }, []);

  const endSession = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, endedAt: Date.now() };
    });
  }, []);

  const resetSession = useCallback(() => {
    setSession(null);
  }, []);

  return (
    <GameContext.Provider
      value={{ session, startSession, recordAttempt, nextQuestion, endSession, resetSession }}
    >
      {children}
    </GameContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used inside <GameProvider>');
  }
  return ctx;
}
