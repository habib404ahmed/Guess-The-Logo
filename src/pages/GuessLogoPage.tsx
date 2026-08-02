import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LogoQuestion } from '@/types';
import { shuffle } from '@/utils';
import { getStoredLogos, getStoredSettings, pinSunstoneLast } from '@/utils/storage';
import { useCountdown } from '@/hooks/useCountdown';
import { useSound } from '@/hooks/useSound';
import { speechSynthesizer } from '@/utils/speechSynthesizer';
import {
  ChallengeLayout,
  ResultsScreen,
  RightControlPanel,
} from '@/components/challenge';
import { StageCountdownModal } from '@/components/challenge/StageCountdownModal';

export function GuessLogoPage() {
  const [settings]  = useState(() => getStoredSettings());
  const [questions] = useState<LogoQuestion[]>(() => {
    const stored = getStoredLogos();
    if (settings.shuffleLogos) {
      const sunstoneItems = stored.filter(
        (q) => q.brandName.trim().toLowerCase() === 'sunstone',
      );
      const otherItems = stored.filter(
        (q) => q.brandName.trim().toLowerCase() !== 'sunstone',
      );
      return pinSunstoneLast([...shuffle(otherItems), ...sunstoneItems]);
    }
    return pinSunstoneLast(stored);
  });

  const [index, setIndex]             = useState(0);
  const [score, setScore]             = useState(0);
  const [isRevealed, setIsRevealed]   = useState(false);
  const [isComplete, setIsComplete]   = useState(false);
  const [isLogoRevealed, setIsLogoRevealed] = useState(false);

  // Stage intro countdown modal state
  const [showCountdown, setShowCountdown] = useState(true);

  const { playRevealSequence, playNextSequence } = useSound();

  const currentQuestion = questions[index];
  const questionTime    = settings.questionTimer || 20;

  // ── Timer ──────────────────────────────────────────────────────────────────
  const { seconds, start, reset } = useCountdown({
    duration: questionTime,
    onExpire: () => {},
  });

  // Reset when question changes
  useEffect(() => {
    setIsRevealed(false);
    setIsLogoRevealed(false);
    const revealTimeout = setTimeout(() => setIsLogoRevealed(true), 300);
    reset();

    if (!showCountdown) {
      const startTimeout = setTimeout(start, 400);
      return () => {
        clearTimeout(revealTimeout);
        clearTimeout(startTimeout);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, showCountdown]);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    speechSynthesizer.speakLogoIntro();
    start();
  }, [start]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleReveal = useCallback(() => {
    if (isRevealed) return;
    setIsRevealed(true);
    playRevealSequence();
    reset();
    setScore((s) => s + 10);
  }, [isRevealed, playRevealSequence, reset]);

  const handleNext = useCallback(() => {
    playNextSequence();
    if (index + 1 >= questions.length) {
      setIsComplete(true);
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, playNextSequence, questions.length]);

  const handlePlayAgain = useCallback(() => {
    setIndex(0);
    setScore(0);
    setIsRevealed(false);
    setIsComplete(false);
    setShowCountdown(true);
  }, []);

  // ── Results Screen ─────────────────────────────────────────────────────────

  if (isComplete) {
    return (
      <ResultsScreen
        challengeType="logo"
        score={score}
        total={questions.length * 10}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  if (!currentQuestion) return null;

  return (
    <ChallengeLayout
      title="Guess the Logo"
      questionIndex={index + 1}
      totalQuestions={questions.length}
      score={score}
      seconds={seconds}
      totalSeconds={questionTime}
      accentColor="primary"
    >
      {/* ── 3-2-1-GO Stage Intro Countdown Modal Overlay ── */}
      {showCountdown && (
        <StageCountdownModal onComplete={handleCountdownComplete} />
      )}

      {/* ── 2-COLUMN SPLIT-SCREEN LAYOUT ── */}
      <div className="w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-2 relative">

        {/* ── LEFT COLUMN (65%): Holographic Stage Pedestal & Chamfered Logo Card ── */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">

          {/* 3D Glowing Circular Pedestal Stage Pod Base (Matches User Mockup Stage Floor) */}
          <div className="absolute -bottom-10 w-[440px] h-[120px] pointer-events-none flex items-center justify-center z-0">
            {/* Concentric Neon Rings */}
            <div
              className="w-full h-full rounded-full border-2 border-cyan-400/80 animate-pulse"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.35) 0%, rgba(0, 102, 255, 0.15) 50%, transparent 80%)',
                boxShadow: '0 0 50px rgba(0, 240, 255, 0.7), inset 0 0 30px rgba(0, 240, 255, 0.5)',
                transform: 'rotateX(75deg)',
              }}
            />
            <div
              className="absolute w-[360px] h-[90px] rounded-full border border-blue-500/80"
              style={{ transform: 'rotateX(75deg)' }}
            />
          </div>

          {/* Logo Container Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`logo-${index}`}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -6, 0],
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.4,
                y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="relative z-10 w-full max-w-[440px] aspect-square flex items-center justify-center overflow-hidden rounded-3xl backdrop-blur-3xl select-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(15, 20, 42, 0.95) 0%, rgba(5, 8, 22, 0.98) 100%)',
                border: '2px solid #00f0ff',
                boxShadow: '0 20px 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 45px rgba(0, 240, 255, 0.65)',
                clipPath: 'polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)',
              }}
            >
              {/* HUD Chamfered Corner Markers */}
              <div className="pointer-events-none absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-cyan-400 z-20" />
              <div className="pointer-events-none absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-cyan-400 z-20" />
              <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-cyan-400 z-20" />
              <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-cyan-400 z-20" />

              {/* Glass Reflection Overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
                }}
              />

              {/* Main Logo Image */}
              <motion.img
                src={currentQuestion.logoSrc}
                alt="Guess this logo"
                draggable={false}
                className="h-full w-full rounded-2xl object-cover scale-[1.12] p-8"
                style={{ mixBlendMode: 'lighten' }}
                initial={{ filter: 'blur(16px)', scale: 1.25 }}
                animate={{
                  filter: isLogoRevealed ? 'blur(0px)' : 'blur(16px)',
                  scale: isLogoRevealed ? 1.12 : 1.25,
                }}
                transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── RIGHT COLUMN (35%): Cybernetic Question & Control Panel Card ── */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <RightControlPanel
            questionIndex={index + 1}
            totalQuestions={questions.length}
            categoryOrGenre={currentQuestion.category.toUpperCase()}
            questionLabel="Which company does this logo belong to?"
            answerText={currentQuestion.brandName}
            subtitle={`Category: ${currentQuestion.category}`}
            isRevealed={isRevealed}
            onReveal={handleReveal}
            onNext={handleNext}
            isLastQuestion={index + 1 === questions.length}
            accentColor="primary"
          />
        </div>
      </div>
    </ChallengeLayout>
  );
}
