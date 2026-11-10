import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type IconButtonVariant = 'secondary' | 'ghost' | 'dark' | 'outline';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string; // Mandatory for accessibility
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  tooltip?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  'aria-label': ariaLabel,
  variant = 'secondary',
  size = 'md',
  loading = false,
  tooltip,
  disabled,
  children,
  className = '',
  title,
  ...props
}, ref) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-button transition-all duration-150 focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-95';

  const sizeClasses = {
    sm: 'w-9 h-9 min-w-[36px] min-h-[36px] p-1.5',
    md: 'w-11 h-11 min-w-[44px] min-h-[44px] p-2.5',
    lg: 'w-12 h-12 min-w-[48px] min-h-[48px] p-3',
  }[size];

  const variantClasses = {
    secondary:
      'bg-surface text-ink border border-border hover:bg-track active:bg-[#E5E8EC]',
    outline:
      'bg-surface text-ink border border-border-strong hover:bg-track active:bg-[#E5E8EC]',
    ghost:
      'bg-transparent text-muted hover:text-ink hover:bg-track active:bg-[#E5E8EC]',
    dark:
      'bg-ink text-white hover:bg-ink-2 active:bg-black',
  }[variant];

  return (
    <button
      ref={ref}
      aria-label={ariaLabel}
      title={tooltip || title || ariaLabel}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" aria-hidden="true" />
      ) : (
        children
      )}
    </button>
  );
});

IconButton.displayName = 'IconButton';

