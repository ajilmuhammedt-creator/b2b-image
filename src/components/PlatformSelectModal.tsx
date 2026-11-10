import type { EcommercePlatform } from '../types';
import { Check, ShieldCheck, X } from 'lucide-react';
import { ShopifyIcon, AmazonIcon, NoonIcon } from './PlatformIcons';
import { IconButton } from './ui';

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
      <div className="relative w-full max-w-4xl bg-[#0E131F] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#E11D2E]/20 text-[#E11D2E] border border-[#E11D2E]/40 rounded-full">
                Target Channel
              </span>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Select Target E-Commerce Marketplace</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {productName
                ? `Catalogue extracted for "${productName}". Select target channel to enforce marketplace-specific rules.`
                : 'Select the e-commerce destination to configure image templates, dimensions, and compliance rules.'}
            </p>
          </div>

          {onClose && (
            <IconButton
              aria-label="Close platform selection"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </IconButton>
          )}
        </div>

        {/* 3 Main Marketplace Columns */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Shopify */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative ${
              currentPlatform === 'shopify'
                ? 'bg-slate-900/90 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
            }`}
          >
            {currentPlatform === 'shopify' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}

            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <ShopifyIcon className="w-7 h-7" />
              </div>

              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Shopify</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold uppercase">
                  D2C Store
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                BuySanford brand templates formatted for direct Shopify catalog publishing.
              </p>

              <ul className="mt-4 space-y-2 text-[11px] text-slate-300">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span><strong>Format:</strong> 100% WebP with SEO naming</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span><strong>Lifestyle:</strong> Red corner badge slogan</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span><strong>Infographics:</strong> Circular icons + red banner</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span><strong>Poster:</strong> Optional portrait poster view</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlatform('shopify')}
              className="mt-5 w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center space-x-1 transition shadow"
            >
              <span>Select Shopify</span>
              <span>→</span>
            </button>
          </div>

          {/* Card 2: Amazon */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative ${
              currentPlatform === 'amazon' || currentPlatform === 'amazon_aplus'
                ? 'bg-slate-900/90 border-[#FF9900] shadow-[0_0_20px_rgba(255,153,0,0.15)] ring-1 ring-[#FF9900]'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
            }`}
          >
            {(currentPlatform === 'amazon' || currentPlatform === 'amazon_aplus') && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#FF9900] text-black flex items-center justify-center shadow-md">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}

            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900] flex items-center justify-center mb-3">
                <AmazonIcon className="w-7 h-7" />
              </div>

              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Amazon</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF9900]/20 text-[#FF9900] font-semibold uppercase">
                  Global
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Strict Seller Central compliance for Amazon India and international marketplaces.
              </p>

              <ul className="mt-4 space-y-2 text-[11px] text-slate-300">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] shrink-0" />
                  <span><strong>Resolution:</strong> 2000 × 2000 px JPEG (sRGB)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] shrink-0" />
                  <span><strong>Hero (Slot 1):</strong> Pure white #FFFFFF, 85%+ fill</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] shrink-0" />
                  <span><strong>Lifestyle:</strong> Strict <em>zero-text</em> mandate</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] shrink-0" />
                  <span><strong>Naming:</strong> MODEL.MAIN.jpg + PT01-05</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => onSelectPlatform('amazon')}
                className="w-full py-2 px-3 rounded-xl bg-[#FF9900] hover:bg-[#FFAC33] text-black text-xs font-bold flex items-center justify-center space-x-1 transition shadow"
              >
                <span>Select Amazon Listing</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectPlatform('amazon_aplus')}
                className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition text-center"
              >
                Amazon A+ Content (EBC)
              </button>
            </div>
          </div>

          {/* Card 3: Noon UAE */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative ${
              currentPlatform === 'noon' || currentPlatform === 'noon_aplus'
                ? 'bg-slate-900/90 border-[#FEEE00] shadow-[0_0_20px_rgba(254,238,0,0.15)] ring-1 ring-[#FEEE00]'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
            }`}
          >
            {(currentPlatform === 'noon' || currentPlatform === 'noon_aplus') && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#FEEE00] text-black flex items-center justify-center shadow-md">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}

            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FEEE00]/10 border border-[#FEEE00]/30 flex items-center justify-center mb-3">
                <NoonIcon className="w-7 h-7" />
              </div>

              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Noon</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FEEE00]/20 text-[#FEEE00] font-semibold uppercase">
                  UAE & KSA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Official Noon Seller Help Center sequence: 6 dedicated photographic angles.
              </p>

              <ul className="mt-4 space-y-2 text-[11px] text-slate-300">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FEEE00] shrink-0" />
                  <span><strong>Format:</strong> JPEG only, 2000 × 2000 px, sRGB</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FEEE00] shrink-0" />
                  <span><strong>Angles:</strong> Front, Back, Side, 3/4, Detail, Life</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FEEE00] shrink-0" />
                  <span><strong>Gallery:</strong> <em>Zero text, no warranty or prices</em></span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FEEE00] shrink-0" />
                  <span><strong>Naming:</strong> SKU_NOON_01_MAIN.jpg</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => onSelectPlatform('noon')}
                className="w-full py-2 px-3 rounded-xl bg-[#FEEE00] hover:bg-[#FFF566] text-black text-xs font-bold flex items-center justify-center space-x-1 transition shadow"
              >
                <span>Select Noon Listing</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectPlatform('noon_aplus')}
                className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition text-center"
              >
                Noon A+ Content (EN & AR)
              </button>
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Switch effortlessly between Shopify, Amazon, and Noon anytime from the Studio bar.</span>
          </div>
          <span className="text-slate-500">Sanford AI Generator Engine</span>
        </div>
      </div>
    </div>
  );
}
