import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Home,
  ShoppingBag,
  History,
  Shield,
  Palette,
  Sparkles,
  X,
  ArrowRight,
  Inbox,
  Calendar,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Pages' | 'Studios' | 'Actions';
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Command items catalog
  const commands: CommandItem[] = [
    {
      id: 'home',
      title: 'Home Dashboard',
      category: 'Pages',
      icon: <Home className="w-4 h-4" />,
      action: () => {
        navigate('/');
        onClose();
      },
    },
    {
      id: 'studio-ecommerce',
      title: 'E-Commerce Studio (Amazon, noon, Shopify)',
      category: 'Studios',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: 'Active',
      action: () => {
        navigate('/studio');
        onClose();
      },
    },
    {
      id: 'history',
      title: 'Project History (10-Day Retention)',
      category: 'Pages',
      icon: <History className="w-4 h-4" />,
      action: () => {
        navigate('/history');
        onClose();
      },
    },
    {
      id: 'work',
      title: 'My Work & Approvals',
      category: 'Pages',
      icon: <Inbox className="w-4 h-4" />,
      action: () => {
        navigate('/work');
        onClose();
      },
    },
    {
      id: 'calendar',
      title: 'Campaign Calendar',
      category: 'Pages',
      icon: <Calendar className="w-4 h-4" />,
      action: () => {
        navigate('/calendar');
        onClose();
      },
    },
    {
      id: 'admin',
      title: 'Staff Access & Daily Telemetry',
      category: 'Pages',
      icon: <Shield className="w-4 h-4" />,
      action: () => {
        navigate('/admin/users');
        onClose();
      },
    },
    {
      id: 'components',
      title: 'Design System & Component Kit (/dev/components)',
      category: 'Pages',
      icon: <Palette className="w-4 h-4" />,
      action: () => {
        navigate('/dev/components');
        onClose();
      },
    },
    {
      id: 'new-run',
      title: 'Start New Image Studio Generation',
      category: 'Actions',
      icon: <Sparkles className="w-4 h-4 text-brand" />,
      badge: 'Quick Action',
      action: () => {
        navigate('/studio');
        onClose();
      },
    },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Surface */}
      <div className="relative w-full max-w-xl bg-surface border border-border rounded-sheet shadow-2xl z-10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-track gap-3">
          <Search className="w-5 h-5 text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted/60 focus:outline-none font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-muted hover:text-ink p-1 rounded-sm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-[6px] bg-track text-muted">
            ESC
          </span>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              No matching commands found for "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-xs transition-colors cursor-pointer text-left select-none ${
                    isSelected
                      ? 'bg-ink text-white font-bold'
                      : 'text-ink hover:bg-track font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={isSelected ? 'text-white' : 'text-muted'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-track text-muted'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <span className={isSelected ? 'text-white' : 'text-muted'}>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-page border-t border-track flex items-center justify-between text-[11px] text-muted">
          <span>Navigate with <kbd className="font-sans font-bold">↑</kbd> <kbd className="font-sans font-bold">↓</kbd></span>
          <span>Select with <kbd className="font-sans font-bold">↵</kbd></span>
        </div>
      </div>
    </div>
  );
};
