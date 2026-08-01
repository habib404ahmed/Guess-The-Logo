import type { HTMLAttributes, ReactNode } from 'react';
import type { ColorVariant } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ColorVariant | 'default';
  children: ReactNode;
  /** Adds a dot indicator before the label */
  dot?: boolean;
}

// ─── CSS Class Map ───────────────────────────────────────────────────────────

const VARIANT_CLASS: Record<string, string> = {
  default: 'badge badge-primary',
  primary: 'badge badge-primary',
  secondary: 'badge badge-secondary',
  accent: 'badge badge-accent',
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  danger: 'badge badge-danger',
  ghost: 'badge',
};

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Badge
 *
 * Small inline label for categories, difficulty levels, and status indicators.
 *
 * @example
 * <Badge variant="success" dot>Correct</Badge>
 * <Badge variant="warning">Medium</Badge>
 */
export function Badge({ variant = 'default', dot = false, children, className = '', ...rest }: BadgeProps) {
  const variantClass = VARIANT_CLASS[variant] ?? VARIANT_CLASS.default;

  return (
    <span className={`${variantClass} ${className}`} {...rest}>
      {dot && (
        <span
          className="block h-[6px] w-[6px] rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
