import { useState } from 'react';
import type { GenerationItem, StudioSettings } from '../types';
import JSZip from 'jszip';
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
  generations: GenerationItem[];
  makePoster: boolean;
  setMakePoster: (val: boolean) => void;
  isGeneratingAll: boolean;
  onGenerateAll: () => Promise<void>;
  onRegenerateSlot: (slotOrKind: number | 'poster') => Promise<void>;
  toggleSelectCard: (id: string) => void;
  settings: StudioSettings;
}

export function ResultsGrid({
  productName,
  generations,
  makePoster,
  setMakePoster,
  isGeneratingAll,
  onGenerateAll,
  onRegenerateSlot,
  toggleSelectCard,
}: ResultsGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<{ title: string; prompt: string } | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const productSlug = (productName.trim() || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Helper to fetch blob safely
  const fetchImageBlob = async (item: GenerationItem): Promise<Blob | null> => {
    try {
      if (item.b64_json) {
        const byteCharacters = atob(item.b64_json);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: 'image/png' });
      } else if (item.imageUrl) {
        const res = await fetch(item.imageUrl);
        return await res.blob();
      }
    } catch (e) {
      console.warn('Could not fetch blob for download:', e);
    }
    return null;
  };

  // 1. Single card download
  const handleDownloadSingle = async (item: GenerationItem) => {
    const blob = await fetchImageBlob(item);
    if (!blob) return;

    const fileName =
      item.kind === 'poster'
        ? `${productSlug}-poster.png`
        : `${productSlug}-feature-${item.slot || 1}.png`;

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  // 2. Download Selected or Download All as ZIP
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

      for (const item of targets) {
        const blob = await fetchImageBlob(item);
        if (blob) {
          const fileName =
            item.kind === 'poster'
              ? `${productSlug}-poster.png`
              : `${productSlug}-feature-${item.slot || 1}.png`;
          zip.file(fileName, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `${productSlug}-images.zip`;
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

  // 3. Save to phone via navigator.share
  const canShare =
    typeof navigator !== 'undefined' &&
    !!navigator.share &&
    !!navigator.canShare;

  const handleShareToPhone = async () => {
    const targets = generations.filter((g) => g.status === 'done');
    if (targets.length === 0) return;

    const files: File[] = [];
    for (const item of targets) {
      const blob = await fetchImageBlob(item);
      if (blob) {
        const fileName =
          item.kind === 'poster'
            ? `${productSlug}-poster.png`
            : `${productSlug}-feature-${item.slot || 1}.png`;
        files.push(new File([blob], fileName, { type: 'image/png' }));
      }
    }

    if (files.length > 0 && navigator.canShare?.({ files })) {
      try {
        await navigator.share({
          files,
          title: `${productName} Product Images`,
          text: `Generated e-commerce images for ${productName}`,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    }
  };

  // 4. Save to folder (showDirectoryPicker)
  const canPickDirectory =
    typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  const handleSaveToFolder = async () => {
    if (!canPickDirectory) return;
    const targets = generations.filter((g) => g.status === 'done');
    if (targets.length === 0) return;

    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      for (const item of targets) {
        const blob = await fetchImageBlob(item);
        if (blob) {
          const fileName =
            item.kind === 'poster'
              ? `${productSlug}-poster.png`
              : `${productSlug}-feature-${item.slot || 1}.png`;
          const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        }
      }
      alert('All files saved successfully to your chosen folder!');
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
    <div className="space-y-5">
      {/* Top Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Generate Button */}
          <button
            type="button"
            onClick={onGenerateAll}
            disabled={isGeneratingAll}
            className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
          >
            {isGeneratingAll ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Generating {completedCount}/{generations.length}...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-300" />
                <span>
                  {makePoster
                    ? `Generate Sanford Set (${featureCards.length} + Poster)`
                    : `Generate Sanford Set (${featureCards.length} Images)`}
                </span>
              </>
            )}
          </button>

          {/* Also Make A Poster Checkbox */}
          <label className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition">
            <input
              type="checkbox"
              checked={makePoster}
              onChange={(e) => setMakePoster(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium text-slate-200">
              Also make a poster
            </span>
          </label>
        </div>

        {/* Batch Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download Selected */}
          <button
            type="button"
            onClick={() => handleDownloadZip(true)}
            disabled={selectedCount === 0 || isZipping}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Selected ({selectedCount})</span>
          </button>

          {/* Download All (ZIP) */}
          <button
            type="button"
            onClick={() => handleDownloadZip(false)}
            disabled={completedCount === 0 || isZipping}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center space-x-1.5"
          >
            <FileArchive className="w-3.5 h-3.5 text-indigo-400" />
            <span>Download All (ZIP)</span>
          </button>

          {/* Save to Phone (Share sheet) */}
          {canShare && (
            <button
              type="button"
              onClick={handleShareToPhone}
              disabled={completedCount === 0}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center space-x-1.5"
              title="Save to Phone Photos"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Save to Phone</span>
            </button>
          )}

          {/* Save to Folder */}
          {canPickDirectory && (
            <button
              type="button"
              onClick={handleSaveToFolder}
              disabled={completedCount === 0}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center space-x-1.5"
              title="Save directly to a folder"
            >
              <FolderDown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Save to Folder</span>
            </button>
          )}
        </div>
      </div>

      {/* 6 BuySanford Pattern Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {featureCards.map((item) => {
          const theme = item.sanfordSlot?.theme || item.theme;
          let themeBadge = 'Slot ' + item.slot;
          let themeBadgeColor = 'bg-slate-800 text-slate-300 border-slate-700';

          if (theme === 'hero') {
            themeBadge = 'White Studio Hero • No Text';
            themeBadgeColor = 'bg-blue-500/10 text-blue-300 border-blue-500/20';
          } else if (theme === 'lifestyle') {
            themeBadge = 'Lifestyle In-Use • No Specs';
            themeBadgeColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
          } else if (theme === 'specs_part_1') {
            themeBadge = 'Specifications Part 1';
            themeBadgeColor = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
          } else if (theme === 'specs_part_2') {
            themeBadge = 'Specifications Part 2';
            themeBadgeColor = 'bg-purple-500/10 text-purple-300 border-purple-500/20';
          } else if (theme === 'colors') {
            themeBadge = 'Available Colors Only';
            themeBadgeColor = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
          } else if (theme === 'size_warranty') {
            themeBadge = 'Size & Warranty Only';
            themeBadgeColor = 'bg-rose-500/10 text-rose-300 border-rose-500/20';
          }

          return (
          <div
            key={item.id}
            className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all duration-200 ${
              item.selected
                ? 'border-indigo-500/80 ring-1 ring-indigo-500/50'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Card Header */}
            <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!!item.selected}
                  onChange={() => toggleSelectCard(item.id)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-white">
                  {item.sanfordSlot?.title || `Slot ${item.slot}`}
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                {item.slot !== 1 && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-800/40" title="All text rendered in Sharp Sans font">
                    Sharp Sans
                  </span>
                )}
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${themeBadgeColor}`}>
                  {themeBadge}
                </span>
                {item.usage && (
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded">
                    {item.usage.total_tokens || 0} tok
                  </span>
                )}
              </div>
            </div>

            {/* Card Canvas / Image Viewport (1:1 aspect ratio) */}
            <div className="aspect-square bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-800">
              {item.status === 'pending' ? (
                <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
                  <div className="animate-spin h-9 w-9 border-3 border-indigo-500 border-t-transparent rounded-full" />
                  <p className="text-xs font-medium text-slate-300">
                    Generating Slot {item.slot}...
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Grounded in original photo
                  </p>
                </div>
              ) : item.status === 'failed' ? (
                <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <p className="text-xs font-medium text-red-300">Generation Failed</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">{item.error}</p>
                  <button
                    type="button"
                    onClick={() => onRegenerateSlot(item.slot || 1)}
                    className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Retry slot
                  </button>
                </div>
              ) : item.imageUrl ? (
                <div className="relative w-full h-full group">
                  <img
                    src={item.imageUrl}
                    alt={`Feature ${item.slot}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setZoomImage(item.imageUrl!)}
                      className="p-2 bg-slate-900/90 text-white rounded-lg hover:bg-slate-900 border border-slate-700 shadow"
                      title="Enlarge"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center text-slate-600">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs">Waiting to generate</span>
                </div>
              )}
            </div>

            {/* Feature Group Preview */}
            <div className="px-3.5 py-2 bg-slate-950/40 border-b border-slate-800 text-[11px] text-slate-400 space-y-0.5">
              {item.slot === 1 && (
                <div className="text-[11px] text-blue-300/90 font-medium">
                  Studio hero centered on pure white (#FFFFFF). Strictly NO text or specs.
                </div>
              )}
              {item.slot === 2 && (
                <div>
                  <div className="font-semibold text-slate-200 truncate">
                    "{item.sanfordSlot?.headline || 'The Smartest Breeze!'}"
                  </div>
                  <div className="text-[10px] text-emerald-400/90 font-medium">
                    Realistic in-use lifestyle scene. Strictly NO product specifications.
                  </div>
                </div>
              )}
              {item.slot === 3 && (
                <div className="space-y-1">
                  {item.sanfordSlot?.headline && (
                    <div className="font-semibold text-slate-200 truncate">
                      "{item.sanfordSlot.headline}"
                    </div>
                  )}
                  {item.featureGroup && item.featureGroup.length > 0 && (
                    <div className="line-clamp-2 text-slate-400">
                      <span className="font-medium text-indigo-300">Upper-Left Badges: </span>
                      {item.featureGroup.join('; ')}
                    </div>
                  )}
                  <div className="text-[10px] text-red-400 font-medium flex items-center space-x-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                    <span>Red Bottom Banner: "{item.sanfordSlot?.promoBanner || item.sanfordSlot?.headline || 'Rechargeable Cooling Hand Fan'}"</span>
                  </div>
                </div>
              )}
              {item.slot === 4 && (
                <div className="space-y-1">
                  {item.sanfordSlot?.headline && (
                    <div className="font-semibold text-slate-200 truncate">
                      "{item.sanfordSlot.headline}"
                    </div>
                  )}
                  {item.featureGroup && item.featureGroup.length > 0 && (
                    <div className="line-clamp-2 text-slate-400">
                      <span className="font-medium text-purple-300">Upper-Left Badges (Non-overlapping): </span>
                      {item.featureGroup.join('; ')}
                    </div>
                  )}
                  <div className="text-[10px] text-red-400 font-medium flex items-center space-x-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                    <span>Red Bottom Banner: "{item.sanfordSlot?.promoBanner || '3600mAh Long-Lasting Battery Life'}"</span>
                  </div>
                </div>
              )}
              {item.slot === 5 && (
                <div className="space-y-1">
                  <div className="font-semibold text-slate-200 truncate">
                    "Available Colors: {item.featureGroup && item.featureGroup.length > 0 ? item.featureGroup.join(', ') : 'Color Options'}"
                  </div>
                  <div className="text-[10px] text-red-400 font-medium flex items-center space-x-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                    <span>Red Bottom Banner: "{item.sanfordSlot?.promoBanner || 'Light Weight and Easy to Carry'}"</span>
                  </div>
                </div>
              )}
              {item.slot === 6 && (
                <div>
                  <div className="font-semibold text-slate-200 truncate">
                    "Unit Dimension & 1 Year Service Warranty"
                  </div>
                  <div className="text-[10px] text-rose-400/90 font-medium">
                    Sanford Style: Pale warm tint, "Unit Dimension", red/navy warranty ribbon & crimson red dimension arrows (&lt;---&gt;). No weight or box items.
                  </div>
                </div>
              )}
            </div>

            {/* Card Actions Footer */}
            <div className="p-3 bg-slate-900/80 flex items-center justify-between gap-1 text-xs mt-auto">
              <button
                type="button"
                onClick={() => handleDownloadSingle(item)}
                disabled={item.status !== 'done'}
                className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded-lg border border-slate-700 transition flex items-center space-x-1"
                title="Download this PNG"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG</span>
              </button>

              <button
                type="button"
                onClick={() => onRegenerateSlot(item.slot || 1)}
                disabled={item.status === 'pending' || isGeneratingAll}
                className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700 transition flex items-center space-x-1"
                title="Regenerate only this card"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyPrompt(item.id, item.prompt)}
                disabled={!item.prompt}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition"
                title="Copy prompt"
              >
                {copiedId === item.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
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
                  className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition"
                  title="View full prompt"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}

        {/* 6th Card: Poster (Only if makePoster is true) */}
        {makePoster && posterCard && (
          <div
            className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all duration-200 md:col-span-2 lg:col-span-1 ${
              posterCard.selected
                ? 'border-indigo-500/80 ring-1 ring-indigo-500/50'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!!posterCard.selected}
                  onChange={() => toggleSelectCard(posterCard.id)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Poster (Portrait)</span>
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-800/40" title="All text rendered in Sharp Sans font">
                  Sharp Sans
                </span>
                {posterCard.usage && (
                  <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                    {posterCard.usage.total_tokens || 0} tok
                  </span>
                )}
              </div>
            </div>

            {/* Poster Canvas Viewport */}
            <div className="aspect-[2/3] bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-800">
              {posterCard.status === 'pending' ? (
                <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
                  <div className="animate-spin h-9 w-9 border-3 border-indigo-500 border-t-transparent rounded-full" />
                  <p className="text-xs font-medium text-slate-300">
                    Generating Portrait Poster...
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Product hero + verified specifications
                  </p>
                </div>
              ) : posterCard.status === 'failed' ? (
                <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <p className="text-xs font-medium text-red-300">Poster Generation Failed</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">{posterCard.error}</p>
                  <button
                    type="button"
                    onClick={() => onRegenerateSlot('poster')}
                    className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 underline"
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
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setZoomImage(posterCard.imageUrl!)}
                      className="p-2 bg-slate-900/90 text-white rounded-lg hover:bg-slate-900 border border-slate-700 shadow"
                      title="Enlarge"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center text-slate-600">
                  <Layers className="w-8 h-8" />
                  <span className="text-xs">Ready for poster run</span>
                </div>
              )}
            </div>

            {/* Poster Actions Footer */}
            <div className="p-3 bg-slate-900/80 flex items-center justify-between gap-1 text-xs mt-auto">
              <button
                type="button"
                onClick={() => handleDownloadSingle(posterCard)}
                disabled={posterCard.status !== 'done'}
                className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded-lg border border-slate-700 transition flex items-center space-x-1"
                title="Download Poster PNG"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG</span>
              </button>

              <button
                type="button"
                onClick={() => onRegenerateSlot('poster')}
                disabled={posterCard.status === 'pending' || isGeneratingAll}
                className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700 transition flex items-center space-x-1"
                title="Regenerate poster"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyPrompt(posterCard.id, posterCard.prompt)}
                disabled={!posterCard.prompt}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition"
                title="Copy prompt"
              >
                {copiedId === posterCard.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
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
                  className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition"
                  title="View full prompt"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal: View Full Prompt */}
      {viewingPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{viewingPrompt.title}</h3>
              <button
                type="button"
                onClick={() => setViewingPrompt(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950/60 m-3 rounded-xl border border-slate-800">
              {viewingPrompt.prompt}
            </div>
            <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(viewingPrompt.prompt);
                  setViewingPrompt(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
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
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm flex items-center space-x-1"
            >
              <span>Close</span>
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomImage}
              alt="Enlarged"
              className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
            />
          </div>
        </div>
      )}
    </div>
  );
}

