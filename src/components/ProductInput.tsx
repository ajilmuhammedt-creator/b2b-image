import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import {
  UploadCloud,
  X,
  FileText,
  Sparkles,
  AlertCircle,
  FileUp,
  SlidersHorizontal,
  CheckCircle2,
  ExternalLink,
  Crop,
  Layers,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { renderPdfToImage, cropImageByBox } from '../lib/pdfRenderer';
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
  dimensions,
  setDimensions,
  weight,
  setWeight,
  whatsInTheBox,
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
}: ProductInputProps) {
  const [activeTab, setActiveTab] = useState<'catalogue' | 'manual'>('catalogue');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const manualPhotoRef = useRef<HTMLInputElement>(null);

  // Process Catalogue (PDF or Image)
  const handleCatalogueUpload = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingStatus('Reading document...');

    try {
      let catalogueDataUrl = '';
      let extractedText = '';

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setProcessingStatus('Rendering PDF catalogue page to high-res image...');
        const rendered = await renderPdfToImage(file);
        catalogueDataUrl = rendered.imageDataUrl;
        extractedText = rendered.extractedText;
      } else if (file.type.startsWith('image/')) {
        setProcessingStatus('Reading catalogue image...');
        catalogueDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      } else {
        throw new Error('Please upload a PDF catalogue (.pdf) or image (.png, .jpg, .webp).');
      }

      setCatalogueImage({
        previewUrl: catalogueDataUrl,
        fileName: file.name,
      });

      // Call /api/parse-catalogue
      setProcessingStatus('Analyzing specifications & generating Sanford 6-slot pattern...');
      const parseRes = await fetch('/api/parse-catalogue', {
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

  const handleManualPhotoInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setSourceImage({
        file,
        previewUrl,
      });
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6 shadow-xl">
      {/* Header with Sanford reference link pill */}
      <div className="space-y-2 pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FileUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Catalogue & Specs</h2>
              <p className="text-xs text-slate-400">Sanford Pattern Generation</p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadSanfordSample}
            disabled={isProcessing}
            className="text-xs font-medium text-indigo-300 bg-indigo-600/20 hover:bg-indigo-600/30 px-2.5 py-1.5 rounded-lg border border-indigo-500/30 transition flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Load Sanford Fan Sample</span>
          </button>
        </div>

        {/* Reference Store Link */}
        <a
          href="https://www.buysanford.com/products/sanford-camping-emergency-lantern-sf2722el"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 transition"
        >
          <span>Pattern Reference: BuySanford (SF2722EL Pattern)</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('catalogue')}
          className={`py-1.5 text-xs font-medium rounded-lg transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'catalogue'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Upload Catalogue (PDF/Img)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`py-1.5 text-xs font-medium rounded-lg transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'manual'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Manual Form</span>
        </button>
      </div>

      {/* Catalogue Upload Area */}
      {activeTab === 'catalogue' && (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
            Product Catalogue Sheet <span className="text-indigo-400">*</span>
          </label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-950'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => e.target.files?.[0] && handleCatalogueUpload(e.target.files[0])}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-indigo-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {isProcessing ? processingStatus : 'Drop Product Catalogue (PDF or Image)'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PDF, PNG, JPG, or WebP. Auto-extracts features & crops product photo.
                </p>
              </div>
            </div>
          </div>

          {/* Processing progress badge */}
          {isProcessing && (
            <div className="flex items-center space-x-2 bg-indigo-950/50 border border-indigo-800/60 p-3 rounded-xl text-xs text-indigo-300 animate-pulse">
              <div className="animate-spin h-3.5 w-3.5 border-2 border-indigo-400 border-t-transparent rounded-full" />
              <span>{processingStatus}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-950/40 p-2.5 rounded-lg border border-red-800/50">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Visual Previews: Catalogue Sheet + Cropped Product */}
          {catalogueImage.previewUrl && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center space-x-1">
                  <FileText className="w-3 h-3 text-indigo-400" />
                  <span>Catalogue Sheet</span>
                </span>
                <div className="h-40 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-1">
                  <img
                    src={catalogueImage.previewUrl}
                    alt="Catalogue"
                    className="max-h-full max-w-full object-contain rounded"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center space-x-1">
                  <Crop className="w-3 h-3 text-emerald-400" />
                  <span>Cropped Product Photo</span>
                </span>
                <div className="h-40 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-1 relative group">
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
                    className="absolute bottom-2 right-2 px-2 py-1 bg-slate-900/90 text-[10px] text-slate-300 hover:text-white rounded border border-slate-700 shadow"
                    title="Replace with custom photo"
                  >
                    Change
                  </button>
                  <input
                    ref={manualPhotoRef}
                    type="file"
                    accept="image/*"
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
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
            Isolated Product Photo <span className="text-indigo-400">*</span>
          </label>
          {sourceImage.previewUrl ? (
            <div className="relative rounded-xl border border-slate-700 bg-slate-950 p-2 flex items-center justify-center overflow-hidden">
              <img
                src={sourceImage.previewUrl}
                alt="Product"
                className="max-h-40 object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => setSourceImage({ file: null, previewUrl: '' })}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/90 text-slate-300 hover:text-red-400 rounded-lg border border-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => manualPhotoRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 text-center cursor-pointer bg-slate-950/40"
            >
              <input
                ref={manualPhotoRef}
                type="file"
                accept="image/*"
                onChange={handleManualPhotoInput}
                className="hidden"
              />
              <p className="text-xs text-slate-300 font-medium">Click to upload product photo</p>
              <p className="text-[10px] text-slate-500">PNG or JPG on white background</p>
            </div>
          )}
        </div>
      )}

      {/* Extracted / Editable Product Details */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        {/* Product Name & Model Code */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2 space-y-1">
            <label className="block text-xs font-medium text-slate-300">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Sanford SF6671HFN Cooling Fan"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">Model #</label>
            <input
              type="text"
              value={modelNumber}
              onChange={(e) => setModelNumber(e.target.value)}
              placeholder="SF6671HFN"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Tagline / Headline */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-300">Marketing Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. The Smartest Breeze!"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Verified Features */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-300">
              Verified Key Specifications
            </label>
            <span className="text-[10px] text-slate-500">One per line</span>
          </div>
          <textarea
            rows={4}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder="Cooling Function&#10;Digital Display - Gear Position & Battery&#10;100 Wind Speed&#10;90° Rotation Fold&#10;3600mAh Battery"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Dimensions, Weight, In The Box & Warranty (Sanford Spec Card requirements) */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-400">Dimensions</label>
            <input
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="78mm x 197mm x 57mm"
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-400">Weight</label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Unit 225g, Pkg 305g"
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-400">In The Box</label>
            <input
              type="text"
              value={whatsInTheBox.join(', ')}
              onChange={(e) =>
                setWhatsInTheBox(
                  e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              placeholder="Hand Fan, Type-C Cable, Manual"
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-400">Warranty</label>
            <input
              type="text"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              placeholder="1 Year Service Warranty"
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-slate-400">Color Options / Finishes</label>
          <input
            type="text"
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder="e.g. Graphite Black, Slate Grey"
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
          />
        </div>
      </div>

      {/* 6 Sanford Pattern Slots */}
      {sanfordSlots && sanfordSlots.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>6 Sanford Pattern Slots</span>
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>SF2722EL Pattern</span>
            </span>
          </div>

          <div className="space-y-2">
            {sanfordSlots.map((slot, index) => {
              let slotBadgeColor = 'text-indigo-300';
              let ruleHint = '';
              if (slot.slot === 1) {
                slotBadgeColor = 'text-blue-300';
                ruleHint = 'Pure white studio background (#FFFFFF). Strictly NO text or specifications.';
              } else if (slot.slot === 2) {
                slotBadgeColor = 'text-emerald-300';
                ruleHint = 'Realistic in-use lifestyle scene. Slogan only. Strictly NO technical specs.';
              } else if (slot.slot === 3) {
                slotBadgeColor = 'text-indigo-300';
                ruleHint = 'Upper-left red circular icon badges & divider lines + Full-width solid red bottom promotional banner.';
              } else if (slot.slot === 4) {
                slotBadgeColor = 'text-purple-300';
                ruleHint = 'Upper-left red circular icon badges & divider lines + Full-width solid red bottom promotional banner.';
              } else if (slot.slot === 5) {
                slotBadgeColor = 'text-amber-300';
                ruleHint = 'Available color options lineup + Full-width solid red bottom promotional banner. No technical specs.';
              } else if (slot.slot === 6) {
                slotBadgeColor = 'text-rose-300';
                ruleHint = 'BuySanford style: Pale warm tint, "Unit Dimension", red/navy ribbon warranty badge & crimson red dimension arrows (<--->). No weight, no box contents.';
              }

              return (
              <div
                key={index}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className={`${slotBadgeColor} font-semibold`}>
                    Slot {slot.slot}: {slot.title}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {slot.theme}
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  {ruleHint || slot.description}
                </p>

                {slot.slot !== 1 && slot.headline && (
                  <input
                    type="text"
                    value={slot.headline}
                    onChange={(e) => updateSlotField(index, 'headline', e.target.value)}
                    placeholder="Headline for this card..."
                    className="w-full bg-slate-900/60 border border-slate-800 px-2 py-1 rounded text-[11px] text-slate-200"
                  />
                )}

                {(slot.slot === 3 || slot.slot === 4 || slot.slot === 5) && (
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-red-400 flex items-center space-x-1">
                      <span>Red Bottom Banner Text (White Typography)</span>
                    </label>
                    <input
                      type="text"
                      value={slot.promoBanner || ''}
                      onChange={(e) => updateSlotField(index, 'promoBanner', e.target.value)}
                      placeholder='e.g. 4" Table Fan with LED'
                      className="w-full bg-red-950/30 border border-red-800/60 px-2 py-1 rounded text-[11px] text-white placeholder-red-300/40 focus:ring-1 focus:ring-red-500"
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
                    placeholder="Features or items to highlight..."
                    className="w-full bg-transparent border-0 p-0 text-xs text-slate-300 placeholder-slate-600 focus:ring-0 resize-y font-sans leading-relaxed"
                  />
                )}
              </div>
            );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
