import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '@/utils/audioManager';
import { speechSynthesizer } from '@/utils/speechSynthesizer';
import { unlockMedia } from '@/utils/mediaUnlock';

interface StageCountdownModalProps {
  onComplete: () => void;
  speakAiIntro?: boolean;
}

/**
 * StageCountdownModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Strict Sequential Stage Intro & Countdown Engine:
 * 1. AI Host Voice speaks intro sequence ("Welcome to Movie Challenge... Watch clip carefully...")
 * 2. Countdown 3... 2... 1... GO! displays with sub-bass impacts
 * 3. Triggers onComplete() to fade in & play video player
 */
export function StageCountdownModal({ onComplete, speakAiIntro = false }: StageCountdownModalProps) {
  const [phase, setPhase] = useState<'voice' | 'countdown'>('voice');
  const [count, setCount] = useState<number | 'GO'>(3);

  useEffect(() => {
    let isCancelled = false;

    // Trigger media unlock on modal mount
    unlockMedia();

    const runSequence = async () => {
      // Step 1: AI Voice Intro
      if (speakAiIntro) {
        setPhase('voice');
        await speechSynthesizer.speakMovieIntroSequence();
      }

      if (isCancelled) return;

      // Step 2: Start 3-2-1-GO Countdown
      setPhase('countdown');
      setCount(3);
      audioManager.playBoomImpact();

      await new Promise((res) => setTimeout(res, 1000));
      if (isCancelled) return;

      setCount(2);
      audioManager.playBoomImpact();

      await new Promise((res) => setTimeout(res, 1000));
      if (isCancelled) return;

      setCount(1);
      audioManager.playBoomImpact();

      await new Promise((res) => setTimeout(res, 1000));
      if (isCancelled) return;

      setCount('GO');
      audioManager.playVictorySting();

      await new Promise((res) => setTimeout(res, 800));
      if (isCancelled) return;

      onComplete();
    };

    runSequence();

    return () => {
      isCancelled = true;
    };
  }, [speakAiIntro, onComplete]);

  return (
    <div
      onClick={() => unlockMedia()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl overflow-hidden pointer-events-auto select-none cursor-pointer"
    >
      {/* Ambient Pulsing Glow Orbs */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[550px] w-[550px] rounded-full bg-gradient-to-r from-purple-600/30 to-blue-600/30 blur-3xl animate-pulse" />
      </div>

      {phase === 'voice' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="relative flex flex-col items-center gap-4 text-center px-6"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-500/20 border border-purple-500/50 text-4xl shadow-xl shadow-purple-500/20 animate-pulse">
            🎙️
          </div>
          <h2
            className="text-2xl sm:text-3xl font-black text-white tracking-wide"
            style={{ fontFamily: 'Space Grotesk, Outfit, system-ui, sans-serif' }}
          >
            AI HOST ANNOUNCEMENT
          </h2>
          <div className="flex items-center gap-2 rounded-full bg-purple-500/15 border border-purple-500/30 px-4 py-1.5 text-xs font-bold text-purple-300">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
            LISTEN CAREFULLY...
          </div>
        </motion.div>
      )}

      {phase === 'countdown' && (
        <AnimatePresence mode="wait">
          <motion.div
            key={String(count)}
            initial={{ opacity: 0, scale: 0.2, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 2.2, filter: 'blur(20px)' }}
            transition={{ duration: 0.45, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="relative flex flex-col items-center justify-center text-center select-none"
          >
            <span
              className="font-black leading-none text-white drop-shadow-2xl"
              style={{
                fontFamily: 'Space Grotesk, Outfit, system-ui, sans-serif',
                fontSize: count === 'GO' ? 'clamp(6rem, 18vw, 12rem)' : 'clamp(8rem, 24vw, 16rem)',
                color: '#ffffff',
                textShadow:
                  count === 'GO'
                    ? '0 0 50px rgba(34,197,94,1), 0 0 100px rgba(34,197,94,0.8)'
                    : '0 0 50px rgba(168,85,247,1), 0 0 100px rgba(59,130,246,0.8)',
              }}
            >
              {count}
            </span>

            <span className="mt-4 text-caption font-bold tracking-widest text-purple-300">
              {count === 'GO' ? 'CHALLENGE BEGUN!' : 'GET READY'}
            </span>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
