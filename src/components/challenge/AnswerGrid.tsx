import { motion } from 'framer-motion';
import type { AnswerOption } from '@/types';
import { staggerContainer } from '@/animations/variants';

// ─── Answer state type ────────────────────────────────────────────────────────

export type AnswerState = 'idle' | 'correct' | 'wrong' | 'reveal';

interface AnswerGridProps {
  options: AnswerOption[];
  selectedId: string | null;
  answerState: AnswerState;
  /** Called when the user selects an option */
  onSelect: (option: AnswerOption) => void;
  disabled?: boolean;
  accentColor?: 'primary' | 'secondary';
}

// ─── Per-option state styles ─────────────────────────────────────────────────

function getOptionStyle(
  opt: AnswerOption,
  selectedId: string | null,
  answerState: AnswerState,
  accentColor: 'primary' | 'secondary',
): {
  background: string;
  border: string;
  color: string;
  boxShadow: string;
} {
  const isSelected = opt.id === selectedId;
  const revealed = answerState !== 'idle';

  if (!revealed) {
    return {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#f0f4ff',
      boxShadow: 'none',
    };
  }

  if (opt.isCorrect) {
    return {
      background: 'rgba(34,197,94,0.15)',
      border: '1px solid rgba(34,197,94,0.5)',
      color: '#4ade80',
      boxShadow: '0 0 20px rgba(34,197,94,0.25)',
    };
  }

  if (isSelected && !opt.isCorrect) {
    return {
      background: 'rgba(239,68,68,0.15)',
      border: '1px solid rgba(239,68,68,0.5)',
      color: '#f87171',
      boxShadow: '0 0 20px rgba(239,68,68,0.25)',
    };
  }

  return {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    color: '#475569',
    boxShadow: 'none',
  };
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Option letter labels
const LETTERS = ['A', 'B', 'C', 'D'];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AnswerGrid
 *
 * 2×2 grid of answer buttons. On selection, reveals correct/wrong states
 * with colour feedback and icons. Fully animated via Framer Motion.
 */
export function AnswerGrid({
  options,
  selectedId,
  answerState,
  onSelect,
  disabled = false,
  accentColor = 'primary',
}: AnswerGridProps) {
  const revealed = answerState !== 'idle';

  const hoverAccent =
    accentColor === 'primary'
      ? { background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.35)' }
      : { background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.35)' };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 gap-3 sm:gap-4"
    >
      {options.map((opt, i) => {
        const style = getOptionStyle(opt, selectedId, answerState, accentColor);
        const isSelected = opt.id === selectedId;
        const showCheckIcon = revealed && opt.isCorrect;
        const showXIcon = revealed && isSelected && !opt.isCorrect;

        return (
          <motion.button
            key={opt.id}
            id={`answer-option-${opt.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35, ease: [0, 0, 0.2, 1] }}
            onClick={() => !disabled && !revealed && onSelect(opt)}
            disabled={disabled || revealed}
            className="relative flex items-center gap-3 rounded-2xl p-4 text-left transition-all duration-200 sm:p-5"
            style={{
              background: style.background,
              border: style.border,
              color: style.color,
              boxShadow: style.boxShadow,
              cursor: revealed || disabled ? 'default' : 'pointer',
            }}
            whileHover={!revealed && !disabled ? hoverAccent : {}}
            whileTap={!revealed && !disabled ? { scale: 0.97 } : {}}
            aria-label={opt.label}
          >
            {/* Letter badge */}
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold"
              style={{
                background: revealed
                  ? opt.isCorrect
                    ? 'rgba(34,197,94,0.2)'
                    : isSelected
                    ? 'rgba(239,68,68,0.2)'
                    : 'rgba(255,255,255,0.04)'
                  : 'rgba(255,255,255,0.08)',
                color: style.color,
              }}
            >
              {LETTERS[i]}
            </span>

            {/* Label */}
            <span
              className="flex-1 font-medium leading-tight"
              style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.0625rem)' }}
            >
              {opt.label}
            </span>

            {/* Result icon */}
            {showCheckIcon && (
              <motion.span
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex-shrink-0 text-[#4ade80]"
              >
                <CheckIcon />
              </motion.span>
            )}
            {showXIcon && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex-shrink-0 text-[#f87171]"
              >
                <XIcon />
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
