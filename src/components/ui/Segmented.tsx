import React from 'react';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface SegmentedProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
  name?: string;
  'aria-label'?: string;
}

export function Segmented<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = true,
  className = '',
  name,
  'aria-label': ariaLabel,
}: SegmentedProps<T>) {
  const sizeClasses = {
    sm: 'h-7 px-2.5 text-xs',
    md: 'h-8 px-3.5 text-[13px]',
  }[size];

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`inline-flex items-center p-1 bg-track rounded-field gap-1 select-none ${
        fullWidth ? 'w-full' : ''
      } ${className}`.trim()}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            name={name}
            aria-checked={isSelected}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && onChange(opt.value)}
            className={`${sizeClasses} ${
              fullWidth ? 'flex-1' : ''
            } rounded-[8px] transition-all duration-150 inline-flex items-center justify-center gap-1.5 font-bold disabled:opacity-40 disabled:cursor-not-allowed ${
              isSelected
                ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(20,22,27,0.14)] cursor-default'
                : 'bg-transparent text-muted hover:text-ink hover:bg-black/[0.03]'
            }`}
          >
            {opt.icon && <span className="shrink-0" aria-hidden="true">{opt.icon}</span>}
            <span className="truncate">{opt.label}</span>
            {opt.badge !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                  isSelected ? 'bg-track text-ink' : 'bg-surface/80 text-muted'
                }`}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

