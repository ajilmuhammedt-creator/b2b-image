import React from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  count?: number | string;
  disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
  'aria-label'?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  activeId,
  onChange,
  className = '',
  'aria-label': ariaLabel = 'Section navigation',
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex items-center gap-6 border-b border-border overflow-x-auto no-scrollbar select-none ${className}`.trim()}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={`pb-3 -mb-px text-sm font-semibold transition-all inline-flex items-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isActive
                ? 'text-ink font-bold border-b-2 border-ink'
                : 'text-muted hover:text-ink border-b-2 border-transparent'
            }`}
          >
            {tab.icon && <span className="shrink-0" aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
                  isActive ? 'bg-ink text-white' : 'bg-track text-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
