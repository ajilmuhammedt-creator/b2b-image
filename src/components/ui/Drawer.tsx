import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: 'right' | 'left';
  width?: string;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  width = 'max-w-md w-full',
  className = '',
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sideClasses = {
    right: 'inset-y-0 right-0 rounded-l-sheet border-l border-border animate-in slide-in-from-right duration-250',
    left: 'inset-y-0 left-0 rounded-r-sheet border-r border-border animate-in slide-in-from-left duration-250',
  }[side];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over surface */}
      <div
        ref={drawerRef}
        className={`fixed ${sideClasses} ${width} bg-surface shadow-2xl flex flex-col z-10 overflow-hidden ${className}`.trim()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-track flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {title && (
              <h2 className="text-lg font-extrabold text-ink tracking-tight m-0">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-muted m-0">
                {description}
              </p>
            )}
          </div>
          <IconButton
            aria-label="Close drawer"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="shrink-0 -mr-1.5 -mt-1.5"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 sm:p-6 bg-page/50 border-t border-track flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
