import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import {
  UploadCloud,
  X,
  FileText,
  Sparkles,
  AlertCircle,
  FileUp,
  SlidersHorizontal,
  Crop,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { renderPdfToImage, cropImageByBox } from '../lib/pdfRenderer';
import { validateUploadFile, resizeImageToMax2048 } from '../lib/imageProcessing';
import { fetchApi } from '../lib/apiClient';
import type { SanfordSlotSpec, CatalogueParsedData } from '../types';

interface ProductInputProps {
  userId: string;
  projectId: string;
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
  weight: string;
  setWeight: (w: string) => void;
  whatsInTheBox: string[];
  setWhatsInTheBox: (items: string[]) => void;
  warranty: string;
  setWarranty: (w: string) => void;
  sanfordSlots: SanfordSlotSpec[];
  setSanfordSlots: (slots: SanfordSlotSpec[]) => void;
  sourceImage: {
    file: File | null;
    previewUrl: string;
    storagePath?: string;
  };
  setSourceImage: (img: { file: File | null; previewUrl: string; storagePath?: string }) => void;
  catalogueImage: {
    previewUrl: string;
    fileName?: string;
  };
  setCatalogueImage: (img: { previewUrl: string; fileName?: string }) => void;
  onCatalogueParsed: (data: CatalogueParsedData) => void;
  validationAttempted?: boolean;
  hasMultipleColors?: boolean;
}

export function ProductInput({
  userId,
  projectId,
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
  dimensions: _dimensions,
  setDimensions,
  weight: _weight,
  setWeight,
  whatsInTheBox: _whatsInTheBox,
  setWhatsInTheBox,
  warranty,
  setWarranty,
  sanfordSlots,
  setSanfordSlots,
  sourceImage,
  setSourceImage,
  catalogueImage,
  setCatalogueImage,
  onCatalogueParsed,
  validationAttempted = false,
  hasMultipleColors = false,
}: ProductInputProps) {
  const [activeTab, setActiveTab] = useState<'catalogue' | 'manual'>('catalogue');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSlotsOpen, setIsSlotsOpen] = useState(false);

  const isNameInvalid = validationAttempted && !productName.trim();
  const isSpecsInvalid = validationAttempted && !featuresText.trim();
  const isPhotoInvalid = validationAttempted && !sourceImage.previewUrl;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const manualPhotoRef = useRef<HTMLInputElement>(null);

  // Process Catalogue (PDF or Image)
  const handleCatalogueUpload = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingStatus('Validating file...');

    try {
      const { isPdf, isImage } = validateUploadFile(file, 'catalogue');
      let catalogueDataUrl = '';
      let extractedText = '';

      if (isPdf) {
        setProcessingStatus('Rendering PDF catalogue page to high-res image...');
        const rendered = await renderPdfToImage(file);
        catalogueDataUrl = rendered.imageDataUrl;
        extractedText = rendered.extractedText;
      } else if (isImage) {
        setProcessingStatus('Optimizing image (max 2048px)...');
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

      // Call /api/parse-catalogue
      setProcessingStatus('Analyzing specifications & generating Sanford 6-slot pattern...');
      const parseRes = await fetchApi('/api/parse-catalogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catalogueImage: catalogueDataUrl,
          extractedText,
          fileName: file.name,
        }),
      });

      if (!parseRes.ok) {
        const errJson = await parseRes.json().catch(() => ({}));
        throw new Error(errJson.error || `Parsing failed with code ${parseRes.status}`);
      }

      const parsed: CatalogueParsedData = await parseRes.json();
      setProcessingStatus('Cropping product reference photo...');

      // Apply crop box if provided
      let croppedProductUrl = catalogueDataUrl;
      if (parsed.cropBox) {
        croppedProductUrl = await cropImageByBox(catalogueDataUrl, parsed.cropBox);
      }

      // Upload cropped product to Supabase source-images bucket
      let storagePath = `${userId}/${projectId}/cropped-product.png`;
      try {
        const base64Data = croppedProductUrl.split('base64,')[1];
        if (base64Data) {
          const byteChars = atob(base64Data);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
          }
          const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'image/png' });
          await supabase.storage.from('source-images').upload(storagePath, blob, {
            upsert: true,
            contentType: 'image/png',
          });
        }
      } catch (uploadErr) {
        console.warn('Storage upload fallback note:', uploadErr);
      }

      setSourceImage({
        file: null,
        previewUrl: croppedProductUrl,
        storagePath,
      });

      // Populate product fields
      setProductName(parsed.productName || file.name.replace(/\.[^/.]+$/, ''));
      if (parsed.modelNumber) setModelNumber(parsed.modelNumber);
      if (parsed.tagline) setTagline(parsed.tagline);
      if (parsed.fullFeatures && parsed.fullFeatures.length > 0) {
        setFeaturesText(parsed.fullFeatures.join('\n'));
      }
      if (parsed.colors) setColors(parsed.colors);
      if (parsed.dimensions) setDimensions(parsed.dimensions);
      if (parsed.weight) setWeight(parsed.weight);
      if (parsed.whatsInTheBox) setWhatsInTheBox(parsed.whatsInTheBox);
      if (parsed.warranty) setWarranty(parsed.warranty);

      if (parsed.slots && parsed.slots.length > 0) {
        setSanfordSlots(parsed.slots);
      }

      onCatalogueParsed(parsed);
      setProcessingStatus('');
    } catch (err: any) {
      console.error('Error processing catalogue:', err);
      setErrorMessage(err.message || 'Failed to process catalogue.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Load Sanford Cooling Hand Fan Sample
  const loadSanfordSample = async () => {
    setIsProcessing(true);
    setProcessingStatus('Loading Sanford Cooling Hand Fan Catalogue sample...');
    try {
      const response = await fetch('/samples/sanford-fan-catalogue.png');
      const blob = await response.blob();
      const file = new File([blob], 'SF6671HFN-ModelCatalogue.png', { type: 'image/png' });
      await handleCatalogueUpload(file);
    } catch (sampleErr: any) {
      console.error('Failed to load sample:', sampleErr);
      setErrorMessage('Could not load sample. Please upload your catalogue directly.');
      setIsProcessing(false);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleCatalogueUpload(e.dataTransfer.files[0]);
    }
  };

  const handleManualPhotoInput = async (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const rawFile = e.target.files[0];
      try {
        validateUploadFile(rawFile, 'photo');
        setIsProcessing(true);
        setProcessingStatus('Optimizing product photo (max 2048px)...');

        // Resize photo so longest side is at most 2048px (save as PNG, no upscaling)
        const processedFile = await resizeImageToMax2048(rawFile);
        const previewUrl = URL.createObjectURL(processedFile);

        // Upload to Supabase source-images bucket
        let storagePath = `${userId}/${projectId}/manual-product.png`;
        try {
          await supabase.storage.from('source-images').upload(storagePath, processedFile, {
            upsert: true,
            contentType: 'image/png',
          });
        } catch (uploadErr) {
          console.warn('Storage upload note:', uploadErr);
        }

        setSourceImage({
          file: processedFile,
          previewUrl,
          storagePath,
        });
      } catch (err: any) {
        console.error('Manual photo upload error:', err);
        setErrorMessage(err.message || 'Failed to upload image');
      } finally {
        setIsProcessing(false);
        setProcessingStatus('');
        if (e.target) e.target.value = '';
      }
    }
  };

  const updateSlotField = (
    index: number,
    field: 'title' | 'headline' | 'promoBanner' | 'features',
    value: any
  ) => {
    const updated = [...sanfordSlots];
    if (updated[index]) {
      (updated[index] as any)[field] = value;
      setSanfordSlots(updated);
    }
  };

  return (
    <div className="bg-[var(--surface)] dark:bg-[#0E1118]/80 border border-[var(--border)] dark:border-white/[0.06] rounded-[14px] p-4.5 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] dark:shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] dark:border-white/[0.06]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-[var(--brand-tint)] dark:bg-white/[0.04] text-[var(--brand)] dark:text-slate-300 flex items-center justify-center">
            <FileUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-900 dark:text-white">Catalogue & Specs</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">BuySanford Pattern Pipeline</p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadSanfordSample}
          disabled={isProcessing}
          className="text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08] transition flex items-center space-x-1"
        >
          <Sparkles className="w-3 h-3 text-[var(--brand)] dark:text-indigo-400" />
          <span>Load Sample</span>
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-white/[0.02] p-1 rounded-xl border border-slate-200 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={() => setActiveTab('catalogue')}
          className={`py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'catalogue'
              ? 'bg-[var(--brand-tint)] border-[1.5px] border-[var(--brand)] text-[var(--brand-ink)] shadow-sm dark:bg-white/[0.08] dark:text-white dark:border dark:border-white/[0.08]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Catalogue Document</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'manual'
              ? 'bg-[var(--brand-tint)] border-[1.5px] border-[var(--brand)] text-[var(--brand-ink)] shadow-sm dark:bg-white/[0.08] dark:text-white dark:border dark:border-white/[0.08]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Manual Form</span>
        </button>
      </div>

      {/* Catalogue Upload Area */}
      {activeTab === 'catalogue' && (
        <div className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-[1.5px] border-dashed rounded-xl p-4.5 text-center cursor-pointer transition ${
              isDragging
                ? 'border-[var(--brand)] bg-[var(--brand-tint)] dark:border-indigo-400 dark:bg-indigo-500/10'
                : 'border-[#CBD5E1] hover:border-[var(--brand)] dark:border-white/[0.12] dark:hover:border-indigo-400/50 bg-[var(--subtle)] hover:bg-slate-100 dark:bg-white/[0.015] dark:hover:bg-white/[0.03]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => e.target.files?.[0] && handleCatalogueUpload(e.target.files[0])}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-1.5">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-transparent flex items-center justify-center text-slate-500 dark:text-slate-300">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {isProcessing ? processingStatus : 'Drop Catalogue PDF or Image'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  PNG, JPG, WebP up to 10 MB or PDF up to 20 MB
                </p>
              </div>
            </div>
          </div>

          {/* Processing progress badge */}
          {isProcessing && (
            <div className="flex items-center space-x-2 bg-[var(--brand-tint)] dark:bg-indigo-500/10 border border-[var(--brand)]/30 dark:border-indigo-500/20 p-2.5 rounded-xl text-xs text-[var(--brand-ink)] dark:text-indigo-300 animate-pulse">
              <div className="animate-spin h-3.5 w-3.5 border-2 border-[var(--brand)] dark:border-indigo-400 border-t-transparent rounded-full" />
              <span>{processingStatus}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center space-x-2 text-xs text-[var(--error)] bg-[var(--error-bg)] dark:text-rose-400 dark:bg-rose-500/10 p-2.5 rounded-xl border border-rose-200 dark:border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Visual Previews: Catalogue Sheet + Cropped Product */}
          {catalogueImage.previewUrl && (
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                  <FileText className="w-3 h-3 text-[var(--brand)] dark:text-indigo-400" />
                  <span>Catalogue Sheet</span>
                </span>
                <div className="h-36 bg-[var(--subtle)] dark:bg-black/40 rounded-xl border border-[var(--border)] dark:border-white/[0.06] overflow-hidden flex items-center justify-center p-1">
                  <img
                    src={catalogueImage.previewUrl}
                    alt="Catalogue"
                    className="max-h-full max-w-full object-contain rounded"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                  <Crop className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Isolated Product</span>
                </span>
                <div className="h-36 bg-[var(--subtle)] dark:bg-black/40 rounded-xl border border-[var(--border)] dark:border-white/[0.06] overflow-hidden flex items-center justify-center p-1 relative group">
                  {sourceImage.previewUrl ? (
                    <img
                      src={sourceImage.previewUrl}
                      alt="Cropped Product"
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">Extracting...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => manualPhotoRef.current?.click()}
                    className="absolute bottom-2 right-2 px-2 py-0.5 bg-white/90 text-slate-800 dark:bg-black/80 dark:text-slate-300 hover:text-black dark:hover:text-white rounded border border-slate-300 dark:border-white/[0.1] shadow"
                    title="Replace with custom photo"
                  >
                    Change
                  </button>
                  <input
                    ref={manualPhotoRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleManualPhotoInput}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Photo Uploader (if on manual tab or replacing photo) */}
      {activeTab === 'manual' && (
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-400">
            Isolated Product Photo
          </label>
          {sourceImage.previewUrl ? (
            <div className="relative rounded-xl border border-slate-200 dark:border-white/[0.08] bg-[var(--subtle)] dark:bg-black/30 p-2 flex items-center justify-center overflow-hidden">
              <img
                src={sourceImage.previewUrl}
                alt="Product"
                className="max-h-36 object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => setSourceImage({ file: null, previewUrl: '' })}
                className="absolute top-2 right-2 p-1 bg-white/90 text-slate-600 dark:bg-black/80 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg border border-slate-300 dark:border-white/[0.1]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => manualPhotoRef.current?.click()}
              className={`border-[1.5px] border-dashed rounded-xl p-3.5 text-center cursor-pointer bg-[var(--subtle)] dark:bg-white/[0.015] transition ${
                isPhotoInvalid
                  ? 'border-red-500 bg-red-50 dark:bg-red-500/5'
                  : 'border-[#CBD5E1] hover:border-[var(--brand)] dark:border-white/[0.1] dark:hover:border-white/[0.2]'
              }`}
            >
              <input
                ref={manualPhotoRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleManualPhotoInput}
                className="hidden"
              />
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Click to upload product photo</p>
              <p className="text-[10px] text-slate-500">PNG, JPG, or WebP up to 10 MB (auto-scaled to 2048px)</p>
            </div>
          )}
        </div>
      )}

      {/* Extracted / Editable Product Details */}
      <div className="space-y-2.5 pt-2 border-t border-[var(--border)] dark:border-white/[0.06]">
        {/* Product Name & Model Code */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2 space-y-1">
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-400">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product title or upload catalogue"
              className={`w-full px-2.5 py-1.5 bg-white dark:bg-white/[0.02] border rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 ${
                isNameInvalid
                  ? 'border-red-500 focus:ring-red-500 ring-1 ring-red-500/30'
                  : 'border-slate-300 dark:border-white/[0.08] focus:ring-[var(--brand)] dark:focus:ring-indigo-500'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-400">Model #</label>
            <input
              type="text"
              value={modelNumber}
              onChange={(e) => setModelNumber(e.target.value)}
              placeholder="e.g. SF6671HFN"
              className="w-full px-2.5 py-1.5 bg-white dark:bg-white/[0.02] border border-slate-300 dark:border-white/[0.08] rounded-lg text-xs text-slate-900 dark:text-slate-100 font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--brand)] dark:focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Tagline / Headline */}
        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-400">Marketing Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Refreshing Airflow In Every Spin!"
            className="w-full px-2.5 py-1.5 bg-white dark:bg-white/[0.02] border border-slate-300 dark:border-white/[0.08] rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--brand)] dark:focus:ring-indigo-500"
          />
        </div>

        {/* Verified Features */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-400">
              Verified Specifications
            </label>
            <span className="text-[10px] text-slate-500">One per line</span>
          </div>
          <textarea
            rows={4}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder="Paste or auto-extract specifications (one per line)..."
            className={`w-full px-2.5 py-1.5 bg-white dark:bg-white/[0.02] border rounded-lg text-xs text-slate-900 dark:text-slate-100 font-mono leading-relaxed resize-y placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 ${
              isSpecsInvalid
                ? 'border-red-500 focus:ring-red-500 ring-1 ring-red-500/30'
                : 'border-slate-300 dark:border-white/[0.08] focus:ring-[var(--brand)] dark:focus:ring-indigo-500'
            }`}
          />
        </div>

        {/* Warranty & Color Options */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-400">Warranty</label>
            <input
              type="text"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              placeholder="e.g. 1 Year Service Warranty"
              className="w-full px-2.5 py-1.5 bg-white dark:bg-white/[0.02] border border-slate-300 dark:border-white/[0.08] rounded-lg text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--brand)] dark:focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-400">Color Options</label>
              <span className="text-[9px] text-slate-500">
                {hasMultipleColors ? 'Multiple colors' : 'Single colour (Slot 5 skipped)'}
              </span>
            </div>
            <input
              type="text"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="e.g. Graphite Black, Arctic White (leave 1 color if no variants)"
              className="w-full px-2.5 py-1.5 bg-white dark:bg-white/[0.02] border border-slate-300 dark:border-white/[0.08] rounded-lg text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--brand)] dark:focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 6 Sanford Pattern Slots (Collapsible Accordion) */}
      {sanfordSlots && sanfordSlots.length > 0 && (
        <div className="pt-2 border-t border-[var(--border)] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => setIsSlotsOpen(!isSlotsOpen)}
            className="w-full flex items-center justify-between text-left py-1 select-none group"
          >
            <div className="flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-[var(--brand)] dark:text-indigo-400" />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Slot Customization ({hasMultipleColors ? '6' : '5'} Images)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--brand-tint)] dark:bg-red-500/10 text-[var(--brand)] dark:text-red-400 border border-[var(--brand)]/30 dark:border-red-500/20 font-medium">
                Sharp Sans Font
              </span>
            </div>
            <div className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition">
              {isSlotsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {isSlotsOpen && (
            <div className="space-y-2 pt-2.5 mt-1">
              {sanfordSlots.map((slot, index) => {
                const isSlot5Skipped = slot.slot === 5 && !hasMultipleColors;

                let slotBadgeColor = 'text-indigo-300';
                if (slot.slot === 1) slotBadgeColor = 'text-blue-300';
                else if (slot.slot === 2) slotBadgeColor = 'text-emerald-300';
                else if (slot.slot === 3) slotBadgeColor = 'text-indigo-300';
                else if (slot.slot === 4) slotBadgeColor = 'text-purple-300';
                else if (slot.slot === 5) slotBadgeColor = 'text-amber-300';
                else if (slot.slot === 6) slotBadgeColor = 'text-rose-300';

                return (
                  <div
                    key={index}
                    className={`bg-slate-50/80 dark:bg-black/30 border rounded-xl p-2.5 space-y-1.5 ${
                      isSlot5Skipped
                        ? 'border-amber-400/40 bg-[var(--warn-bg)] dark:bg-black/30 dark:border-amber-500/20 opacity-85'
                        : 'border-slate-200 dark:border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className={`${slotBadgeColor} font-semibold text-[11px] text-slate-800 dark:text-inherit`}>
                        Slot {slot.slot}: {slot.title}
                      </span>
                      {isSlot5Skipped ? (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[var(--warn-bg)] text-[var(--warn)] border border-[#FCD34D] dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
                          Skipped (Single colour)
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/[0.04] dark:text-slate-400 dark:border-white/[0.06]">
                          {slot.theme}
                        </span>
                      )}
                    </div>

                    {isSlot5Skipped && (
                      <p className="text-[10px] text-[var(--warn)] bg-white/60 dark:bg-amber-500/5 border border-amber-300 dark:border-amber-500/10 rounded px-2 py-1">
                        Product only has 1 colour or no colour options. Slot 5 will be skipped during generation.
                      </p>
                    )}

                    {slot.slot !== 1 && (
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-medium text-slate-700 dark:text-slate-400">
                          {slot.slot === 2
                            ? 'Top-Right Red Badge Tagline (Sharp Sans Text)'
                            : slot.slot === 3 || slot.slot === 4
                            ? 'Upper-Right Context Slogan'
                            : slot.slot === 5
                            ? 'Header Title'
                            : 'Top-Left Header'}
                        </label>
                        <input
                          type="text"
                          value={slot.headline || ''}
                          onChange={(e) => updateSlotField(index, 'headline', e.target.value)}
                          placeholder={
                            slot.slot === 2
                              ? 'e.g. Refreshing Airflow In Every Spin!'
                              : slot.slot === 3
                              ? 'e.g. SUITABLE FOR OUTDOOR & INDOOR USE'
                              : slot.slot === 4
                              ? 'e.g. PORTABLE, POWERFUL, STAY COOL EVERYWHERE'
                              : slot.slot === 5
                              ? 'e.g. Available Colors'
                              : 'e.g. Unit Dimension'
                          }
                          className="w-full bg-white dark:bg-white/[0.02] border border-slate-300 dark:border-white/[0.08] px-2 py-1 rounded text-[11px] text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--brand)] dark:focus:ring-indigo-500"
                        />
                      </div>
                    )}

                    {(slot.slot === 3 || slot.slot === 4 || slot.slot === 5) && (
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-medium text-slate-700 dark:text-slate-400">
                          Bottom Banner Text
                        </label>
                        <input
                          type="text"
                          value={slot.promoBanner || ''}
                          onChange={(e) => updateSlotField(index, 'promoBanner', e.target.value)}
                          placeholder="e.g. Rechargeable Cooling Hand Fan with Cold Plate"
                          className="w-full bg-white dark:bg-white/[0.02] border border-slate-300 dark:border-white/[0.08] px-2 py-1 rounded text-[11px] text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--brand)] dark:focus:ring-indigo-500"
                        />
                      </div>
                    )}

                    {slot.slot !== 1 && slot.slot !== 2 && (
                      <textarea
                        rows={2}
                        value={slot.features?.join('\n') || ''}
                        onChange={(e) =>
                          updateSlotField(
                            index,
                            'features',
                            e.target.value.split('\n').filter((f) => f.trim().length > 0)
                          )
                        }
                        placeholder="e.g. Feature callouts (one per line)..."
                        className="w-full bg-white dark:bg-white/[0.02] border border-slate-300 dark:border-white/[0.08] p-1.5 rounded text-[11px] text-slate-900 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--brand)] dark:focus:ring-indigo-500 resize-y font-mono leading-relaxed"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
