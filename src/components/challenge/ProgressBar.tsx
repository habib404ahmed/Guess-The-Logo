import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  accentColor?: 'primary' | 'secondary';
}

/**
 * ProgressBar
 * Shows current question out of total with a filled track.
 */
export function ProgressBar({ current, total, accentColor = 'primary' }: ProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;

  const trackColor =
    accentColor === 'primary'
      ? 'linear-gradient(90deg, #3b82f6, #a855f7)'
      : 'linear-gradient(90deg, #a855f7, #06b6d4)';

  return (
    <div className="flex items-center gap-3">
      <span className="text-label min-w-[5ch] text-[#94a3b8]">
        {current} / {total}
      </span>
      <div
        className="relative h-2 flex-1 overflow-hidden rounded-full"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: trackColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
}
