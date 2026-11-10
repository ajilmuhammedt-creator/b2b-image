import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rounded',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantClasses = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    rounded: 'rounded-field',
  }[variant];

  return (
    <div
      aria-hidden="true"
      className={`bg-track animate-pulse ${variantClasses} ${className}`.trim()}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};
