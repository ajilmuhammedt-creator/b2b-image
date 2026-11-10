import React, { forwardRef, useId } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  action?: React.ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  helperText,
  error,
  id: customId,
  disabled,
  rows = 3,
  className = '',
  required,
  action,
  ...props
}, ref) => {
  const generatedId = useId();
  const textareaId = customId || generatedId;
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  return (
    <div className="w-full flex flex-col text-left">
      {(label || action) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label
              htmlFor={textareaId}
              className="text-[13px] font-bold text-ink-2 flex items-center gap-1 select-none"
            >
              {label}
              {required && <span className="text-brand">*</span>}
            </label>
          )}
          {action && <div className="text-xs">{action}</div>}
        </div>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`w-full p-3 bg-surface text-ink text-sm rounded-field border transition-all duration-150 font-sans resize-y placeholder:text-muted/60 disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? 'border-brand focus:border-brand focus:ring-1 focus:ring-brand'
            : 'border-border-strong focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink'
        } ${className}`.trim()}
        {...props}
      />

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

Textarea.displayName = 'Textarea';

