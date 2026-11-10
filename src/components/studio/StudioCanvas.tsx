import React, { useState } from 'react';
import type { GenerationItem } from '../../types';
import { ImageTile } from '../ui/ImageTile';
import { RotateCw, Check } from 'lucide-react';

interface StudioCanvasProps {
  items: GenerationItem[];
  selectedId: string | null;
  onSelectSlot: (id: string) => void;
  onRetrySlot: (slot: number | 'poster') => void;
  onToggleSelectCheckbox: (id: string) => void;
  onRegenerateSelected?: (customInstructions?: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onSelectOnlySlot?: (id: string) => void;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  items,
  selectedId,
  onSelectSlot,
  onRetrySlot,
  onToggleSelectCheckbox,
  onRegenerateSelected,
  onSelectAll,
  onDeselectAll,
  onSelectOnlySlot,
}) => {
  const [filter, setFilter] = useState<'all' | 'approved' | 'review' | 'failed'>('all');
  const [customInstructions, setCustomInstructions] = useState('');

  // Selected items calculation
  const selectedSlots = items.filter((item) => item.selected && item.status !== 'skipped');
  const selectedCount = selectedSlots.length;
  const isAnyGenerating = items.some((item) => item.status === 'pending');

  // Count statuses
  const approvedCount = items.filter((item) => item.status === 'done' && (item as any).isApproved !== false).length;
  const reviewCount = items.filter((item) => item.status === 'done' && (item as any).isApproved === false).length;
  const failedCount = items.filter((item) => item.status === 'failed').length;

  const filteredItems = items.filter((item) => {
    if (filter === 'approved') return item.status === 'done' && (item as any).isApproved !== false;
    if (filter === 'review') return item.status === 'done' && (item as any).isApproved === false;
    if (filter === 'failed') return item.status === 'failed';
    return true;
  });

  const handleTriggerRegenerateSelected = () => {
    if (!onRegenerateSelected || selectedCount === 0) return;
    const instructions = customInstructions.trim();
    setCustomInstructions('');
    onRegenerateSelected(instructions || undefined);
  };

  return (
    <section
      aria-label="Canvas"
      className="flex-1 min-w-0 flex flex-col gap-4 select-none"
    >
      {/* Filter Tabs & Selection Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Filter canvas slots"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5"
        >
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`h-9 px-3.5 rounded-full text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-ink text-white'
                : 'bg-surface border border-border text-ink hover:bg-track'
            }`}
          >
            All {items.length}
          </button>

          <button
            type="button"
            onClick={() => setFilter('approved')}
            className={`h-9 px-3.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              filter === 'approved'
                ? 'bg-ink text-white font-bold'
                : 'bg-surface border border-border text-ink hover:bg-track'
            }`}
          >
            Approved {approvedCount}
          </button>

          <button
            type="button"
            onClick={() => setFilter('review')}
            className={`h-9 px-3.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              filter === 'review'
                ? 'bg-ink text-white font-bold'
                : 'bg-surface border border-border text-ink hover:bg-track'
            }`}
          >
            In review {reviewCount}
          </button>

          {failedCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter('failed')}
              className={`h-9 px-3.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'failed'
                  ? 'bg-ink text-white font-bold'
                  : 'bg-surface border border-border text-ink hover:bg-track'
              }`}
            >
              Failed {failedCount}
            </button>
          )}
        </div>

        {/* Quick select/deselect shortcuts */}
        <div className="flex items-center gap-2 text-xs font-medium text-ink-2 self-start sm:self-center">
          {onSelectAll && (
            <button
              type="button"
              onClick={onSelectAll}
              className="px-2.5 py-1 rounded-md hover:bg-surface border border-transparent hover:border-border text-[11px] font-semibold text-ink-2 hover:text-ink cursor-pointer transition-colors"
            >
              Select all
            </button>
          )}
          {onDeselectAll && (
            <button
              type="button"
              onClick={onDeselectAll}
              className="px-2.5 py-1 rounded-md hover:bg-surface border border-transparent hover:border-border text-[11px] font-semibold text-ink-2 hover:text-ink cursor-pointer transition-colors"
            >
              Deselect all
            </button>
          )}
        </div>
      </div>

      {/* Selective Regeneration & Error Correction Toolbar */}
      {selectedCount > 0 && onRegenerateSelected && (
        <div className="bg-surface border-2 border-border/80 focus-within:border-ink rounded-card p-3.5 shadow-2xs flex flex-col gap-3 transition-all animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-ink text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                {selectedCount}
              </span>
              <span className="text-xs font-extrabold text-ink">
                {selectedCount === items.length
                  ? 'All 6 slots selected for regeneration'
                  : selectedCount === 1
                  ? `Slot ${selectedSlots[0].slot || 'selected'} chosen for targeted iteration`
                  : `${selectedCount} slots chosen (${selectedSlots.map((s) => `Slot ${s.slot || '?'}`).join(', ')})`}
              </span>
            </div>

            <span className="text-[11px] font-medium text-ok-fg bg-ok-bg/50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Remaining {items.length - selectedCount} slot(s) kept intact</span>
            </span>
          </div>

          {/* Natural language modification input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-track">
            <div className="relative flex-1">
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder={
                  selectedCount === 1
                    ? `Modification instruction for Slot ${selectedSlots[0].slot} (e.g. fix Type-C port alignment and remove extraneous details)...`
                    : `Modification instructions for ${selectedCount} selected slots...`
                }
                className="w-full h-9 px-3 text-xs bg-page border border-border rounded-field text-ink placeholder:text-muted focus:outline-none focus:border-ink font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAnyGenerating) {
                    handleTriggerRegenerateSelected();
                  }
                }}
              />
            </div>

            <button
              type="button"
              disabled={isAnyGenerating}
              onClick={handleTriggerRegenerateSelected}
              className={`h-9 px-4 rounded-field text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                customInstructions.trim()
                  ? 'bg-brand hover:bg-brand-hover text-white shadow-2xs'
                  : 'bg-ink hover:bg-ink/90 text-white shadow-2xs'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAnyGenerating ? 'animate-spin' : ''}`} />
              <span>
                {customInstructions.trim()
                  ? `Apply & Regenerate (${selectedCount})`
                  : `Regenerate selected (${selectedCount})`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Grid of ImageTiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isSelected = item.id === selectedId;
          const isDone = item.status === 'done';
          const isPending = item.status === 'pending';
          const isFailed = item.status === 'failed';
          const isApproved = isDone && (item as any).isApproved !== false;
          const isReview = isDone && !isApproved;

          let tileStatus: 'draft' | 'generating' | 'in_review' | 'approved' | 'failed' = 'draft';
          if (isApproved) tileStatus = 'approved';
          else if (isReview) tileStatus = 'in_review';
          else if (isFailed) tileStatus = 'failed';
          else if (isPending) tileStatus = 'generating';

          return (
            <div key={item.id} className="relative group">
              <ImageTile
                slotNumber={item.slot || 1}
                title={item.slotTitle || `Slot ${item.slot}`}
                imageUrl={item.imageUrl}
                status={tileStatus}
                isSelected={isSelected}
                isChecked={item.selected}
                generatingStep="Rendering in progress"
                generatingProgress={60}
                onSelect={() => onSelectSlot(item.id)}
                onCheckChange={() => onToggleSelectCheckbox(item.id)}
                onRetry={() => onRetrySlot(item.slot || 'poster')}
              />
              {/* Quick Select Only shortcut button */}
              {onSelectOnlySlot && !item.selected && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOnlySlot(item.id);
                  }}
                  className="absolute bottom-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-surface/95 backdrop-blur-xs border border-border px-2 py-0.5 rounded text-[10px] font-bold text-ink shadow-2xs hover:bg-page"
                >
                  Select only this
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
