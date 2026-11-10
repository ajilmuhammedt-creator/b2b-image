import React, { useState, useRef, useEffect } from 'react';
import { Download, Share2, FolderDown, MoreHorizontal, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface StudioDeliveryFooterProps {
  approvedCount: number;
  totalCount: number;
  marketplaceName: string;
  formatLabel: string; // e.g. "2000 × 2000 JPEG" or "100% WebP"
  isZipping?: boolean;
  onDownloadZip: () => void;
  onPhoneShare?: () => void;
  onFolderSave?: () => void;
  onDeliver: () => void;
}

export const StudioDeliveryFooter: React.FC<StudioDeliveryFooterProps> = ({
  approvedCount,
  totalCount,
  marketplaceName,
  formatLabel,
  isZipping = false,
  onDownloadZip,
  onPhoneShare,
  onFolderSave,
  onDeliver,
}) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isAllApproved = approvedCount >= totalCount && totalCount > 0;
  const progressPercent = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreOpen]);

  return (
    <footer className="sticky bottom-0 z-20 px-6 py-3.5 bg-surface border-t border-border flex flex-wrap items-center justify-between gap-4 select-none shadow-sm">
      {/* Left: Progress info */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-ink whitespace-nowrap">
            {approvedCount} of {totalCount} approved
          </span>
          <div
            aria-hidden="true"
            className="w-32 sm:w-48 h-2 rounded-full bg-border overflow-hidden shrink-0"
          >
            <div
              className="h-full bg-ink rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <span className="text-xs text-muted hidden md:inline">
          {isAllApproved
            ? 'All assets approved and verified'
            : `Delivery unlocks when all ${totalCount} are approved`}
        </span>
      </div>

      {/* Right: Export Toolbar & Deliver Action */}
      <div className="flex items-center gap-2.5">
        {/* Single Target Format Tag in Toolbar */}
        <span className="hidden sm:inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full bg-track text-muted">
          {formatLabel}
        </span>

        {/* Single Download ZIP Button */}
        <Button
          variant="secondary"
          size="md"
          loading={isZipping}
          onClick={onDownloadZip}
          icon={<Download className="w-4 h-4" />}
        >
          Download ZIP
        </Button>

        {/* More Export Menu Dropdown */}
        <div className="relative" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            aria-label="More export options"
            aria-expanded={moreOpen}
            className="w-11 h-11 rounded-button border border-border-strong bg-surface text-ink hover:bg-track flex items-center justify-center transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {moreOpen && (
            <div className="absolute right-0 bottom-13 w-56 bg-surface border border-border rounded-card shadow-xl p-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150">
              {onPhoneShare && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    onPhoneShare();
                  }}
                  className="w-full h-9 px-3 rounded-[8px] text-xs font-semibold text-ink hover:bg-track flex items-center gap-2.5 cursor-pointer text-left"
                >
                  <Share2 className="w-3.5 h-3.5 text-muted" />
                  <span>Share to Mobile</span>
                </button>
              )}

              {onFolderSave && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    onFolderSave();
                  }}
                  className="w-full h-9 px-3 rounded-[8px] text-xs font-semibold text-ink hover:bg-track flex items-center gap-2.5 cursor-pointer text-left"
                >
                  <FolderDown className="w-3.5 h-3.5 text-muted" />
                  <span>Save to Local Folder</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Deliver Action Button */}
        {isAllApproved ? (
          <Button
            variant="primary"
            size="md"
            onClick={onDeliver}
            icon={<Check className="w-4 h-4" />}
          >
            Deliver to {marketplaceName}
          </Button>
        ) : (
          <button
            type="button"
            aria-disabled="true"
            title={`Delivery unlocks when all ${totalCount} are approved`}
            className="h-11 px-4 text-sm font-bold rounded-button bg-track text-muted cursor-not-allowed select-none transition-colors border border-transparent"
          >
            Deliver to {marketplaceName}
          </button>
        )}
      </div>
    </footer>
  );
};
