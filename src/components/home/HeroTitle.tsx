import { motion } from 'framer-motion';
import { speechSynthesizer } from '@/utils/speechSynthesizer';

/**
 * HeroTitle — High-Energy Esports Game Zone Hero Header
 * ─────────────────────────────────────────────────────────────────────────────
 * Designed to look like a million-dollar Game Zone / PlayStation Showcase:
 * - 3D Neon Esports Typography
 * - Cyan & Magenta Dual Aura Glow
 * - Clickable orientation badge for AI host welcome
 */

export function HeroTitle() {
  const handleBadgeClick = () => {
    speechSynthesizer.speakHomeIntro();
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none relative z-10">
      {/* ── 1. Game Zone Badge ── */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onClick={handleBadgeClick}
        className="cursor-pointer group"
        title="Click to hear AI Host Welcome"
      >
        <span
          className="inline-flex items-center gap-3 rounded-full px-6 py-2 backdrop-blur-2xl relative overflow-hidden transition-all group-hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(0,243,255,0.12) 0%, rgba(168,85,247,0.12) 100%)',
            border: '1.5px solid rgba(0, 243, 255, 0.45)',
            boxShadow: '0 0 35px rgba(0, 243, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          }}
        >
          {/* Light Sweep Highlight */}
          <div
            className="pointer-events-none absolute inset-0 opacity-50 animate-shimmer"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
            }}
          />

          <span className="h-2.5 w-2.5 rounded-full bg-[#00f3ff] animate-ping" />
          <span
            className="text-caption font-black tracking-widest uppercase text-xs"
            style={{ color: '#00f3ff', textShadow: '0 0 12px rgba(0,243,255,0.8)' }}
          >
            🎮 GAME ZONE ARENA &nbsp;•&nbsp; FRESHERS 2026
          </span>
        </span>
      </motion.div>

      {/* ── 2. Massive Esports Game Title ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center gap-1"
      >
        <h1
          className="font-black leading-none tracking-tight flex flex-wrap justify-center items-center gap-x-4 gap-y-2 uppercase drop-shadow-2xl"
          style={{
            fontFamily: 'Space Grotesk, Outfit, system-ui, sans-serif',
            fontSize: 'clamp(2.8rem, 6.2vw, 5.2rem)',
          }}
        >
          {/* Word 1: FRESHERS in Cyan Neon */}
          <span
            style={{
              background: 'linear-gradient(135deg, #00f3ff 0%, #38bdf8 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 35px rgba(0,243,255,0.7))',
            }}
          >
            FRESHERS
          </span>

          {/* Word 2: CHALLENGE ARENA in Magenta Glow */}
          <span
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f43f5e 50%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 35px rgba(244,63,94,0.6))',
            }}
          >
            CHALLENGE ARENA
          </span>
        </h1>
      </motion.div>

      {/* ── 3. Electric Stage Subtitle Banner ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex items-center gap-4 mt-1"
      >
        <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        <span
          className="text-xs sm:text-sm font-extrabold tracking-widest uppercase"
          style={{
            color: '#ff007f',
            textShadow: '0 0 15px rgba(255,0,127,0.7)',
          }}
        >
          🔥 CHOOSE YOUR ARENA & CONQUER THE STAGE
        </span>
        <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
      </motion.div>

      {/* ── 4. Tagline ── */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-[#94a3b8] text-center font-bold max-w-lg leading-relaxed text-xs sm:text-sm tracking-wide"
      >
        Pick a challenge below and show everyone what you've got!
      </motion.p>
    </div>
  );
}
