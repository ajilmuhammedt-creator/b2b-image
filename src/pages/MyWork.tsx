import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Textarea';
import {
  Check,
  ExternalLink,
} from 'lucide-react';

interface WorkItem {
  id: string;
  sku: string;
  title: string;
  studio: 'ecommerce' | 'social' | 'packaging' | 'flyers';
  studioName: string;
  submitter: string;
  submitterInitials: string;
  dueText: string;
  isUrgent: boolean;
  status: 'pending' | 'approved' | 'rejected';
  imageUrl: string;
  comment: string;
  checks: { label: string; pass: boolean }[];
}

export function MyWork() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'waiting' | 'submitted' | 'completed'>('waiting');
  const [selectedId, setSelectedId] = useState('w1');
  const [reviewNote, setReviewNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [items, setItems] = useState<WorkItem[]>([
    {
      id: 'w1',
      sku: 'SF935HFN',
      title: 'Slot 1 (Hero) · Pure White Studio Cutout',
      studio: 'ecommerce',
      studioName: 'Amazon Seller Central',
      submitter: 'Sarah Chen · Marketplace Exec',
      submitterInitials: 'SC',
      dueText: 'Due today',
      isUrgent: true,
      status: 'pending',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
      comment: 'Amazon hero image following the 85% fill rule on pure white background. Please verify lighting and absence of packaging.',
      checks: [
        { label: '2000 × 2000 px resolution', pass: true },
        { label: 'Pure white #FFFFFF background', pass: true },
        { label: 'Product occupies 88% frame', pass: true },
        { label: 'Zero badges or text overlays', pass: true },
      ],
    },
    {
      id: 'w2',
      sku: 'SF5905GM C',
      title: 'Front & Back Panels Dieline Verification',
      studio: 'packaging',
      studioName: 'Gift Box Studio',
      submitter: 'Faisal Al-Kuwari · Packaging QA',
      submitterInitials: 'FA',
      dueText: 'Due 4:00 PM',
      isUrgent: true,
      status: 'pending',
      imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=80',
      comment: 'Updated barcode EAN-13 to 6291100590512 and verified Arabic font sizing above 6.5 pt.',
      checks: [
        { label: '3mm bleed margin respected', pass: true },
        { label: 'Kitchen green #0A8141 token applied', pass: true },
        { label: 'Barcode Grade A verification', pass: true },
      ],
    },
    {
      id: 'w3',
      sku: 'SF6671HFN',
      title: 'Instagram Post & Story Creative Set',
      studio: 'social',
      studioName: 'Social Media Studio',
      submitter: 'Ananya Sharma · Content Lead',
      submitterInitials: 'AS',
      dueText: 'Tomorrow',
      isUrgent: false,
      status: 'pending',
      imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
      comment: 'Summer Breeze campaign variants with dual English and Arabic typography.',
      checks: [
        { label: 'Safe areas cleared (100% visible)', pass: true },
        { label: 'Contrast ratio 6.8:1 (WCAG AAA)', pass: true },
      ],
    },
    {
      id: 'w4',
      sku: 'SF9709HC',
      title: 'LuLu Hypermarket Retail Flyer Slot',
      studio: 'flyers',
      studioName: 'Retail Flyers Studio',
      submitter: 'Marcus Vance · Retail Media',
      submitterInitials: 'MV',
      dueText: 'Nov 24',
      isUrgent: false,
      status: 'pending',
      imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      comment: 'Offer price AED 69 against regular retail AED 99. Verified from Excel price list.',
      checks: [
        { label: 'Offer price highlights verified', pass: true },
        { label: 'Arabic title & specs formatted', pass: true },
      ],
    },
  ]);

  const activeItem = items.find((i) => i.id === selectedId) || items[0];
  const pendingCount = items.filter((i) => i.status === 'pending').length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApprove = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'approved' } : i))
    );
    showToast(`Approved ${activeItem.sku} review task!`);
  };

  const handleSendBack = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'rejected' } : i))
    );
    showToast(`Sent back with revisions to ${activeItem.submitter}`);
  };

  return (
    <div className="min-h-full flex flex-col bg-background text-ink p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-6 select-none">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 py-2.5 px-4 rounded-xl shadow-lg border border-ok-fg/20 bg-ok-bg text-ok-fg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-ink m-0 tracking-tight">My Work</h1>
          <p className="text-xs text-muted m-0">
            {pendingCount} review and approval tasks require your sign-off before publication.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('waiting')}
            className={`h-9 px-4 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              filter === 'waiting'
                ? 'bg-ink text-white'
                : 'bg-surface border border-border text-ink hover:bg-track'
            }`}
          >
            <span>Waiting on you</span>
            <span className="w-5 h-5 rounded-full bg-brand text-white text-2xs flex items-center justify-center">
              {pendingCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('submitted')}
            className={`h-9 px-4 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'submitted'
                ? 'bg-ink text-white'
                : 'bg-surface border border-border text-ink hover:bg-track'
            }`}
          >
            Submitted by you (2)
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`h-9 px-4 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-ink text-white'
                : 'bg-surface border border-border text-ink hover:bg-track'
            }`}
          >
            Approved this week (8)
          </button>
        </div>
      </div>

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List: 5 cols */}
        <section
          aria-label="Approval Items List"
          className="lg:col-span-5 bg-surface border border-border rounded-card overflow-hidden shadow-2xs divide-y divide-track"
        >
          <div className="p-3.5 bg-track/40 text-2xs font-extrabold uppercase tracking-wider text-muted">
            Prioritized Approval Queue
          </div>

          {items.map((item) => {
            const isSelected = item.id === selectedId;
            const isDone = item.status === 'approved';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`w-full p-4 flex items-center gap-3.5 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-track border-l-4 border-l-ink'
                    : 'bg-surface hover:bg-track/30'
                }`}
              >
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-12 h-12 rounded-lg border border-track object-contain p-1 bg-white shrink-0 shadow-2xs"
                />

                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-ink truncate">
                      {item.sku}
                    </span>
                    <span
                      className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                        item.isUrgent
                          ? 'bg-err-bg text-err-fg'
                          : 'bg-track text-muted'
                      }`}
                    >
                      {item.dueText}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-ink line-clamp-1">
                    {item.title}
                  </span>
                  <span className="text-2xs text-muted truncate">
                    {item.studioName} · {item.submitter}
                  </span>
                </div>

                {isDone && (
                  <Check className="w-4 h-4 text-ok-fg shrink-0" />
                )}
              </button>
            );
          })}
        </section>

        {/* Right Detail Pane: 7 cols */}
        <section
          aria-label="Review Detail"
          className="lg:col-span-7 bg-surface border border-border rounded-card p-6 flex flex-col gap-5 shadow-2xs select-none"
        >
          {/* Header Info */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-track">
            <div className="flex flex-col gap-1">
              <span className="text-2xs font-bold text-muted uppercase">
                {activeItem.studioName} Review
              </span>
              <h2 className="text-lg font-black text-ink m-0 tracking-tight">
                {activeItem.sku} · {activeItem.title}
              </h2>
              <span className="text-xs text-muted">
                Submitted by <strong>{activeItem.submitter}</strong>
              </span>
            </div>

            <Badge variant={activeItem.status === 'approved' ? 'ok' : 'warn'}>
              {activeItem.status === 'approved' ? 'Approved' : 'Needs your sign-off'}
            </Badge>
          </div>

          {/* Large Image Preview with Quick Open Link */}
          <div className="relative rounded-xl border border-track bg-surface p-4 flex items-center justify-center overflow-hidden aspect-video max-h-[340px]">
            <img
              src={activeItem.imageUrl}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
            <button
              type="button"
              onClick={() => navigate('/studio')}
              className="absolute top-3 right-3 h-8 px-3 rounded-lg bg-black/60 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs hover:bg-black/80 transition-colors cursor-pointer"
            >
              <span>Open in Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Compliance Check Results */}
          <div className="p-3.5 rounded-xl bg-track/30 border border-border flex flex-col gap-2">
            <span className="text-xs font-bold text-ink">Automated Quality Checks</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {activeItem.checks.map((chk, idx) => (
                <div key={idx} className="flex items-center gap-2 text-ok-fg font-medium">
                  <Check className="w-4 h-4 shrink-0" />
                  <span className="text-ink">{chk.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submitter Comment */}
          <div className="p-3.5 rounded-xl border border-border bg-surface flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-track text-ink font-extrabold text-xs flex items-center justify-center shrink-0">
              {activeItem.submitterInitials}
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-bold text-ink">{activeItem.submitter}</span>
              <p className="text-muted m-0 leading-relaxed">{activeItem.comment}</p>
            </div>
          </div>

          {/* Feedback note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink">Your Review Notes / Feedback</label>
            <Textarea
              rows={3}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Provide constructive feedback or explain any requested adjustments..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-track mt-auto">
            <Button
              variant="secondary"
              onClick={() => handleSendBack(activeItem.id)}
            >
              Send back with revisions
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={() => handleApprove(activeItem.id)}
              >
                Approve asset
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
