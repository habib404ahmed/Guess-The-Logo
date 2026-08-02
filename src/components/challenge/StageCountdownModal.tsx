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
 * Zero-Delay Stage Intro & Countdown Engine:
 * 1. AI Host Voice speaks intro non-blockingly in background (NEVER blocks video playback)
 * 2. Countdown 3... 2... 1... GO! displays with sub-bass impacts
 * 3. Triggers onComplete() to play video immediately
 */
export function StageCountdownModal({ onComplete, speakAiIntro = false }: StageCountdownModalProps) {
  const [phase, setPhase] = useState<'countdown'>('countdown');
  const [count, setCount] = useState<number | 'GO'>(3);

  useEffect(() => {
    let isCancelled = false;

    // Trigger media unlock on modal mount
    unlockMedia();

    // Fire AI voice non-blockingly in background (NEVER BLOCKS STAGE COUNTDOWN OR VIDEO PLAYBACK)
    if (speakAiIntro) {
      speechSynthesizer.speakMovieIntroSequence().catch(() => {});
    }

    const runSequence = async () => {
      // Start 3-2-1-GO Countdown immediately without waiting for speech
      setPhase('countdown');
      setCount(3);
      audioManager.playBoomImpact();

      await new Promise((res) => setTimeout(res, 900));
      if (isCancelled) return;

      setCount(2);
      audioManager.playBoomImpact();

      await new Promise((res) => setTimeout(res, 900));
      if (isCancelled) return;

      setCount(1);
      audioManager.playBoomImpact();

      await new Promise((res) => setTimeout(res, 900));
      if (isCancelled) return;

      setCount('GO');
      audioManager.playVictorySting();

      await new Promise((res) => setTimeout(res, 400));
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

      {phase === 'countdown' && (
        <AnimatePresence mode="wait">
          <motion.div
            key={String(count)}
            initial={{ opacity: 0, scale: 0.2, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 2.2, filter: 'blur(20px)' }}
            transition={{ duration: 0.35, ease: [0.175, 0.885, 0.32, 1.275] }}
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
