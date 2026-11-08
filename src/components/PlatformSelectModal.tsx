import type { EcommercePlatform } from '../types';
import { ShoppingBag, Box, FileText, Check, ShieldCheck, X } from 'lucide-react';

interface PlatformSelectModalProps {
  isOpen: boolean;
  currentPlatform: EcommercePlatform | null;
  onSelectPlatform: (platform: EcommercePlatform) => void;
  onClose?: () => void;
  productName?: string;
}

export function PlatformSelectModal({
  isOpen,
  currentPlatform,
  onSelectPlatform,
  onClose,
  productName,
}: PlatformSelectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0E131F] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#E11D2E]/20 text-[#E11D2E] border border-[#E11D2E]/40 rounded-full">
                Step 2 · Target Channel
              </span>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Select Target E-Commerce Platform</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {productName
                ? `Catalogue extracted for "${productName}". Choose your channel to apply matching image guidelines.`
                : 'Select the e-commerce destination to configure image templates, dimensions, and compliance rules.'}
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Platform Choices */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Shopify */}
          <button
            type="button"
            onClick={() => onSelectPlatform('shopify')}
            className={`text-left p-5 rounded-xl border transition flex flex-col justify-between group relative ${
              currentPlatform === 'shopify'
                ? 'bg-slate-900/90 border-[#E11D2E] shadow-[0_0_20px_rgba(225,29,46,0.15)] ring-1 ring-[#E11D2E]'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
            }`}
          >
            {currentPlatform === 'shopify' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#E11D2E] text-white flex items-center justify-center shadow-md">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}

            <div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center space-x-2">
                <span>Shopify / BuySanford</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Standard BuySanford brand format optimized for Shopify storefronts and direct-to-consumer websites.
              </p>

              <ul className="mt-4 space-y-2 text-[11px] text-slate-300">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span><strong>Format:</strong> 100% WebP with Shopify SEO folder structure</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span><strong>Lifestyle:</strong> Top-right solid red corner badge branding</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span><strong>Slot 6:</strong> Dimension lines with full warranty banner</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span><strong>Poster:</strong> Optional 1024×1536 promotional portrait poster</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Apply Shopify Template</span>
              <span className="text-base leading-none">→</span>
            </div>
          </button>

          {/* Option 2: Amazon Listing Images */}
          <button
            type="button"
            onClick={() => onSelectPlatform('amazon')}
            className={`text-left p-5 rounded-xl border transition flex flex-col justify-between group relative ${
              currentPlatform === 'amazon'
                ? 'bg-slate-900/90 border-[#E11D2E] shadow-[0_0_20px_rgba(225,29,46,0.15)] ring-1 ring-[#E11D2E]'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
            }`}
          >
            {currentPlatform === 'amazon' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#E11D2E] text-white flex items-center justify-center shadow-md">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}

            <div>
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors flex items-center space-x-2">
                <span>Amazon Listing Images</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
                  Official Rules
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Strict adherence to Amazon India and Global Seller Central technical and content image standards.
              </p>

              <ul className="mt-4 space-y-2 text-[11px] text-slate-300">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span><strong>Resolution:</strong> 2000 × 2000 px High-Res JPEG / PNG (1:1 zoom)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span><strong>Main Image:</strong> Pure #FFFFFF white background, 85%+ coverage, no text</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span><strong>Lifestyle:</strong> Photorealistic in-use context with <em>zero text overlays</em></span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span><strong>Naming & Check:</strong> MODEL.MAIN.jpg + Amazon Compliance Engine</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>Apply Amazon Template</span>
              <span className="text-base leading-none">→</span>
            </div>
          </button>
        </div>

        {/* Secondary: Amazon A+ Content */}
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={() => onSelectPlatform('amazon_aplus')}
            className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between group ${
              currentPlatform === 'amazon_aplus'
                ? 'bg-slate-900/90 border-[#E11D2E] shadow-sm'
                : 'bg-slate-900/20 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Amazon A+ Content (Enhanced Brand Content)
                  </h4>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold uppercase">
                    EBC Modules
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Generate rich storytelling modules: 970×300 standard headers, 1464×600 premium hero banners, and technical deep-dives.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 flex-shrink-0 pl-3">
              <span>Switch to A+</span>
              <span>→</span>
            </div>
          </button>
        </div>

        {/* Footer info note */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>You can toggle between Shopify and Amazon anytime at the top of the Studio.</span>
          </div>
          <span className="text-slate-500">Sanford AI Generator Engine</span>
        </div>
      </div>
    </div>
  );
}
