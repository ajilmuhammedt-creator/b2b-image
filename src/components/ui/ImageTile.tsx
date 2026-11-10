import React from 'react';
import { Badge } from './Badge';
import { Loader2, RefreshCw } from 'lucide-react';

export interface ImageTileProps {
  slotNumber: number;
  title: string;
  imageUrl?: string;
  status: 'draft' | 'generating' | 'in_review' | 'approved' | 'failed';
  statusLabel?: string;
  generatingProgress?: number; // 0 to 100
  generatingStep?: string; // e.g. "step 2 of 3"
  isSelected?: boolean;
  isChecked?: boolean;
  onSelect?: () => void;
  onCheckChange?: (checked: boolean) => void;
  onRetry?: () => void;
  className?: string;
}

export const ImageTile: React.FC<ImageTileProps> = ({
  slotNumber,
  title,
  imageUrl,
  status,
  statusLabel,
  generatingProgress = 40,
  generatingStep = 'generating',
  isSelected = false,
  isChecked = false,
  onSelect,
  onCheckChange,
  onRetry,
  className = '',
}) => {
  const isGenerating = status === 'generating';
  const isFailed = status === 'failed';

  const badgeComponent = () => {
    switch (status) {
      case 'approved':
        return <Badge check="pass" size="sm">{statusLabel || 'Approved'}</Badge>;
      case 'in_review':
        return <Badge check="warning" size="sm">{statusLabel || 'In review'}</Badge>;
      case 'failed':
        return <Badge check="fail" size="sm">{statusLabel || 'Failed'}</Badge>;
      case 'generating':
        return <Badge variant="neutral" size="sm">{statusLabel || 'Generating'}</Badge>;
      case 'draft':
      default:
        return <Badge variant="neutral" size="sm">{statusLabel || 'Draft'}</Badge>;
    }
  };

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
      aria-label={`Slot ${slotNumber}: ${title} - ${status}`}
      className={`group relative rounded-[14px] overflow-hidden bg-surface text-ink text-left transition-all duration-150 cursor-pointer flex flex-col select-none ${
        isSelected
          ? 'border-2 border-ink shadow-[0_0_0_3px_#E4E6EB]'
          : 'border-2 border-border hover:border-border-strong hover:shadow-xs'
      } ${className}`.trim()}
    >
      {/* Visual Square Preview Container */}
      <div className="relative aspect-square w-full bg-surface border-b border-track overflow-hidden flex items-center justify-center">
        {/* Actual Image if available */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : !isGenerating ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-track/40 text-muted">
            <span className="text-xs font-semibold">Slot {slotNumber}</span>
            <span className="text-[11px] text-subtle text-center mt-1">Ready to generate</span>
          </div>
        ) : null}

        {/* Generating overlay */}
        {isGenerating && (
          <div className="absolute inset-3 rounded-[10px] bg-track flex flex-col justify-end gap-2 p-3.5 z-10 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-ink shrink-0" />
              <span className="text-xs font-bold text-ink-2 truncate">
                {generatingStep}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border-strong overflow-hidden">
              <div
                className="h-full bg-ink transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(10, Math.min(100, generatingProgress))}%` }}
              />
            </div>
          </div>
        )}

        {/* Checkbox (top-left) */}
        {onCheckChange && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onCheckChange(!isChecked);
            }}
            className="absolute top-2.5 left-2.5 z-20"
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => onCheckChange(e.target.checked)}
              aria-label={`Select slot ${slotNumber}`}
              className="w-4 h-4 rounded-[4px] border-border-strong text-ink accent-ink cursor-pointer focus:ring-1 focus:ring-ink"
            />
          </div>
        )}

        {/* Corner Status Badge (top-right or top-left offset) */}
        <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
          {badgeComponent()}
        </div>

        {/* Failed Retry button overlay on hover */}
        {isFailed && onRetry && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRetry();
            }}
            className="absolute bottom-2.5 right-2.5 z-20 bg-surface border border-border-strong rounded-button px-2.5 py-1 text-xs font-bold text-ink hover:bg-track flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        )}
      </div>

      {/* Title & Slot Info Section - NEVER truncate slot title mid-word! */}
      <div className="p-3 sm:p-3.5 flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted leading-tight">
          Slot {slotNumber}
        </span>
        <h4 className="text-sm font-bold text-ink leading-tight m-0 truncate" title={title}>
          {title}
        </h4>
      </div>
    </div>
  );
};
