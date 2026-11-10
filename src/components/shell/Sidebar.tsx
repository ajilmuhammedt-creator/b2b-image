import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  Inbox,
  Calendar,
  Package,
  ShoppingCart,
  Megaphone,
  Box,
  FileText,
  BookOpen,
  Settings,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  workCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  workCount = 4,
}) => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `h-10 px-3 rounded-[10px] flex items-center gap-3 text-sm transition-colors select-none ${
      collapsed ? 'justify-center px-0 w-10 mx-auto' : ''
    } ${
      isActive
        ? 'bg-ink text-white font-bold'
        : 'text-ink-2 hover:bg-track font-medium text-ink'
    }`;

  return (
    <aside
      className={`h-screen sticky top-0 shrink-0 bg-surface border-r border-border p-3 flex flex-col gap-1 transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-[68px]' : 'w-[232px]'
      }`}
    >
      {/* Brand Logo Header */}
      <div className={`py-2 px-2.5 mb-2 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <Link to="/" className="flex items-center gap-1.5 no-underline">
          <p className="m-0 text-[21px] font-extrabold tracking-tight text-ink">
            sanford<span className="text-brand">Ai</span>
          </p>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav aria-label="Main" className="flex flex-col gap-1 flex-1 overflow-y-auto no-scrollbar">
        {/* Core items */}
        <NavLink to="/" end className={navLinkClass} title={collapsed ? 'Home' : undefined}>
          <Home className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Home</span>}
        </NavLink>

        <NavLink to="/work" className={navLinkClass} title={collapsed ? 'My work' : undefined}>
          <div className="relative flex items-center">
            <Inbox className="w-[18px] h-[18px] shrink-0" />
            {collapsed && workCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-ink" />
            )}
          </div>
          {!collapsed && (
            <>
              <span className="flex-1">My work</span>
              {workCount > 0 && (
                <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center">
                  {workCount}
                </span>
              )}
            </>
          )}
        </NavLink>

        <NavLink to="/calendar" className={navLinkClass} title={collapsed ? 'Calendar' : undefined}>
          <Calendar className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Calendar</span>}
        </NavLink>

        <NavLink to="/products" className={navLinkClass} title={collapsed ? 'Products' : undefined}>
          <Package className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Products</span>}
        </NavLink>

        {/* Studios Section */}
        <div className="my-2">
          {!collapsed ? (
            <p className="px-3 pt-3 pb-1 text-xs font-bold text-subtle m-0 uppercase tracking-wider">
              Studios
            </p>
          ) : (
            <div className="h-px bg-track my-2" />
          )}

          <div className="flex flex-col gap-1">
            <NavLink to="/studio" className={navLinkClass} title={collapsed ? 'E-commerce' : undefined}>
              <ShoppingCart className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>E-commerce</span>}
            </NavLink>

            <NavLink to="/studio/social" className={navLinkClass} title={collapsed ? 'Social media' : undefined}>
              <Megaphone className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>Social media</span>}
            </NavLink>

            <NavLink to="/studio/packaging" className={navLinkClass} title={collapsed ? 'Packaging' : undefined}>
              <Box className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>Packaging</span>}
            </NavLink>

            <NavLink to="/studio/flyers" className={navLinkClass} title={collapsed ? 'Retail flyers' : undefined}>
              <FileText className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>Retail flyers</span>}
            </NavLink>
          </div>
        </div>

        <div className="h-px bg-track my-1 mx-2" />

        {/* History, Library & Settings */}
        <NavLink to="/history" className={navLinkClass} title={collapsed ? 'History' : undefined}>
          <Clock className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>History</span>}
        </NavLink>

        <NavLink to="/library/brand" className={navLinkClass} title={collapsed ? 'Library' : undefined}>
          <BookOpen className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Library</span>}
        </NavLink>

        <NavLink to="/admin/users" className={navLinkClass} title={collapsed ? 'Settings' : undefined}>
          <Settings className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </nav>

      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={`h-10 px-3 rounded-[10px] text-xs font-semibold text-muted hover:text-ink hover:bg-track flex items-center gap-3 transition-colors cursor-pointer ${
          collapsed ? 'justify-center px-0 w-10 mx-auto' : ''
        }`}
      >
        {collapsed ? (
          <ChevronRight className="w-[18px] h-[18px] shrink-0" />
        ) : (
          <>
            <ChevronLeft className="w-[18px] h-[18px] shrink-0" />
            <span>Collapse</span>
          </>
        )}
      </button>
    </aside>
  );
};

