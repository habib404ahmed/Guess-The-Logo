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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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

  // "Guess the" in white, second word in gradient
  const titleWords = title.split(' ');
  const mainWord = titleWords[0] || 'Guess';
  const accentWord = titleWords.slice(1).join(' ') || 'Logo';

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#060918]">
      {/* ── Ambient Game Show Stage Background ── */}
      <BackgroundParticles />

      {/* ── Top Bar Header (1:1 Mockup Match) ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
        className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b px-6 py-3.5 backdrop-blur-2xl"
        style={{
          borderColor: 'rgba(168, 85, 247, 0.25)',
          background: 'rgba(8, 10, 26, 0.85)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        {/* Left Section: Back Button + Stage Title */}
        <div className="flex items-center gap-4">
          <button
            id="challenge-back-btn"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/15 text-white transition-all hover:bg-white/15 hover:scale-105"
            onClick={() => navigate(ROUTES.HOME)}
            aria-label="Back to home"
            title="Back to home"
          >
            <BackArrow />
          </button>

          <div className="flex flex-col leading-tight select-none">
            <div className="flex items-center gap-1.5 text-xl font-black tracking-tight" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
              <span className="text-white">{mainWord}</span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.8))',
                }}
              >
                {accentWord}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Question {questionIndex} of {totalQuestions}
            </span>
          </div>
        </div>

        {/* Center Section: Progress Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <ProgressBar current={questionIndex} total={totalQuestions} accentColor={accentColor} />
        </div>

        {/* Right Section: Score Badge + Countdown Timer Ring */}
        <div className="flex items-center gap-4">
          {/* Score Badge */}
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-2 text-center select-none"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 15, 45, 0.9), rgba(10, 8, 28, 0.9))',
              border: '1.5px solid rgba(0, 240, 255, 0.35)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 15px rgba(0,240,255,0.2)',
            }}
          >
            <div className="flex items-center gap-1.5 text-cyan-400">
              <span className="text-lg">🏆</span>
              <span className="text-xs font-black">↑</span>
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">POINTS</span>
              <span
                className="font-black text-white text-xl"
                style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
              >
                {score}
              </span>
            </div>
          </div>

          {/* Countdown Timer Ring */}
          <CountdownTimer seconds={seconds} total={totalSeconds} accentColor={accentColor} />
        </div>
      </motion.header>

      {/* ── Main Stage Content ── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-6 sm:px-8 lg:px-12">
        {children}
      </main>
    </div>
  );
}
