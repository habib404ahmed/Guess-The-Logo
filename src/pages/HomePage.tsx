import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/types';
import { staggerContainer, staggerChild } from '@/animations/variants';
import { useTheme } from '@/contexts/ThemeContext';
import { speechSynthesizer } from '@/utils/speechSynthesizer';
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

  useEffect(() => {
    // Automatically trigger speech intro when homepage opens
    const timer = setTimeout(() => {
      speechSynthesizer.speakHomeIntro();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-page relative flex min-h-dvh flex-col overflow-hidden">
      {/* ── Custom Full-Screen Image Background ────────────────── */}
      <HomeBackground />

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
