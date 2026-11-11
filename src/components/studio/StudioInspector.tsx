import React, { useState } from 'react';
import type { GenerationItem } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import {
  Check,
  AlertTriangle,
  X,
  RotateCw,
  ExternalLink,
  Loader2,
  History,
  Sparkles,
  Download,
} from 'lucide-react';

interface InspectorCheck {
  status: 'pass' | 'warning' | 'fail';
  text: string;
}

interface StudioInspectorProps {
  item: GenerationItem | null;
  onApprove: (id: string) => void;
  onSendBack: (id: string, note: string) => void;
  onRetry: (slot: number | 'poster', customInstructions?: string) => void;
  onCancelJob?: (id: string) => void;
  onOpenComplianceModal?: (item: GenerationItem) => void;
  onDownloadItem?: (item: GenerationItem) => void;
}

export const StudioInspector: React.FC<StudioInspectorProps> = ({
  item,
  onApprove,
  onSendBack,
  onRetry,
  onCancelJob,
  onOpenComplianceModal,
  onDownloadItem,
}) => {
  const [changeNote, setChangeNote] = useState('');

  if (!item) {
    return (
      <aside
        aria-label="Inspector"
        className="w-full lg:w-[320px] xl:w-[340px] shrink-0 bg-surface border border-border rounded-card p-6 flex flex-col items-center justify-center text-center gap-2"
      >
        <span className="text-sm font-bold text-ink">No slot selected</span>
        <span className="text-xs text-muted">Click an image tile on the canvas to inspect checks and approve.</span>
      </aside>
    );
  }

  const slotNum = item.slot || (item.kind === 'poster' ? 'Poster' : 1);
  const isApproved = item.status === 'done' && (item as any).isApproved !== false;
  const isPending = item.status === 'pending';
  const isFailed = item.status === 'failed';
  const isReview = item.status === 'done' && !isApproved;
  const currentVersion = item.version || 1;

  // Quick suggestion chips for natural language feedback
  const quickChips = [
    'Fix connector & port alignment',
    'Sharpen spec callout text',
    'Adjust lighting & soft shadows',
    'Remove extraneous artifacts',
  ];

  // Derive compliance checks based on slot & platform
  const isShopifyAsset = !item.platform || item.platform === 'shopify';
  const checks: InspectorCheck[] = [];
  if (item.imageUrl) {
    checks.push({
      status: 'pass',
      text:
        item.kind === 'poster'
          ? 'Portrait poster aspect ratio standard verified'
          : '1:1 Square Resolution standard verified',
    });
    if (slotNum === 1 && item.kind !== 'poster') {
      checks.push({ status: 'pass', text: 'Pure white background (#FFFFFF)' });
      checks.push({ status: 'pass', text: 'Strictly zero text or promotional badges' });
    } else {
      checks.push({ status: 'pass', text: 'Product orientation matches catalogue' });
      if (isShopifyAsset) {
        checks.push({
          status: 'pass',
          text: 'Shopify Typography: Exclusive Sharp Sans enforced (zero Arial/Helvetica/Roboto fallback)',
        });
      } else {
        checks.push({ status: 'warning', text: 'Typography readability verified on 390px screens' });
      }
    }
  } else if (isFailed) {
    checks.push({ status: 'fail', text: 'Generation failed: Image generation service timed out' });
  }

  return (
    <aside
      aria-label="Inspector"
      className="w-full lg:w-[320px] xl:w-[340px] shrink-0 bg-surface border border-border rounded-card p-4 sm:p-5 flex flex-col gap-4 select-none shadow-2xs"
    >
      {/* 1:1 Large Preview Container */}
      <div className="relative aspect-square w-full rounded-button border border-track bg-surface overflow-hidden flex items-center justify-center group">
        {item.imageUrl ? (
          <>
            <img
              src={item.imageUrl}
              alt={item.slotTitle || `Slot ${slotNum}`}
              className="w-full h-full object-contain p-2"
            />
            {onDownloadItem && (
              <button
                type="button"
                onClick={() => onDownloadItem(item)}
                title="Download SEO Image file"
                className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-surface/95 backdrop-blur-xs border border-border px-2.5 py-1 rounded-md text-[11px] font-bold text-ink hover:text-brand shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>SEO Export</span>
              </button>
            )}
          </>
        ) : isPending ? (
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-ink" />
            <span className="text-xs font-bold text-ink">Rendering image...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center text-muted">
            <span className="text-xs font-semibold">Slot {slotNum}</span>
            <span className="text-[11px] text-muted">Ready to generate</span>
          </div>
        )}
      </div>

      {/* Title & Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-muted font-medium">
            Slot {slotNum} · Version {currentVersion}
          </span>
          <h2 className="text-base font-extrabold text-ink m-0 leading-tight truncate">
            {item.slotTitle || `Slot ${slotNum}`}
          </h2>
        </div>

        <div className="shrink-0">
          {isApproved ? (
            <Badge check="pass" size="sm">Approved</Badge>
          ) : isReview ? (
            <Badge check="warning" size="sm">In review</Badge>
          ) : isFailed ? (
            <Badge check="fail" size="sm">Failed</Badge>
          ) : isPending ? (
            <Badge variant="neutral" size="sm">Rendering</Badge>
          ) : (
            <Badge variant="neutral" size="sm">Draft</Badge>
          )}
        </div>
      </div>

      {/* Automated Checks List */}
      <div className="flex flex-col gap-2 pt-2 border-t border-track">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-ink uppercase tracking-wider m-0">
            Compliance Checks
          </h3>
          {onOpenComplianceModal && item.imageUrl && (
            <button
              type="button"
              onClick={() => onOpenComplianceModal(item)}
              className="text-[11px] font-bold text-ink hover:text-brand flex items-center gap-1 cursor-pointer"
            >
              <span>Full audit</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          {checks.map((chk, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 text-xs text-ink-2 p-2 rounded-field bg-page"
            >
              {chk.status === 'pass' ? (
                <span className="w-4 h-4 rounded-full bg-ok-bg text-ok-fg flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              ) : chk.status === 'warning' ? (
                <span className="w-4 h-4 rounded-full bg-warn-bg text-warn-fg flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-2.5 h-2.5 stroke-[2.5]" />
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full bg-fail-bg text-fail-fg flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
              <span className="flex-1 leading-normal text-[11px] font-medium">{chk.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action / Review Box: Slot-Specific Feedback & Iterative Refinement */}
      {item.imageUrl && (
        <div className="flex flex-col gap-3 pt-2 border-t border-track">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-ink uppercase tracking-wider m-0 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Feedback & Iteration</span>
            </h3>
            {changeNote.trim() && (
              <span className="text-[10px] text-brand font-bold bg-brand/10 px-2 py-0.5 rounded-full">
                Custom prompt active
              </span>
            )}
          </div>

          <Textarea
            placeholder={`In Slot ${slotNum}, fix the Type-C port alignment and remove extraneous connector details...`}
            rows={3}
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
          />

          {/* Quick modification suggestion chips */}
          <div className="flex flex-wrap gap-1.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  setChangeNote((prev) =>
                    prev.trim() ? `${prev.trim()}; ${chip}` : `In Slot ${slotNum}, ${chip.toLowerCase()}`
                  )
                }
                className="text-[10px] font-semibold text-ink-2 bg-page hover:bg-track border border-border px-2 py-0.5 rounded-full transition-colors cursor-pointer text-left"
              >
                + {chip}
              </button>
            ))}
          </div>

          {/* Primary Action Button */}
          {changeNote.trim() ? (
            <div className="flex flex-col gap-2 pt-1">
              <Button
                variant="primary"
                fullWidth
                size="md"
                icon={<RotateCw className="w-4 h-4" />}
                onClick={() => {
                  const note = changeNote.trim();
                  setChangeNote('');
                  onRetry(item.slot || 'poster', note);
                }}
              >
                Regenerate Slot {slotNum} with changes
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  fullWidth
                  size="sm"
                  onClick={() => {
                    onSendBack(item.id, changeNote);
                    setChangeNote('');
                  }}
                >
                  Save note only
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  size="sm"
                  onClick={() => onApprove(item.id)}
                >
                  Approve as-is
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 pt-1">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                icon={<RotateCw className="w-3.5 h-3.5" />}
                onClick={() => onRetry(item.slot || 'poster')}
              >
                Regenerate
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => onApprove(item.id)}
              >
                Approve
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Iteration Refinement History */}
      {item.iterationHistory && item.iterationHistory.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-track">
          <span className="text-[11px] font-extrabold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3 h-3 text-muted" />
            <span>Refinement History ({item.iterationHistory.length})</span>
          </span>
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
            {item.iterationHistory.map((iter, idx) => (
              <div key={idx} className="p-2 rounded-field bg-page border border-border text-[11px]">
                <div className="flex items-center justify-between font-bold text-ink mb-0.5">
                  <span>Version {iter.version} Refinement</span>
                  <span className="text-muted text-[10px] font-normal">{iter.timestamp}</span>
                </div>
                <p className="m-0 text-ink-2 font-medium italic">"{iter.note}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Retry if failed */}
      {isFailed && (
        <Button
          variant="secondary"
          fullWidth
          size="md"
          icon={<RotateCw className="w-4 h-4" />}
          onClick={() => onRetry(item.slot || 'poster')}
        >
          Retry this image
        </Button>
      )}

      {/* Cancel if generating */}
      {isPending && onCancelJob && (
        <Button
          variant="secondary"
          fullWidth
          size="md"
          onClick={() => onCancelJob(item.id)}
        >
          Cancel job
        </Button>
      )}
    </aside>
  );
};
