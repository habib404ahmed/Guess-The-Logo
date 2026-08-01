import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { ButtonVariant, SizeVariant } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | 'danger' | 'success';
  size?: SizeVariant;
  /** Shows a spinner and disables the button */
  loading?: boolean;
  /** Renders only the icon; applies square dimensions */
  iconOnly?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
  /** Full width */
  fullWidth?: boolean;
}

// ─── Size → CSS Class Map ─────────────────────────────────────────────────────

const SIZE_CLASS: Record<string, string> = {
  xs: 'btn-sm',
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
  xl: 'btn-xl',
};

// ─── Variant → CSS Class Map ─────────────────────────────────────────────────

const VARIANT_CLASS: Record<string, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  danger: 'btn-danger',
  success: 'btn-success',
};

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Button
 *
 * The single button component for the entire application.
 * All visual variants, sizes, and states flow through here.
 *
 * @example
 * <Button variant="primary" size="lg" leftIcon={<PlayIcon />}>
 *   Start Challenge
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      iconOnly = false,
      leftIcon,
      rightIcon,
      children,
      fullWidth = false,
      disabled,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const variantClass = VARIANT_CLASS[variant] ?? '';
    const sizeClass = SIZE_CLASS[size] ?? '';
    const iconOnlyClass = iconOnly ? 'btn-icon' : '';
    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <motion.button
        ref={ref}
        className={`btn ${variantClass} ${sizeClass} ${iconOnlyClass} ${widthClass} ${className}`}
        disabled={disabled || loading}
        whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
        {...(rest as object)}
      >
        {loading ? (
          <Spinner />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {!iconOnly && children && <span>{children}</span>}
            {!iconOnly && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
