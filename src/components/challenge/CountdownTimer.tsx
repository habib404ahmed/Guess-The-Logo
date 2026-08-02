import { motion } from 'framer-motion';

interface CountdownTimerProps {
  seconds: number;
  total: number;
  accentColor?: 'primary' | 'secondary';
}

const SIZE = 68;
const STROKE = 5;
const RADIUS = (SIZE - STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * CountdownTimer — 1:1 Match to User Mockup
 * Circular SVG timer with "18 SEC" formatting and glowing cyan/magenta ring.
 */
export function CountdownTimer({ seconds, total, accentColor = 'primary' }: CountdownTimerProps) {
  const progress = total > 0 ? seconds / total : 0;
  const offset = CIRCUMFERENCE * (1 - progress);

  const isWarning = progress <= 0.4 && progress > 0.2;
  const isDanger  = progress <= 0.2;

  const strokeColor = isDanger
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : accentColor === 'primary'
    ? '#00f0ff'
    : '#a855f7';

  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-full p-1 shadow-2xl"
      style={{
        width: SIZE,
        height: SIZE,
        background: 'rgba(12, 10, 28, 0.85)',
        border: '1.5px solid rgba(255, 255, 255, 0.15)',
        boxShadow: `0 0 20px ${strokeColor}60`,
      }}
    >
      {/* SVG Ring */}
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
          style={{ filter: `drop-shadow(0 0 8px ${strokeColor})` }}
        />
      </svg>

      {/* Number & SEC */}
      <div className="relative flex flex-col items-center justify-center leading-none">
        <motion.span
          key={seconds}
          initial={{ scale: 1.15, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="font-black text-white text-lg tracking-tight tabular-nums"
          style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
        >
          {seconds}
        </motion.span>
        <span className="text-[9px] font-black text-purple-300 tracking-wider uppercase mt-0.5">
          SEC
        </span>
      </div>
    </div>
  );
}
