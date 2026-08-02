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

  const glowColor = isPrimary ? 'rgba(168,85,247,0.55)' : 'rgba(255,0,127,0.55)';
  const borderColor = isPrimary ? '#a855f7' : '#ff007f';

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
    if (isLastQuestion) {
      speechSynthesizer.speakFinalQuestion();
    }
  };

  const handleReplayClick = () => {
    if (isDisabled) return;
    audioManager.playClick();
    if (onReplay) onReplay();
  };

  // Format questionLabel so 'logo' or 'movie' is highlighted in cyan
  const renderQuestionText = (text: string) => {
    const parts = text.split(/(logo|movie)/i);
    return parts.map((part, i) => {
      if (part.toLowerCase() === 'logo' || part.toLowerCase() === 'movie') {
        return (
          <span
            key={i}
            className="text-[#00f0ff]"
            style={{ textShadow: '0 0 16px rgba(0, 240, 255, 0.9)' }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <motion.div
      layout
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col gap-6 w-full items-stretch p-8 lg:p-10 rounded-[32px] backdrop-blur-3xl select-none"
      style={{
        background: 'linear-gradient(145deg, rgba(14, 12, 35, 0.92) 0%, rgba(6, 8, 24, 0.96) 100%)',
        border: `2px solid ${borderColor}`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.25), 0 0 45px ${glowColor}`,
        clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)',
      }}
    >
      {/* HUD Chamfered Corner Markers */}
      <div className="pointer-events-none absolute top-4 left-4 h-4 w-4 border-t-2 border-l-2 border-purple-400 z-20" />
      <div className="pointer-events-none absolute top-4 right-4 h-4 w-4 border-t-2 border-r-2 border-purple-400 z-20" />
      <div className="pointer-events-none absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-purple-400 z-20" />
      <div className="pointer-events-none absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-purple-400 z-20" />

      {/* ── 1. Top Row Header (Category + Question Badge) ── */}
      <div className="flex items-center justify-between">
        {/* Left: Chip Icon + CATEGORY Label & Technology Value */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-400 text-xl shadow-[0_0_20px_rgba(0,240,255,0.35)]">
            ⚙️
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-black tracking-widest text-[#38bdf8] uppercase">
              CATEGORY
            </span>
            <span
              className="text-lg lg:text-xl font-black tracking-tight text-[#00f0ff] mt-1 uppercase"
              style={{ textShadow: '0 0 14px rgba(0,240,255,0.8)' }}
            >
              {categoryOrGenre.replace('CATEGORY:', '').trim()}
            </span>
          </div>
        </div>

        {/* Right: QUESTION Glass Badge */}
        <div
          className="flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-black text-white shadow-xl backdrop-blur-md"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(126, 34, 206, 0.4))',
            border: '1.5px solid rgba(168, 85, 247, 0.7)',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)',
          }}
        >
          QUESTION {questionIndex} of {totalQuestions}
        </div>
      </div>

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

      {/* ── 3. Middle Section: Question Container Box ── */}
      {!isRevealed && (
        <div
          className="relative flex flex-col items-center justify-center p-8 rounded-2xl border border-white/10 text-center min-h-[170px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(12, 16, 38, 0.95) 0%, rgba(5, 7, 20, 0.98) 100%)',
            boxShadow: 'inset 0 0 25px rgba(0,0,0,0.7)',
          }}
        >
          <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-0" />
          <h2
            className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-white leading-snug tracking-tight"
            style={{ fontFamily: 'Space Grotesk, Orbitron, sans-serif' }}
          >
            {renderQuestionText(questionLabel)}
          </h2>

          {/* Thin Glowing Divider Line */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-purple-500/40 to-transparent mt-6" />
        </div>
      )}

      {/* ── 4. Dynamic Answer Card (Created ONLY WHEN isRevealed === true) ── */}
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
            className="relative w-full flex flex-col items-center justify-center gap-2.5 overflow-hidden rounded-3xl p-6 text-center backdrop-blur-2xl min-h-[170px]"
            style={{
              background: 'linear-gradient(135deg, rgba(0,240,255,0.25), rgba(168,85,247,0.35))',
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
                fontFamily: 'Space Grotesk, Orbitron, sans-serif',
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                color: '#ffffff',
                textShadow: '0 0 30px rgba(0,240,255,1), 0 0 60px rgba(168,85,247,0.9)',
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

            {!optionalHint && subtitle && (
              <p className="relative z-10 text-xs sm:text-sm font-semibold text-[#94a3b8]">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 5. AAA 90px Action Button (`REVEAL ANSWER`) ── */}
      <motion.div layout className="flex flex-col gap-3.5 w-full mt-1">
        {/* Replay Clip Button */}
        {showReplayButton && onReplay && (
          <motion.button
            key="btn-replay"
            id="replay-clip-btn"
            layout
            disabled={isDisabled}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="btn w-full overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed h-[70px] rounded-2xl font-extrabold text-white text-lg"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.22)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
            }}
            whileHover={isDisabled ? {} : { scale: 1.02, y: -1 }}
            whileTap={isDisabled ? {} : { scale: 0.98 }}
            onMouseEnter={() => !isDisabled && audioManager.playHover()}
            onClick={handleReplayClick}
          >
            <span className="text-xl">▶️</span>
            <span>REPLAY CLIP</span>
          </motion.button>
        )}

        {/* Action Button: 90px Height, 24px Rounded, Blue-Purple Gradient, Light Sweep Shimmer */}
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
              className="relative w-full overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-extrabold text-white uppercase tracking-wider rounded-[24px] select-none cursor-pointer"
              style={{
                height: '90px',
                background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 50%, #a855f7 100%)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 10px 40px rgba(0, 240, 255, 0.65), inset 0 2px 0 rgba(255, 255, 255, 0.5)',
                fontSize: '22px',
              }}
              whileHover={isDisabled ? {} : { scale: 1.02, y: -3, filter: 'brightness(1.15)' }}
              whileTap={isDisabled ? {} : { scale: 0.98 }}
              onMouseEnter={() => !isDisabled && audioManager.playHover()}
              onClick={handleRevealClick}
            >
              {/* Shimmer Light Sweep Overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-50 animate-shimmer"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                }}
              />

              <span className="text-3xl drop-shadow-md">🎯</span>
              <span className="drop-shadow-lg">REVEAL ANSWER</span>
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
              className="relative w-full overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-extrabold text-white uppercase tracking-wider rounded-[24px] select-none cursor-pointer"
              style={{
                height: '90px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 10px 40px rgba(34, 197, 94, 0.65), inset 0 2px 0 rgba(255, 255, 255, 0.5)',
                fontSize: '22px',
              }}
              whileHover={isDisabled ? {} : { scale: 1.02, y: -3, filter: 'brightness(1.15)' }}
              whileTap={isDisabled ? {} : { scale: 0.98 }}
              onMouseEnter={() => !isDisabled && audioManager.playHover()}
              onClick={handleNextClick}
            >
              <span>{isLastQuestion ? '🏆 VIEW FINAL RESULTS' : 'NEXT QUESTION'}</span>
              <span className="text-3xl">➡️</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
