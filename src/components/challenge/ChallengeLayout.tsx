import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/types';
import { ProgressBar } from './ProgressBar';
import { CountdownTimer } from './CountdownTimer';
import { BackgroundParticles } from './BackgroundParticles';

interface ChallengeLayoutProps {
  children: ReactNode;
  /** Current question number (1-indexed) */
  questionIndex: number;
  totalQuestions: number;
  score: number;
  seconds: number;
  totalSeconds: number;
  accentColor?: 'primary' | 'secondary';
  title: string;
}

function BackArrow() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChallengeLayout({
  children,
  questionIndex,
  totalQuestions,
  score,
  seconds,
  totalSeconds,
  accentColor = 'primary',
  title,
}: ChallengeLayoutProps) {
  const navigate = useNavigate();

  const titleWords = title.split(' ');
  const mainWord = titleWords[0] || 'Guess';
  const accentWord = titleWords.slice(1).join(' ') || 'Logo';

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#050816] font-[Inter]">
      {/* ── AAA Animated Space & Particle Background ── */}
      <BackgroundParticles />

      {/* ── 90px AAA Top Bar Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
        className="sticky top-0 z-40 flex h-[90px] items-center justify-between gap-6 px-8 select-none"
        style={{
          background: 'rgba(6, 9, 24, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(0, 240, 255, 0.35)',
          boxShadow: '0 4px 30px rgba(0, 240, 255, 0.2), 0 10px 40px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* ── LEFT SECTION ── */}
        <div className="flex items-center gap-5 min-w-[280px]">
          {/* 56×56 Rounded Square Glass Back Button */}
          <motion.button
            id="challenge-back-btn"
            className="flex h-[56px] w-[56px] items-center justify-center rounded-2xl text-white transition-all backdrop-blur-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1.5px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
            whileHover={{
              scale: 1.05,
              borderColor: 'rgba(0, 240, 255, 0.7)',
              boxShadow: '0 0 30px rgba(0, 240, 255, 0.5)',
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(ROUTES.HOME)}
            aria-label="Back to home"
            title="Back to home"
          >
            <BackArrow />
          </motion.button>

          {/* Title & Subtitle */}
          <div className="flex flex-col justify-center leading-snug">
            <div
              className="flex items-center gap-1.5 text-2xl font-extrabold tracking-tight"
              style={{ fontFamily: 'Space Grotesk, Orbitron, sans-serif' }}
            >
              <span className="text-white">{mainWord}</span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #00f0ff 0%, #38bdf8 50%, #a855f7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 12px rgba(0, 240, 255, 0.7))',
                }}
              >
                {accentWord}
              </span>
            </div>
            <span className="text-xs font-medium text-[#94a3b8]">
              Question {questionIndex} of {totalQuestions}
            </span>
          </div>
        </div>

        {/* ── CENTER SECTION: 65% Width Progress Bar ── */}
        <div className="hidden lg:flex flex-1 items-center justify-center max-w-[680px] px-4">
          <ProgressBar current={questionIndex} total={totalQuestions} accentColor={accentColor} />
        </div>

        {/* ── RIGHT SECTION: Points Card & Timer Ring ── */}
        <div className="flex items-center gap-5 min-w-[280px] justify-end">
          {/* Glass Points Card */}
          <div
            className="flex items-center gap-3.5 rounded-2xl px-5 py-2.5 backdrop-blur-xl select-none"
            style={{
              background: 'rgba(15, 20, 42, 0.85)',
              border: '1.5px solid rgba(0, 240, 255, 0.4)',
              boxShadow: '0 0 25px rgba(0, 240, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            <div className="flex items-center gap-1 text-[#00f0ff]">
              <span className="text-xl">🏆</span>
              <span className="text-xs font-black">↑</span>
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">
                POINTS
              </span>
              <span
                className="font-black text-white text-2xl"
                style={{ fontFamily: 'Space Grotesk, Orbitron, sans-serif' }}
              >
                {score}
              </span>
            </div>
          </div>

          {/* Circular Countdown Timer Ring */}
          <CountdownTimer seconds={seconds} total={totalSeconds} accentColor={accentColor} />
        </div>
      </motion.header>

      {/* ── MAIN STAGE CONTENT (16:9 Vertical Alignment) ── */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-6 lg:px-12">
        {children}
      </main>
    </div>
  );
}
