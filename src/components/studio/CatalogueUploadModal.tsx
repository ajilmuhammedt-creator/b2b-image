import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { validateUploadFile, resizeImageToMax2048 } from '../../lib/imageProcessing';
import { renderPdfToImage } from '../../lib/pdfRenderer';
import { fetchApi } from '../../lib/apiClient';
import type { CatalogueParsedData } from '../../types';
import { UploadCloud, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';

interface CatalogueUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCatalogueParsed: (data: CatalogueParsedData) => void;
  setCatalogueImage: (img: { previewUrl: string; fileName?: string }) => void;
  setSourceImage: (img: { file: File | null; previewUrl: string; storagePath?: string }) => void;
}

export const CatalogueUploadModal: React.FC<CatalogueUploadModalProps> = ({
  isOpen,
  onClose,
  onCatalogueParsed,
  setCatalogueImage,
  setSourceImage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingStatus('Validating uploaded file...');

    try {
      const { isPdf, isImage } = validateUploadFile(file, 'catalogue');
      let catalogueDataUrl = '';
      let extractedText = '';

      if (isPdf) {
        setProcessingStatus('Rendering high-resolution PDF catalogue page...');
        const rendered = await renderPdfToImage(file);
        catalogueDataUrl = rendered.imageDataUrl;
        extractedText = rendered.extractedText;
      } else if (isImage) {
        setProcessingStatus('Optimizing image for vision extraction...');
        const processedFile = await resizeImageToMax2048(file);
        catalogueDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(processedFile);
        });
      }

      setCatalogueImage({
        previewUrl: catalogueDataUrl,
        fileName: file.name,
      });

      // Call catalogue parsing API
      setProcessingStatus('Vision AI extracting product data & specs...');
      const parseRes = await fetchApi('/api/parse-catalogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: catalogueDataUrl,
          extractedText: extractedText || undefined,
        }),
      });

      if (!parseRes.ok) {
        const errJson = await parseRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to analyze catalogue');
      }

      const parsed: CatalogueParsedData = await parseRes.json();
      setProcessingStatus('Finalizing product extraction...');

      // If an isolated cutout or catalogue sheet was extracted
      if (catalogueDataUrl) {
        setSourceImage({
          file: null,
          previewUrl: catalogueDataUrl,
        });
      }

      onCatalogueParsed(parsed);
      onClose();
    } catch (err: any) {
      console.error('Catalogue parse error:', err);
      setErrorMessage(err.message || 'Error processing catalogue document');
    } finally {
      setIsProcessing(false);
    }
  };

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
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid product photo');
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Product Document"
      description="Upload a Sanford catalogue sheet (PDF or image) to automatically extract specifications, model number, colors, and product imagery."
      maxWidth="md"
    >
      <div className="flex flex-col gap-5 py-2">
        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-ink bg-track/60'
              : 'border-border hover:border-muted hover:bg-track/30 bg-surface'
          } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="w-10 h-10 text-brand-red animate-spin" />
              <div className="flex flex-col gap-1 items-center">
                <span className="text-sm font-bold text-ink">{processingStatus}</span>
                <span className="text-xs text-muted">This may take 10-20 seconds...</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-14 h-14 rounded-2xl bg-track flex items-center justify-center text-ink shadow-2xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-extrabold text-ink">
                  Click to select or drag and drop catalogue
                </span>
                <span className="text-xs text-muted">
                  Supports PDF (up to 20 MB) or PNG, JPG, WebP (up to 10 MB)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-err-bg border border-err-fg/20 text-xs text-err-fg font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Alternative: Direct Product Photo */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-track/30">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-muted shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-ink">Already have an isolated product photo?</span>
              <span className="text-2xs text-muted">Upload a clean studio cutout directly</span>
            </div>
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
            Upload Photo
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
