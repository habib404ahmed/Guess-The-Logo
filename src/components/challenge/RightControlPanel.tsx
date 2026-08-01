import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '@/utils/audioManager';
import { speechSynthesizer } from '@/utils/speechSynthesizer';

interface RightControlPanelProps {
  questionIndex: number;
  totalQuestions: number;
  categoryOrGenre: string;
  questionLabel: string;
  answerText: string;
  dialogueText?: string;
  optionalHint?: string;
  subtitle?: string;
  isRevealed: boolean;
  onReveal: () => void;
  onNext: () => void;
  onReplay?: () => void;
  showReplayButton?: boolean;
  isLastQuestion: boolean;
  accentColor?: 'primary' | 'secondary';
  isDisabled?: boolean;
}

export function RightControlPanel({
  questionIndex,
  totalQuestions,
  categoryOrGenre,
  questionLabel,
  answerText,
  dialogueText,
  optionalHint,
  subtitle,
  isRevealed,
  onReveal,
  onNext,
  onReplay,
  showReplayButton = false,
  isLastQuestion,
  accentColor = 'primary',
  isDisabled = false,
}: RightControlPanelProps) {
  const isPrimary = accentColor === 'primary';

  const glowColor = isPrimary ? 'rgba(59,130,246,0.5)' : 'rgba(168,85,247,0.5)';
  const borderColor = isPrimary ? 'rgba(59,130,246,0.6)' : 'rgba(168,85,247,0.6)';
  const badgeColor = isPrimary ? '#60a5fa' : '#c084fc';

  const handleRevealClick = () => {
    if (isDisabled) return;
    audioManager.playRevealSequence(() => {
      onReveal();
    });
    speechSynthesizer.speakReveal(answerText);
  };

  const handleNextClick = () => {
    if (isDisabled) return;
    audioManager.playGameShowTransition();
    onNext();
    speechSynthesizer.speakNextQuestion(isLastQuestion);
  };

  const handleReplayClick = () => {
    if (isDisabled) return;
    audioManager.playClick();
    if (onReplay) onReplay();
  };

  return (
    <motion.div
      layout
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 w-full items-stretch"
    >
      {/* ── 1. Question Information Card ── */}
      <motion.div
        layout
        className="flex flex-col gap-2 rounded-2xl p-5 border backdrop-blur-2xl relative overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-black tracking-widest uppercase"
            style={{ color: badgeColor }}
          >
            {categoryOrGenre}
          </span>
          <span className="rounded-full bg-white/10 border border-white/15 px-3 py-0.5 text-xs font-bold text-slate-200">
            Question {questionIndex} of {totalQuestions}
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-[#f0f4ff] leading-snug">
          {questionLabel}
        </h2>
      </motion.div>

      {/* ── 2. Dialogue Clue Card (Movie Challenge BEFORE Reveal ONLY) ── */}
      <AnimatePresence mode="popLayout">
        {!isRevealed && dialogueText && (
          <motion.div
            key="dialogue-clue-card"
            layout
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.94 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col gap-2 rounded-2xl p-5 backdrop-blur-2xl border border-purple-500/40 bg-purple-950/30 shadow-xl shadow-purple-500/15"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">📝</span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Dialogue Clue
              </span>
            </div>
            <p
              className="text-base sm:text-lg font-semibold italic text-[#f0f4ff] leading-relaxed"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              "{dialogueText}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. Dynamic Answer Card (Created ONLY WHEN isRevealed === true) ── */}
      <AnimatePresence mode="popLayout">
        {isRevealed && (
          <motion.div
            key="dynamic-answer-card"
            layout
            initial={{ opacity: 0, scale: 0.75, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              duration: 0.5,
              ease: [0.175, 0.885, 0.32, 1.275], // Dramatic bounce
            }}
            className="relative w-full flex flex-col items-center justify-center gap-2.5 overflow-hidden rounded-3xl p-6 text-center backdrop-blur-2xl"
            style={{
              background: isPrimary
                ? 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(168,85,247,0.35))'
                : 'linear-gradient(135deg, rgba(168,85,247,0.35), rgba(6,182,212,0.35))',
              border: `2px solid ${borderColor}`,
              boxShadow: `0 0 80px ${glowColor}, inset 0 0 35px rgba(255,255,255,0.25)`,
            }}
          >
            {/* Flash Light Burst */}
            <motion.div
              initial={{ opacity: 1, scale: 0.5 }}
              animate={{ opacity: 0, scale: 1.8 }}
              transition={{ duration: 0.6 }}
              className="pointer-events-none absolute inset-0 z-0 bg-white"
            />

            <span className="relative z-10 text-4xl drop-shadow-md">
              {isPrimary ? '🏢' : '🎬'}
            </span>

            {/* Company Name / Movie Name Display */}
            <h3
              className="relative z-10 font-black leading-tight tracking-tight text-white drop-shadow-xl"
              style={{
                fontFamily: 'Space Grotesk, system-ui, sans-serif',
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                color: '#ffffff',
                textShadow: isPrimary
                  ? '0 0 30px rgba(96,165,250,1), 0 0 60px rgba(168,85,247,0.9)'
                  : '0 0 30px rgba(192,132,252,1), 0 0 60px rgba(34,211,238,0.9)',
              }}
            >
              {answerText || 'Answer Revealed'}
            </h3>

            {/* 💡 Hint (if available) */}
            {optionalHint && (
              <p className="relative z-10 text-xs sm:text-sm font-semibold text-[#c084fc] bg-purple-500/20 border border-purple-500/40 px-4 py-1 rounded-xl shadow-lg">
                💡 Hint: {optionalHint}
              </p>
            )}

            {/* Subtitle / Category (if provided & no hint) */}
            {!optionalHint && subtitle && (
              <p className="relative z-10 text-xs sm:text-sm font-semibold text-[#94a3b8]">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. Host Action Buttons (Stacks naturally below visible cards!) ── */}
      <motion.div layout className="flex flex-col gap-3.5 w-full">
        {/* Replay Clip Button */}
        {showReplayButton && onReplay && (
          <motion.button
            key="btn-replay"
            id="replay-clip-btn"
            layout
            disabled={isDisabled}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="btn btn-xl w-full overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              height: '56px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.22)',
              color: '#ffffff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
            }}
            whileHover={isDisabled ? {} : { scale: 1.02, y: -1 }}
            whileTap={isDisabled ? {} : { scale: 0.98 }}
            onMouseEnter={() => !isDisabled && audioManager.playHover()}
            onClick={handleReplayClick}
          >
            <span className="text-xl">▶️</span>
            <span className="font-extrabold tracking-wide text-base">
              REPLAY CLIP
            </span>
          </motion.button>
        )}

        {/* Action Button: Reveal Answer vs Next Question */}
        <AnimatePresence mode="wait">
          {!isRevealed ? (
            <motion.button
              key="btn-reveal"
              id="reveal-answer-btn"
              layout
              disabled={isDisabled}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              className="btn btn-xl shimmer group w-full overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                height: '60px',
                background: isPrimary
                  ? 'linear-gradient(135deg, #3b82f6, #8b5cf6, #2563eb)'
                  : 'linear-gradient(135deg, #a855f7, #ec4899, #9333ea)',
                border: `1px solid ${borderColor}`,
                color: '#ffffff',
                boxShadow: `0 8px 36px ${glowColor}`,
              }}
              whileHover={isDisabled ? {} : { scale: 1.02, y: -1 }}
              whileTap={isDisabled ? {} : { scale: 0.98 }}
              onMouseEnter={() => !isDisabled && audioManager.playHover()}
              onClick={handleRevealClick}
            >
              <span className="text-xl">🎯</span>
              <span className="font-extrabold tracking-wide text-lg">
                REVEAL ANSWER
              </span>
            </motion.button>
          ) : (
            <motion.button
              key="btn-next"
              id="next-question-btn"
              layout
              disabled={isDisabled}
              initial={{ opacity: 0, y: 10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
              className="btn btn-xl group w-full overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                height: '60px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                border: '1px solid rgba(34, 197, 94, 0.7)',
                color: '#ffffff',
                boxShadow: '0 8px 36px rgba(34, 197, 94, 0.5)',
              }}
              whileHover={isDisabled ? {} : { scale: 1.02, y: -1 }}
              whileTap={isDisabled ? {} : { scale: 0.98 }}
              onMouseEnter={() => !isDisabled && audioManager.playHover()}
              onClick={handleNextClick}
            >
              <span className="font-extrabold tracking-wide text-lg">
                {isLastQuestion ? '🏆 VIEW FINAL RESULTS' : 'NEXT QUESTION'}
              </span>
              <span className="text-xl">➡️</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
