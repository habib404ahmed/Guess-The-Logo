import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ROUTES } from '@/types';
import { HomePage } from '@/pages/HomePage';
import { GuessLogoPage } from '@/pages/GuessLogoPage';
import { GuessMoviePage } from '@/pages/GuessMoviePage';
import { AdminPage } from '@/pages/AdminPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RootLayout } from '@/components/layout/RootLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { WelcomeScreen } from '@/components/home/WelcomeScreen';

/**
 * AppRouter
 *
 * Defines all application routes and wraps them with:
 * - RootLayout    → ambient background, z-index context
 * - WelcomeScreen → Opening ceremony (shown strictly ONCE on app load / refresh)
 * - PageTransition → AnimatePresence-based page transitions
 *
 * Route map:
 *   /              → WelcomeScreen (if first visit) -> HomePage
 *   /guess-logo    → GuessLogoPage
 *   /guess-movie   → GuessMoviePage
 *   /admin         → AdminPage
 *   *              → NotFoundPage
 */
export function AppRouter() {
  const location = useLocation();

  // Check if welcome screen has already been shown in this browser session
  const [welcomeShown, setWelcomeShown] = useState(() => {
    return sessionStorage.getItem('welcomeScreenShown') === 'true';
  });

  const handleWelcomeComplete = () => {
    sessionStorage.setItem('welcomeScreenShown', 'true');
    setWelcomeShown(true);
  };

  return (
    <RootLayout>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route
            path={ROUTES.HOME}
            element={
              !welcomeShown ? (
                <WelcomeScreen onComplete={handleWelcomeComplete} />
              ) : (
                <PageTransition>
                  <HomePage />
                </PageTransition>
              )
            }
          />
          <Route
            path={ROUTES.GUESS_LOGO}
            element={
              <PageTransition>
                <GuessLogoPage />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.GUESS_MOVIE}
            element={
              <PageTransition>
                <GuessMoviePage />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.ADMIN}
            element={
              <PageTransition>
                <AdminPage />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.NOT_FOUND}
            element={
              <PageTransition>
                <NotFoundPage />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </RootLayout>
  );
}
