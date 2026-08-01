import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { staggerContainer, staggerChild, celebrate } from '@/animations/variants';
import { ROUTES } from '@/types';
import type { ChallengeType } from '@/types';
import { formatScore, getScoreLabel } from '@/utils';

interface ResultsScreenProps {
  challengeType: ChallengeType;
  score: number;
  total: number;
  onPlayAgain: () => void;
}

// ─── Score Circle ─────────────────────────────────────────────────────────────

function ScoreCircle({
  score,
  total,
  accentColor,
}: {
  score: number;
  total: number;
  accentColor: 'primary' | 'secondary';
}) {
  const SIZE = 160;
  const STROKE = 8;
  const RADIUS = (SIZE - STROKE * 2) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const pct = total > 0 ? score / total : 0;
  const offset = CIRCUMFERENCE * (1 - pct);

  const trackGrad =
    accentColor === 'primary'
      ? '#3b82f6'
      : '#a855f7';

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="absolute -rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={STROKE}
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={trackGrad}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0, 0, 0.2, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${trackGrad}80)` }}
        />
      </svg>

      <div className="relative text-center">
        <motion.span
          variants={celebrate}
          className="block font-black leading-none text-[#f0f4ff]"
          style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontSize: '2.5rem' }}
        >
          {score}
        </motion.span>
        <span className="text-label text-[#475569]">out of {total}</span>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ResultsScreen
 *
 * Full-screen celebration shown after all questions are answered.
 * Shows score, percentage, label, and replay/home buttons.
 */
export function ResultsScreen({ challengeType, score, total, onPlayAgain }: ResultsScreenProps) {
  const navigate = useNavigate();
  const accentColor = challengeType === 'logo' ? 'primary' : 'secondary';
  const label = getScoreLabel(score, total);
  const pctStr = formatScore(score, total);

  const isPerfect = score === total;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="flex w-full max-w-lg flex-col items-center gap-8"
      >
        {/* ── Trophy / Emoji ── */}
        <motion.div
          variants={celebrate}
          className="text-6xl"
        >
          {isPerfect ? '🏆' : score >= total * 0.7 ? '🥈' : '🎯'}
        </motion.div>

        {/* ── Headline ── */}
        <motion.div variants={staggerChild} className="text-center">
          <h1
            className="font-black leading-tight tracking-tighter"
            style={{
              fontFamily: 'Space Grotesk, system-ui, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              background:
                accentColor === 'primary'
                  ? 'linear-gradient(135deg, #60a5fa, #a855f7)'
                  : 'linear-gradient(135deg, #a855f7, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {label}
          </h1>
        </motion.div>

        {/* ── Score Circle ── */}
        <motion.div variants={staggerChild}>
          <ScoreCircle score={score} total={total} accentColor={accentColor} />
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          variants={staggerChild}
          className="grid w-full grid-cols-3 gap-3"
        >
          {[
            { label: 'Score', value: `${score}/${total}` },
            { label: 'Accuracy', value: pctStr },
            { label: 'Rank', value: isPerfect ? '🥇' : score >= total * 0.7 ? '🥈' : '🥉' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 rounded-2xl py-4"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span className="text-h4 font-bold text-[#f0f4ff]">{stat.value}</span>
              <span className="text-caption text-[#475569]">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Actions ── */}
        <motion.div variants={staggerChild} className="flex w-full gap-3">
          <button
            id="play-again-btn"
            className="btn btn-lg flex-1"
            style={{
              background:
                accentColor === 'primary'
                  ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  : 'linear-gradient(135deg, #a855f7, #9333ea)',
              border: `1px solid ${accentColor === 'primary' ? 'rgba(59,130,246,0.4)' : 'rgba(168,85,247,0.4)'}`,
              color: '#fff',
              boxShadow: `0 4px 20px ${accentColor === 'primary' ? 'rgba(59,130,246,0.35)' : 'rgba(168,85,247,0.35)'}`,
            }}
            onClick={onPlayAgain}
          >
            Play Again
          </button>
          <button
            id="home-btn"
            className="btn btn-lg btn-ghost flex-1"
            onClick={() => navigate(ROUTES.HOME)}
          >
            Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
