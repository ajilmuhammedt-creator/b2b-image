import React, { forwardRef, useId } from 'react';

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  action?: React.ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(({
  label,
  helperText,
  error,
  prefixIcon,
  suffixIcon,
  action,
  id: customId,
  disabled,
  className = '',
  required,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full flex flex-col text-left">
      {(label || action) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label
              htmlFor={inputId}
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
        {prefixIcon && (
          <div className="absolute left-3.5 text-muted pointer-events-none flex items-center justify-center shrink-0">
            {prefixIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full h-11 px-3.5 bg-surface text-ink text-sm rounded-field border transition-all duration-150 placeholder:text-muted/60 disabled:opacity-50 disabled:cursor-not-allowed ${
            prefixIcon ? 'pl-10' : ''
          } ${suffixIcon ? 'pr-10' : ''} ${
            error
              ? 'border-brand focus:border-brand focus:ring-1 focus:ring-brand'
              : 'border-border-strong focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink'
          } ${className}`.trim()}
          {...props}
        />

        {suffixIcon && (
          <div className="absolute right-3.5 text-muted flex items-center justify-center shrink-0">
            {suffixIcon}
          </div>
        )}
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

Field.displayName = 'Field';

