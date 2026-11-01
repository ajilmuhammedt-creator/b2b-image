import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { BrandLogo } from './BrandLogo';
import { History as HistoryIcon, LayoutGrid, LogOut, Shield } from 'lucide-react';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const isAdmin = profile?.role === 'admin';
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Staff';
  const userRole = isAdmin ? 'Admin' : 'Staff';

  return (
    <div className="sticky top-0 z-40 transition-colors">
      {/* 2. Thin top strip above header: background #0F1B3D, height 36px, white 13px text */}
      <div className="bg-[#0F1B3D] text-white h-[36px] px-4 sm:px-6 lg:px-8 flex items-center justify-between text-[13px] border-b border-[#0F1B3D]">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="text-white/80 font-normal">Logged in as</span>
          <span className="font-semibold text-white">{userName}</span>
          <span className="text-white/50">&middot;</span>
          <span className="text-white/90 font-medium capitalize">{userRole}</span>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle className="text-white hover:text-white hover:bg-white/10 p-1 rounded-md transition" />
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="flex items-center space-x-1 text-white/90 hover:text-white hover:bg-white/10 px-2 py-1 rounded transition text-xs font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Main header: stays white with a bottom border #E3E8EF in light mode */}
      <header className="border-b border-[#E3E8EF] dark:border-white/[0.06] bg-[#FFFFFF] dark:bg-[#090B10]/80 backdrop-blur-xl transition-colors">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/studio" className="flex items-center group py-1">
              <BrandLogo heightClass="h-8" />
            </Link>

            <nav className="flex items-center space-x-1.5">
              <Link
                to="/studio"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  location.pathname === '/studio'
                    ? 'bg-red-50 text-[#E11D2E] border border-red-200/80 shadow-sm dark:bg-white/[0.08] dark:text-white dark:border-white/[0.08]'
                    : 'text-[#5B6478] hover:text-[#0F172A] hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/[0.03]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Studio</span>
              </Link>

              <Link
                to="/history"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  location.pathname === '/history'
                    ? 'bg-red-50 text-[#E11D2E] border border-red-200/80 shadow-sm dark:bg-white/[0.08] dark:text-white dark:border-white/[0.08]'
                    : 'text-[#5B6478] hover:text-[#0F172A] hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/[0.03]'
                }`}
              >
                <HistoryIcon className="w-3.5 h-3.5" />
                <span>History</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin/users"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-red-50 text-[#E11D2E] border border-red-200/80 shadow-sm dark:bg-indigo-600/30 dark:text-indigo-300 dark:border-indigo-500/40'
                      : 'text-[#5B6478] hover:text-[#0F172A] hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-[#E11D2E] dark:text-indigo-400" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
    </div>
  );
}
