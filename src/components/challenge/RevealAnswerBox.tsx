import { motion, AnimatePresence } from 'framer-motion';

interface RevealAnswerBoxProps {
  answerText: string;
  subtitle?: string;
  hiddenTitle?: string;
  hiddenSubtitle?: string;
  isRevealed: boolean;
  onReveal: () => void;
  onNext: () => void;
  onReplay?: () => void;
  showReplayButton?: boolean;
  isLastQuestion: boolean;
  accentColor?: 'primary' | 'secondary';
}

export function RevealAnswerBox({
  answerText,
  subtitle,
  hiddenTitle = 'ANSWER HIDDEN',
  hiddenSubtitle = 'Think carefully... Click Reveal Answer when everyone has guessed.',
  isRevealed,
  onReveal,
  onNext,
  onReplay,
  showReplayButton = false,
  isLastQuestion,
  accentColor = 'primary',
}: RevealAnswerBoxProps) {
  const isPrimary = accentColor === 'primary';

  const glowColor = isPrimary ? 'rgba(59,130,246,0.5)' : 'rgba(168,85,247,0.5)';
  const borderColor = isPrimary ? 'rgba(59,130,246,0.6)' : 'rgba(168,85,247,0.6)';

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* ── Answer Display Panel ── */}
      <div className="relative w-full max-w-2xl">
        <AnimatePresence>
          {!isRevealed ? (
            /* ── BEFORE REVEAL: Glass Lock Panel ── */
            <motion.div
              key="hidden-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              className="relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl p-8 text-center backdrop-blur-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '2px dashed rgba(255, 255, 255, 0.15)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Glowing Lock & Question Mark Badge */}
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="text-3xl"
                >
                  🔒
                </motion.span>
                <span className="text-3xl">❓</span>
              </div>

              {/* Title */}
              <h3
                className="font-black tracking-wider text-[#f0f4ff]"
                style={{
                  fontFamily: 'Space Grotesk, system-ui, sans-serif',
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)',
                }}
              >
                {hiddenTitle}
              </h3>

              {/* Subtitle */}
              <p className="text-body max-w-md text-[#94a3b8]">
                {hiddenSubtitle}
              </p>
            </motion.div>
          ) : (
            /* ── AFTER REVEAL: Flash Light-Up TV Game Show Panel ── */
            <motion.div
              key="revealed-panel"
              initial={{ opacity: 0, scale: 0.88, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.3,
                ease: [0, 0, 0.2, 1],
              }}
              className="relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl p-8 text-center backdrop-blur-2xl"
              style={{
                background: isPrimary
                  ? 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(168,85,247,0.25))'
                  : 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(6,182,212,0.25))',
                border: `2px solid ${borderColor}`,
                boxShadow: `0 0 80px ${glowColor}, inset 0 0 30px rgba(255,255,255,0.15)`,
              }}
            >
              {/* Flash Light Overlay */}
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pointer-events-none absolute inset-0 z-0 bg-white"
              />

              {/* Confetti / Sparkle Icon */}
              <span className="relative z-10 text-4xl">✨</span>

              {/* Massive Answer Typography — Guaranteed Crisp White Visibility */}
              <h3
                className="relative z-10 font-black leading-tight tracking-tight text-white drop-shadow-md"
                style={{
                  fontFamily: 'Space Grotesk, system-ui, sans-serif',
                  fontSize: 'clamp(2.5rem, 6vw, 3.8rem)',
                  color: '#ffffff',
                  textShadow: isPrimary
                    ? '0 0 24px rgba(96,165,250,0.9), 0 0 48px rgba(168,85,247,0.7)'
                    : '0 0 24px rgba(192,132,252,0.9), 0 0 48px rgba(34,211,238,0.7)',
                }}
              >
                {answerText || 'Answer Revealed'}
              </h3>

              {subtitle && (
                <p className="relative z-10 text-body font-semibold text-[#94a3b8]">
                  {subtitle}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Oversized Stage Action Controls ── */}
      <div className="flex w-full max-w-xl flex-wrap items-center justify-center gap-4">
        {/* Replay Clip Button (if enabled) */}
        {showReplayButton && onReplay && (
          <motion.button
            key="btn-replay"
            id="replay-clip-btn"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="btn btn-xl flex-1 min-w-[200px] overflow-hidden"
            style={{
              height: '64px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onReplay}
          >
            <span className="text-2xl">▶️</span>
            <span className="font-extrabold tracking-wide text-lg">
              REPLAY CLIP
            </span>
          </motion.button>
        )}

        {/* Action Button: Reveal Answer OR Next Question */}
        <AnimatePresence mode="wait">
          {!isRevealed ? (
            /* ── REVEAL ANSWER BUTTON ── */
            <motion.button
              key="btn-reveal"
              id="reveal-answer-btn"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="btn btn-xl shimmer group flex-1 min-w-[220px] overflow-hidden"
              style={{
                height: '64px',
                background: isPrimary
                  ? 'linear-gradient(135deg, #3b82f6, #8b5cf6, #2563eb)'
                  : 'linear-gradient(135deg, #a855f7, #ec4899, #9333ea)',
                border: `1px solid ${borderColor}`,
                color: '#ffffff',
                boxShadow: `0 8px 36px ${glowColor}`,
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onReveal}
            >
              <span className="text-2xl">🎯</span>
              <span className="font-extrabold tracking-wide text-lg">
                REVEAL ANSWER
              </span>
            </motion.button>
          ) : (
            /* ── NEXT QUESTION BUTTON (Glowing Green Morph) ── */
            <motion.button
              key="btn-next"
              id="next-question-btn"
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
              className="btn btn-xl group flex-1 min-w-[220px] overflow-hidden"
              style={{
                height: '64px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                border: '1px solid rgba(34, 197, 94, 0.6)',
                color: '#ffffff',
                boxShadow: '0 8px 36px rgba(34, 197, 94, 0.45)',
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onNext}
            >
              <span className="font-extrabold tracking-wide text-lg">
                {isLastQuestion ? '🏆 VIEW FINAL RESULTS' : 'NEXT QUESTION'}
              </span>
              <span className="text-2xl">➡️</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
