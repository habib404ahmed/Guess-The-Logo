import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/types';
import type { ChallengeType } from '@/types';
import { BackgroundParticles } from './BackgroundParticles';
import { audioManager } from '@/utils/audioManager';

interface ResultsScreenProps {
  challengeType: ChallengeType;
  score: number;
  total: number;
  onPlayAgain: () => void;
}

/**
 * Clean Cinematic Completion Screen
 * ─────────────────────────────────────────────────────────────────────────────
 * Clean, elegant, cinematic live game show ending:
 * - NO score circle, NO accuracy, NO rank, NO stats cards.
 * - Large 3D Gold Trophy with animated gold glow aura & falling confetti.
 * - Challenge completed title ("🎉 LOGO CHALLENGE COMPLETED!" or "🎬 MOVIE CHALLENGE COMPLETED!").
 * - Subtitle: "Get ready for the next challenge!".
 * - Only 2 large premium buttons: 🏠 Back to Home and 🔄 Play Again.
 */
export function ResultsScreen({ challengeType, onPlayAgain }: ResultsScreenProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // Play victory sound effect on completion screen mount
    audioManager.playBoomImpact();
  }, []);

  const isLogo = challengeType === 'logo';
  const completedTitle = isLogo
    ? '🎉 LOGO CHALLENGE COMPLETED!'
    : '🎬 MOVIE CHALLENGE COMPLETED!';

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#050816] font-[Inter] px-6 select-none">
      {/* ── 1. Animated Galaxy & Particle Engine Background ── */}
      <BackgroundParticles />

      {/* ── 2. Top Blue & Purple Stage Spotlights ── */}
      <div
        className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 opacity-50"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(0, 240, 255, 0.4) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute top-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 opacity-50"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
        }}
      />

      {/* ── 3. Falling Gold Confetti Particles Overlay ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-10 opacity-75">
        {Array.from({ length: 35 }).map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 3;
          const duration = Math.random() * 3 + 3;
          const size = Math.random() * 8 + 6;
          const colors = ['#fbbf24', '#f59e0b', '#00f0ff', '#c084fc', '#ffffff'];
          const color = colors[i % colors.length];

          return (
            <motion.div
              key={`confetti-${i}`}
              className="absolute rounded-sm"
              style={{
                left: `${left}%`,
                top: `-20px`,
                width: `${size}px`,
                height: `${size * 1.4}px`,
                background: color,
                boxShadow: `0 0 10px ${color}`,
              }}
              animate={{
                y: ['0vh', '105vh'],
                rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
                x: [0, Math.sin(i) * 60],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: 'linear',
              }}
            />
          );
        })}
      </div>

      {/* ── 4. Main Completion Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 flex w-full max-w-2xl flex-col items-center justify-center gap-8 rounded-[36px] p-10 sm:p-14 text-center backdrop-blur-3xl"
        style={{
          background: 'linear-gradient(145deg, rgba(14, 12, 38, 0.9) 0%, rgba(6, 8, 24, 0.95) 100%)',
          border: '2px solid rgba(251, 191, 36, 0.5)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 60px rgba(251, 191, 36, 0.35)',
        }}
      >
        {/* Animated 3D Floating Gold Trophy */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative flex h-32 w-32 items-center justify-center rounded-full text-7xl select-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.25) 0%, transparent 70%)',
            filter: 'drop-shadow(0 0 35px rgba(251, 191, 36, 0.8))',
          }}
        >
          🏆
        </motion.div>

        {/* Challenge Completed Headline */}
        <div className="flex flex-col items-center gap-3">
          <h1
            className="font-black leading-tight tracking-tight uppercase"
            style={{
              fontFamily: 'Space Grotesk, Orbitron, system-ui, sans-serif',
              fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
              background: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 50%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 25px rgba(251, 191, 36, 0.7))',
            }}
          >
            {completedTitle}
          </h1>

          <p className="text-base sm:text-lg font-semibold text-[#cbd5e1] tracking-wide">
            Get ready for the next challenge!
          </p>
        </div>

        {/* ── 5. Only Two Large Premium Action Buttons ── */}
        <div className="flex w-full flex-col sm:flex-row gap-4 mt-2">
          {/* Button 1: 🏠 Back to Home */}
          <motion.button
            id="home-btn"
            className="flex-1 flex items-center justify-center gap-2.5 h-[64px] rounded-2xl font-black text-white text-lg tracking-wider uppercase backdrop-blur-xl transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
            whileHover={{ scale: 1.03, y: -2, background: 'rgba(255, 255, 255, 0.15)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              audioManager.playClick();
              navigate(ROUTES.HOME);
            }}
          >
            <span className="text-xl">🏠</span>
            <span>BACK TO HOME</span>
          </motion.button>

          {/* Button 2: 🔄 Play Again */}
          <motion.button
            id="play-again-btn"
            className="flex-1 flex items-center justify-center gap-2.5 h-[64px] rounded-2xl font-black text-white text-lg tracking-wider uppercase transition-all cursor-pointer shimmer"
            style={{
              background: isLogo
                ? 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)'
                : 'linear-gradient(135deg, #e040fb 0%, #7c4dff 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              boxShadow: isLogo
                ? '0 8px 30px rgba(0, 162, 255, 0.6)'
                : '0 8px 30px rgba(168, 85, 247, 0.6)',
            }}
            whileHover={{ scale: 1.03, y: -2, filter: 'brightness(1.15)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              audioManager.playClick();
              onPlayAgain();
            }}
          >
            <span className="text-xl">🔄</span>
            <span>PLAY AGAIN</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
