import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { CommandMenu } from './CommandMenu';
import { JobsTray } from './JobsTray';
import { NotificationsPanel } from './NotificationsPanel';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  breadcrumbs,
}) => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sanford_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [jobsTrayOpen, setJobsTrayOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sanford_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-page text-ink font-sans flex antialiased">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <TopBar
          title={title}
          breadcrumbs={breadcrumbs}
          onOpenCommandMenu={() => setCommandMenuOpen(true)}
          onOpenJobsTray={() => setJobsTrayOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Shell Overlays */}
      <CommandMenu
        isOpen={commandMenuOpen}
        onClose={() => setCommandMenuOpen(false)}
      />

      <JobsTray
        isOpen={jobsTrayOpen}
        onClose={() => setJobsTrayOpen(false)}
      />

      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
};
