import { useState } from 'react';
import type { GenerationItem, StudioSettings } from '../types';
import JSZip from 'jszip';
import { convertToWebpBlob } from '../lib/imageConversion';
import { getSeoImageFilename, getSeoFolderName, getSeoZipFilename } from '../lib/seoNaming';
import {
  Download,
  RotateCw,
  Copy,
  Check,
  FileArchive,
  Share2,
  FolderDown,
  Sparkles,
  AlertCircle,
  Eye,
  X,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

interface ResultsGridProps {
  productName: string;
  modelNumber?: string;
  brand?: string;
  generations: GenerationItem[];
  makePoster: boolean;
  setMakePoster: (val: boolean) => void;
  isGeneratingAll: boolean;
  onGenerateAll: () => Promise<void>;
  onRegenerateSlot: (slotOrKind: number | 'poster') => Promise<void>;
  toggleSelectCard: (id: string) => void;
  settings: StudioSettings;
  isReadyToGenerate?: boolean;
  missingFields?: string[];
  hasMultipleColors?: boolean;
}

export function ResultsGrid({
  productName,
  modelNumber = '',
  brand = 'Sanford',
  generations,
  makePoster,
  setMakePoster,
  isGeneratingAll,
  onGenerateAll,
  onRegenerateSlot,
  toggleSelectCard,
  isReadyToGenerate = true,
  missingFields = [],
  hasMultipleColors = false,
}: ResultsGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<{ title: string; prompt: string } | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Helper to fetch blob and strictly convert to WebP format
  const fetchImageBlob = async (item: GenerationItem): Promise<Blob | null> => {
    try {
      if (item.b64_json) {
        const byteCharacters = atob(item.b64_json);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const rawBlob = new Blob([byteArray], { type: 'image/png' });
        return await convertToWebpBlob(rawBlob);
      } else if (item.imageUrl) {
        const res = await fetch(item.imageUrl);
        const rawBlob = await res.blob();
        return await convertToWebpBlob(rawBlob);
      }
    } catch (e) {
      console.warn('Could not fetch and convert blob for download:', e);
    }
    return null;
  };

  // 1. Single card download (strictly WebP with SEO Shopify filename)
  const handleDownloadSingle = async (item: GenerationItem) => {
    const blob = await fetchImageBlob(item);
    if (!blob) return;

    const fileName = getSeoImageFilename({
      brand,
      productName,
      modelNumber,
      item,
    });

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  // 2. Download Selected or Download All as ZIP (SEO folder & WebP files)
  const handleDownloadZip = async (onlySelected: boolean = false) => {
    const targets = generations.filter((g) => {
      if (g.status !== 'done') return false;
      if (onlySelected) return g.selected;
      return true;
    });

    if (targets.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const seoFolder = getSeoFolderName({ brand, productName, modelNumber });
      const zipFileName = getSeoZipFilename({ brand, productName, modelNumber });

      for (let i = 0; i < targets.length; i++) {
        const item = targets[i];
        const webpBlob = await fetchImageBlob(item);
        if (webpBlob) {
          const fileName = getSeoImageFilename({
            brand,
            productName,
            modelNumber,
            item,
            index: i + 1,
          });
          // Store within the SEO-named Shopify folder inside the ZIP
          zip.file(`${seoFolder}/${fileName}`, webpBlob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // 3. Save to phone via navigator.share (strictly WebP)
  const canShare =
    typeof navigator !== 'undefined' &&
    !!navigator.share &&
    !!navigator.canShare;

  const handleShareToPhone = async () => {
    const targets = generations.filter((g) => g.status === 'done');
    if (targets.length === 0) return;

    const files: File[] = [];
    for (let i = 0; i < targets.length; i++) {
      const item = targets[i];
      const webpBlob = await fetchImageBlob(item);
      if (webpBlob) {
        const fileName = getSeoImageFilename({
          brand,
          productName,
          modelNumber,
          item,
          index: i + 1,
        });
        files.push(new File([webpBlob], fileName, { type: 'image/webp' }));
      }
    }

    if (files.length > 0 && navigator.canShare?.({ files })) {
      try {
        await navigator.share({
          files,
          title: `${productName} Shopify WebP Images`,
          text: `Generated e-commerce WebP images for ${productName}`,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    }
  };

  // 4. Save to folder (showDirectoryPicker with SEO folder name)
  const canPickDirectory =
    typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  const handleSaveToFolder = async () => {
    if (!canPickDirectory) return;
    const targets = generations.filter((g) => g.status === 'done');
    if (targets.length === 0) return;

    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      const seoFolder = getSeoFolderName({ brand, productName, modelNumber });
      const targetDirHandle = await dirHandle.getDirectoryHandle(seoFolder, { create: true });

      for (let i = 0; i < targets.length; i++) {
        const item = targets[i];
        const webpBlob = await fetchImageBlob(item);
        if (webpBlob) {
          const fileName = getSeoImageFilename({
            brand,
            productName,
            modelNumber,
            item,
            index: i + 1,
          });
          const fileHandle = await targetDirHandle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(webpBlob);
          await writable.close();
        }
      }
      alert(`All images successfully converted to WebP and saved in folder: "${seoFolder}"`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Directory write error:', err);
      }
    }
  };

  const handleCopyPrompt = (id: string, promptText?: string) => {
    if (!promptText) return;
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const featureCards = generations.filter((g) => g.kind === 'feature');
  const posterCard = generations.find((g) => g.kind === 'poster');
  const selectedCount = generations.filter((g) => g.selected && g.status === 'done').length;
  const completedCount = generations.filter((g) => g.status === 'done').length;

  return (
    <div className="space-y-4">
      {/* Top Toolbar (Action Bar): background #0F1B3D, radius 16px, white text */}
      <div className="bg-[#0F1B3D] dark:bg-[#0E1118]/80 border border-[#0F1B3D] dark:border-white/[0.06] rounded-[16px] p-3 shadow-[0_1px_3px_rgba(15,27,61,0.06)] dark:shadow-xl flex flex-wrap items-center justify-between gap-2.5 text-white">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Generate Button: #E11D2E, hover #C8102E, white text, 44px tall */}
          <button
            type="button"
            onClick={onGenerateAll}
            disabled={isGeneratingAll || !isReadyToGenerate}
            className="h-[44px] px-5 bg-[#E11D2E] hover:bg-[#C8102E] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs tracking-wide rounded-xl shadow-sm transition-all flex items-center space-x-2 active:scale-[0.98]"
          >
            {isGeneratingAll ? (
              <>
                <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                <span>Generating {completedCount}/{hasMultipleColors ? 6 : 5}...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-white/90" />
                <span>
                  {makePoster
                    ? `Generate Set (${hasMultipleColors ? 6 : 5} + Poster)`
                    : `Generate ${hasMultipleColors ? 6 : 5}-Image Set`}
                </span>
              </>
            )}
          </button>

          {!isReadyToGenerate && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FEF3C7] border border-[#FCD34D] text-xs font-semibold text-[#92400E]">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#92400E]" />
              <span>Missing: {missingFields.join(', ')}</span>
            </div>
          )}

          {/* Also Make A Poster Checkbox */}
          <label className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 px-3 py-2 rounded-xl border border-white/20 cursor-pointer transition text-white">
            <input
              type="checkbox"
              checked={makePoster}
              onChange={(e) => setMakePoster(e.target.checked)}
              className="rounded border-white/30 bg-white/10 text-[#E11D2E] focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px] font-medium text-white">
              Poster
            </span>
          </label>
        </div>

        {/* Batch Actions: Secondary buttons on the bar: transparent with 1px border rgba(255,255,255,.25), white text; disabled at 40% opacity */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Download Selected */}
          <button
            type="button"
            onClick={() => handleDownloadZip(true)}
            disabled={selectedCount === 0 || isZipping}
            className="h-[36px] px-3 bg-transparent hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-medium border border-white/25 transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Selected ({selectedCount})</span>
          </button>

          {/* Download All (ZIP) */}
          <button
            type="button"
            onClick={() => handleDownloadZip(false)}
            disabled={completedCount === 0 || isZipping}
            className="h-[36px] px-3 bg-transparent hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-medium border border-white/25 transition flex items-center space-x-1.5"
          >
            <FileArchive className="w-3.5 h-3.5 text-white" />
            <span>ZIP All</span>
          </button>

          {/* Save to Phone (Share sheet) */}
          {canShare && (
            <button
              type="button"
              onClick={handleShareToPhone}
              disabled={completedCount === 0}
              className="h-[36px] px-3 bg-transparent hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-medium border border-white/25 transition flex items-center space-x-1.5"
              title="Save to Phone Photos"
            >
              <Share2 className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Phone</span>
            </button>
          )}

          {/* Save to Folder */}
          {canPickDirectory && (
            <button
              type="button"
              onClick={handleSaveToFolder}
              disabled={completedCount === 0}
              className="h-[36px] px-3 bg-transparent hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-medium border border-white/25 transition flex items-center space-x-1.5"
              title="Save directly to a folder"
            >
              <FolderDown className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Folder</span>
            </button>
          )}
        </div>
      </div>

      {/* 6 BuySanford Pattern Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureCards.map((item) => {
          const isSlot5Skipped = item.slot === 5 && !hasMultipleColors;

          return (
          <div
            key={item.id}
            className={`bg-[#FFFFFF] dark:bg-[#0E1118]/80 border rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(15,27,61,0.06)] dark:shadow-xl flex flex-col transition-all duration-200 ${
              isSlot5Skipped
                ? 'border-[#E3E8EF] dark:border-white/[0.04] opacity-80'
                : item.selected
                ? 'border-[#0F1B3D] dark:border-indigo-500/80 ring-1 ring-[#0F1B3D] dark:ring-indigo-500/50'
                : 'border-[#E3E8EF] dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12]'
            }`}
          >
            {/* Card Header */}
            <div className="px-3.5 py-2.5 bg-white dark:bg-white/[0.02] border-b border-[#E3E8EF] dark:border-white/[0.06] flex items-start justify-between gap-2">
              <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={!isSlot5Skipped && !!item.selected}
                  disabled={isSlot5Skipped}
                  onChange={() => !isSlot5Skipped && toggleSelectCard(item.id)}
                  className="mt-0.5 rounded border-[#E3E8EF] dark:border-white/[0.12] bg-white dark:bg-white/[0.04] text-[#0F1B3D] focus:ring-[#0F1B3D] w-3.5 h-3.5 shrink-0 disabled:opacity-30"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-[#0F172A] dark:text-white line-clamp-2 leading-snug break-words">
                    {item.sanfordSlot?.title || `Slot ${item.slot}`}
                  </span>
                  {isSlot5Skipped && (
                    <span className="inline-block mt-1 text-[10px] font-medium text-[var(--warn)] bg-[var(--warn-bg)] border border-[#FCD34D] px-1.5 py-0.5 rounded">
                      Single colour (Skipped)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card Canvas / Image Viewport (1:1 aspect ratio) */}
            <div className="aspect-square bg-[#F4F7FC] dark:bg-black/40 relative flex items-center justify-center overflow-hidden border-b border-[#E3E8EF] dark:border-white/[0.06] p-3">
              {isSlot5Skipped && !item.imageUrl ? (
                <div className="w-full h-full rounded-lg border-[1.5px] border-dashed border-[#CBD5E1] dark:border-white/[0.08] flex flex-col items-center justify-center space-y-2 p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-white/[0.02] border border-[#CBD5E1] dark:border-white/[0.06] flex items-center justify-center text-[var(--muted)] dark:text-slate-500">
                    <Layers className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[#5B6478] dark:text-slate-300">Single Colour Product</p>
                    <p className="text-[10px] text-[#94A3B8] dark:text-slate-500 max-w-[190px] leading-relaxed">
                      Slot 5 is skipped because there are no multiple colour options.
                    </p>
                  </div>
                </div>
              ) : item.status === 'pending' ? (
                <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
                  <div className="animate-spin h-7 w-7 border-2 border-[#0F1B3D] dark:border-indigo-400 border-t-transparent rounded-full" />
                  <p className="text-xs font-medium text-[#0F172A] dark:text-slate-300">
                    Generating Slot {item.slot}...
                  </p>
                  <p className="text-[10px] text-[#94A3B8] dark:text-slate-500">
                    Applying Sharp Sans & BuySanford template
                  </p>
                </div>
              ) : item.status === 'failed' ? (
                <div className="flex flex-col items-center justify-center space-y-1.5 p-4 text-center">
                  <AlertCircle className="w-6 h-6 text-[var(--error)] dark:text-rose-400" />
                  <p className="text-xs font-medium text-[var(--error)] dark:text-rose-300">Generation Failed</p>
                  <p className="text-[10px] text-[#5B6478] dark:text-slate-400 max-w-xs">{item.error}</p>
                  <button
                    type="button"
                    onClick={() => onRegenerateSlot(item.slot || 1)}
                    className="mt-1 text-xs text-[#E11D2E] hover:underline dark:text-indigo-400 dark:hover:text-indigo-300 underline font-semibold"
                  >
                    Retry
                  </button>
                </div>
              ) : item.imageUrl ? (
                <div className="relative w-full h-full group">
                  <img
                    src={item.imageUrl}
                    alt={`Feature ${item.slot}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setZoomImage(item.imageUrl!)}
                      className="p-2 bg-white/90 text-slate-800 dark:bg-black/80 dark:text-white rounded-lg hover:bg-white dark:hover:bg-black border border-[#E3E8EF] dark:border-white/[0.1] shadow transition"
                      title="Enlarge"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full rounded-lg border-[1.5px] border-dashed border-[#CBD5E1] dark:border-white/[0.08] flex flex-col items-center justify-center space-y-1.5 p-6 text-center">
                  <ImageIcon className="w-7 h-7 stroke-[1.5] text-[#94A3B8]" />
                  <span className="text-[11px] font-medium text-[#94A3B8]">Ready to generate</span>
                </div>
              )}
            </div>

            {/* Card Actions Footer */}
            <div className="p-2 bg-white dark:bg-black/40 border-t border-[#E3E8EF] dark:border-white/[0.06] flex items-center justify-between gap-1 text-xs mt-auto">
              <button
                type="button"
                onClick={() => handleDownloadSingle(item)}
                disabled={item.status !== 'done'}
                className="py-1 px-2.5 bg-[#F4F7FC] hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-[#5B6478] dark:text-slate-200 rounded-lg border border-[#E3E8EF] dark:border-white/[0.06] transition flex items-center space-x-1"
                title="Download SEO WebP image"
              >
                <Download className="w-3 h-3" />
                <span className="text-[11px] font-medium">WebP</span>
              </button>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => !isSlot5Skipped && onRegenerateSlot(item.slot || 1)}
                  disabled={item.status === 'pending' || isGeneratingAll || isSlot5Skipped}
                  className="p-1.5 bg-[#F4F7FC] hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] disabled:opacity-30 text-[#5B6478] dark:text-slate-200 rounded-lg border border-[#E3E8EF] dark:border-white/[0.06] transition flex items-center justify-center shrink-0"
                  title={isSlot5Skipped ? 'Slot 5 is skipped for single colour products' : 'Regenerate card'}
                  aria-label="Regenerate card"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyPrompt(item.id, item.prompt)}
                  disabled={!item.prompt}
                  className="p-1.5 bg-[#F4F7FC] hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] disabled:opacity-30 text-[#5B6478] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white rounded-lg border border-[#E3E8EF] dark:border-white/[0.06] transition flex items-center justify-center shrink-0"
                  title="Copy prompt"
                  aria-label="Copy prompt"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {item.prompt && (
                  <button
                    type="button"
                    onClick={() =>
                      setViewingPrompt({
                        title: `Image ${item.slot} Prompt`,
                        prompt: item.prompt || '',
                      })
                    }
                    className="p-1.5 bg-[#F4F7FC] hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-[#5B6478] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white rounded-lg border border-[#E3E8EF] dark:border-white/[0.06] transition flex items-center justify-center shrink-0"
                    title="View full prompt"
                    aria-label="View full prompt"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

        {/* 6th Card: Poster (Only if makePoster is true) */}
        {makePoster && posterCard && (
          <div
            className={`bg-[#FFFFFF] dark:bg-slate-900 border rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(15,27,61,0.06)] dark:shadow-xl flex flex-col transition-all duration-200 md:col-span-2 lg:col-span-1 ${
              posterCard.selected
                ? 'border-[#0F1B3D] dark:border-indigo-500/80 ring-1 ring-[#0F1B3D] dark:ring-indigo-500/50'
                : 'border-[#E3E8EF] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {/* Header */}
            <div className="px-3.5 py-2.5 bg-white dark:bg-slate-950/70 border-b border-[#E3E8EF] dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={!!posterCard.selected}
                  onChange={() => toggleSelectCard(posterCard.id)}
                  className="rounded border-[#E3E8EF] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F1B3D] focus:ring-[#0F1B3D] shrink-0 w-3.5 h-3.5"
                />
                <span className="text-xs font-semibold text-[#0F172A] dark:text-white flex items-center space-x-1.5 line-clamp-2 leading-snug break-words">
                  <Layers className="w-3.5 h-3.5 text-[#0F1B3D] dark:text-indigo-400 shrink-0" />
                  <span>Poster (Portrait)</span>
                </span>
              </div>

              {posterCard.usage && (
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-indigo-500/10 text-[#5B6478] dark:text-indigo-300 border border-[#E3E8EF] dark:border-indigo-500/20 px-1.5 py-0.5 rounded shrink-0">
                  {posterCard.usage.total_tokens || 0} tok
                </span>
              )}
            </div>

            {/* Poster Canvas Viewport */}
            <div className="aspect-[2/3] bg-[#F4F7FC] dark:bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-[#E3E8EF] dark:border-slate-800 p-3">
              {posterCard.status === 'pending' ? (
                <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
                  <div className="animate-spin h-9 w-9 border-3 border-[#0F1B3D] dark:border-indigo-500 border-t-transparent rounded-full" />
                  <p className="text-xs font-medium text-[#0F172A] dark:text-slate-300">
                    Generating Portrait Poster...
                  </p>
                  <p className="text-[11px] text-[#94A3B8] dark:text-slate-500">
                    Product hero + verified specifications
                  </p>
                </div>
              ) : posterCard.status === 'failed' ? (
                <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-[var(--error)] dark:text-red-400" />
                  <p className="text-xs font-medium text-[var(--error)] dark:text-red-300">Poster Generation Failed</p>
                  <p className="text-[11px] text-[#5B6478] dark:text-slate-400 max-w-xs">{posterCard.error}</p>
                  <button
                    type="button"
                    onClick={() => onRegenerateSlot('poster')}
                    className="mt-2 text-xs text-[#E11D2E] hover:underline dark:text-indigo-400 dark:hover:text-indigo-300 underline font-semibold"
                  >
                    Retry poster
                  </button>
                </div>
              ) : posterCard.imageUrl ? (
                <div className="relative w-full h-full group">
                  <img
                    src={posterCard.imageUrl}
                    alt="Product poster"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setZoomImage(posterCard.imageUrl!)}
                      className="p-2 bg-white/90 text-slate-800 dark:bg-slate-900/90 dark:text-white rounded-lg hover:bg-white dark:hover:bg-slate-900 border border-[#E3E8EF] dark:border-slate-700 shadow"
                      title="Enlarge"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full rounded-lg border-[1.5px] border-dashed border-[#CBD5E1] dark:border-white/[0.08] flex flex-col items-center justify-center space-y-2 p-6 text-center">
                  <Layers className="w-8 h-8 text-[#94A3B8] stroke-[1.5]" />
                  <span className="text-xs font-medium text-[#94A3B8]">Ready for poster run</span>
                </div>
              )}
            </div>

            {/* Poster Actions Footer */}
            <div className="p-2 bg-white dark:bg-black/40 border-t border-[#E3E8EF] dark:border-white/[0.06] flex items-center justify-between gap-1 text-xs mt-auto">
              <button
                type="button"
                onClick={() => handleDownloadSingle(posterCard)}
                disabled={posterCard.status !== 'done'}
                className="py-1 px-2.5 bg-[#F4F7FC] hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-[#5B6478] dark:text-slate-200 rounded-lg border border-[#E3E8EF] dark:border-white/[0.06] transition flex items-center space-x-1"
                title="Download Poster WebP"
              >
                <Download className="w-3 h-3" />
                <span className="text-[11px] font-medium">WebP</span>
              </button>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => onRegenerateSlot('poster')}
                  disabled={posterCard.status === 'pending' || isGeneratingAll}
                  className="p-1.5 bg-[#F4F7FC] hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] disabled:opacity-30 text-[#5B6478] dark:text-slate-200 rounded-lg border border-[#E3E8EF] dark:border-white/[0.06] transition flex items-center justify-center shrink-0"
                  title="Regenerate poster"
                  aria-label="Regenerate poster"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyPrompt(posterCard.id, posterCard.prompt)}
                  disabled={!posterCard.prompt}
                  className="p-1.5 bg-[#F4F7FC] hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] disabled:opacity-30 text-[#5B6478] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white rounded-lg border border-[#E3E8EF] dark:border-white/[0.06] transition flex items-center justify-center shrink-0"
                  title="Copy prompt"
                  aria-label="Copy prompt"
                >
                  {copiedId === posterCard.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {posterCard.prompt && (
                  <button
                    type="button"
                    onClick={() =>
                      setViewingPrompt({
                        title: 'Poster Prompt',
                        prompt: posterCard.prompt || '',
                      })
                    }
                    className="p-1.5 bg-[#F4F7FC] hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-[#5B6478] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white rounded-lg border border-[#E3E8EF] dark:border-white/[0.06] transition flex items-center justify-center shrink-0"
                    title="View full prompt"
                    aria-label="View full prompt"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: View Full Prompt */}
      {viewingPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] dark:bg-[#0E1118] border border-[var(--border)] dark:border-white/[0.08] rounded-[14px] max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            <div className="px-5 py-3 border-b border-[var(--border)] dark:border-white/[0.06] flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">{viewingPrompt.title}</h3>
              <button
                type="button"
                onClick={() => setViewingPrompt(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-[11px] text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-[var(--subtle)] dark:bg-black/40 m-3 rounded-xl border border-[var(--border)] dark:border-white/[0.04]">
              {viewingPrompt.prompt}
            </div>
            <div className="px-5 py-3 border-t border-[var(--border)] dark:border-white/[0.06] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(viewingPrompt.prompt);
                  setViewingPrompt(null);
                }}
                className="px-3.5 py-1.5 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 text-xs font-semibold rounded-lg transition"
              >
                Copy & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Enlarge Image */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-xs flex items-center space-x-1"
            >
              <span>Close</span>
              <X className="w-4 h-4" />
            </button>
            <img
              src={zoomImage}
              alt="Enlarged"
              className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/[0.1]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

