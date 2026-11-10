import { useState } from 'react';
import { StageBar } from '../components/ui/StageBar';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Textarea';
import {
  Box,
  Download,
  Printer,
  Check,
  Sliders,
  ChevronLeft,
  ChevronRight,
  QrCode,
} from 'lucide-react';

interface PackagingCategory {
  id: string;
  name: string;
  hex: string;
  deep: string;
  exampleSku: string;
}

const CATEGORIES: PackagingCategory[] = [
  { id: 'kitchen', name: 'Kitchen', hex: '#0A8141', deep: '#073E25', exampleSku: 'SF5905GM C' },
  { id: 'grooming', name: 'Grooming', hex: '#2170B4', deep: '#111B25', exampleSku: 'SF9709HC' },
  { id: 'cooling', name: 'Cooling', hex: '#1C82C3', deep: '#0C202F', exampleSku: 'SF965RTF' },
  { id: 'lighting', name: 'Lighting', hex: '#5C2E8E', deep: '#350555', exampleSku: 'SF453EL' },
  { id: 'gold', name: 'Air Cooler Gold', hex: '#D4AC68', deep: '#7A4F00', exampleSku: 'SF8112PAC' },
];

type PanelKey = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';

interface PanelInfo {
  key: PanelKey;
  name: string;
  dimensions: string;
  status: 'approved' | 'review';
}

