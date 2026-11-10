import React from 'react';
import { Check } from 'lucide-react';

export interface StageStep {
  id: string;
  label: string;
}

export interface StageBarProps {
  steps?: StageStep[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  className?: string;
  'aria-label'?: string;
}

const DEFAULT_STEPS: StageStep[] = [
  { id: 'brief', label: 'Brief' },
  { id: 'generate', label: 'Generate' },
  { id: 'review', label: 'Review' },
  { id: 'deliver', label: 'Deliver' },
];

export const StageBar: React.FC<StageBarProps> = ({
  steps = DEFAULT_STEPS,
  currentStepIndex,
  onStepClick,
  className = '',
  'aria-label': ariaLabel = 'Workflow stages',
}) => {
  return (
    <ol
      aria-label={ariaLabel}
      className={`m-0 p-0 list-none flex flex-wrap items-center gap-2 select-none ${className}`.trim()}
    >
      {steps.map((step, idx) => {
        const isDone = idx < currentStepIndex;
        const isCurrent = idx === currentStepIndex;
        const isClickable = !!onStepClick && isDone;

        return (
          <React.Fragment key={step.id}>
            <li
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => isClickable && onStepClick(idx)}
              className={`flex items-center gap-2 text-[13px] transition-colors ${
                isClickable ? 'cursor-pointer hover:opacity-80' : ''
              } ${
                isCurrent
                  ? 'font-extrabold text-ink'
                  : isDone
                  ? 'font-semibold text-muted'
                  : 'font-medium text-subtle'
              }`}
            >
              {isDone ? (
                <span
                  className="w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center shrink-0 shadow-xs"
                  aria-hidden="true"
                >
                  <Check className="w-3 h-3 stroke-[3.5]" />
                </span>
              ) : isCurrent ? (
                <span
                  className="w-6 h-6 box-border rounded-full border-2 border-ink text-ink flex items-center justify-center font-bold text-xs shrink-0"
                  aria-hidden="true"
                >
                  {idx + 1}
                </span>
              ) : (
                <span
                  className="w-6 h-6 box-border rounded-full border-2 border-border-strong text-subtle flex items-center justify-center font-medium text-xs shrink-0"
                  aria-hidden="true"
                >
                  {idx + 1}
                </span>
              )}
              <span>{step.label}</span>
            </li>

            {/* Connecting line */}
            {idx < steps.length - 1 && (
              <li
                aria-hidden="true"
                className={`w-5 h-0.5 rounded-full shrink-0 ${
                  idx < currentStepIndex ? 'bg-ink' : 'bg-border'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </ol>
  );
};
