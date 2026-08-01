import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCountdownOptions {
  /** Duration in seconds */
  duration: number;
  /** Called when timer reaches zero */
  onExpire?: () => void;
  /** Whether to start automatically */
  autoStart?: boolean;
}

interface UseCountdownReturn {
  seconds: number;
  progress: number; // 0–1, where 1 = full time remaining
  isRunning: boolean;
  isExpired: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

/**
 * Countdown timer hook.
 * Tracks remaining seconds, progress ratio, and running state.
 */
export function useCountdown({
  duration,
  onExpire,
  autoStart = false,
}: UseCountdownOptions): UseCountdownReturn {
  const [seconds, setSeconds] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!isRunning) return;

    if (seconds <= 0) {
      setIsRunning(false);
      onExpireRef.current?.();
      return;
    }

    const id = setTimeout(() => {
      setSeconds((s) => s - 1);
    }, 1000);

    return () => clearTimeout(id);
  }, [seconds, isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(duration);
  }, [duration]);

  return {
    seconds,
    progress: seconds / duration,
    isRunning,
    isExpired: seconds === 0 && !isRunning,
    start,
    pause,
    reset,
  };
}
