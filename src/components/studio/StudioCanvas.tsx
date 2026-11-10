import React, { useState } from 'react';
import type { GenerationItem } from '../../types';
import { ImageTile } from '../ui/ImageTile';

interface StudioCanvasProps {
  items: GenerationItem[];
  selectedId: string | null;
  onSelectSlot: (id: string) => void;
  onRetrySlot: (slot: number | 'poster') => void;
  onToggleSelectCheckbox: (id: string) => void;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  items,
  selectedId,
  onSelectSlot,
  onRetrySlot,
  onToggleSelectCheckbox,
}) => {
  const [filter, setFilter] = useState<'all' | 'approved' | 'review' | 'failed'>('all');

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

  return (
    <section
      aria-label="Canvas"
      className="flex-1 min-w-0 flex flex-col gap-4 select-none"
    >
      {/* Filter Tabs Bar */}
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
            <ImageTile
              key={item.id}
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
          );
        })}
      </div>
    </section>
  );
};
