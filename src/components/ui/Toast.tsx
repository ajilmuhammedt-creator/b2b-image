import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, AlertTriangle, X, Info } from 'lucide-react';

export type ToastType = 'ok' | 'warn' | 'fail' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
    return id;
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const icons = {
    ok: (
      <span className="w-5 h-5 rounded-full bg-ok-bg text-ok-fg flex items-center justify-center shrink-0">
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </span>
    ),
    warn: (
      <span className="w-5 h-5 rounded-full bg-warn-bg text-warn-fg flex items-center justify-center shrink-0">
        <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
      </span>
    ),
    fail: (
      <span className="w-5 h-5 rounded-full bg-fail-bg text-fail-fg flex items-center justify-center shrink-0">
        <X className="w-3.5 h-3.5 stroke-[3]" />
      </span>
    ),
    info: (
      <span className="w-5 h-5 rounded-full bg-track text-ink flex items-center justify-center shrink-0">
        <Info className="w-3.5 h-3.5" />
      </span>
    ),
  }[toast.type];

  return (
    <div
      role="alert"
      className="pointer-events-auto p-4 bg-surface border border-border rounded-button shadow-lg flex items-start gap-3 animate-in slide-in-from-bottom-3 duration-200"
    >
      {icons}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className="text-sm font-bold text-ink m-0 leading-tight">
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs text-muted m-0 leading-normal">
            {toast.message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-muted hover:text-ink -mr-1 -mt-1 p-1 rounded-sm cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

