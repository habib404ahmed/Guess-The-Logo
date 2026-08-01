import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────

type CardVariant = 'default' | 'elevated' | 'glow-primary' | 'glow-secondary' | 'glow-accent';
type CardSize = 'sm' | 'md' | 'lg' | 'xl';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  size?: CardSize;
  hoverable?: boolean;
  children?: ReactNode;
  /** Apply shimmer animation to the card */
  shimmer?: boolean;
  /** Apply noise texture overlay */
  noise?: boolean;
  /** Animate in on mount */
  animate?: boolean;
}

// ─── CSS Class Maps ──────────────────────────────────────────────────────────

const VARIANT_CLASS: Record<CardVariant, string> = {
  default: 'card',
  elevated: 'card card-elevated',
  'glow-primary': 'card card-glow-primary',
  'glow-secondary': 'card card-glow-secondary',
  'glow-accent': 'card card-glow-accent',
};

const SIZE_CLASS: Record<CardSize, string> = {
  sm: 'card-sm',
  md: '',
  lg: 'card-lg',
  xl: 'card-xl',
};

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Card
 *
 * Glass-effect card used as the building block for all content areas.
 * Consistent padding, border radius, and backdrop blur across the app.
 *
 * @example
 * <Card variant="glow-primary" size="lg" hoverable>
 *   <CardHeader>...</CardHeader>
 *   <CardBody>...</CardBody>
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      size = 'md',
      hoverable = false,
      shimmer = false,
      noise = false,
      animate = false,
      children,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const variantClass = VARIANT_CLASS[variant];
    const sizeClass = SIZE_CLASS[size];
    const hoverClass = hoverable ? 'card-hover' : '';
    const shimmerClass = shimmer ? 'shimmer' : '';
    const noiseClass = noise ? 'noise' : '';

    const allClasses = [variantClass, sizeClass, hoverClass, shimmerClass, noiseClass, className]
      .filter(Boolean)
      .join(' ');

    if (animate) {
      return (
        <motion.div
          ref={ref as React.Ref<HTMLDivElement>}
          className={allClasses}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
          {...(rest as HTMLMotionProps<'div'>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={allClasses} {...rest}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

// ─── Sub-components ──────────────────────────────────────────────────────────

interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function CardHeader({ children, className = '', ...rest }: CardSectionProps) {
  return (
    <div className={`mb-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...rest }: CardSectionProps) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...rest }: CardSectionProps) {
  return (
    <div
      className={`mt-6 flex items-center justify-between ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
