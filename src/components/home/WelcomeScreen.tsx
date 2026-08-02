import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundParticles } from '@/components/challenge/BackgroundParticles';
import { speechSynthesizer } from '@/utils/speechSynthesizer';
import { audioManager } from '@/utils/audioManager';

interface WelcomeScreenProps {
  onComplete: () => void;
}

/**
 * WelcomeScreen — Opening Ceremony for Live Auditorium Freshers Orientation
 * ─────────────────────────────────────────────────────────────────────────────
 * Features:
 * - 100vh Fullscreen animated space background
 * - College crest & massive 3D blue-purple gradient typography
 * - "🚀 START EVENT" shimmer glassmorphism button
 * - Sequential AI Host speech:
 *   1. "Welcome everyone to the Freshers Challenge Arena."
 *   2. "Get ready for an exciting challenge."
 *   3. "Let's begin."
 * - 3-2-1-GO! Stage Countdown with sub-bass boom impacts & camera shake
 * - Smooth transition into Home Page
 */
export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [countdownStep, setCountdownStep] = useState<string | null>(null); // '3' | '2' | '1' | 'GO!' | null
  const [shake, setShake] = useState(false);

  const triggerCameraShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleStartEvent = useCallback(async () => {
    if (isStarted) return;
    setIsStarted(true);
    audioManager.playClick();

    // 1. AI Host Speech Sequence
    await speechSynthesizer.speakAsync('Welcome everyone to the Freshers Challenge Arena.');
    await new Promise((r) => setTimeout(r, 500));

    await speechSynthesizer.speakAsync('Get ready for an exciting challenge.');
    await new Promise((r) => setTimeout(r, 500));

    await speechSynthesizer.speakAsync("Let's begin.");
    await new Promise((r) => setTimeout(r, 400));

    // 2. Stage Countdown 3-2-1-GO!
    const steps = ['3', '2', '1', 'GO!'];
    for (const step of steps) {
      setCountdownStep(step);
      audioManager.playBoomImpact();
      triggerCameraShake();
      await new Promise((r) => setTimeout(r, 900));
    }

    setCountdownStep(null);
    onComplete();
  }, [isStarted, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#050816] font-[Inter] select-none ${
        shake ? 'animate-bounce' : ''
      }`}
    >
      {/* ── 1. Animated Galaxy & Star Matrix Background ── */}
      <BackgroundParticles />

      {/* ── 2. Cinematic Dimming Overlay on Event Start ── */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 pointer-events-none"
        style={{
          background: isStarted
            ? 'radial-gradient(ellipse at center, rgba(5, 8, 22, 0.85) 0%, rgba(2, 4, 12, 0.98) 100%)'
            : 'radial-gradient(ellipse at center, rgba(5, 8, 22, 0.45) 0%, rgba(2, 4, 12, 0.8) 100%)',
        }}
      />

      {/* ── 3. Top Blue & Purple Spotlights ── */}
      <div
        className="pointer-events-none absolute top-0 left-1/4 h-[550px] w-[550px] -translate-x-1/2 opacity-60"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(0, 240, 255, 0.4) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute top-0 right-1/4 h-[550px] w-[550px] translate-x-1/2 opacity-60"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
        }}
      />

      {/* ── 4. Main Center Content (Before Countdown) ── */}
      <AnimatePresence>
        {!countdownStep && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 flex w-full max-w-3xl flex-col items-center justify-center text-center px-6 gap-8"
          >
            {/* College Logo / Crest Badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-24 w-24 items-center justify-center rounded-3xl backdrop-blur-2xl text-5xl shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(168,85,247,0.15))',
                border: '1.5px solid rgba(0, 240, 255, 0.45)',
                boxShadow: '0 0 35px rgba(0, 240, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              }}
            >
              🎓
            </motion.div>

            {/* Massive Hero Title */}
            <div className="flex flex-col items-center gap-2">
              <h1
                className="font-black uppercase tracking-tight leading-none"
                style={{
                  fontFamily: 'Space Grotesk, Orbitron, system-ui, sans-serif',
                  fontSize: 'clamp(2.6rem, 5.8vw, 5rem)',
                  background: 'linear-gradient(135deg, #00f0ff 0%, #38bdf8 40%, #c084fc 70%, #ffffff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 35px rgba(0, 240, 255, 0.8))',
                }}
              >
                FRESHERS CHALLENGE ARENA
              </h1>

              {/* Subtitle */}
              <div className="flex items-center gap-3 mt-2">
                <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                <span className="text-xs sm:text-sm font-extrabold tracking-widest text-cyan-300 uppercase">
                  Interactive Quiz Experience &nbsp;•&nbsp; Freshers Orientation 2026
                </span>
                <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              </div>
            </div>

            {/* START EVENT BUTTON */}
            <motion.button
              id="start-event-btn"
              disabled={isStarted}
              onClick={handleStartEvent}
              className="relative overflow-hidden flex items-center justify-center gap-3 px-12 py-5 rounded-[24px] font-black text-white text-xl tracking-wider uppercase cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
              style={{
                background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 50%, #a855f7 100%)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 10px 40px rgba(0, 240, 255, 0.65), inset 0 2px 0 rgba(255, 255, 255, 0.4)',
              }}
              whileHover={isStarted ? {} : { scale: 1.05, y: -3, filter: 'brightness(1.15)' }}
              whileTap={isStarted ? {} : { scale: 0.98 }}
            >
              {/* Shimmer Light Sweep Effect */}
              <div
                className="pointer-events-none absolute inset-0 opacity-60 animate-shimmer"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                }}
              />

              <span className="text-2xl drop-shadow-md">🚀</span>
              <span className="drop-shadow-lg">START EVENT</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 5. 3-2-1-GO! STAGE COUNTDOWN OVERLAY ── */}
      <AnimatePresence>
        {countdownStep && (
          <motion.div
            key={countdownStep}
            initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
            animate={{ scale: 1.25, opacity: 1, rotate: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="relative z-30 flex items-center justify-center"
          >
            <span
              className="font-black text-white tracking-tight drop-shadow-2xl select-none"
              style={{
                fontFamily: 'Space Grotesk, Orbitron, system-ui, sans-serif',
                fontSize: 'clamp(7rem, 18vw, 15rem)',
                background:
                  countdownStep === 'GO!'
                    ? 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)'
                    : 'linear-gradient(135deg, #00f0ff 0%, #38bdf8 50%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter:
                  countdownStep === 'GO!'
                    ? 'drop-shadow(0 0 60px rgba(34, 197, 94, 0.9))'
                    : 'drop-shadow(0 0 60px rgba(0, 240, 255, 0.9))',
              }}
            >
              {countdownStep}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
