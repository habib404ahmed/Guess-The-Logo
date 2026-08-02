import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  accentColor?: 'primary' | 'secondary';
}

/**
 * ProgressBar — Match to User Mockup
 * Shows centered fraction pill badge (e.g. "1 / 11") with glowing cyan/purple track.
 */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="relative flex items-center justify-center w-full max-w-md mx-auto">
      {/* Outer Glow Track */}
      <div
        className="relative h-2 w-full overflow-hidden rounded-full border border-white/10"
        style={{
          background: 'rgba(15, 10, 30, 0.8)',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
        }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #00f0ff 0%, #3b82f6 50%, #a855f7 100%)',
            boxShadow: '0 0 12px #00f0ff, 0 0 24px rgba(0, 240, 255, 0.8)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
        />
      </div>

      {/* Center Fraction Pill Badge (e.g., "1 / 11") */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center px-4 py-0.5 rounded-full text-xs font-black text-white shadow-xl backdrop-blur-md"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 15, 60, 0.95), rgba(15, 8, 35, 0.95))',
          border: '1.5px solid rgba(168, 85, 247, 0.7)',
          boxShadow: '0 0 16px rgba(168, 85, 247, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        }}
      >
        <span>{current}</span>
        <span className="mx-1 text-purple-400">/</span>
        <span>{total}</span>
      </div>
    </div>
  );
}
