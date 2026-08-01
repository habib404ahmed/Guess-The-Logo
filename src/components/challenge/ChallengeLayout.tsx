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
      <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

  const accentGrad =
    accentColor === 'primary'
      ? 'linear-gradient(135deg, #60a5fa, #a855f7)'
      : 'linear-gradient(135deg, #a855f7, #06b6d4)';

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#060918]">
      {/* ── Ambient Game Show Stage Background ── */}
      <BackgroundParticles />

      {/* ── Top Bar Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
        className="sticky top-0 z-30 flex items-center gap-4 border-b px-5 py-3.5 backdrop-blur-xl sm:px-8"
        style={{
          borderColor: 'rgba(255,255,255,0.08)',
          background: 'rgba(6,9,24,0.88)',
        }}
      >
        {/* Back button */}
        <button
          id="challenge-back-btn"
          className="control-btn flex-shrink-0"
          onClick={() => navigate(ROUTES.HOME)}
          aria-label="Back to home"
          title="Back to home"
        >
          <BackArrow />
        </button>

        {/* Title + Progress */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span
              className="truncate font-bold tracking-tight"
              style={{
                fontFamily: 'Space Grotesk, system-ui, sans-serif',
                fontSize: '1.05rem',
                background: accentGrad,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {title}
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
              Q{questionIndex}/{totalQuestions}
            </span>
          </div>
          <div className="mt-1.5">
            <ProgressBar
              current={questionIndex}
              total={totalQuestions}
              accentColor={accentColor}
            />
          </div>
        </div>

        {/* Score Card */}
        <div
          className="flex-shrink-0 rounded-2xl px-4 py-2 text-center"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          <p className="text-caption text-[#94a3b8]">Points</p>
          <p
            className="font-black leading-none text-[#f0f4ff]"
            style={{
              fontFamily: 'Space Grotesk, system-ui, sans-serif',
              fontSize: '1.35rem',
            }}
          >
            {score}
          </p>
        </div>

        {/* Timer Ring */}
        <CountdownTimer
          seconds={seconds}
          total={totalSeconds}
          accentColor={accentColor}
        />
      </motion.header>

      {/* ── Main Stage Content ── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-6 sm:px-8 lg:px-12">
        {children}
      </main>
    </div>
  );
}
