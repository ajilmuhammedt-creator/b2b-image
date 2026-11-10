import { useState } from 'react';
import { Button } from '../components/ui/Button';
import {
  ShieldCheck,
  Check,
  Upload,
} from 'lucide-react';

export function BrandKitLibrary() {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'marks'>('colors');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const categories = [
    {
      name: 'Kitchen',
      hex: '#0A8141',
      deep: '#073E25',
      use: 'Mixer grinders, blenders, kettles, sandwich makers',
      contrast: '5.0:1 (WCAG AA OK)',
      rule: 'Aa white text on category banner',
      sampleSku: 'SF5901GM, SF5905GM C',
    },
    {
      name: 'Grooming & Personal Care',
      hex: '#2170B4',
      deep: '#111B25',
      use: 'Hair clippers, beard trimmers, hair dryers',
      contrast: '5.2:1 (WCAG AA OK)',
      rule: 'Aa white text on category banner',
      sampleSku: 'SF9709HC',
    },
    {
      name: 'Cooling & Ventilation',
      hex: '#1C82C3',
      deep: '#0C202F',
      use: 'Rechargeable table fans, box fans, stand fans',
      contrast: '4.17:1 (Large text or bold 19pt+ only)',
      rule: 'Bold white text on category banner',
      sampleSku: 'SF965RTF, SF6671HFN',
    },
    {
      name: 'Lighting & Lanterns',
      hex: '#5C2E8E',
      deep: '#350555',
      use: 'Emergency lights, solar lanterns, LED torches',
      contrast: '9.4:1 (WCAG AAA OK)',
      rule: 'Aa crisp white text on category banner',
      sampleSku: 'SF453EL',
    },
    {
      name: 'Air Cooler Gold',
      hex: '#D4AC68',
      deep: '#7A4F00',
      use: 'Desert air coolers, luxury tower models',
      contrast: '2.1:1 (White text FAILS)',
      rule: 'Set text in solid #000000 ink only',
      sampleSku: 'SF8112PAC',
    },
  ];

  const typography = [
    {
      role: 'Headlines & Model Names',
      printFace: 'Sharp Sans Bold',
      screenStandIn: 'Montserrat (900)',
      use: 'Product names, feature badges, specifications tables',
      sample: '750W MIXER GRINDER',
    },
    {
      role: 'Speed & Wattage Numerals',
      printFace: 'HighSpeed Regular',
      screenStandIn: 'Racing Sans One',
      use: 'Front wattage pill, RPM callouts, blade speeds',
      sample: '750W · 20000 RPM',
    },
    {
      role: 'Warranty & Ribbon Badges',
      printFace: 'Bebas Neue',
      screenStandIn: 'Bebas Neue',
      use: 'SANFORD WARRANTY & JAPANESE TECHNOLOGY seals',
      sample: '2 YEARS WARRANTY',
    },
    {
      role: 'Arabic Product Title',
      printFace: 'AraHamah 1964 Bold',
      screenStandIn: 'Noto Kufi Arabic (Bold)',
      use: 'Arabic front hero title & marketing banners',
      sample: 'خلاط ومطحنة كهربائية ٧٥٠ واط',
    },
    {
      role: 'Arabic Technical Bullets',
      printFace: 'GE SS Text Medium',
      screenStandIn: 'Noto Kufi Arabic (Regular)',
      use: 'Arabic specifications bullets & user manuals (min 6.5 pt)',
      sample: 'محرك نحاسي ١٠٠٪ مع حماية من الحرارة الزائدة',
    },
    {
      role: 'Regulatory & Legal Text',
      printFace: 'Century Gothic',
      screenStandIn: 'Montserrat (Medium)',
      use: 'Rating label specifications, disposal notes (min 5.5 pt)',
      sample: '220-240V ~ 50/60Hz 750W Made in India',
    },
  ];

  return (
    <div className="min-h-full flex flex-col bg-background text-ink p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-6 select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 py-2.5 px-4 rounded-xl shadow-lg border border-ok-fg/20 bg-ok-bg text-ok-fg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-ink m-0 tracking-tight">
            Brand &amp; Packaging Kit
          </h1>
          <p className="text-xs text-muted m-0">
            Edition November 2026 · GCC / UAE · Imported from{' '}
            <code className="text-brand font-mono font-bold">Sanford-Brand-Packaging-Kit.pdf</code>.
            Every packaging pre-flight check reads from here.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => showToast('Importing updated Brand Kit PDF...')}
        >
          <Upload className="w-4 h-4 mr-2" />
          <span>Import new edition</span>
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-track text-sm">
        <button
          type="button"
          onClick={() => setActiveTab('colors')}
          className={`py-2.5 font-extrabold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'colors'
              ? 'border-ink text-ink'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Category Colours
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('typography')}
          className={`py-2.5 font-extrabold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'typography'
              ? 'border-ink text-ink'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Typography &amp; Fonts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('spacing')}
          className={`py-2.5 font-extrabold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'spacing'
              ? 'border-ink text-ink'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Dieline Spacing Rules
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('marks')}
          className={`py-2.5 font-extrabold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'marks'
              ? 'border-ink text-ink'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Regulatory Marks
        </button>
      </div>

      {/* Tab 1: Category Colours */}
      {activeTab === 'colors' && (
        <div className="flex flex-col gap-6">
          <div className="p-4 rounded-xl bg-surface border border-border shadow-2xs flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-brand shrink-0" />
            <span className="text-xs text-ink leading-relaxed">
              <strong>Kit Rule:</strong> Color is set by <strong>category</strong>, not by individual
              product. One category color token drives the outer frame, model pill, icon circles,
              size tab, and title bars.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((c) => (
              <div
                key={c.name}
                className="bg-surface border border-border rounded-card overflow-hidden shadow-2xs flex flex-col"
              >
                {/* Visual Swatch */}
                <div
                  className="h-28 p-4 flex flex-col justify-between"
                  style={{ backgroundColor: c.hex }}
                >
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/20 text-white w-fit">
                    {c.hex}
                  </span>
                  <span
                    className={`text-base font-black ${
                      c.name.includes('Gold') ? 'text-black' : 'text-white'
                    }`}
                  >
                    {c.rule}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-extrabold text-ink m-0">{c.name}</h3>
                    <span className="font-mono text-2xs text-muted">Deep: {c.deep}</span>
                  </div>
                  <p className="text-muted m-0 leading-relaxed text-2xs">{c.use}</p>
                  <div className="pt-2 border-t border-track flex items-center justify-between text-2xs">
                    <span className="text-muted">Contrast:</span>
                    <span className="font-bold text-ink">{c.contrast}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Universal Accents */}
          <div className="bg-surface border border-border rounded-card p-5 shadow-2xs flex flex-col gap-3">
            <h3 className="text-sm font-extrabold text-ink m-0">Universal Accent Tokens</h3>
            <div className="flex flex-wrap gap-2.5">
              <span className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-bold flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FFF000] border border-black/20" />
                <span>Power Yellow · #FFF000</span>
              </span>
              <span className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-bold flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#F68725]" />
                <span>RPM Orange · #F68725</span>
              </span>
              <span className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-bold flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#E71D28]" />
                <span>RPM Red · #E71D28</span>
              </span>
              <span className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-bold flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#1C75BC]" />
                <span>Warranty Blue · #1C75BC</span>
              </span>
              <span className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-bold flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#ED1F24]" />
                <span>Warranty Red · #ED1F24</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Typography */}
      {activeTab === 'typography' && (
        <div className="bg-surface border border-border rounded-card overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-track/50 text-muted uppercase text-3xs font-extrabold border-b border-track">
              <tr>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Print Licensed Face</th>
                <th className="py-3 px-4">Screen Stand-In</th>
                <th className="py-3 px-4">Visual Sample</th>
                <th className="py-3 px-4">Usage Specification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-track">
              {typography.map((t) => (
                <tr key={t.role} className="hover:bg-track/20 transition-colors">
                  <td className="py-3 px-4 font-bold text-ink">{t.role}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-brand">{t.printFace}</td>
                  <td className="py-3 px-4 text-muted">{t.screenStandIn}</td>
                  <td className="py-3 px-4 font-extrabold text-ink">{t.sample}</td>
                  <td className="py-3 px-4 text-muted text-2xs">{t.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Spacing & Margins */}
      {activeTab === 'spacing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-card p-5 shadow-2xs flex flex-col gap-3">
            <h3 className="text-sm font-extrabold text-ink m-0">Dieline Margin Rules (mm)</h3>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-track/30 border border-track">
                <span className="font-bold text-ink">Bleed Margin</span>
                <span className="font-mono font-bold text-brand">3.0 mm</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-track/30 border border-track">
                <span className="font-bold text-ink">Safe Zone Inset</span>
                <span className="font-mono font-bold text-brand">3.0 mm</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-track/30 border border-track">
                <span className="font-bold text-ink">Corner Inset (Front &lt; 100mm)</span>
                <span className="font-mono font-bold text-brand">3.0 mm</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-track/30 border border-track">
                <span className="font-bold text-ink">Corner Inset (Front 100–250mm)</span>
                <span className="font-mono font-bold text-brand">6.0 mm</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-track/30 border border-track">
                <span className="font-bold text-ink">Corner Inset (Front &gt; 250mm)</span>
                <span className="font-mono font-bold text-brand">13.0 mm</span>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-card p-5 shadow-2xs flex flex-col gap-3">
            <h3 className="text-sm font-extrabold text-ink m-0">Minimum Type Size Limits (pt)</h3>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-track/30 border border-track">
                <span className="font-bold text-ink">Legal Disclaimer Paragraph</span>
                <span className="font-mono font-bold text-ok-fg">5.5 pt min</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-track/30 border border-track">
                <span className="font-bold text-ink">Arabic Typography Anywhere</span>
                <span className="font-mono font-bold text-ok-fg">6.5 pt min</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-track/30 border border-track">
                <span className="font-bold text-ink">Technical Rating Label Text</span>
                <span className="font-mono font-bold text-ok-fg">7.0 pt min</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-track/30 border border-track">
                <span className="font-bold text-ink">Corrugated Master Carton (Positive)</span>
                <span className="font-mono font-bold text-ok-fg">8.0 pt min</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-track/30 border border-track">
                <span className="font-bold text-ink">Corrugated Master Carton (Reversed)</span>
                <span className="font-mono font-bold text-ok-fg">10.0 pt min</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Regulatory Marks */}
      {activeTab === 'marks' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-card bg-surface border border-border flex flex-col items-center text-center gap-2 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-track flex items-center justify-center text-ink font-black text-lg border border-track">
              G
            </div>
            <span className="text-xs font-extrabold text-ink">G-Mark</span>
            <span className="text-2xs text-muted">Gulf Conformity Tracking Symbol</span>
          </div>

          <div className="p-4 rounded-card bg-surface border border-border flex flex-col items-center text-center gap-2 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-track flex items-center justify-center text-ink font-black text-sm border border-track">
              SASO
            </div>
            <span className="text-xs font-extrabold text-ink">SASO Quality</span>
            <span className="text-2xs text-muted">Saudi Standards, Metrology and Quality</span>
          </div>

          <div className="p-4 rounded-card bg-surface border border-border flex flex-col items-center text-center gap-2 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-track flex items-center justify-center text-ink font-black text-lg border border-track">
              CE
            </div>
            <span className="text-xs font-extrabold text-ink">CE Conformity</span>
            <span className="text-2xs text-muted">European Health &amp; Safety Standard</span>
          </div>

          <div className="p-4 rounded-card bg-surface border border-border flex flex-col items-center text-center gap-2 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-track flex items-center justify-center text-ink font-black text-sm border border-track">
              RoHS
            </div>
            <span className="text-xs font-extrabold text-ink">RoHS Restriction</span>
            <span className="text-2xs text-muted">Restriction of Hazardous Substances</span>
          </div>
        </div>
      )}
    </div>
  );
}