export function GiftBoxStudio() {
  const [packPiece, setPackPiece] = useState<'giftbox' | 'carton' | 'label' | 'manual'>('giftbox');
  const [stageIndex, setStageIndex] = useState(2); // 0: Brief, 1: Dieline, 2: Artwork, 3: Review, 4: Release
  const [briefCollapsed, setBriefCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [selectedCategory, setSelectedCategory] = useState<PackagingCategory>(CATEGORIES[0]);
  const [activePanelKey, setActivePanelKey] = useState<PanelKey>('front');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const panels: PanelInfo[] = [
    { key: 'top', name: 'Top Flap', dimensions: '310 × 190 mm', status: 'approved' },
    { key: 'left', name: 'Left Profile Panel', dimensions: '190 × 240 mm', status: 'approved' },
    { key: 'front', name: 'Front Hero Panel', dimensions: '310 × 240 mm', status: 'approved' },
    { key: 'right', name: 'Right Feature Panel', dimensions: '190 × 240 mm', status: 'approved' },
    { key: 'back', name: 'Back Specifications Panel', dimensions: '310 × 240 mm', status: 'approved' },
    { key: 'bottom', name: 'Bottom Closure Flap', dimensions: '310 × 190 mm', status: 'review' },
  ];

  const activePanel = panels.find((p) => p.key === activePanelKey) || panels[0];
  const approvedCount = panels.filter((p) => p.status === 'approved').length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-full flex flex-col bg-background text-ink">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 py-2.5 px-4 rounded-xl shadow-lg border border-ok-fg/20 bg-ok-bg text-ok-fg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Pack Piece Tabs */}
      <div className="px-6 py-4 bg-surface border-b border-border flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-[10px] border border-track bg-surface flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            <Box className="w-5 h-5 text-ink" />
          </div>
          <div className="flex flex-col min-w-0 gap-0.5">
            <h1 className="text-lg font-extrabold text-ink m-0 truncate leading-tight">
              SF5905GM C · Mixer Grinder · Gift Box Studio
            </h1>
            <span className="text-xs text-muted truncate">
              Packaging Suite · GCC / UAE · English + Arabic · Owner Packaging Team
            </span>
          </div>
        </div>

        {/* Center: StageBar Stepper */}
        <div className="hidden lg:flex items-center">
          <StageBar
            steps={[
              { id: 'brief', label: 'Brief' },
              { id: 'dieline', label: 'Dieline' },
              { id: 'artwork', label: 'Artwork' },
              { id: 'review', label: 'Review' },
              { id: 'release', label: 'Release' },
            ]}
            currentStepIndex={stageIndex}
            onStepClick={(idx) => setStageIndex(idx)}
          />
        </div>

        {/* Pack Piece Switcher */}
        <div className="flex items-center gap-3">
          <Segmented
            size="sm"
            value={packPiece}
            onChange={(val) => setPackPiece(val as any)}
            options={[
              { value: 'giftbox', label: 'Gift Box' },
              { value: 'carton', label: 'Master Carton' },
              { value: 'label', label: 'Rating Label' },
              { value: 'manual', label: 'User Manual' },
            ]}
          />
          <Button
            variant="primary"
            onClick={() => showToast('Generating production print package for all panels...')}
          >
            <Printer className="w-4 h-4" />
            <span>Generate artwork</span>
          </Button>
        </div>
      </div>

      {/* 3-Column Studio Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch min-w-0 p-4 lg:p-6 gap-6 overflow-x-hidden">
        {/* Left Column: Brief Panel */}
        <aside
          aria-label="Packaging Brief"
          className={`shrink-0 transition-all duration-200 select-none ${
            briefCollapsed ? 'w-12' : 'w-full lg:w-[270px]'
          }`}
        >
          <div className="bg-surface border border-border rounded-card p-4 flex flex-col gap-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-track">
              {!briefCollapsed && (
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-ink" />
                  <h2 className="text-sm font-extrabold text-ink m-0">Box Brief</h2>
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
              <div className="flex flex-col gap-4 text-xs">
                {/* Category Color from BRAND-KIT.json */}
                <div className="flex flex-col gap-2">
                  <span className="text-2xs font-extrabold uppercase tracking-wider text-muted">
                    Category Color (Brand Kit)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`p-2 rounded-xl border flex items-center gap-2 text-left cursor-pointer transition-all ${
                          selectedCategory.id === cat.id
                            ? 'border-ink bg-track shadow-2xs'
                            : 'border-border hover:border-muted bg-surface'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: cat.hex }}
                        />
                        <span className="text-2xs font-extrabold text-ink truncate">
                          {cat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <span className="text-3xs text-muted leading-tight mt-0.5">
                    Kit rule: Category token drives frame, model pill, icon circles, and title bars.
                  </span>
                </div>

                {/* Box Structure & Dieline Specs */}
                <div className="p-3 rounded-xl bg-track/40 border border-border flex flex-col gap-1.5">
                  <span className="text-2xs font-extrabold text-ink uppercase">Box Specifications</span>
                  <div className="flex justify-between">
                    <span className="text-muted">Style:</span>
                    <span className="font-bold text-ink">Tuck End (STE)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Outer Dimensions:</span>
                    <span className="font-bold text-ink">310 × 190 × 240 mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Corner Inset:</span>
                    <span className="font-bold text-ink">13 mm (fronts &gt; 250mm)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Substrate:</span>
                    <span className="font-bold text-ink">350 GSM White SBS Board</span>
                  </div>
                </div>

                {/* Regulatory Checklist */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-2xs font-extrabold uppercase tracking-wider text-muted">
                    Mandatory Package Marks
                  </span>
                  <div className="space-y-1 text-2xs text-ink font-semibold">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-ok-fg" />
                      <span>G-Mark (Gulf Conformity)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-ok-fg" />
                      <span>SASO / ECAS Approved Mark</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-ok-fg" />
                      <span>2 Years Sanford Warranty Seal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-ok-fg" />
                      <span>RoHS Compliant &amp; Recyclable</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center Column: Interactive Dieline Map Canvas */}
        <section aria-label="Dieline Canvas" className="flex-1 min-w-0 flex flex-col gap-4 select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-ink">
                Carton Dieline Map (1:1 Folded Geometry)
              </span>
              <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-track border border-border text-muted">
                3mm Bleed Active
              </span>
            </div>

            {/* View Switcher: 2D Flat vs 3D Preview */}
            <div className="flex items-center gap-2">
              <Segmented
                size="sm"
                value={viewMode}
                onChange={(val) => setViewMode(val as any)}
                options={[
                  { value: '2d', label: 'Flat Dieline (2D)' },
                  { value: '3d', label: '3D Folded Box' },
                ]}
              />
            </div>
          </div>

          {/* Dieline Visualizer Surface */}
          <div className="bg-surface border border-border shadow-card rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center overflow-x-auto min-h-[640px]">
            {viewMode === '2d' ? (
              /* 2D Flat Dieline Unfolded Map */
              <div className="flex flex-col items-center gap-4 py-4 min-w-[700px]">
                {/* Dieline Legend */}
                <div className="flex items-center gap-5 text-2xs font-bold text-muted mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-red-600 inline-block" />
                    <span>Cut Line</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 border-b border-dashed border-blue-600 inline-block" />
                    <span>Fold / Crease</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-cyan-400 inline-block" />
                    <span>3mm Bleed Outset</span>
                  </div>
                </div>

                {/* Top Flap */}
                <div
                  onClick={() => setActivePanelKey('top')}
                  className={`w-[310px] h-[100px] border-2 border-red-500 rounded-t-xl p-3 flex flex-col items-center justify-between cursor-pointer transition-all ${
                    activePanelKey === 'top'
                      ? 'ring-2 ring-ink shadow-md bg-slate-50 dark:bg-slate-900'
                      : 'bg-surface hover:bg-track/30'
                  }`}
                >
                  <span className="text-3xs font-extrabold text-muted uppercase">Top Flap (Closure)</span>
                  <span className="text-xs font-extrabold tracking-wide uppercase text-ink">
                    sanford
                  </span>
                  <span className="text-3xs text-muted">310 × 190 mm</span>
                </div>

                {/* Main 4-Panel Body Sequence (Left, Front, Right, Back, Glue Tab) */}
                <div className="flex items-stretch border-2 border-red-500 rounded-xl overflow-hidden shadow-sm">
                  {/* Glue Tab */}
                  <div className="w-[30px] bg-slate-100 dark:bg-slate-800 border-r border-dashed border-blue-500 flex items-center justify-center">
                    <span className="text-3xs font-bold text-muted -rotate-90 whitespace-nowrap">
                      Glue Tab
                    </span>
                  </div>

                  {/* Left Panel */}
                  <div
                    onClick={() => setActivePanelKey('left')}
                    className={`w-[130px] min-h-[220px] p-3 border-r border-dashed border-blue-500 flex flex-col justify-between cursor-pointer transition-all ${
                      activePanelKey === 'left' ? 'bg-slate-50 dark:bg-slate-900 ring-2 ring-ink' : 'bg-surface hover:bg-track/30'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-3xs font-extrabold text-muted">Left Panel</span>
                      <span className="text-xs font-extrabold text-ink">SF5905GM C</span>
                      <span className="text-3xs text-muted">Features &amp; Specs</span>
                    </div>
                    <div
                      className="w-full h-1.5 rounded-full"
                      style={{ backgroundColor: selectedCategory.hex }}
                    />
                  </div>

                  {/* Front Main Panel */}
                  <div
                    onClick={() => setActivePanelKey('front')}
                    className={`w-[240px] min-h-[220px] p-3 border-r border-dashed border-blue-500 flex flex-col justify-between cursor-pointer transition-all relative ${
                      activePanelKey === 'front' ? 'bg-slate-50 dark:bg-slate-900 ring-2 ring-ink' : 'bg-surface hover:bg-track/30'
                    }`}
                  >
                    {/* Brand Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-ink tracking-tight">sanford</span>
                      <span
                        className="text-3xs font-extrabold text-white px-2 py-0.5 rounded-full shadow-2xs"
                        style={{ backgroundColor: selectedCategory.hex }}
                      >
                        {selectedCategory.name}
                      </span>
                    </div>

                    {/* Product Mock Center */}
                    <div className="flex flex-col items-center my-2">
                      <img
                        src="https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=240&q=80"
                        alt=""
                        className="w-24 h-24 object-contain"
                      />
                      <span className="text-xs font-black tracking-tight text-ink mt-1">
                        750W MIXER GRINDER
                      </span>
                      <span className="text-3xs text-muted font-arabic" dir="rtl">
                        خلاط ومطحنة كهربائية
                      </span>
                    </div>

                    {/* Category frame line */}
                    <div
                      className="w-full h-1.5 rounded-full"
                      style={{ backgroundColor: selectedCategory.hex }}
                    />
                  </div>

                  {/* Right Panel */}
                  <div
                    onClick={() => setActivePanelKey('right')}
                    className={`w-[130px] min-h-[220px] p-3 border-r border-dashed border-blue-500 flex flex-col justify-between cursor-pointer transition-all ${
                      activePanelKey === 'right' ? 'bg-slate-50 dark:bg-slate-900 ring-2 ring-ink' : 'bg-surface hover:bg-track/30'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-3xs font-extrabold text-muted">Right Panel</span>
                      <span className="text-xs font-extrabold text-ink">Included Jars</span>
                      <span className="text-3xs text-muted">1.5L, 1.0L, 0.4L</span>
                    </div>
                    <div
                      className="w-full h-1.5 rounded-full"
                      style={{ backgroundColor: selectedCategory.hex }}
                    />
                  </div>

                  {/* Back Specs Panel */}
                  <div
                    onClick={() => setActivePanelKey('back')}
                    className={`w-[240px] min-h-[220px] p-3 flex flex-col justify-between cursor-pointer transition-all ${
                      activePanelKey === 'back' ? 'bg-slate-50 dark:bg-slate-900 ring-2 ring-ink' : 'bg-surface hover:bg-track/30'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-ink">Technical Data</span>
                        <QrCode className="w-4 h-4 text-ink" />
                      </div>
                      <span className="text-3xs text-muted">220-240V ~ 50/60Hz 750W</span>
                      <span className="text-3xs text-muted">Made in India for Sanford ME</span>
                    </div>

                    {/* EAN-13 Barcode */}
                    <div className="flex flex-col items-center p-1.5 bg-white border border-slate-200 rounded text-black my-1">
                      <div className="h-6 w-32 bg-slate-900 flex items-center justify-center text-white text-3xs font-mono">
                        ||||| | |||| ||| |||||
                      </div>
                      <span className="text-3xs font-mono tracking-widest mt-0.5">
                        6291100590512
                      </span>
                    </div>

                    <div
                      className="w-full h-1.5 rounded-full"
                      style={{ backgroundColor: selectedCategory.hex }}
                    />
                  </div>
                </div>

                {/* Bottom Flap */}
                <div
                  onClick={() => setActivePanelKey('bottom')}
                  className={`w-[310px] h-[90px] border-2 border-red-500 rounded-b-xl p-3 flex flex-col items-center justify-between cursor-pointer transition-all ${
                    activePanelKey === 'bottom'
                      ? 'ring-2 ring-ink shadow-md bg-slate-50 dark:bg-slate-900'
                      : 'bg-surface hover:bg-track/30'
                  }`}
                >
                  <span className="text-3xs font-extrabold text-muted uppercase">Bottom Flap (Tuck)</span>
                  <span className="text-3xs text-muted">Recycling Symbols &amp; SASO Registration</span>
                </div>
              </div>
            ) : (
              /* 3D Folded Box Simulation Mode */
              <div className="flex flex-col items-center justify-center py-12 gap-6">
                <div className="relative w-64 h-72 border-2 border-ink rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden bg-white text-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black tracking-tight">sanford</span>
                    <span
                      className="text-2xs font-extrabold text-white px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: selectedCategory.hex }}
                    >
                      {selectedCategory.name}
                    </span>
                  </div>

                  <div className="flex flex-col items-center my-3">
                    <img
                      src="https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=200&q=80"
                      alt=""
                      className="w-32 h-32 object-contain drop-shadow-xl"
                    />
                    <span className="text-sm font-black text-slate-900 mt-2">SF5905GM C</span>
                    <span className="text-xs text-slate-600">750W Heavy Duty Motor</span>
                  </div>

                  <div
                    className="w-full h-2 rounded-full"
                    style={{ backgroundColor: selectedCategory.hex }}
                  />
                </div>
                <span className="text-xs font-bold text-muted">
                  3D perspective simulation of final printed and folded box
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Panel Inspector */}
        <aside
          aria-label="Panel Inspector"
          className="w-full lg:w-[320px] xl:w-[340px] shrink-0 bg-surface border border-border rounded-card p-5 flex flex-col gap-4 shadow-2xs select-none"
        >
          <div className="flex items-center justify-between pb-3 border-b border-track">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-muted">Active Panel</span>
              <h3 className="text-base font-extrabold text-ink m-0">{activePanel.name}</h3>
            </div>
            <Badge variant={activePanel.status === 'approved' ? 'ok' : 'neutral'}>
              {activePanel.status}
            </Badge>
          </div>

          {/* Technical Specs */}
          <div className="p-3 rounded-xl bg-track/40 border border-border flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Panel Dimensions:</span>
              <span className="font-bold text-ink">{activePanel.dimensions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Bleed Margin:</span>
              <span className="font-bold text-ok-fg">3.0 mm (Standard)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Safe Area Inset:</span>
              <span className="font-bold text-ink">13 mm card inset</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Brand Color Token:</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedCategory.hex }}
                />
                <span className="font-mono text-ink">{selectedCategory.hex}</span>
              </div>
            </div>
          </div>

          {/* Pre-Flight Compliance Checks */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink">Packaging Pre-Flight Checks</span>
            <div className="flex items-center gap-2 text-xs text-ok-fg">
              <Check className="w-4 h-4 shrink-0" />
              <span>Barcode EAN-13 Grade A scan verification</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-ok-fg">
              <Check className="w-4 h-4 shrink-0" />
              <span>Bilingual Arabic text size &ge; 6.5 pt</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-ok-fg">
              <Check className="w-4 h-4 shrink-0" />
              <span>Brand Kit category color token applied</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-ok-fg">
              <Check className="w-4 h-4 shrink-0" />
              <span>G-Mark &amp; SASO logos placed on technical side</span>
            </div>
          </div>

          {/* Revision Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink">Packaging Revision Notes</label>
            <Textarea
              rows={3}
              placeholder="e.g. Expand bleed allowance around top tuck flap..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-track mt-auto">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => showToast('Marked panel for revision')}
            >
              Send back
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => showToast(`Approved ${activePanel.name} for print release!`)}
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
            {approvedCount} of {panels.length} panels verified for print
          </span>
          <span className="text-xs text-muted">· 0 pre-flight warnings</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => showToast('Exporting 1:1 Vector Dieline CAD (PDF + DXF)...')}
          >
            <Download className="w-4 h-4" />
            <span>Export Dieline CAD</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => showToast('Release package dispatched to packaging print house!')}
          >
            <Printer className="w-4 h-4" />
            <span>Release Print Package</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}
