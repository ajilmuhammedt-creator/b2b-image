import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  action?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  helperText,
  error,
  options,
  children,
  id: customId,
  disabled,
  className = '',
  required,
  action,
  ...props
}, ref) => {
  const generatedId = useId();
  const selectId = customId || generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  return (
    <div className="w-full flex flex-col text-left">
      {(label || action) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label
              htmlFor={selectId}
              className="text-[13px] font-bold text-ink-2 flex items-center gap-1 select-none"
            >
              {label}
              {required && <span className="text-brand">*</span>}
            </label>
          )}
          {action && <div className="text-xs">{action}</div>}
        </div>
      )}

      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full h-11 pl-3.5 pr-10 bg-surface text-ink text-sm rounded-field border transition-all duration-150 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? 'border-brand focus:border-brand focus:ring-1 focus:ring-brand'
              : 'border-border-strong focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink'
          } ${className}`.trim()}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute right-3.5 text-muted pointer-events-none flex items-center justify-center shrink-0">
          <ChevronDown className="w-4 h-4" aria-hidden="true" />
        </div>
      </div>

      {error ? (
        <p id={errorId} className="text-xs font-semibold text-brand mt-1.5 flex items-center gap-1">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-muted mt-1.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
