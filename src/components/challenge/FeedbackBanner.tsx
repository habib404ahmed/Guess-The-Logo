import { motion, AnimatePresence } from 'framer-motion';
import type { AnswerState } from './AnswerGrid';

interface FeedbackBannerProps {
  state: AnswerState;
  correctLabel: string;
}

/**
 * FeedbackBanner
 *
 * Slides up from the bottom when an answer is selected.
 * Shows CORRECT ✓ in green or WRONG ✗ in red with the correct answer.
 */
export function FeedbackBanner({ state, correctLabel }: FeedbackBannerProps) {
  const isCorrect = state === 'correct';
  const isVisible = state === 'correct' || state === 'wrong';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
          className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4"
          style={{
            background: isCorrect ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
            boxShadow: `0 0 24px ${isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
          }}
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <span
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
              style={{
                background: isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                color: isCorrect ? '#4ade80' : '#f87171',
              }}
            >
              {isCorrect ? '✓' : '✗'}
            </span>

            {/* Label */}
            <div>
              <p
                className="font-bold"
                style={{
                  color: isCorrect ? '#4ade80' : '#f87171',
                  fontFamily: 'Space Grotesk, system-ui, sans-serif',
                  fontSize: '1rem',
                }}
              >
                {isCorrect ? 'Correct!' : 'Wrong!'}
              </p>
              {!isCorrect && (
                <p className="text-label text-[#94a3b8]">
                  Answer: <span className="font-semibold text-[#f0f4ff]">{correctLabel}</span>
                </p>
              )}
            </div>
          </div>

          {isCorrect && (
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
              className="text-2xl"
            >
              🎉
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
