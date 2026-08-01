import { motion } from 'framer-motion';

interface CountdownTimerProps {
  seconds: number;
  total: number;
  accentColor?: 'primary' | 'secondary';
}

const SIZE = 72;
const STROKE = 5;
const RADIUS = (SIZE - STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * CountdownTimer
 *
 * Circular SVG timer that drains clockwise.
 * Colour transitions: normal → warning (amber) → danger (red).
 */
export function CountdownTimer({ seconds, total, accentColor = 'primary' }: CountdownTimerProps) {
  const progress = total > 0 ? seconds / total : 0;
  const offset = CIRCUMFERENCE * (1 - progress);

  // Colour states
  const isWarning = progress <= 0.4 && progress > 0.2;
  const isDanger  = progress <= 0.2;

  const strokeColor = isDanger
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : accentColor === 'primary'
    ? '#3b82f6'
    : '#a855f7';

  const textColor = isDanger ? '#f87171' : isWarning ? '#fbbf24' : '#f0f4ff';

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      {/* Track */}
      <svg width={SIZE} height={SIZE} className="absolute -rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE}
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'linear' }}
          style={{ filter: `drop-shadow(0 0 6px ${strokeColor}80)` }}
        />
      </svg>

      {/* Number */}
      <motion.span
        key={seconds}
        initial={{ scale: 1.2, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="relative font-bold tabular-nums"
        style={{
          fontFamily: 'Space Grotesk, Inter, system-ui, sans-serif',
          fontSize: '1.25rem',
          color: textColor,
        }}
      >
        {seconds}
      </motion.span>
    </div>
  );
}
