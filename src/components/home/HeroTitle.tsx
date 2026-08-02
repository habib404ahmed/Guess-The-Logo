import { motion } from 'framer-motion';
import { speechSynthesizer } from '@/utils/speechSynthesizer';

/**
 * HeroTitle — 1:1 Match to User's 3D Metallic Game Show Typography
 * ─────────────────────────────────────────────────────────────────────────────
 * Modeled after the exact user reference image:
 * - Top Eyebrow Badge: Dark blur pill with glowing purple dot
 * - 3D Embossed Metallic Title "FRESHERS CHALLENGE ARENA"
 * - Subtitle: ← PLAY • GUESS • WIN →
 * - Tagline: "Pick a challenge below and put your knowledge to the test."
 */

export function HeroTitle() {
  const handleBadgeClick = () => {
    speechSynthesizer.speakHomeIntro();
  };

  return (
    <div className="flex flex-col items-center gap-3.5 select-none relative z-10">
      {/* ── 1. Dark Glass Eyebrow Badge ── */}
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onClick={handleBadgeClick}
        className="cursor-pointer group"
        title="Click to hear AI Host Welcome"
      >
        <span
          className="inline-flex items-center gap-2.5 rounded-full px-5 py-1.5 backdrop-blur-2xl relative overflow-hidden transition-all group-hover:scale-105"
          style={{
            background: 'rgba(15, 10, 30, 0.75)',
            border: '1.5px solid rgba(168, 85, 247, 0.45)',
            boxShadow: '0 0 25px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-purple-400 animate-ping" />
          <span className="text-caption text-white font-extrabold tracking-widest uppercase text-xs">
            FRESHERS ORIENTATION 2026
          </span>
        </span>
      </motion.div>

      {/* ── 2. Massive 3D Metallic Embossed Hero Title ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center gap-0.5"
      >
        {/* Line 1: FRESHERS */}
        <h1
          className="font-black leading-none tracking-tight uppercase"
          style={{
            fontFamily: 'Space Grotesk, Outfit, system-ui, sans-serif',
            fontSize: 'clamp(2.5rem, 5.5vw, 4.8rem)',
            background: 'linear-gradient(180deg, #ffffff 0%, #e0f2fe 30%, #38bdf8 70%, #0284c7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 6px 15px rgba(0, 162, 255, 0.6))',
          }}
        >
          FRESHERS
        </h1>

        {/* Line 2: CHALLENGE ARENA */}
        <h2
          className="font-black leading-none tracking-tight uppercase"
          style={{
            fontFamily: 'Space Grotesk, Outfit, system-ui, sans-serif',
            fontSize: 'clamp(2.8rem, 6.2vw, 5.4rem)',
            background: 'linear-gradient(180deg, #ffffff 0%, #c084fc 40%, #a855f7 70%, #7e22ce 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 8px 20px rgba(168, 85, 247, 0.7))',
          }}
        >
          CHALLENGE ARENA
        </h2>
      </motion.div>

      {/* ── 3. Subtitle Banner (← PLAY • GUESS • WIN →) ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex items-center gap-3 mt-1"
      >
        <div className="h-px w-14 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        <span
          className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-cyan-300"
          style={{ textShadow: '0 0 12px rgba(0,243,255,0.7)' }}
        >
          ← PLAY &nbsp;•&nbsp; GUESS &nbsp;•&nbsp; WIN →
        </span>
        <div className="h-px w-14 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
      </motion.div>

      {/* ── 4. Tagline ── */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-[#94a3b8] text-center font-medium max-w-lg leading-relaxed text-xs sm:text-sm"
      >
        Pick a challenge below and put your knowledge to the test.
      </motion.p>
    </div>
  );
}
