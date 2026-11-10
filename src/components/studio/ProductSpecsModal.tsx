import React, { ChangeEvent, useRef } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { Textarea } from '../ui/Textarea';
import { resizeImageToMax2048, validateUploadFile } from '../../lib/imageProcessing';
import { Image as ImageIcon } from 'lucide-react';

interface ProductSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  setProductName: (name: string) => void;
  modelNumber: string;
  setModelNumber: (model: string) => void;
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
}

export const ProductSpecsModal: React.FC<ProductSpecsModalProps> = ({
  isOpen,
  onClose,
  productName,
  setProductName,
  modelNumber,
  setModelNumber,
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

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Product Specifications"
      description="Review and customize product details before generating marketplace images. All specifications must match physical catalogue data."
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
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

        {/* Basic Info: Model & Name */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Field
              label="Model Number"
              value={modelNumber}
              onChange={(e) => setModelNumber(e.target.value)}
              placeholder="e.g. SF6671HFN"
            />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Sanford 16'' Rechargeable Table Fan"
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

        {/* Verified Specifications */}
        <div>
          <label className="block text-xs font-bold text-ink mb-1.5">
            Verified Specifications (One per line)
          </label>
          <Textarea
            rows={5}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder="5 Leaf AS Blade&#10;9 Speed Settings&#10;Brushless DC Motor&#10;Up to 12 Hours Battery Backup&#10;USB Mobile Charging Port"
          />
          <span className="text-2xs text-muted mt-1 block">
            Used across Spec Callout and Feature Infographic cards.
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
