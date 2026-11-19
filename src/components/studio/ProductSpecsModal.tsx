import React, { ChangeEvent, useRef } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { Textarea } from '../ui/Textarea';
import { resizeImageToMax2048, validateUploadFile } from '../../lib/imageProcessing';
import { Image as ImageIcon, Check, AlertTriangle, Sparkles, Layers } from 'lucide-react';
import type { SanfordSlotSpec } from '../../types';

interface ProductSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  setProductName: (name: string) => void;
  modelNumber: string;
  setModelNumber: (model: string) => void;
  seriesName?: string;
  setSeriesName?: (series: string) => void;
  tagline: string;
  setTagline: (tagline: string) => void;
  featuresText: string;
  setFeaturesText: (text: string) => void;
  colors: string;
  setColors: (colors: string) => void;
  dimensions: string;
  setDimensions: (dim: string) => void;
  warranty: string;
  setWarranty: (w: string) => void;
  sourceImage: {
    file: File | null;
    previewUrl: string;
    storagePath?: string;
  };
  setSourceImage: (img: { file: File | null; previewUrl: string; storagePath?: string }) => void;
  sanfordSlots?: SanfordSlotSpec[];
  onUpdateSlotField?: (slotNum: number, field: string, val: any) => void;
}

export const ProductSpecsModal: React.FC<ProductSpecsModalProps> = ({
  isOpen,
  onClose,
  productName,
  setProductName,
  modelNumber,
  setModelNumber,
  seriesName = '',
  setSeriesName,
  tagline,
  setTagline,
  featuresText,
  setFeaturesText,
  colors,
  setColors,
  dimensions,
  setDimensions,
  warranty,
  setWarranty,
  sourceImage,
  setSourceImage,
  sanfordSlots = [],
  onUpdateSlotField,
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateUploadFile(file, 'photo');
      const processed = await resizeImageToMax2048(file);
      const previewUrl = URL.createObjectURL(processed);
      setSourceImage({
        file: processed,
        previewUrl,
      });
    } catch (err: any) {
      alert(err.message || 'Invalid product photo');
    }
  };

  const slot3 = sanfordSlots.find((s) => s.slot === 3);
  const slot4 = sanfordSlots.find((s) => s.slot === 4);

  // Validation: Check for duplicates across Slot 3 and Slot 4
  const s3Features = [slot3?.bannerFeature, slot3?.callout1, slot3?.callout2]
    .map((f) => (f || '').trim().toLowerCase())
    .filter(Boolean);
  const s4Features = [slot4?.bannerFeature, slot4?.callout1, slot4?.callout2]
    .map((f) => (f || '').trim().toLowerCase())
    .filter(Boolean);

  const duplicateFeature = s3Features.find((f) => s4Features.includes(f));

  // Auto-suggest handler from verified specs
  const handleAutoSuggest = () => {
    if (!onUpdateSlotField) return;
    const lines = featuresText
      .split('\n')
      .map((l) => l.replace(/^[-•*#\d.]+\s*/, '').trim())
      .filter(Boolean);
    const seen = new Set<string>();
    const cleanList: string[] = [];
    for (const l of lines) {
      const key = l.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        cleanList.push(l);
      }
    }
    const clamp = (str: string, maxLen: number) => {
      if (!str) return '';
      const clean = str.trim();
      if (clean.length <= maxLen) return clean;
      const sub = clean.slice(0, maxLen);
      const lastSpace = sub.lastIndexOf(' ');
      return (lastSpace > maxLen * 0.6 ? sub.slice(0, lastSpace) : sub).trim();
    };

    if (cleanList[0]) onUpdateSlotField(3, 'bannerFeature', clamp(cleanList[0], 30));
    if (cleanList[1]) onUpdateSlotField(4, 'bannerFeature', clamp(cleanList[1], 30));
    if (cleanList[2]) onUpdateSlotField(3, 'callout1', clamp(cleanList[2], 25));
    if (cleanList[3]) onUpdateSlotField(3, 'callout2', clamp(cleanList[3], 25));
    if (cleanList[4]) onUpdateSlotField(4, 'callout1', clamp(cleanList[4], 25));
    if (cleanList[5]) onUpdateSlotField(4, 'callout2', clamp(cleanList[5], 25));
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Product Specifications"
      description="Review and customize product details before generating marketplace images. All specifications must match physical catalogue data."
      maxWidth="lg"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <span className="text-xs text-muted">
            All specifications verified against physical catalogue data.
          </span>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onClose}
              disabled={Boolean(duplicateFeature)}
              icon={<Check className="w-4 h-4" />}
            >
              Verify & Continue
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5 py-2 max-h-[70vh] overflow-y-auto px-1">
        {/* Source Photo Banner */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface shadow-2xs">
          <div className="w-16 h-16 rounded-lg border border-track bg-surface flex items-center justify-center shrink-0 overflow-hidden">
            {sourceImage.previewUrl ? (
              <img
                src={sourceImage.previewUrl}
                alt="Product"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <ImageIcon className="w-7 h-7 text-muted" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-ink">Isolated Product Photo</span>
            <p className="text-2xs text-muted mt-0.5">
              {sourceImage.previewUrl
                ? 'High-resolution cutout detected. Used as master visual reference.'
                : 'No cutout detected. Please upload an isolated product photo.'}
            </p>
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => photoInputRef.current?.click()}
          >
            Change Photo
          </Button>
        </div>

        {/* Basic Info: Model, Name & Series */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Field
              label="Model Number"
              value={modelNumber}
              onChange={(e) => setModelNumber(e.target.value)}
              placeholder="e.g. SF6671HFN"
            />
          </div>
          <div>
            <Field
              label="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Sanford 16'' Table Fan"
            />
          </div>
          <div>
            <Field
              label="Series / Product Line (Optional)"
              value={seriesName}
              onChange={(e) => setSeriesName?.(e.target.value)}
              placeholder="e.g. PLATINUM ZOOM"
            />
          </div>
        </div>

        {/* Tagline */}
        <div>
          <Field
            label="Marketing Tagline (Optional)"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Powerful Airflow Anywhere, Anytime"
          />
        </div>

        {/* Feature Highlight Customization (buysanford.com single-feature style) */}
        {slot3 && slot4 && (
          <div className="p-4 rounded-xl border border-border bg-[#F8FAFC] dark:bg-white/[0.02] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand" />
                <span className="text-xs font-bold text-ink">
                  Feature Highlight Customization (buysanford.com Style)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand/10 text-brand font-semibold">
                  Mobile-First 1-Feature Focus
                </span>
              </div>
              {onUpdateSlotField && (
                <button
                  type="button"
                  onClick={handleAutoSuggest}
                  className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                  title="Auto-fill feature slots from verified specifications"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-fill from specs</span>
                </button>
              )}
            </div>

            <p className="text-2xs text-muted">
              Each feature image sells <strong>ONE main feature</strong> in the red bottom banner with at most <strong>2 large callouts</strong>. Long bulleted spec lists are removed for crystal-clear readability on phones.
            </p>

            {/* Duplicate Feature Inline Warning */}
            {duplicateFeature && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>Validation Error: Feature "{duplicateFeature}" cannot be used in both Feature Highlight slots. Each slot must highlight a unique feature.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Feature Highlight 1 (Slot 3) */}
              <div className="p-3 bg-surface rounded-lg border border-border shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">
                    Slot 3: Feature Highlight 1
                  </span>
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-track text-muted">
                    Slot 3
                  </span>
                </div>

                {/* Banner Feature */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-ink">
                      Banner Feature <span className="text-brand">*</span>
                    </label>
                    <span className="text-[10px] text-muted font-mono">
                      {(slot3.bannerFeature || '').length}/30
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={30}
                    value={slot3.bannerFeature || ''}
                    onChange={(e) => onUpdateSlotField?.(3, 'bannerFeature', e.target.value)}
                    placeholder="e.g. 4L Capacity"
                    className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                  />
                  <span className="text-[10px] text-muted block mt-0.5">
                    Red bottom banner text. Never brand or product name.
                  </span>
                </div>

                {/* Supporting Callout 1 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-ink">
                      Supporting Callout 1 (Optional)
                    </label>
                    <span className="text-[10px] text-muted font-mono">
                      {(slot3.callout1 || '').length}/25
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={25}
                    value={slot3.callout1 || ''}
                    onChange={(e) => onUpdateSlotField?.(3, 'callout1', e.target.value)}
                    placeholder="e.g. Digital Display"
                    className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                {/* Supporting Callout 2 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-ink">
                      Supporting Callout 2 (Optional)
                    </label>
                    <span className="text-[10px] text-muted font-mono">
                      {(slot3.callout2 || '').length}/25
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={25}
                    value={slot3.callout2 || ''}
                    onChange={(e) => onUpdateSlotField?.(3, 'callout2', e.target.value)}
                    placeholder="e.g. 1500W Powerful Motor"
                    className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                {/* Top Headline */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-ink">
                      Top Headline (Optional)
                    </label>
                    <span className="text-[10px] text-muted font-mono">
                      {(slot3.topHeadline || '').length}/40
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={40}
                    value={slot3.topHeadline || ''}
                    onChange={(e) => onUpdateSlotField?.(3, 'topHeadline', e.target.value)}
                    placeholder="e.g. CRISP & DELICIOUS EVERY TIME"
                    className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand uppercase"
                  />
                </div>
              </div>

              {/* Feature Highlight 2 (Slot 4) */}
              <div className="p-3 bg-surface rounded-lg border border-border shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">
                    Slot 4: Feature Highlight 2
                  </span>
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-track text-muted">
                    Slot 4
                  </span>
                </div>

                {/* Banner Feature */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-ink">
                      Banner Feature <span className="text-brand">*</span>
                    </label>
                    <span className="text-[10px] text-muted font-mono">
                      {(slot4.bannerFeature || '').length}/30
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={30}
                    value={slot4.bannerFeature || ''}
                    onChange={(e) => onUpdateSlotField?.(4, 'bannerFeature', e.target.value)}
                    placeholder="e.g. 30-Minute Timer"
                    className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                  />
                  <span className="text-[10px] text-muted block mt-0.5">
                    Red bottom banner text. Must not repeat Slot 3.
                  </span>
                </div>

                {/* Supporting Callout 1 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-ink">
                      Supporting Callout 1 (Optional)
                    </label>
                    <span className="text-[10px] text-muted font-mono">
                      {(slot4.callout1 || '').length}/25
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={25}
                    value={slot4.callout1 || ''}
                    onChange={(e) => onUpdateSlotField?.(4, 'callout1', e.target.value)}
                    placeholder="e.g. Non-Stick Basket"
                    className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                {/* Supporting Callout 2 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-ink">
                      Supporting Callout 2 (Optional)
                    </label>
                    <span className="text-[10px] text-muted font-mono">
                      {(slot4.callout2 || '').length}/25
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={25}
                    value={slot4.callout2 || ''}
                    onChange={(e) => onUpdateSlotField?.(4, 'callout2', e.target.value)}
                    placeholder="e.g. Overheat Protection"
                    className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                {/* Top Headline */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-ink">
                      Top Headline (Optional)
                    </label>
                    <span className="text-[10px] text-muted font-mono">
                      {(slot4.topHeadline || '').length}/40
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={40}
                    value={slot4.topHeadline || ''}
                    onChange={(e) => onUpdateSlotField?.(4, 'topHeadline', e.target.value)}
                    placeholder="e.g. SAFE & CONVENIENT OPERATION"
                    className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verified Specifications */}
        <div>
          <label className="block text-xs font-bold text-ink mb-1.5">
            Verified Specifications (One per line)
          </label>
          <Textarea
            rows={4}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder="4L Capacity&#10;1500W Powerful Motor&#10;30-Minute Timer&#10;Non-stick Coated Basket&#10;Overheat Protection"
          />
          <span className="text-2xs text-muted mt-1 block">
            Extracted specifications from catalogue. Auto-fills Feature Highlight slots and other asset cards.
          </span>
        </div>

        {/* Additional Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Field
              label="Available Colors"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="e.g. Arctic White, Matte Black"
            />
            <span className="text-2xs text-muted mt-0.5 block">
              Leave single/empty if only 1 color exists.
            </span>
          </div>

          <div>
            <Field
              label="Dimensions"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="e.g. 420 × 210 × 510 mm"
            />
          </div>

          <div>
            <Field
              label="Warranty"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              placeholder="e.g. 2 Years Brand Warranty"
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};
