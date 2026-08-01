import type { ReactNode } from 'react';
import { BackgroundOrbs } from './BackgroundOrbs';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RootLayoutProps {
  children: ReactNode;
  /** Hide the background orbs (useful for full-bleed challenge screens) */
  hideOrbs?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * RootLayout
 *
 * The outermost layout shell. Provides:
 * - Background color + ambient orbs
 * - A stacking context so orbs sit behind content
 * - Consistent full-screen height
 *
 * Every page is rendered inside this.
 */
export function RootLayout({ children, hideOrbs = false }: RootLayoutProps) {
  return (
    <div className="page-wrapper relative">
      {!hideOrbs && <BackgroundOrbs />}

      {/* Content layer — above the orbs */}
      <div className="relative z-10 flex min-h-dvh flex-col">
        {children}
      </div>
    </div>
  );
}
