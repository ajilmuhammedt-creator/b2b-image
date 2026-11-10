import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Loader2,
  Bell,
  LogOut,
  Shield,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

interface TopBarProps {
  title?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  runningJobsCount?: number;
  unreadNotificationsCount?: number;
  onOpenCommandMenu: () => void;
  onOpenJobsTray: () => void;
  onOpenNotifications: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title = 'Sanford AI Studio',
  breadcrumbs,
  runningJobsCount = 0,
  unreadNotificationsCount = 3,
  onOpenCommandMenu,
  onOpenJobsTray,
  onOpenNotifications,
}) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Staff User';
  const userEmail = user?.email || '';
  const isAdmin = profile?.role === 'admin';

  // Close avatar menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    };
    if (avatarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [avatarMenuOpen]);

  const handleSignOut = async () => {
    setAvatarMenuOpen(false);
    await signOut();
    navigate('/signin', { replace: true });
  };

  return (
    <header className="h-14 min-h-[56px] px-4 sm:px-6 bg-surface border-b border-border flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Left: Breadcrumbs or Title */}
      <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm truncate">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={b.label}>
                {i > 0 && <span className="text-muted">/</span>}
                {b.href ? (
                  <button
                    type="button"
                    onClick={() => navigate(b.href!)}
                    className="text-muted hover:text-ink font-medium truncate cursor-pointer"
                  >
                    {b.label}
                  </button>
                ) : (
                  <strong className="text-ink font-bold truncate">{b.label}</strong>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : (
          <span className="text-sm font-bold text-ink truncate">
            {title}
          </span>
        )}
      </div>

      {/* Center: Search Button (Cmd+K / Ctrl+K trigger) */}
      <button
        type="button"
        onClick={onOpenCommandMenu}
        aria-label="Search products, projects, people (Ctrl K)"
        className="hidden md:flex flex-1 max-w-sm h-10 px-3.5 rounded-field border border-border bg-page text-muted hover:text-ink hover:border-border-strong text-sm items-center gap-2.5 transition-all text-left cursor-pointer"
      >
        <Search className="w-4 h-4 shrink-0 text-muted" />
        <span className="flex-1 truncate text-xs text-muted">
          Search products, projects, people
        </span>
        <kbd className="text-[11px] font-bold px-1.5 py-0.5 rounded-[5px] bg-surface border border-border text-ink shrink-0 shadow-2xs">
          ⌘K
        </kbd>
      </button>

      {/* Right Tools: Jobs Tray + Notifications + Avatar Menu */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile Search trigger */}
        <button
          type="button"
          onClick={onOpenCommandMenu}
          aria-label="Search"
          className="md:hidden w-10 h-10 rounded-full border border-border bg-surface text-ink flex items-center justify-center hover:bg-track cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Jobs Tray Button */}
        <button
          type="button"
          onClick={onOpenJobsTray}
          aria-label={`Jobs Tray, ${runningJobsCount} running`}
          className="h-10 px-3 rounded-full border border-border bg-surface text-ink hover:bg-track font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          {runningJobsCount > 0 ? (
            <Loader2 className="w-4 h-4 animate-spin text-ink" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-border-strong" />
          )}
          <span className="hidden sm:inline">
            {runningJobsCount > 0 ? `${runningJobsCount} jobs running` : 'Jobs'}
          </span>
        </button>

        {/* Notifications Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label={`Notifications, ${unreadNotificationsCount} unread`}
          className="relative w-10 h-10 rounded-full border border-border bg-surface text-ink hover:bg-track flex items-center justify-center transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-ink" />
          )}
        </button>

        {/* User Avatar Menu Dropdown */}
        <div className="relative" ref={avatarMenuRef}>
          <button
            type="button"
            onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
            aria-label="Account menu"
            aria-expanded={avatarMenuOpen}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-ink transition-colors cursor-pointer focus:outline-none"
          >
            <Avatar name={userName} size="md" />
          </button>

          {/* Floating Dropdown Menu */}
          {avatarMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-card shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1">
              {/* Profile summary */}
              <div className="p-3 border-b border-track flex flex-col gap-1">
                <span className="text-xs font-bold text-ink truncate leading-tight">
                  {userName}
                </span>
                <span className="text-[11px] text-muted truncate font-mono">
                  {userEmail}
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  <Badge variant={isAdmin ? 'dark' : 'neutral'} size="sm">
                    {isAdmin ? 'Admin' : 'Staff'}
                  </Badge>
                  <span className="text-[11px] text-muted">Sanford AI Studio</span>
                </div>
              </div>

              {/* Navigation links */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarMenuOpen(false);
                    navigate('/admin/users');
                  }}
                  className="w-full h-9 px-3 rounded-[8px] text-xs font-semibold text-ink hover:bg-track flex items-center gap-2.5 cursor-pointer text-left"
                >
                  <Shield className="w-3.5 h-3.5 text-muted" />
                  <span>Admin Dashboard</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setAvatarMenuOpen(false);
                  navigate('/dev/components');
                }}
                className="w-full h-9 px-3 rounded-[8px] text-xs font-semibold text-ink hover:bg-track flex items-center gap-2.5 cursor-pointer text-left"
              >
                <Palette className="w-3.5 h-3.5 text-muted" />
                <span>Component Kit (/dev/components)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAvatarMenuOpen(false);
                  navigate('/history');
                }}
                className="w-full h-9 px-3 rounded-[8px] text-xs font-semibold text-ink hover:bg-track flex items-center gap-2.5 cursor-pointer text-left"
              >
                <ExternalLink className="w-3.5 h-3.5 text-muted" />
                <span>Project Library</span>
              </button>

              <div className="h-px bg-track my-1" />

              {/* Logout button */}
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full h-9 px-3 rounded-[8px] text-xs font-bold text-brand hover:bg-brand-tint/60 flex items-center gap-2.5 cursor-pointer text-left transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-brand" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
