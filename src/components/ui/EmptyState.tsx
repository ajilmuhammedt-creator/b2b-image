import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-surface border border-border border-dashed rounded-card ${className}`.trim()}
    >
      <div className="w-14 h-14 rounded-full bg-track text-muted flex items-center justify-center mb-4 shrink-0">
        {icon || <Inbox className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-extrabold text-ink tracking-tight m-0">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-muted max-w-sm mt-1.5 mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
