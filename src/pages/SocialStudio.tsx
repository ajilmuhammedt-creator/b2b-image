import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StageBar } from '../components/ui/StageBar';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Textarea } from '../components/ui/Textarea';
import { Segmented } from '../components/ui/Segmented';
import { Badge } from '../components/ui/Badge';
import {
  Sparkles,
  Download,
  Calendar,
  Check,
  Copy,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Eye,
  Smartphone,
} from 'lucide-react';

interface SocialFormat {
  id: string;
  name: string;
  platform: 'instagram' | 'facebook' | 'whatsapp' | 'tiktok';
  aspect: string;
  dimensions: string;
  enabled: boolean;
  status: 'draft' | 'pending' | 'review' | 'approved';
  previewImg: string;
}

export function SocialStudio() {
  const [stageIndex, setStageIndex] = useState(2); // 0: Brief, 1: Generate, 2: Review, 3: Schedule
  const [briefCollapsed, setBriefCollapsed] = useState(false);
  const [selectedFormatId, setSelectedFormatId] = useState('ig_post');
  const [showSafeAreas, setShowSafeAreas] = useState(true);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Brief Inputs
  const [headline, setHeadline] = useState('Rechargeable Table Fan');
  const [supportingLine, setSupportingLine] = useState('Type-C fast charging · 9 speeds · 12H battery backup');
  const [language, setLanguage] = useState<'en' | 'ar' | 'dual'>('dual');
  const [cta, setCta] = useState('Shop at Sanford Stores & Online');

  // Formats list
  const [formats, setFormats] = useState<SocialFormat[]>([
    {
      id: 'ig_post',
      name: 'Instagram Post',
      platform: 'instagram',
      aspect: '4:5',
      dimensions: '1080 × 1350 px',
      enabled: true,
      status: 'approved',
      previewImg: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'ig_story',
      name: 'Instagram Story / Reel',
      platform: 'instagram',
      aspect: '9:16',
      dimensions: '1080 × 1920 px',
      enabled: true,
      status: 'approved',
      previewImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'wa_status',
      name: 'WhatsApp Status',
      platform: 'whatsapp',
      aspect: '9:16',
      dimensions: '1080 × 1920 px',
      enabled: true,
      status: 'approved',
      previewImg: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'fb_post',
      name: 'Facebook Feed Post',
      platform: 'facebook',
      aspect: '1.91:1',
      dimensions: '1200 × 628 px',
      enabled: false,
      status: 'review',
      previewImg: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'tiktok_cover',
      name: 'TikTok Video Cover',
      platform: 'tiktok',
      aspect: '9:16',
      dimensions: '1080 × 1920 px',
      enabled: false,
      status: 'draft',
      previewImg: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80',
    },
  ]);

  const activeFormat = formats.find((f) => f.id === selectedFormatId) || formats[0];
  const activeCount = formats.filter((f) => f.enabled).length;
  const approvedCount = formats.filter((f) => f.enabled && f.status === 'approved').length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleFormat = (id: string) => {
    setFormats((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const handleApprove = (id: string) => {
    setFormats((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'approved' } : f))
    );
    showToast(`Approved ${activeFormat.name}!`);
  };

  const handleSendBack = (id: string) => {
    setFormats((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'review' } : f))
    );
    showToast(`Revision requested for ${activeFormat.name}`);
  };

  const handleCopyCaption = () => {
    const text = `${headline}\n${supportingLine}\n\n${cta}\n\n#SanfordAppliances #SmartLiving #StayCool #HomeEssentials #SanfordMiddleEast`;
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  return (
    <div className="min-h-full flex flex-col bg-background text-ink">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 py-2.5 px-4 rounded-xl shadow-lg border border-ok-fg/20 bg-ok-bg text-ok-fg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Studio Header */}
      <div className="px-6 py-4 bg-surface border-b border-border flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-[10px] border border-track bg-surface flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            <Smartphone className="w-5 h-5 text-ink" />
          </div>
          <div className="flex flex-col min-w-0 gap-0.5">
            <h1 className="text-lg font-extrabold text-ink m-0 truncate leading-tight">
              SF6671HFN · Social Campaign Suite
            </h1>
            <span className="text-xs text-muted truncate">
              Instagram, WhatsApp, Facebook & TikTok · Owner Social Media Team
            </span>
          </div>
        </div>

        {/* Center: StageBar Stepper */}
        <div className="hidden md:flex items-center">
          <StageBar
            steps={[
              { id: 'brief', label: 'Brief' },
              { id: 'generate', label: 'Generate' },
              { id: 'review', label: 'Review' },
              { id: 'schedule', label: 'Schedule' },
            ]}
            currentStepIndex={stageIndex}
            onStepClick={(idx) => setStageIndex(idx)}
          />
        </div>

        {/* Right: Primary Action Button in Red */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => showToast('Generating creative variants for selected social channels...')}
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate set</span>
          </Button>
        </div>
      </div>

      {/* 3-Column Studio Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch min-w-0 p-4 lg:p-6 gap-6 overflow-x-hidden">
        {/* Left Column: Brief Panel */}
        <aside
          aria-label="Social Brief"
          className={`shrink-0 transition-all duration-200 select-none ${
            briefCollapsed ? 'w-12' : 'w-full lg:w-[270px]'
          }`}
        >
          <div className="bg-surface border border-border rounded-card p-4 flex flex-col gap-4 shadow-2xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-track">
              {!briefCollapsed && (
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-ink" />
                  <h2 className="text-sm font-extrabold text-ink m-0">Campaign Brief</h2>
                </div>
              )}
              <button
                type="button"
                onClick={() => setBriefCollapsed(!briefCollapsed)}
                className="w-7 h-7 rounded-lg hover:bg-track flex items-center justify-center text-muted hover:text-ink cursor-pointer ml-auto"
                title={briefCollapsed ? 'Expand Brief' : 'Collapse Brief'}
              >
                {briefCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {!briefCollapsed && (
              <div className="flex flex-col gap-4">
                {/* Formats Checkbox List */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-2xs font-extrabold uppercase tracking-wider text-muted">
                    Target Formats
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {formats.map((f) => (
                      <label
                        key={f.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-track hover:bg-track/40 cursor-pointer text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={f.enabled}
                            onChange={() => handleToggleFormat(f.id)}
                            className="w-4 h-4 accent-ink rounded"
                          />
                          <span className="font-bold text-ink">{f.name}</span>
                        </div>
                        <span className="text-2xs font-semibold text-muted bg-track px-1.5 py-0.5 rounded">
                          {f.aspect}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Copy Inputs */}
                <div className="flex flex-col gap-3">
                  <div>
                    <Field
                      label="Headline"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                    />
                  </div>
                  <div>
                    <Field
                      label="Supporting Line"
                      value={supportingLine}
                      onChange={(e) => setSupportingLine(e.target.value)}
                    />
                  </div>
                  <div>
                    <Field
                      label="Call to Action (CTA)"
                      value={cta}
                      onChange={(e) => setCta(e.target.value)}
                    />
                  </div>
                </div>

                {/* Language Switcher */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-2xs font-extrabold uppercase tracking-wider text-muted">
                    Language
                  </span>
                  <Segmented
                    size="sm"
                    value={language}
                    onChange={(val) => setLanguage(val as any)}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'ar', label: 'Arabic' },
                      { value: 'dual', label: 'Dual (EN+AR)' },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center Column: Canvas Grid */}
        <section aria-label="Social Canvas" className="flex-1 min-w-0 flex flex-col gap-4 select-none">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-9 px-3.5 rounded-full text-xs font-bold bg-ink text-white flex items-center">
                All {activeCount}
              </span>
              <span className="h-9 px-3.5 rounded-full text-xs font-semibold bg-surface border border-border text-ink flex items-center">
                Approved {approvedCount}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSafeAreas(!showSafeAreas)}
                className={`h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  showSafeAreas
                    ? 'border-ink bg-track text-ink'
                    : 'border-border bg-surface text-muted hover:text-ink'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Safe Zones {showSafeAreas ? 'On' : 'Off'}</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {formats
              .filter((f) => f.enabled)
              .map((item) => {
                const isSelected = item.id === selectedFormatId;
                const isStoryAspect = item.aspect === '9:16';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedFormatId(item.id)}
                    className={`bg-surface border rounded-card overflow-hidden flex flex-col cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'ring-2 ring-ink border-transparent shadow-card'
                        : 'border-border hover:border-muted hover:shadow-2xs'
                    }`}
                  >
                    {/* Image Area with Dynamic Aspect Ratio */}
                    <div
                      className={`relative bg-surface overflow-hidden flex items-center justify-center border-b border-border ${
                        isStoryAspect ? 'aspect-[9/16] max-h-[360px]' : 'aspect-[4/5] max-h-[320px]'
                      }`}
                    >
                      <img
                        src={item.previewImg}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Mock Social Overlay Elements */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-4 flex flex-col justify-between text-white pointer-events-none">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold tracking-wide uppercase">Sanford</span>
                          <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                            {item.aspect}
                          </span>
                        </div>

                        {/* Safe Area Guideline Lines */}
                        {showSafeAreas && isStoryAspect && (
                          <div className="absolute inset-x-4 top-14 bottom-14 border border-dashed border-cyan-400/50 pointer-events-none rounded flex items-center justify-center">
                            <span className="text-2xs font-bold bg-cyan-900/60 text-cyan-200 px-2 py-0.5 rounded">
                              Safe Area
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-extrabold leading-tight drop-shadow-md">
                            {headline}
                          </span>
                          <span className="text-2xs text-white/90 drop-shadow-sm">
                            {supportingLine}
                          </span>
                          <span className="mt-1 text-2xs font-extrabold bg-brand text-white px-2.5 py-1 rounded-full w-fit">
                            {cta}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-2.5 left-2.5 pointer-events-none">
                        <Badge
                          variant={item.status === 'approved' ? 'ok' : 'neutral'}
                        >
                          {item.status === 'approved' ? 'Approved' : 'In review'}
                        </Badge>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-ink">{item.name}</span>
                        <span className="text-2xs text-muted">{item.dimensions}</span>
                      </div>
                      <span className="text-2xs font-bold text-muted bg-track px-2 py-1 rounded">
                        {item.aspect}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Right Column: Inspector */}
        <aside
          aria-label="Social Inspector"
          className="w-full lg:w-[320px] xl:w-[340px] shrink-0 bg-surface border border-border rounded-card p-5 flex flex-col gap-4 shadow-2xs select-none"
        >
          <div className="flex items-center justify-between pb-3 border-b border-track">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-muted">Active Channel</span>
              <h3 className="text-base font-extrabold text-ink m-0">{activeFormat.name}</h3>
            </div>
            <Badge variant={activeFormat.status === 'approved' ? 'ok' : 'neutral'}>
              {activeFormat.status}
            </Badge>
          </div>

          {/* Technical Specs */}
          <div className="p-3 rounded-xl bg-track/40 border border-border flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Resolution:</span>
              <span className="font-bold text-ink">{activeFormat.dimensions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Aspect Ratio:</span>
              <span className="font-bold text-ink">{activeFormat.aspect}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Safe Zones:</span>
              <span className="font-bold text-ok-fg">Cleared (100% visible)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Contrast Ratio:</span>
              <span className="font-bold text-ok-fg">6.8:1 (WCAG AAA)</span>
            </div>
          </div>

          {/* Marketing Copy & Caption Generator */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-ink">Post Caption & Hashtags</span>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="text-2xs font-bold text-ink hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedCaption ? <Check className="w-3 h-3 text-ok-fg" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCaption ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3 rounded-xl border border-border bg-surface text-xs leading-relaxed text-ink font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
              {headline}
              {'\n'}
              {supportingLine}
              {'\n\n'}
              {cta}
              {'\n\n'}
              #SanfordAppliances #SmartLiving #StayCool #HomeEssentials #SanfordMiddleEast
            </div>
          </div>

          {/* Change Request Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink">Change Request / Notes</label>
            <Textarea
              rows={3}
              placeholder="e.g. Brighten background tone, shift logo higher for story cutout"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-track mt-auto">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => handleSendBack(activeFormat.id)}
            >
              Send back
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => handleApprove(activeFormat.id)}
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
            {approvedCount} of {activeCount} formats approved
          </span>
          <span className="text-xs text-muted">· Ready for social publishing</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => showToast('Downloading social campaign ZIP (PNG + copy)...')}
          >
            <Download className="w-4 h-4" />
            <span>Download ZIP</span>
          </Button>
          <Link to="/calendar">
            <Button variant="primary">
              <Calendar className="w-4 h-4" />
              <span>Schedule to Campaign Calendar</span>
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
