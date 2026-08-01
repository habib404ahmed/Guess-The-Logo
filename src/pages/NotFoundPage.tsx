import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerChild } from '@/animations/variants';
import { ROUTES } from '@/types';

/**
 * NotFoundPage
 *
 * Displayed for any unknown route.
 * Clean and on-brand — not a generic browser error.
 */
export function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center gap-6"
      >
        {/* Error code */}
        <motion.div variants={staggerChild}>
          <span
            className="text-display gradient-text-primary block select-none font-black"
            aria-hidden="true"
          >
            404
          </span>
        </motion.div>

        {/* Message */}
        <motion.div variants={staggerChild} className="flex flex-col items-center gap-3">
          <h1 className="text-h3 text-text-primary">Page not found</h1>
          <p className="text-body max-w-xs text-[#94a3b8]">
            The route{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm font-mono text-[#60a5fa]">
              {location.pathname}
            </code>{' '}
            doesn&apos;t exist.
          </p>
        </motion.div>

        {/* Back button */}
        <motion.div variants={staggerChild}>
          <Link to={ROUTES.HOME} className="btn btn-primary">
            Back to home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
