import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { pageSlideUp } from '@/animations/variants';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PageTransitionProps {
  children: ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * PageTransition
 *
 * Wraps page content with AnimatePresence + motion.div.
 * Keyed on the route location so transitions fire on navigation.
 *
 * Place this inside the Router, wrapping the <Routes> element.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageSlideUp}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex min-h-dvh flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
