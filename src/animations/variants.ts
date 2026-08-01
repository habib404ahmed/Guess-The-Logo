import type { Variants, Easing } from 'framer-motion';

const EASE_INOUT: Easing = 'easeInOut';

/**
 * Framer Motion Variants Library
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralizes all animation variants. Import from here — never define
 * inline variants in components. This keeps animations consistent and
 * makes global tweaks trivial.
 */

// ─── Page Transitions ────────────────────────────────────────────────────────

/**
 * Fades the page in when entering, fades out when leaving.
 */
export const pageFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: [0, 0, 0.2, 1] } },
  exit: { opacity: 0, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } },
};

/**
 * Slides up while fading in — used for primary page content.
 */
export const pageSlideUp: Variants = {
  initial: { opacity: 0, y: 32 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

/**
 * Slides in from the right (forward navigation).
 */
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    x: -60,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  },
};

/**
 * Slides in from the left (backward navigation).
 */
export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    x: 60,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  },
};

// ─── Element Reveals ─────────────────────────────────────────────────────────

/**
 * Staggered container — children animate in sequence.
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

/**
 * Staggered child — fades and slides up.
 */
export const staggerChild: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

/**
 * Scale in from center — used for modals and overlays.
 */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.175, 0.885, 0.32, 1.275] },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

/**
 * Spring scale — used for interactive cards and choice buttons.
 */
export const springScale: Variants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 24, mass: 0.9 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

// ─── Feedback Animations ─────────────────────────────────────────────────────

/**
 * Shake — used when the user selects a wrong answer.
 */
export const shake: Variants = {
  initial: { x: 0 },
  animate: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
};

/**
 * Bounce — used when the user selects the correct answer.
 */
export const bounce: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.08, 0.96, 1.04, 1],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
};

/**
 * Celebrate — used after completing a challenge.
 */
export const celebrate: Variants = {
  initial: { scale: 0, rotate: -180, opacity: 0 },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 16 },
  },
};

// ─── Overlay ─────────────────────────────────────────────────────────────────

/**
 * Dark overlay backdrop — for modals.
 */
export const backdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// ─── Floating Orb ────────────────────────────────────────────────────────────

/**
 * Subtle floating animation for decorative background orbs.
 */
export const floatOrb = {
  animate: {
    y: [0, -20, 0],
    x: [0, 10, 0],
    scale: [1, 1.05, 1],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: EASE_INOUT,
    },
  },
};

export const floatOrbSlow = {
  animate: {
    y: [0, -30, 0],
    x: [0, -15, 0],
    scale: [1, 1.08, 1],
    transition: {
      duration: 12,
      repeat: Infinity,
      ease: EASE_INOUT,
    },
  },
};
