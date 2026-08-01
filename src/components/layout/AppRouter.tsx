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

/**
 * AppRouter
 *
 * Defines all application routes and wraps them with:
 * - RootLayout    → ambient background, z-index context
 * - PageTransition → AnimatePresence-based page transitions
 *
 * Route map:
 *   /              → HomePage
 *   /guess-logo    → GuessLogoPage
 *   /guess-movie   → GuessMoviePage
 *   /admin         → AdminPage
 *   *              → NotFoundPage
 */
export function AppRouter() {
  const location = useLocation();

  return (
    <RootLayout>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route
            path={ROUTES.HOME}
            element={
              <PageTransition>
                <HomePage />
              </PageTransition>
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
