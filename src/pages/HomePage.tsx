import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '@/types';
import { staggerContainer, staggerChild } from '@/animations/variants';
import { useTheme } from '@/contexts/ThemeContext';
import { speechSynthesizer } from '@/utils/speechSynthesizer';
import { audioManager } from '@/utils/audioManager';
import { ChallengeCard } from '@/components/home/ChallengeCard';
import { HeroTitle } from '@/components/home/HeroTitle';
import { ControlBar } from '@/components/home/ControlBar';
import { FooterBadge } from '@/components/home/FooterBadge';
import { HomeBackground } from '@/components/home/HomeBackground';

/**
 * HomePage
 *
 * The main landing screen projected onto the large auditorium display.
 * Designed to fit entirely within one viewport with custom background image.
 */
export function HomePage() {
  const navigate = useNavigate();
  const { isSoundEnabled, toggleSound, isFullscreen, toggleFullscreen } = useTheme();

  // Auditorium Stage Audio Unlock Splash State
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleStartStage = useCallback(() => {
    setHasInteracted(true);
    audioManager.playBoomImpact();
    setTimeout(() => {
      speechSynthesizer.speakHomeIntro();
    }, 200);
  }, []);

  useEffect(() => {
    // Listener for any screen tap/click/keydown to start AI Host voice automatically
    const handleFirstGesture = () => {
      if (!hasInteracted) {
        handleStartStage();
      }
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [hasInteracted, handleStartStage]);

  return (
    <div className="home-page relative flex min-h-dvh flex-col overflow-hidden">
      {/* ── Custom Full-Screen Image Background ────────────────── */}
      <HomeBackground />

      {/* ── Auditorium Stage Intro Splash (Bypasses Browser Autoplay Restrictions 100%) ── */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleStartStage}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-2xl cursor-pointer select-none px-6 text-center"
          >
            <div className="relative flex flex-col items-center gap-6 max-w-lg">
              {/* Pulsing Glowing Stage Play Icon */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], boxShadow: ['0 0 30px rgba(168,85,247,0.4)', '0 0 70px rgba(59,130,246,0.8)', '0 0 30px rgba(168,85,247,0.4)'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 text-5xl shadow-2xl border border-white/30"
              >
                🎙️
              </motion.div>

              <div className="flex flex-col gap-2">
                <h2
                  className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-snug drop-shadow-xl"
                  style={{ fontFamily: 'Space Grotesk, Outfit, system-ui, sans-serif' }}
                >
                  ENTER STAGE ARENA
                </h2>
                <p className="text-sm sm:text-base font-semibold text-purple-200/80">
                  Click anywhere to activate AI Voice Host & Live Auditorium Sound
                </p>
              </div>

              {/* Shimmer Button */}
              <div
                className="btn btn-xl shimmer mt-2 px-8 py-3.5 rounded-2xl font-black text-white text-lg tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                  boxShadow: '0 8px 36px rgba(168, 85, 247, 0.5)',
                }}
              >
                ▶ CLICK TO START EVENT
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Control Bar ─────────────────────────────────── */}
      <ControlBar
        isSoundEnabled={isSoundEnabled}
        onToggleSound={toggleSound}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* ── Main Content ────────────────────────────────── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-6 sm:px-8 lg:px-12">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex w-full max-w-6xl flex-col items-center gap-8 lg:gap-10"
        >
          {/* ── Hero Title ── */}
          <motion.div variants={staggerChild} className="w-full text-center">
            <HeroTitle />
          </motion.div>

          {/* ── Challenge Cards Grid ── */}
          <motion.div
            variants={staggerChild}
            className="grid w-full grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-8"
          >
            <ChallengeCard
              id="logo-challenge-card"
              title="Guess the Logo"
              description="Test your brand recognition! Can you identify the company behind the logo?"
              imageSrc="/images/logo-challenge.png"
              imageAlt="Guess the Logo challenge"
              accentColor="primary"
              questionCount={10}
              difficulty="Mixed"
              onClick={() => navigate(ROUTES.GUESS_LOGO)}
              index={0}
            />

            <ChallengeCard
              id="movie-challenge-card"
              title="Guess the Movie"
              description="Lights, camera, action! Identify the film from a famous dialogue or scene."
              imageSrc="/images/movie-challenge.png"
              imageAlt="Guess the Movie challenge"
              accentColor="secondary"
              questionCount={10}
              difficulty="Mixed"
              onClick={() => navigate(ROUTES.GUESS_MOVIE)}
              index={1}
            />
          </motion.div>

          {/* ── Footer Badge ── */}
          <motion.div variants={staggerChild}>
            <FooterBadge />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
