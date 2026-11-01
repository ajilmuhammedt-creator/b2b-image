import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
      className={`p-2 rounded-lg transition-all duration-200 flex items-center space-x-1.5 ${
        theme === 'dark'
          ? 'text-amber-300 hover:text-amber-200 hover:bg-white/[0.08] bg-white/[0.04] border border-white/[0.08]'
          : 'text-indigo-600 hover:text-indigo-700 hover:bg-slate-100 bg-white border border-slate-200 shadow-sm'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-200 hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs font-medium">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
