import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { StageBar } from '../ui/StageBar';
import { Button } from '../ui/Button';

interface StudioHeaderProps {
  productName: string;
  modelNumber?: string;
  sourceImageUrl?: string;
  platformLabel: string;
  stageIndex: number;
  onStepClick?: (idx: number) => void;
  primaryActionLabel?: string;
  isGenerating?: boolean;
  onPrimaryAction?: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  productName,
  modelNumber,
  sourceImageUrl,
  platformLabel,
  stageIndex,
  onStepClick,
  primaryActionLabel = 'Generate set',
  isGenerating = false,
  onPrimaryAction,
}) => {
  const displayTitle = modelNumber
    ? `${modelNumber} · ${productName || 'Product set'}`
    : productName || 'New E-commerce Image Set';

  return (
    <div className="px-6 py-4 bg-surface border-b border-border flex flex-wrap items-center justify-between gap-4 select-none">
      {/* Left: Product thumbnail & titles */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-[10px] border border-track bg-surface flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
          {sourceImageUrl ? (
            <img
              src={sourceImageUrl}
              alt=""
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <ShoppingCart className="w-5 h-5 text-muted" />
          )}
        </div>

        <div className="flex flex-col min-w-0 gap-0.5">
          <h1 className="text-lg font-extrabold text-ink m-0 truncate leading-tight">
            {displayTitle}
          </h1>
          <span className="text-xs text-muted truncate">
            {platformLabel} · Owner Marketplace executive
          </span>
        </div>
      </div>

      {/* Center: StageBar Stepper */}
      <div className="hidden md:flex items-center">
        <StageBar
          currentStepIndex={stageIndex}
          onStepClick={onStepClick}
        />
      </div>

      {/* Right: Primary Action Button in Sanford Red (One Primary Button rule!) */}
      {onPrimaryAction && (
        <div className="shrink-0">
          <Button
            variant="primary"
            size="md"
            loading={isGenerating}
            onClick={onPrimaryAction}
          >
            {primaryActionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

