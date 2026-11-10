import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Textarea';
import {
  FileText,
  Download,
  Upload,
  Check,
  Plus,
  Sliders,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface FlyerProduct {
  id: string;
  model: string;
  name: string;
  arabicName: string;
  regularPrice: number;
  offerPrice: number;
  specs: string[];
  imageUrl: string;
  status: 'approved' | 'review';
}

export function FlyersStudio() {
  const [briefCollapsed, setBriefCollapsed] = useState(false);
  const [retailer, setRetailer] = useState<'lulu' | 'carrefour' | 'nesto' | 'sanford'>('lulu');
  const [pageFormat] = useState<'a4' | 'a3'>('a4');
  const [gridLayout, setGridLayout] = useState<'2x2' | '3x3' | 'hero_4'>('2x2');
  const [selectedProductId, setSelectedProductId] = useState('p1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [products] = useState<FlyerProduct[]>([
    {
      id: 'p1',
      model: 'SF5905GM C',
      name: '750W Heavy Duty Mixer Grinder',
      arabicName: 'خلاط ومطحنة كهربائية ٧٥٠ واط',
      regularPrice: 229,
      offerPrice: 159,
      specs: ['3 Stainless Steel Jars', '100% Copper Motor', '3 Speed with Pulse'],
      imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=400&q=80',
      status: 'approved',
    },
    {
      id: 'p2',
      model: 'SF6671HFN',
      name: '16" Rechargeable Table Fan',
      arabicName: 'مروحة طاولة قابلة للشحن ١٦ بوصة',
      regularPrice: 179,
      offerPrice: 119,
      specs: ['5 Leaf AS Blade', '12 Hours Battery', 'USB Charging Port'],
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
      status: 'approved',
    },
    {
      id: 'p3',
      model: 'SF9709HC',
      name: 'Professional Hair Clipper',
      arabicName: 'ماكينة حلاقة وتشذيب احترافية',
      regularPrice: 99,
      offerPrice: 69,
      specs: ['Titanium Blade', 'LED Battery Display', 'Cordless Operation'],
      imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80',
      status: 'approved',
    },
    {
      id: 'p4',
      model: 'SF453EL',
      name: 'Rechargeable Emergency Light',
      arabicName: 'كشاف طوارئ ليد قابل للشحن',
      regularPrice: 79,
      offerPrice: 49,
      specs: ['High Brightness LED', 'Solar Input Socket', 'Overcharge Protection'],
      imageUrl: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=80',
      status: 'review',
    },
  ]);

  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const approvedCount = products.filter((p) => p.status === 'approved').length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const retailerName = {
    lulu: 'LuLu Hypermarket',
    carrefour: 'Carrefour UAE',
    nesto: 'Nesto Hypermarket',
    sanford: 'Sanford Flagship Page',
  }[retailer];

  return (
    <div className="min-h-full flex flex-col bg-background text-ink">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 py-2.5 px-4 rounded-xl shadow-lg border border-ok-fg/20 bg-ok-bg text-ok-fg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 bg-surface border-b border-border flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-[10px] border border-track bg-surface flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            <FileText className="w-5 h-5 text-ink" />
          </div>
          <div className="flex flex-col min-w-0 gap-0.5">
            <h1 className="text-lg font-extrabold text-ink m-0 truncate leading-tight">
              National Day Super Sale · {retailerName}
            </h1>
            <span className="text-xs text-muted truncate">
              Retail Flyer Page · Due to Print Nov 28 · Owner Retail Graphic Team
            </span>
          </div>
        </div>

        {/* Center / Layout pickers */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <Segmented
              size="sm"
              value={retailer}
              onChange={(val) => setRetailer(val as any)}
              options={[
                { value: 'lulu', label: 'LuLu' },
                { value: 'carrefour', label: 'Carrefour' },
                { value: 'nesto', label: 'Nesto' },
                { value: 'sanford', label: 'Sanford Own' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Segmented
              size="sm"
              value={gridLayout}
              onChange={(val) => setGridLayout(val as any)}
              options={[
                { value: '2x2', label: '2×2 Featured' },
                { value: '3x3', label: '3×3 Dense' },
                { value: 'hero_4', label: 'Hero + 4' },
              ]}
            />
          </div>
        </div>

        {/* Primary Action Button */}
        <div>
          <Button
            variant="primary"
            onClick={() => showToast('Generating high-resolution CMYK print layout...')}
          >
            <Printer className="w-4 h-4" />
            <span>Generate flyer</span>
          </Button>
        </div>
      </div>

      {/* 3-Column Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch min-w-0 p-4 lg:p-6 gap-6 overflow-x-hidden">
        {/* Left Column: Brief */}
        <aside
          aria-label="Flyer Brief"
          className={`shrink-0 transition-all duration-200 select-none ${
            briefCollapsed ? 'w-12' : 'w-full lg:w-[280px]'
          }`}
        >
          <div className="bg-surface border border-border rounded-card p-4 flex flex-col gap-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-track">
              {!briefCollapsed && (
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-ink" />
                  <h2 className="text-sm font-extrabold text-ink m-0">Flyer Brief</h2>
                </div>
              )}
              <button
                type="button"
                onClick={() => setBriefCollapsed(!briefCollapsed)}
                className="w-7 h-7 rounded-lg hover:bg-track flex items-center justify-center text-muted hover:text-ink cursor-pointer ml-auto"
              >
                {briefCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {!briefCollapsed && (
              <div className="flex flex-col gap-4">
                {/* Retailer Price List Card */}
                <div className="p-3 rounded-xl border border-border bg-track/30 flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-ink">{retailerName} Rate Card</span>
                    <Badge variant="ok" size="sm">Valid</Badge>
                  </div>
                  <span className="text-2xs text-muted">
                    Synced from Excel catalogue · Valid until Dec 04
                  </span>
                  <button
                    type="button"
                    onClick={() => showToast('Import Excel rate sheet')}
                    className="text-2xs font-bold text-ink hover:underline text-left mt-1 cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload updated rate list</span>
                  </button>
                </div>

                {/* Products on page */}
                <div className="flex flex-col gap-2">
                  <span className="text-2xs font-extrabold uppercase tracking-wider text-muted">
                    Products on This Page ({products.length})
                  </span>
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto no-scrollbar">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProductId(p.id)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                          p.id === selectedProductId
                            ? 'bg-track border-ink'
                            : 'bg-surface border-track hover:bg-track/40'
                        }`}
                      >
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="w-10 h-10 object-contain rounded-lg border border-track bg-white p-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-extrabold text-ink block truncate">{p.model}</span>
                          <span className="text-2xs text-muted block truncate">{p.name}</span>
                        </div>
                        <span className="text-xs font-bold text-brand">AED {p.offerPrice}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast('Select product from central inventory')}
                    className="h-10 rounded-xl border border-dashed border-border hover:border-ink hover:bg-track text-xs font-bold text-ink flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add product from catalogue</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center Column: Interactive Flyer Preview */}
        <section aria-label="Flyer Canvas" className="flex-1 min-w-0 flex flex-col gap-4 select-none">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-ink">
              Page Preview · {pageFormat.toUpperCase()} High-Res Print View
            </span>
            <span className="text-xs font-bold text-ok-fg bg-ok-bg px-2.5 py-1 rounded-full border border-ok-fg/20">
              300 DPI CMYK Print Ready
            </span>
          </div>

          {/* A4 Sheet Container */}
          <div className="bg-white border border-border shadow-card rounded-2xl p-6 sm:p-8 flex flex-col max-w-[800px] mx-auto w-full min-h-[760px] text-slate-900 select-none">
            {/* Flyer Header Banner */}
            <div className="rounded-xl overflow-hidden mb-6 bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="bg-white text-red-600 font-extrabold px-3 py-1.5 rounded-lg text-lg tracking-wider">
                  sanford
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-extrabold leading-tight">NATIONAL DAY OFFERS</span>
                  <span className="text-xs font-bold text-amber-200">عروض اليوم الوطني المميزة</span>
                </div>
              </div>
              <div className="bg-black/30 backdrop-blur-xs px-3 py-1 rounded-lg text-xs font-extrabold">
                {retailerName}
              </div>
            </div>

            {/* Product Slots Grid */}
            <div
              className={`grid gap-4 flex-1 ${
                gridLayout === '2x2' ? 'grid-cols-2' : gridLayout === '3x3' ? 'grid-cols-3' : 'grid-cols-2'
              }`}
            >
              {products.map((item) => {
                const isSelected = item.id === selectedProductId;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedProductId(item.id)}
                    className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all relative ${
                      isSelected
                        ? 'ring-2 ring-ink border-transparent bg-slate-50'
                        : 'border-slate-200 hover:border-slate-400 bg-white'
                    }`}
                  >
                    {/* Offer Badge */}
                    <div className="absolute top-2.5 right-2.5 bg-red-600 text-white text-2xs font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                      SAVE {Math.round(((item.regularPrice - item.offerPrice) / item.regularPrice) * 100)}%
                    </div>

                    {/* Image */}
                    <div className="w-full h-32 flex items-center justify-center p-2 mb-2">
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800">{item.model}</span>
                        <span className="text-2xs line-through text-slate-400 font-bold">
                          AED {item.regularPrice}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 leading-tight truncate">
                        {item.name}
                      </span>
                      <span className="text-2xs text-slate-500 font-arabic truncate" dir="rtl">
                        {item.arabicName}
                      </span>

                      {/* Specs */}
                      <ul className="text-3xs text-slate-600 list-disc list-inside mt-1 space-y-0.5">
                        {item.specs.slice(0, 2).map((s, idx) => (
                          <li key={idx} className="truncate">{s}</li>
                        ))}
                      </ul>

                      {/* Big Price Tag */}
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                        <span className="text-3xs font-extrabold text-slate-400 uppercase">Special Price</span>
                        <span className="text-base font-extrabold text-red-600">
                          AED {item.offerPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Flyer Footer */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-2xs text-slate-500">
              <span>Prices inclusive of 5% VAT · Offers valid while stocks last</span>
              <span className="font-bold">Sanford Middle East · Customer Care: 800-SANFORD</span>
            </div>
          </div>
        </section>

        {/* Right Column: Inspector */}
        <aside
          aria-label="Flyer Inspector"
          className="w-full lg:w-[320px] xl:w-[340px] shrink-0 bg-surface border border-border rounded-card p-5 flex flex-col gap-4 shadow-2xs select-none"
        >
          <div className="flex items-center justify-between pb-3 border-b border-track">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-muted">Selected Slot</span>
              <h3 className="text-base font-extrabold text-ink m-0">{activeProduct.model}</h3>
            </div>
            <Badge variant={activeProduct.status === 'approved' ? 'ok' : 'neutral'}>
              {activeProduct.status}
            </Badge>
          </div>

          {/* Pricing Audit */}
          <div className="p-3 rounded-xl bg-track/40 border border-border flex flex-col gap-2 text-xs">
            <span className="text-2xs font-extrabold text-muted uppercase">Retailer Margin & Audit</span>
            <div className="flex justify-between">
              <span className="text-muted">Original Retail:</span>
              <span className="font-bold text-ink">AED {activeProduct.regularPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Promotion Price:</span>
              <span className="font-extrabold text-brand">AED {activeProduct.offerPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Discount Depth:</span>
              <span className="font-bold text-ok-fg">
                {Math.round(((activeProduct.regularPrice - activeProduct.offerPrice) / activeProduct.regularPrice) * 100)}% OFF
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">EAN-13 Barcode:</span>
              <span className="font-mono text-ink">6291100590512</span>
            </div>
          </div>

          {/* Compliance Checks */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink">Print Pre-Flight Checks</span>
            <div className="flex items-center gap-2 text-xs text-ok-fg">
              <Check className="w-4 h-4 shrink-0" />
              <span>Arabic legal font size &ge; 6.5 pt</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-ok-fg">
              <Check className="w-4 h-4 shrink-0" />
              <span>Offer price typography exceeds 1.5&times; original</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-ok-fg">
              <Check className="w-4 h-4 shrink-0" />
              <span>Product cutout resolution &gt; 300 DPI</span>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink">Retailer Notes / Revisions</label>
            <Textarea
              rows={3}
              placeholder="e.g. Ensure LuLu flyer disclaimer is appended to bottom right..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-track mt-auto">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => showToast('Revision requested')}
            >
              Send back
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => showToast(`Approved ${activeProduct.model} for print`)}
            >
              Approve
            </Button>
          </div>
        </aside>
      </div>

      {/* Sticky Delivery Footer */}
      <footer className="sticky bottom-0 z-20 px-6 py-3.5 bg-surface border-t border-border flex flex-wrap items-center justify-between gap-4 select-none shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm font-extrabold text-ink">
            {approvedCount} of {products.length} products verified for print
          </span>
          <span className="text-xs text-muted">· Standard 3mm bleed margin included</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => showToast('Downloading layered print asset package (PDF + INDD)...')}
          >
            <Download className="w-4 h-4" />
            <span>Export Print Package</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => showToast(`Flyer approved and dispatched to ${retailerName} media desk!`)}
          >
            <Printer className="w-4 h-4" />
            <span>Release Print PDF</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}
