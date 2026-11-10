import React from 'react';
import { Bell, X, ShieldCheck, AlertTriangle } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: 'approval' | 'warning' | 'info';
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: NotificationItem[];
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Listing Set Ready for Review',
    message: 'SF935HFN Amazon image set completed generation with 6 slots.',
    time: '10m ago',
    read: false,
    type: 'approval',
  },
  {
    id: '2',
    title: 'Amazon Compliance Check',
    message: 'Slot 1 verified: Pure #FFFFFF hero canvas with >85% product frame ratio.',
    time: '1h ago',
    read: false,
    type: 'approval',
  },
  {
    id: '3',
    title: 'Resolution Warning',
    message: 'Slot 4 image was resized to 2000×2000px standard.',
    time: '3h ago',
    read: true,
    type: 'warning',
  },
];

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose,
  notifications = DEFAULT_NOTIFICATIONS,
  onMarkAllRead,
  onDismiss,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Surface Panel */}
      <div className="fixed top-14 right-4 sm:right-16 w-full max-w-sm bg-surface border border-border rounded-sheet shadow-2xl z-10 overflow-hidden flex flex-col animate-in slide-in-from-top-3 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-track flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-ink m-0">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-ink text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onMarkAllRead && unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-xs text-muted hover:text-ink font-semibold"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="text-muted hover:text-ink p-1 rounded-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-1.5">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 text-muted/50 stroke-[1.5]" />
              <p className="font-bold text-ink m-0">All caught up</p>
              <p className="text-[11px] text-muted m-0">No new notifications</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-card transition-colors flex items-start gap-3 relative ${
                  item.read ? 'bg-surface' : 'bg-page'
                } border border-border/80`}
              >
                <div className="mt-0.5 shrink-0">
                  {item.type === 'warning' ? (
                    <span className="w-6 h-6 rounded-full bg-warn-bg text-warn-fg flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-ok-bg text-ok-fg flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-ink truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-muted shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted m-0 leading-normal">
                    {item.message}
                  </p>
                </div>

                {onDismiss && (
                  <button
                    type="button"
                    onClick={() => onDismiss(item.id)}
                    aria-label="Dismiss notification"
                    className="text-muted/60 hover:text-ink p-0.5 rounded-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
