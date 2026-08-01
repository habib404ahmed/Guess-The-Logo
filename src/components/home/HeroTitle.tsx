import { motion } from 'framer-motion';

/**
 * HeroTitle — Million Dollar Stage Hero Header
 * ─────────────────────────────────────────────────────────────────────────────
 * Modeled after Apple Keynotes, PlayStation Showcases & Netflix intros:
 * - Letter-by-letter typewriter entrance
 * - Blue -> Purple -> White gradient with 8-second periodic light sweep
 * - Pulsing cyan glassmorphism orientation badge
 */

const titleText = "Freshers Challenge Arena";

export function HeroTitle() {
  const letters = Array.from(titleText);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.035,
        delayChildren: 0.2,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <div className="flex flex-col items-center gap-3.5 select-none relative">
      {/* ── 1. Glass Eyebrow Badge ── */}
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span
          className="inline-flex items-center gap-2.5 rounded-full px-5 py-1.5 backdrop-blur-2xl relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Animated Light Sweep Line */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40 animate-shimmer"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            }}
          />

          <span className="h-2 w-2 rounded-full bg-[#22d3ee] animate-ping" />
          <span className="text-caption text-purple-200 font-extrabold tracking-widest uppercase text-xs">
            FRESHERS ORIENTATION 2026
          </span>
        </span>
      </motion.div>

      {/* ── 2. Hero Title — Staggered Letter-by-Letter Entrance ── */}
      <motion.h1
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center font-black leading-none tracking-tight flex flex-wrap justify-center items-center gap-x-3 gap-y-1 relative"
        style={{
          fontFamily: 'Space Grotesk, Outfit, system-ui, sans-serif',
          fontSize: 'clamp(2.5rem, 5.2vw, 4.5rem)',
        }}
      >
        {letters.map((char, i) => {
          if (char === ' ') {
            return (
              <span key={`space-${i}`} className="inline-block w-3 sm:w-4">
                &nbsp;
              </span>
            );
          }

          const isAccentWord = i < 8; // "Freshers"

          return (
            <motion.span
              key={`char-${i}`}
              variants={letterVariants}
              className="inline-block relative"
              style={{
                background: isAccentWord
                  ? 'linear-gradient(135deg, #60a5fa 0%, #c084fc 50%, #ffffff 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 70%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: isAccentWord
                  ? 'drop-shadow(0 0 35px rgba(96,165,250,0.7))'
                  : 'drop-shadow(0 0 25px rgba(255,255,255,0.4))',
              }}
            >
              {char}
            </motion.span>
          );
        })}
      </motion.h1>

      {/* ── 3. Subtitle Banner (PLAY • GUESS • WIN) ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex items-center gap-3 mt-1"
      >
        <div className="h-px w-16 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-cyan-400">
          PLAY &nbsp;•&nbsp; GUESS &nbsp;•&nbsp; WIN
        </span>
        <div className="h-px w-16 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
      </motion.div>

      {/* ── 4. Tagline ── */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="text-label text-center text-[#94a3b8] font-medium max-w-lg leading-relaxed"
      >
        Pick a challenge below and put your knowledge to the test.
      </motion.p>
    </div>
  );
}
