import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, History as HistoryIcon, LayoutGrid, LogOut, User } from 'lucide-react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/studio" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">
                Octopus <span className="text-indigo-400">Image Studio</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">
                B2B E-Commerce
              </span>
            </div>
          </Link>

          <nav className="flex items-center space-x-1">
            <Link
              to="/studio"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                location.pathname === '/studio'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Studio</span>
            </Link>

            <Link
              to="/history"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                location.pathname === '/history'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <HistoryIcon className="w-4 h-4" />
              <span>History</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="max-w-[180px] truncate">{user?.email || 'Supplier'}</span>
          </div>

          <button
            onClick={handleSignOut}
            title="Sign out"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

