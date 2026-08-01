/**
 * Design Tokens
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all design decisions.
 * These are consumed by Tailwind config and CSS custom properties.
 * Never hardcode colors, spacing, or typography values anywhere else.
 */

// ─── Color Palette ──────────────────────────────────────────────────────────

export const colors = {
  // Brand
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Electric Blue — primary CTA
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Purple — secondary actions
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  accent: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4', // Cyan — accent highlights
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },

  // Background scale
  background: {
    base: '#060918',   // Deepest dark — page background
    surface: '#0d1424', // Cards, panels
    elevated: '#131d35', // Modals, dropdowns
    overlay: '#192340', // Hover states
    border: '#1e2d4a',  // Subtle borders
    borderMuted: '#162038', // Very subtle borders
  },

  // Text scale
  text: {
    primary: '#f0f4ff',   // High-contrast headings
    secondary: '#94a3b8', // Body text, descriptions
    muted: '#475569',     // Placeholders, disabled
    inverse: '#060918',   // Text on light backgrounds
  },

  // Semantic
  success: {
    DEFAULT: '#22c55e',
    light: '#4ade80',
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.3)',
  },
  warning: {
    DEFAULT: '#f59e0b',
    light: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  danger: {
    DEFAULT: '#ef4444',
    light: '#f87171',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.3)',
  },

  // Glass / frosted effects
  glass: {
    white: 'rgba(255, 255, 255, 0.04)',
    whiteMd: 'rgba(255, 255, 255, 0.08)',
    whiteHover: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.16)',
  },
} as const;

// ─── Spacing Scale ───────────────────────────────────────────────────────────
// Base unit: 4px. All spacing is a multiple of 4.

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const typography = {
  fontFamily: {
    display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
    body: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },

  // Fluid type scale — desktop sizes
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
    sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
    base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
    lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
    xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
    '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
    '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
    '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
    '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
    '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
  },

  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────

export const borderRadius = {
  none: '0',
  sm: '4px',
  DEFAULT: '8px',
  md: '10px',
  lg: '14px',
  xl: '18px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
  DEFAULT: '0 4px 16px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
  md: '0 8px 24px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.4)',
  lg: '0 16px 40px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)',
  xl: '0 24px 64px rgba(0,0,0,0.7), 0 12px 32px rgba(0,0,0,0.5)',
  '2xl': '0 40px 80px rgba(0,0,0,0.8)',
  glow: {
    primary: '0 0 24px rgba(59, 130, 246, 0.4)',
    secondary: '0 0 24px rgba(168, 85, 247, 0.4)',
    accent: '0 0 24px rgba(6, 182, 212, 0.4)',
    success: '0 0 24px rgba(34, 197, 94, 0.4)',
    danger: '0 0 24px rgba(239, 68, 68, 0.4)',
  },
} as const;

// ─── Animations ──────────────────────────────────────────────────────────────

export const animation = {
  duration: {
    instant: '0ms',
    fast: '120ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '700ms',
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// ─── Breakpoints ─────────────────────────────────────────────────────────────

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px', // Ultra-wide / projector
} as const;

// ─── Z-Index Scale ───────────────────────────────────────────────────────────

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  raised: 10,
  dropdown: 20,
  sticky: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
} as const;
