import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { History as HistoryIcon, LayoutGrid, LogOut, Shield } from 'lucide-react';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <header className="border-b border-white/[0.06] bg-[#090B10]/80 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/studio" className="flex items-center group py-1">
            <img
              src="/sanford-ai-logo.png"
              alt="Sanford AI"
              className="h-8 w-auto object-contain mix-blend-screen transition-opacity duration-200 group-hover:opacity-95"
            />
          </Link>

          <nav className="flex items-center space-x-1">
            <Link
              to="/studio"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                location.pathname === '/studio'
                  ? 'bg-white/[0.08] text-white border border-white/[0.08] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Studio</span>
            </Link>

            <Link
              to="/history"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                location.pathname === '/history'
                  ? 'bg-white/[0.08] text-white border border-white/[0.08] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <HistoryIcon className="w-3.5 h-3.5" />
              <span>History</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin/users"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="max-w-[180px] truncate text-slate-300 font-mono text-[11px]">
              {profile?.full_name || user?.email || 'Supplier'}
            </span>
            {isAdmin && (
              <span className="ml-1 text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Admin
              </span>
            )}
          </div>

          <button
            onClick={handleSignOut}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/[0.04] rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
