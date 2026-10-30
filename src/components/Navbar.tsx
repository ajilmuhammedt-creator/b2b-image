import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { History as HistoryIcon, LayoutGrid, LogOut, User } from 'lucide-react';

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
          <Link to="/studio" className="flex items-center space-x-3 group">
            <img
              src="/sanford-ai-logo.png"
              alt="Sanford AI"
              className="h-9 w-auto object-contain mix-blend-screen group-hover:opacity-90 transition-opacity"
            />
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
              B2B Image Studio
            </span>
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

