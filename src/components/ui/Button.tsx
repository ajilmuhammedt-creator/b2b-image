import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}, ref) => {
  // Base classes: 44px min touch target, Plus Jakarta Sans, rounded-button (12px)
  const baseClasses =
    'inline-flex items-center justify-center font-bold tracking-tight rounded-button transition-all duration-150 focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  // Sizing: sizes ensure touch targets >= 44px where needed, sm has 36px with padding
  const sizeClasses = {
    sm: 'h-9 px-3 text-xs gap-1.5',
    md: 'h-11 px-4 text-sm gap-2 min-h-[44px]',
    lg: 'h-12 px-6 text-sm gap-2.5 min-h-[48px]',
  }[size];

  // Variants according to 02-DESIGN-SYSTEM.md:
  // Primary: #C8281E (Brand Red) - Single main action per screen
  // Secondary: White surface with #D5D9E0 border & #14161B ink text
  // Ghost: Transparent with #14161B ink text, hover #EEF0F3
  // Destructive: Outlined with border-strong, hover text-brand and border-brand
  const variantClasses = {
    primary:
      'bg-brand text-white hover:bg-brand-hover active:bg-[#8C1B15] shadow-xs border border-transparent',
    secondary:
      'bg-surface text-ink border border-border-strong hover:bg-track active:bg-[#E5E8EC]',
    ghost:
      'bg-transparent text-ink hover:bg-track active:bg-[#E5E8EC]',
    destructive:
      'bg-surface text-ink border border-border-strong hover:border-brand hover:text-brand hover:bg-[#FDECEA]/40 active:bg-[#FDECEA]',
  }[variant];

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : icon && iconPosition === 'left' ? (
        <span className="shrink-0 inline-flex items-center" aria-hidden="true">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' ? (
        <span className="shrink-0 inline-flex items-center" aria-hidden="true">{icon}</span>
      ) : null}
    </button>
  );
});

Button.displayName = 'Button';

