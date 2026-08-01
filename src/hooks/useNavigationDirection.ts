import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { NavigationDirection } from '@/types';

const ROUTE_ORDER = ['/', '/guess-logo', '/guess-movie'];

/**
 * Returns the navigation direction (forward / backward / none)
 * based on route index order. Used to select the correct
 * page transition variant.
 */
export function useNavigationDirection(): NavigationDirection {
  const location = useLocation();
  const prevPathRef = useRef<string>(location.pathname);

  const prevIndex = ROUTE_ORDER.indexOf(prevPathRef.current);
  const nextIndex = ROUTE_ORDER.indexOf(location.pathname);

  // Update ref for next navigation
  if (prevPathRef.current !== location.pathname) {
    prevPathRef.current = location.pathname;
  }

  if (prevIndex === -1 || nextIndex === -1) return 'none';
  if (nextIndex > prevIndex) return 'forward';
  if (nextIndex < prevIndex) return 'backward';
  return 'none';
}
