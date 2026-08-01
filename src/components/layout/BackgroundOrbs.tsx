import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';

const EASE_INOUT: Easing = 'easeInOut';

const ORB_TRANSITION_1 = {
  duration: 8,
  repeat: Infinity,
  ease: EASE_INOUT,
} as const;

const ORB_TRANSITION_2 = {
  duration: 12,
  repeat: Infinity,
  ease: EASE_INOUT,
} as const;

const ORB_TRANSITION_3 = {
  duration: 10,
  repeat: Infinity,
  ease: EASE_INOUT,
} as const;

/**
 * BackgroundOrbs
 *
 * Decorative ambient gradient orbs rendered behind page content.
 * Performance: uses will-change + GPU-accelerated transforms only.
 * Pointer events are disabled so they never interfere with interaction.
 */
export function BackgroundOrbs() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Primary blue orb — top left */}
      <motion.div
        className="absolute"
        style={{
          top: '-15%',
          left: '-10%',
          width: '55vw',
          height: '55vw',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.05) 50%, transparent 70%)',
          filter: 'blur(48px)',
        }}
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          scale: [1, 1.05, 1],
          transition: ORB_TRANSITION_1,
        }}
      />

      {/* Purple orb — top right */}
      <motion.div
        className="absolute"
        style={{
          top: '-20%',
          right: '-15%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(168,85,247,0.16) 0%, rgba(168,85,247,0.04) 50%, transparent 70%)',
          filter: 'blur(64px)',
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, -15, 0],
          scale: [1, 1.08, 1],
          transition: ORB_TRANSITION_2,
        }}
      />

      {/* Cyan accent orb — bottom center */}
      <motion.div
        className="absolute"
        style={{
          bottom: '-20%',
          left: '30%',
          width: '45vw',
          height: '45vw',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(6,182,212,0.03) 50%, transparent 70%)',
          filter: 'blur(56px)',
        }}
        animate={{
          y: [0, 24, 0],
          x: [0, -12, 0],
          scale: [1, 1.06, 1],
          transition: ORB_TRANSITION_3,
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
}
