import React from 'react';
import { Check, AlertTriangle, X } from 'lucide-react';

export type LifecycleStatus = 'draft' | 'in_review' | 'approved' | 'delivered' | 'generating';
export type CheckStatus = 'pass' | 'warning' | 'fail';
export type ChannelStatus = 'connected' | 'disconnected';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  // Pre-configured semantic variants
  variant?: 'neutral' | 'ok' | 'warn' | 'fail' | 'dark';
  lifecycle?: LifecycleStatus;
  check?: CheckStatus;
  channel?: ChannelStatus;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  lifecycle,
  check,
  channel,
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  // Determine variant and default icon/label based on status
  let resolvedVariant = variant || 'neutral';
  let resolvedIcon = icon;
  let defaultLabel: React.ReactNode = children;

  if (lifecycle) {
    switch (lifecycle) {
      case 'draft':
        resolvedVariant = 'neutral';
        defaultLabel = defaultLabel || 'Draft';
        break;
      case 'in_review':
        resolvedVariant = 'warn';
        defaultLabel = defaultLabel || 'In review';
        break;
      case 'approved':
        resolvedVariant = 'ok';
        defaultLabel = defaultLabel || 'Approved';
        break;
      case 'delivered':
        resolvedVariant = 'dark';
        defaultLabel = defaultLabel || 'Delivered';
        break;
      case 'generating':
        resolvedVariant = 'neutral';
        defaultLabel = defaultLabel || 'Generating';
        break;
    }
  } else if (check) {
    switch (check) {
      case 'pass':
        resolvedVariant = 'ok';
        resolvedIcon = resolvedIcon || <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />;
        defaultLabel = defaultLabel || 'Pass';
        break;
      case 'warning':
        resolvedVariant = 'warn';
        resolvedIcon = resolvedIcon || <AlertTriangle className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />;
        defaultLabel = defaultLabel || 'Warning';
        break;
      case 'fail':
        // Critical Rule: Fail is ALWAYS black with white text, never red!
        resolvedVariant = 'fail';
        resolvedIcon = resolvedIcon || <X className="w-3 h-3 stroke-[3]" aria-hidden="true" />;
        defaultLabel = defaultLabel || 'Fail';
        break;
    }
  } else if (channel) {
    switch (channel) {
      case 'connected':
        resolvedVariant = 'ok';
        resolvedIcon = (
          <span className="w-1.5 h-1.5 rounded-full bg-ok-fg animate-pulse shrink-0" aria-hidden="true" />
        );
        defaultLabel = defaultLabel || 'Connected';
        break;
      case 'disconnected':
        resolvedVariant = 'neutral';
        resolvedIcon = (
          <span className="w-1.5 h-1.5 rounded-full bg-muted shrink-0" aria-hidden="true" />
        );
        defaultLabel = defaultLabel || 'Not connected';
        break;
    }
  }

  const variantStyles = {
    neutral: 'bg-track text-muted border border-transparent',
    ok: 'bg-ok-bg text-ok-fg border border-transparent',
    warn: 'bg-warn-bg text-warn-fg border border-transparent',
    fail: 'bg-fail-bg text-fail-fg border border-transparent', // Pure black with white text
    dark: 'bg-ink text-white border border-transparent',
  }[resolvedVariant];

  const sizeStyles = {
    sm: 'h-5 px-2 text-[11px] gap-1',
    md: 'h-6 px-2.5 text-xs gap-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-full select-none shrink-0 ${variantStyles} ${sizeStyles} ${className}`.trim()}
      {...props}
    >
      {resolvedIcon && <span className="shrink-0 flex items-center justify-center">{resolvedIcon}</span>}
      <span className="truncate">{defaultLabel}</span>
    </span>
  );
};

