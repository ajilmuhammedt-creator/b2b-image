import React, { useId } from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  name,
  id: customId,
}) => {
  const generatedId = useId();
  const switchId = customId || generatedId;

  return (
    <label
      htmlFor={switchId}
      className={`inline-flex items-center justify-between gap-4 cursor-pointer select-none min-h-[44px] py-1 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`.trim()}
    >
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="text-sm font-bold text-ink">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-muted">
              {description}
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        id={switchId}
        name={name}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 ${
          checked ? 'bg-ink' : 'bg-border-strong'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
};
