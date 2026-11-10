import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Inbox,
  Calendar,
  ShoppingCart,
  MoreHorizontal,
  Package,
  BookOpen,
  Settings,
  Shield,
  Palette,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  workCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({ workCount = 4 }) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex-1 h-full flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors select-none ${
      isActive ? 'text-ink font-bold' : 'text-muted hover:text-ink'
    }`;

  return (
    <>
      {/* Fixed bottom navigation bar */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-surface border-t border-border z-40 flex items-center justify-around px-2 shadow-lg select-none"
      >
        <NavLink to="/" end className={navItemClass}>
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink to="/work" className={navItemClass}>
          <div className="relative">
            <Inbox className="w-5 h-5" />
            {workCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-ink" />
            )}
          </div>
          <span>My work</span>
        </NavLink>

        <NavLink to="/calendar" className={navItemClass}>
          <Calendar className="w-5 h-5" />
          <span>Calendar</span>
        </NavLink>

        <NavLink to="/studio" className={navItemClass}>
          <ShoppingCart className="w-5 h-5" />
          <span>Studios</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
            moreOpen ? 'text-ink font-bold' : 'text-muted hover:text-ink'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>

      {/* "More" Slide-up sheet */}
      {moreOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="More navigation"
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setMoreOpen(false)}
          />

          {/* Panel */}
          <div className="relative bg-surface rounded-t-sheet border-t border-border p-4 pb-20 shadow-2xl z-10 flex flex-col gap-2 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-track">
              <span className="text-sm font-extrabold text-ink">Navigation & Settings</span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="text-muted hover:text-ink p-1 rounded-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <NavLink
                to="/products"
                onClick={() => setMoreOpen(false)}
                className="p-3 rounded-field bg-page border border-border flex items-center gap-2.5 text-xs font-bold text-ink"
              >
                <Package className="w-4 h-4 text-muted" />
                <span>Products</span>
              </NavLink>

              <NavLink
                to="/library/brand"
                onClick={() => setMoreOpen(false)}
                className="p-3 rounded-field bg-page border border-border flex items-center gap-2.5 text-xs font-bold text-ink"
              >
                <BookOpen className="w-4 h-4 text-muted" />
                <span>Brand Kit</span>
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin/users"
                  onClick={() => setMoreOpen(false)}
                  className="p-3 rounded-field bg-page border border-border flex items-center gap-2.5 text-xs font-bold text-ink"
                >
                  <Shield className="w-4 h-4 text-muted" />
                  <span>Admin Access</span>
                </NavLink>
              )}

              <NavLink
                to="/dev/components"
                onClick={() => setMoreOpen(false)}
                className="p-3 rounded-field bg-page border border-border flex items-center gap-2.5 text-xs font-bold text-ink"
              >
                <Palette className="w-4 h-4 text-muted" />
                <span>Component Kit</span>
              </NavLink>

              <NavLink
                to="/history"
                onClick={() => setMoreOpen(false)}
                className="p-3 rounded-field bg-page border border-border flex items-center gap-2.5 text-xs font-bold text-ink col-span-2"
              >
                <Settings className="w-4 h-4 text-muted" />
                <span>Project History</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

