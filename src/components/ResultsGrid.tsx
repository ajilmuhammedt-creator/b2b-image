import { useState } from 'react';
import type { GenerationItem, StudioSettings, EcommercePlatform } from '../types';
import JSZip from 'jszip';
import { convertToWebpBlob, convertToAmazonFormatBlob } from '../lib/imageConversion';
import {
  getSeoImageFilename,
  getSeoFolderName,
  getSeoZipFilename,
  getAmazonImageFilename,
  getAmazonFolderName,
  getAmazonZipFilename,
  getAmazonAPlusFilename,
  getNoonImageFilename,
  getNoonAPlusFilename,
  getNoonFolderName,
  getNoonZipFilename,
} from '../lib/seoNaming';
import { AmazonComplianceModal } from './AmazonComplianceModal';
import { NoonComplianceModal } from './NoonComplianceModal';
import { ShopifyIcon, AmazonIcon, NoonIcon } from './PlatformIcons';
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
  platform: EcommercePlatform | null;
  onSelectPlatform: (platform: EcommercePlatform) => void;
  onOpenPlatformModal?: () => void;
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
  settings,
  isReadyToGenerate = true,
  missingFields = [],
  hasMultipleColors = false,
  platform,
  onSelectPlatform,
  onOpenPlatformModal,
}: ResultsGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<{ title: string; prompt: string } | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [complianceModalItem, setComplianceModalItem] = useState<GenerationItem | null>(null);
  const [noonComplianceModalItem, setNoonComplianceModalItem] = useState<GenerationItem | null>(null);

  const isAmazon = platform === 'amazon' || platform === 'amazon_aplus';
  const isNoon = platform === 'noon' || platform === 'noon_aplus';

  // Helper to fetch blob and convert to target platform format (WebP for Shopify, 2000x2000 JPEG for Amazon & Noon)
  const fetchImageBlob = async (item: GenerationItem): Promise<Blob | null> => {
    try {
      let rawBlob: Blob;
      if (item.b64_json) {
        const byteCharacters = atob(item.b64_json);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        rawBlob = new Blob([byteArray], { type: 'image/png' });
      } else if (item.imageUrl) {
        const res = await fetch(item.imageUrl);
        rawBlob = await res.blob();
      } else {
        return null;
      }

      if (isAmazon || isNoon) {
        const format = isNoon ? 'jpeg' : (settings.amazonFormat || 'jpeg');
        return await convertToAmazonFormatBlob(rawBlob, format, 2000, 0.95);
      } else {
        return await convertToWebpBlob(rawBlob);
      }
    } catch (e) {
      console.warn('Could not fetch and convert blob for download:', e);
    }
    return null;
  };

  // 1. Single card download (converts to WebP for Shopify, or 2000px JPEG for Amazon & Noon)
  const handleDownloadSingle = async (item: GenerationItem) => {
    const blob = await fetchImageBlob(item);
    if (!blob) return;

    let fileName: string;
    if (platform === 'noon') {
      fileName = getNoonImageFilename({
        modelNumber,
        productName,
        slotNumber: item.slot ?? 1,
        theme: item.theme,
      });
    } else if (platform === 'noon_aplus') {
      fileName = getNoonAPlusFilename({
        modelNumber,
        productName,
        slotNumber: item.slot ?? 1,
        language: item.noonLanguage || 'en',
      });
    } else if (platform === 'amazon') {
      fileName = getAmazonImageFilename({
        modelNumber,
        productName,
        slotNumber: item.slot ?? 1,
        format: settings.amazonFormat || 'jpeg',
      });
    } else if (platform === 'amazon_aplus') {
      fileName = getAmazonAPlusFilename({
        modelNumber,
        productName,
        aplusType: item.sanfordSlot?.aplusType,
        index: item.slot ?? 1,
        format: settings.amazonFormat || 'jpeg',
      });
    } else {
      fileName = getSeoImageFilename({
        brand,
        productName,
        modelNumber,
        item,
      });
    }

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
      const folderName = isNoon
        ? getNoonFolderName({ brand, productName, modelNumber, isAPlus: platform === 'noon_aplus' })
        : isAmazon
        ? getAmazonFolderName({ brand, productName, modelNumber })
        : getSeoFolderName({ brand, productName, modelNumber });
      const zipFileName = isNoon
        ? getNoonZipFilename({ brand, productName, modelNumber, isAPlus: platform === 'noon_aplus' })
        : isAmazon
        ? getAmazonZipFilename({ brand, productName, modelNumber })
        : getSeoZipFilename({ brand, productName, modelNumber });

      let amazonPtCounter = 1;

      for (let i = 0; i < targets.length; i++) {
        const item = targets[i];
        const blob = await fetchImageBlob(item);
        if (blob) {
          let fileName: string;
          if (platform === 'noon') {
            fileName = getNoonImageFilename({
              modelNumber,
              productName,
              slotNumber: item.slot ?? i + 1,
              theme: item.theme,
            });
          } else if (platform === 'noon_aplus') {
            fileName = getNoonAPlusFilename({
              modelNumber,
              productName,
              slotNumber: item.slot ?? i + 1,
              language: item.noonLanguage || 'en',
            });
          } else if (platform === 'amazon') {
            const isMain = item.slot === 1 || item.theme === 'hero';
            fileName = getAmazonImageFilename({
              modelNumber,
              productName,
              slotNumber: item.slot ?? 1,
              secondaryIndex: isMain ? undefined : amazonPtCounter++,
              format: settings.amazonFormat || 'jpeg',
            });
          } else if (platform === 'amazon_aplus') {
            fileName = getAmazonAPlusFilename({
              modelNumber,
              productName,
              aplusType: item.sanfordSlot?.aplusType,
              index: i + 1,
              format: settings.amazonFormat || 'jpeg',
            });
          } else {
            fileName = getSeoImageFilename({
              brand,
              productName,
              modelNumber,
              item,
              index: i + 1,
            });
          }
          zip.file(`${folderName}/${fileName}`, blob);
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

  // 3. Save to phone via navigator.share
  const canShare =
    typeof navigator !== 'undefined' &&
    !!navigator.share &&
    !!navigator.canShare;

  const handleShareToPhone = async () => {
    const targets = generations.filter((g) => g.status === 'done');
    if (targets.length === 0) return;

    const files: File[] = [];
    let ptCount = 1;

    for (let i = 0; i < targets.length; i++) {
      const item = targets[i];
      const blob = await fetchImageBlob(item);
      if (blob) {
        let fileName: string;
        let mime = 'image/webp';
        if (platform === 'noon') {
          fileName = getNoonImageFilename({
            modelNumber,
            productName,
            slotNumber: item.slot ?? 1,
            theme: item.theme,
          });
          mime = 'image/jpeg';
        } else if (platform === 'noon_aplus') {
          fileName = getNoonAPlusFilename({
            modelNumber,
            productName,
            slotNumber: item.slot ?? 1,
            language: item.noonLanguage || 'en',
          });
          mime = 'image/jpeg';
        } else if (isAmazon) {
          const isMain = item.slot === 1 || item.theme === 'hero';
          fileName = getAmazonImageFilename({
            modelNumber,
            productName,
            slotNumber: item.slot ?? 1,
            secondaryIndex: isMain ? undefined : ptCount++,
            format: settings.amazonFormat || 'jpeg',
          });
          mime = settings.amazonFormat === 'png' ? 'image/png' : 'image/jpeg';
        } else {
          fileName = getSeoImageFilename({
            brand,
            productName,
            modelNumber,
            item,
            index: i + 1,
          });
        }
        files.push(new File([blob], fileName, { type: mime }));
      }
    }

    if (files.length > 0 && navigator.canShare({ files })) {
      try {
        await navigator.share({
          files,
          title: `${productName} Listing Images`,
        });
      } catch (err) {
        console.warn('Share sheet cancelled or failed:', err);
      }
    }
  };

  // 4. Save to folder (showDirectoryPicker API)
  const canPickDirectory =
    typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  const handleSaveToFolder = async () => {
    const targets = generations.filter((g) => g.status === 'done');
    if (targets.length === 0) return;

    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker();
      let ptCounter = 1;

      for (let i = 0; i < targets.length; i++) {
        const item = targets[i];
        const blob = await fetchImageBlob(item);
        if (blob) {
          let fileName: string;
          if (platform === 'noon') {
            fileName = getNoonImageFilename({
              modelNumber,
              productName,
              slotNumber: item.slot ?? 1,
              theme: item.theme,
            });
          } else if (platform === 'noon_aplus') {
            fileName = getNoonAPlusFilename({
              modelNumber,
              productName,
              slotNumber: item.slot ?? 1,
              language: item.noonLanguage || 'en',
            });
          } else if (isAmazon) {
            const isMain = item.slot === 1 || item.theme === 'hero';
            fileName = getAmazonImageFilename({
              modelNumber,
              productName,
              slotNumber: item.slot ?? 1,
              secondaryIndex: isMain ? undefined : ptCounter++,
              format: settings.amazonFormat || 'jpeg',
            });
          } else {
            fileName = getSeoImageFilename({
              brand,
              productName,
              modelNumber,
              item,
              index: i + 1,
            });
          }
          const fileHandle = await dirHandle.getFileHandle(fileName, {
            create: true,
          });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Save to folder error:', err);
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
      {/* Platform Selector Segmented Bar */}
      <div className="bg-[#0E131F] border border-slate-800 rounded-[16px] p-2 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-1 tracking-wider">
            Target Platform:
          </span>

          {/* Shopify Button */}
          <button
            type="button"
            onClick={() => onSelectPlatform('shopify')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              platform === 'shopify'
                ? 'bg-[#008060] text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShopifyIcon className="w-4 h-4 shrink-0" />
            <span>Shopify</span>
            {platform === 'shopify' && <Check className="w-3 h-3 stroke-[3]" />}
          </button>

          {/* Amazon Group Button */}
          <div className="inline-flex rounded-xl bg-slate-900/60 p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => onSelectPlatform('amazon')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                platform === 'amazon'
                  ? 'bg-[#FF9900] text-black shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <AmazonIcon className="w-4 h-4 shrink-0" />
              <span>Amazon</span>
              {platform === 'amazon' && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
            <button
              type="button"
              onClick={() => onSelectPlatform('amazon_aplus')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                platform === 'amazon_aplus'
                  ? 'bg-[#FF9900] text-black shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Amazon Enhanced Brand Content"
            >
              <span>A+</span>
            </button>
          </div>

          {/* Noon UAE Group Button */}
          <div className="inline-flex rounded-xl bg-slate-900/60 p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => onSelectPlatform('noon')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                platform === 'noon'
                  ? 'bg-[#FEEE00] text-black shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <NoonIcon className="w-4 h-4 shrink-0" />
              <span>Noon</span>
              {platform === 'noon' && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
            <button
              type="button"
              onClick={() => onSelectPlatform('noon_aplus')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                platform === 'noon_aplus'
                  ? 'bg-[#FEEE00] text-black shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Noon UAE A+ Content (EN & AR)"
            >
              <span>A+</span>
            </button>
          </div>
        </div>

        {/* Right Info Note */}
        {platform === 'noon' ? (
          <div className="flex items-center space-x-2 text-[11px] text-[#FEEE00] bg-[#FEEE00]/10 px-3 py-1 rounded-lg border border-[#FEEE00]/20 font-medium">
            <NoonIcon className="w-3.5 h-3.5" />
            <span>2000 × 2000 px JPEG · 6 Dedicated Angles · Help Center Rules Active</span>
          </div>
        ) : platform === 'noon_aplus' ? (
          <div className="flex items-center space-x-2 text-[11px] text-[#FEEE00] bg-[#FEEE00]/10 px-3 py-1 rounded-lg border border-[#FEEE00]/20 font-medium">
            <NoonIcon className="w-3.5 h-3.5" />
            <span>Noon A+ Content (EN & AR RTL) · 2400px Wide Banners</span>
          </div>
        ) : platform === 'amazon' ? (
          <div className="flex items-center space-x-2 text-[11px] text-amber-300 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 font-medium">
            <AmazonIcon className="w-3.5 h-3.5" />
            <span>2000 × 2000 px JPEG · Amazon Seller Central Compliance Active</span>
          </div>
        ) : platform === 'amazon_aplus' ? (
          <div className="flex items-center space-x-2 text-[11px] text-amber-300 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 font-medium">
            <AmazonIcon className="w-3.5 h-3.5" />
            <span>Amazon Enhanced Brand Content (EBC) Modules</span>
          </div>
        ) : platform === 'shopify' ? (
          <div className="flex items-center space-x-2 text-[11px] text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 font-medium">
            <ShopifyIcon className="w-3.5 h-3.5" />
            <span>WebP Format · Shopify SEO Naming Active</span>
          </div>
        ) : (
          onOpenPlatformModal && (
            <button
              type="button"
              onClick={onOpenPlatformModal}
              className="px-3 py-1 text-xs font-bold bg-[#E11D2E] hover:bg-[#C8102E] text-white rounded-lg transition"
            >
              Choose Channel Now
            </button>
          )
        )}
      </div>

      {/* Unselected Platform Prompt Banner */}
      {!platform && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-red-500/10 to-indigo-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Target E-Commerce Channel Required</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Select whether you are building listing images for <strong>Shopify</strong>, <strong>Amazon</strong>, or <strong>Noon</strong> to apply matching guidelines.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => onSelectPlatform('shopify')}
              className="py-1.5 px-3 rounded-xl bg-[#008060] hover:bg-[#007054] text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow"
            >
              <ShopifyIcon className="w-3.5 h-3.5" />
              <span>Shopify</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectPlatform('amazon')}
              className="py-1.5 px-3 rounded-xl bg-[#FF9900] hover:bg-[#FFAC33] text-black text-xs font-bold flex items-center space-x-1.5 transition shadow"
            >
              <AmazonIcon className="w-3.5 h-3.5" />
              <span>Amazon</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectPlatform('noon')}
              className="py-1.5 px-3 rounded-xl bg-[#FEEE00] hover:bg-[#FFF566] text-black text-xs font-bold flex items-center space-x-1.5 transition shadow"
            >
              <NoonIcon className="w-3.5 h-3.5" />
              <span>Noon</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Toolbar (Action Bar) */}
      <div className="bg-[#0F1B3D] dark:bg-[#0E1118]/80 border border-[#0F1B3D] dark:border-white/[0.06] rounded-[16px] p-3 shadow-[0_1px_3px_rgba(15,27,61,0.06)] dark:shadow-xl flex flex-wrap items-center justify-between gap-2.5 text-white">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Generate Button */}
          <button
            type="button"
            onClick={onGenerateAll}
            disabled={isGeneratingAll || !isReadyToGenerate}
            className="h-[44px] px-5 bg-[#E11D2E] hover:bg-[#C8102E] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs tracking-wide rounded-xl shadow-sm transition-all flex items-center space-x-2 active:scale-[0.98]"
          >
            {isGeneratingAll ? (
              <>
                <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                <span>Generating {completedCount}/{generations.length}...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-white/90" />
                <span>
                  {makePoster && platform === 'shopify'
                    ? `Generate Set (${hasMultipleColors ? 6 : 5} + Poster)`
                    : `Generate ${isNoon ? 6 : hasMultipleColors ? 6 : 5}-Image Set`}
                </span>
              </>
            )}
          </button>

          {/* Validation Error Inline Hint */}
          {!isReadyToGenerate && missingFields.length > 0 && (
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-xl text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
              <span>Missing: {missingFields.join(', ')}</span>
            </div>
          )}

          {/* Also Make A Poster Checkbox (Only relevant for Shopify) */}
          {platform === 'shopify' && (
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
          )}
        </div>

        {/* Batch Actions */}
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
            <span>
              {isNoon
                ? 'ZIP All (Noon JPEG)'
                : isAmazon
                ? (settings.amazonFormat === 'png' ? 'ZIP All (PNG)' : 'ZIP All (Amazon 2000px JPEG)')
                : 'ZIP All (WebP)'}
            </span>
          </button>

          {/* Save to Phone */}
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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureCards.map((item) => {
          const isSlot5Skipped = (platform !== 'noon' && platform !== 'noon_aplus' && item.slot === 5 && !hasMultipleColors) ||
            (platform === 'noon_aplus' && item.slot === 6 && !hasMultipleColors);

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

                {/* Amazon Compliance Status Pill */}
                {isAmazon && item.status === 'done' && (
                  <button
                    type="button"
                    onClick={() => setComplianceModalItem(item)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1 border transition flex-shrink-0 ${
                      item.compliance?.status === 'pass'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : item.compliance?.status === 'review'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                    title="View Amazon Listing Compliance Report"
                  >
                    <AmazonIcon className="w-3 h-3 flex-shrink-0" />
                    <span>{item.compliance?.status === 'pass' ? 'Pass' : 'Review'}</span>
                  </button>
                )}

                {/* Noon UAE Compliance Status Pill */}
                {isNoon && item.status === 'done' && (
                  <button
                    type="button"
                    onClick={() => setNoonComplianceModalItem(item)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 border transition flex-shrink-0 ${
                      item.noonCompliance?.status === 'pass'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : item.noonCompliance?.status === 'review'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                    title="View Noon UAE Seller Compliance Report"
                  >
                    <NoonIcon className="w-3 h-3 flex-shrink-0" />
                    <span>{item.noonCompliance?.score ?? 100}%</span>
                    <span className="uppercase text-[9px]">{item.noonCompliance?.status || 'Pass'}</span>
                  </button>
                )}
              </div>

              {/* Card Canvas / Image Viewport */}
              <div className="aspect-square bg-[#F4F7FC] dark:bg-black/40 relative flex items-center justify-center overflow-hidden border-b border-[#E3E8EF] dark:border-white/[0.06] p-3">
                {isSlot5Skipped && !item.imageUrl ? (
                  <div className="w-full h-full rounded-lg border-[1.5px] border-dashed border-[#CBD5E1] dark:border-white/[0.08] flex flex-col items-center justify-center space-y-2 p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-white/[0.02] border border-[#CBD5E1] dark:border-white/[0.06] flex items-center justify-center text-[var(--muted)] dark:text-slate-500">
                      <Layers className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-[#5B6478] dark:text-slate-300">Single Colour Product</p>
                      <p className="text-[10px] text-[#94A3B8] dark:text-slate-500 max-w-[190px] leading-relaxed">
                        Slot is skipped because there are no multiple colour options.
                      </p>
                    </div>
                  </div>
                ) : item.status === 'pending' ? (
                  <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
                    <div className="animate-spin h-7 w-7 border-2 border-[#0F1B3D] dark:border-indigo-400 border-t-transparent rounded-full" />
                    <p className="text-xs font-medium text-[#0F172A] dark:text-slate-300">
                      Generating {isNoon ? `Noon Image ${item.slot}` : isAmazon ? `Amazon Image ${item.slot}` : `Slot ${item.slot}`}...
                    </p>
                    <p className="text-[10px] text-[#94A3B8] dark:text-slate-500">
                      {isNoon
                        ? 'Applying Noon UAE Seller Help Center Standards'
                        : isAmazon
                        ? 'Enforcing Amazon Seller Central Guidelines'
                        : 'Applying Sharp Sans & BuySanford template'}
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
                      alt={item.slotTitle || `Image ${item.slot}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setZoomImage(item.imageUrl!)}
                        className="p-2 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white rounded-full shadow hover:scale-110 transition"
                        title="Enlarge"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-lg border-[1.5px] border-dashed border-[#CBD5E1] dark:border-white/[0.08] flex flex-col items-center justify-center space-y-2 p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-white/[0.02] border border-[#CBD5E1] dark:border-white/[0.06] flex items-center justify-center text-[var(--muted)] dark:text-slate-500">
                      <ImageIcon className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <p className="text-xs font-medium text-[#94A3B8] dark:text-slate-500">Ready to generate</p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-3 py-2 bg-white dark:bg-white/[0.02] flex items-center justify-between text-xs text-[#5B6478] dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(item)}
                  disabled={item.status !== 'done'}
                  className="py-1 px-2.5 bg-[#F4F7FC] hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-[#5B6478] dark:text-slate-200 rounded-lg border border-[#E3E8EF] dark:border-white/[0.06] transition flex items-center space-x-1"
                  title={isNoon ? 'Download Noon 2000px JPEG' : isAmazon ? 'Download 2000px Amazon JPEG' : 'Download SEO WebP image'}
                >
                  <Download className="w-3 h-3" />
                  <span className="text-[11px] font-medium">
                    {isNoon
                      ? 'JPEG (2000px)'
                      : isAmazon
                      ? (settings.amazonFormat === 'png' ? 'PNG 2000px' : 'JPEG 2000px')
                      : 'WebP'}
                  </span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => !isSlot5Skipped && onRegenerateSlot(item.slot || 1)}
                    disabled={item.status === 'pending' || isGeneratingAll || isSlot5Skipped}
                    className="p-1.5 bg-[#F4F7FC] hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] disabled:opacity-30 text-[#5B6478] dark:text-slate-200 rounded-lg border border-[#E3E8EF] dark:border-white/[0.06] transition flex items-center justify-center shrink-0"
                    title={isSlot5Skipped ? 'Slot is skipped for single colour products' : 'Regenerate card'}
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
                          title: `${item.slotTitle || `Image ${item.slot}`} Prompt`,
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

        {/* Poster Card (Shopify only) */}
        {makePoster && posterCard && platform === 'shopify' && (
          <div
            className={`bg-[#FFFFFF] dark:bg-slate-900 border rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(15,27,61,0.06)] dark:shadow-xl flex flex-col transition-all duration-200 md:col-span-2 lg:col-span-1 ${
              posterCard.selected
                ? 'border-[#0F1B3D] dark:border-indigo-500/80 ring-1 ring-[#0F1B3D] dark:ring-indigo-500/50'
                : 'border-[#E3E8EF] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {/* Header */}
            <div className="px-3.5 py-2.5 bg-white dark:bg-slate-950/70 border-b border-[#E3E8EF] dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <input
                  type="checkbox"
                  checked={!!posterCard.selected}
                  onChange={() => toggleSelectCard(posterCard.id)}
                  className="rounded border-[#E3E8EF] dark:border-slate-700 bg-white dark:bg-slate-950 text-[#0F1B3D] focus:ring-[#0F1B3D] w-3.5 h-3.5"
                />
                <span className="text-xs font-semibold text-[#0F172A] dark:text-white">
                  Marketing Poster (2:3)
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#5B6478] dark:text-slate-400 bg-[#F4F7FC] dark:bg-slate-800 px-1.5 py-0.5 rounded">
                Poster
              </span>
            </div>

            {/* Canvas */}
            <div className="aspect-[2/3] max-h-[380px] bg-[#F4F7FC] dark:bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-[#E3E8EF] dark:border-slate-800 p-3">
              {posterCard.status === 'pending' ? (
                <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
                  <div className="animate-spin h-7 w-7 border-2 border-[#0F1B3D] dark:border-indigo-400 border-t-transparent rounded-full" />
                  <p className="text-xs font-medium text-[#0F172A] dark:text-slate-300">
                    Generating portrait poster...
                  </p>
                </div>
              ) : posterCard.status === 'failed' ? (
                <div className="flex flex-col items-center justify-center space-y-1.5 p-4 text-center">
                  <AlertCircle className="w-6 h-6 text-[var(--error)] dark:text-rose-400" />
                  <p className="text-xs font-medium text-[var(--error)] dark:text-rose-300">Failed</p>
                  <button
                    type="button"
                    onClick={() => onRegenerateSlot('poster')}
                    className="mt-1 text-xs text-[#E11D2E] hover:underline dark:text-indigo-400 dark:hover:text-indigo-300 underline font-semibold"
                  >
                    Retry
                  </button>
                </div>
              ) : posterCard.imageUrl ? (
                <div className="relative w-full h-full group">
                  <img
                    src={posterCard.imageUrl}
                    alt="Poster"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setZoomImage(posterCard.imageUrl!)}
                      className="p-2 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white rounded-full shadow hover:scale-110 transition"
                      title="Enlarge"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full rounded-lg border-[1.5px] border-dashed border-[#CBD5E1] dark:border-slate-800 flex flex-col items-center justify-center space-y-2 p-4 text-center">
                  <ImageIcon className="w-6 h-6 text-[#94A3B8] dark:text-slate-600" />
                  <p className="text-xs font-medium text-[#94A3B8] dark:text-slate-500">Poster Canvas</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 bg-white dark:bg-slate-950/70 flex items-center justify-between text-xs text-[#5B6478] dark:text-slate-400">
              <button
                type="button"
                onClick={() => handleDownloadSingle(posterCard)}
                disabled={posterCard.status !== 'done'}
                className="py-1 px-2.5 bg-[#F4F7FC] hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 text-[#5B6478] dark:text-slate-200 rounded-lg border border-[#E3E8EF] dark:border-slate-700 transition flex items-center space-x-1"
              >
                <Download className="w-3 h-3" />
                <span className="text-[11px] font-medium">WebP</span>
              </button>

              <button
                type="button"
                onClick={() => onRegenerateSlot('poster')}
                disabled={posterCard.status === 'pending' || isGeneratingAll}
                className="p-1.5 bg-[#F4F7FC] hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 text-[#5B6478] dark:text-slate-200 rounded-lg border border-[#E3E8EF] dark:border-slate-700 transition"
                title="Regenerate poster"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Prompt Inspector Modal */}
      {viewingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-[#E3E8EF] dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E8EF] dark:border-slate-800">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center space-x-2">
                <span>{viewingPrompt.title}</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewingPrompt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              <pre className="text-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-[#E3E8EF] dark:border-slate-800 whitespace-pre-wrap font-mono text-slate-700 dark:text-slate-300">
                {viewingPrompt.prompt}
              </pre>
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(viewingPrompt.prompt);
                  setViewingPrompt(null);
                }}
                className="py-1.5 px-4 bg-[#0F1B3D] hover:bg-[#1A2C5B] text-white rounded-lg text-xs font-semibold transition"
              >
                Copy Prompt & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Resolution Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={zoomImage}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain rounded-xl border border-slate-700 shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black/90 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Amazon Listing Compliance Modal */}
      {complianceModalItem && (
        <AmazonComplianceModal
          isOpen={!!complianceModalItem}
          onClose={() => setComplianceModalItem(null)}
          item={complianceModalItem}
          compliance={complianceModalItem.compliance || null}
          productName={productName}
          modelNumber={modelNumber}
        />
      )}

      {/* Noon UAE Listing Compliance Modal */}
      {noonComplianceModalItem && (
        <NoonComplianceModal
          isOpen={!!noonComplianceModalItem}
          onClose={() => setNoonComplianceModalItem(null)}
          item={noonComplianceModalItem}
          compliance={noonComplianceModalItem.noonCompliance || null}
          productName={productName}
          modelNumber={modelNumber}
        />
      )}
    </div>
  );
}
