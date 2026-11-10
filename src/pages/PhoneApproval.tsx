import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreVertical, Check, CheckCircle2 } from 'lucide-react';
import { ShopifyIcon, AmazonIcon, NoonIcon } from '../components/PlatformIcons';

interface ApprovalQueueItem {
  id: string;
  title: string;
  sku: string;
  context: string;
  platform: 'shopify' | 'amazon' | 'noon';
  imageUrl: string;
  warn?: string;
  submitter: string;
  submitterInitials: string;
  comment: string;
}

export function PhoneApproval() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  const queue: ApprovalQueueItem[] = [
    {
      id: 'appr-1',
      title: 'Dimensions & warranty callout',
      sku: 'SF935HFN',
      context: 'SF935HFN · Amazon listing · Slot 6',
      platform: 'amazon',
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
      warn: 'Small dimension labels',
      submitter: 'Marketplace executive',
      submitterInitials: 'ME',
      comment: 'Please check the 190 mm dimension arrow before we upload this set directly to Amazon Seller Central.',
    },
    {
      id: 'appr-2',
      title: 'Rechargeable Fan Lifestyle Hero',
      sku: 'SF935HFN',
      context: 'SF935HFN · Shopify store · Slot 2',
      platform: 'shopify',
      imageUrl: 'https://images.unsplash.com/photo-1618941716939-553df3c6c278?w=800&auto=format&fit=crop&q=80',
      submitter: 'Graphic designer',
      submitterInitials: 'GD',
      comment: 'Sharp Sans header and Sanford Red corner badge placed according to the BuySanford pattern template.',
    },
    {
      id: 'appr-3',
      title: 'Back View Technical Details',
      sku: 'SF6801HC',
      context: 'SF6801HC · Noon UAE · Slot 2',
      platform: 'noon',
      imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      submitter: 'Marketplace executive',
      submitterInitials: 'ME',
      comment: 'Pure white studio background with rear panel and power ports clearly visible, strictly zero overlays.',
    },
  ];

  const hasItem = index < queue.length;
  const current = hasItem ? queue[index] : null;

  const handleNext = () => {
    setIndex((prev) => prev + 1);
  };

  const handleReset = () => {
    setIndex(0);
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center p-0 sm:p-4 select-none">
      {/* 390px Mobile Viewport Container (Matching Phone.reference.html) */}
      <div className="w-full max-w-[390px] h-screen sm:h-[844px] bg-surface sm:border sm:border-border sm:rounded-[32px] sm:shadow-2xl flex flex-col overflow-hidden text-ink font-sans">
        {/* Top Header */}
        <header className="h-14 px-3 border-b border-border bg-surface flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="w-10 h-10 rounded-field hover:bg-track flex items-center justify-center text-ink cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-sm font-extrabold text-ink">Approvals</span>
            <span className="text-[11px] text-muted">
              {hasItem ? `${index + 1} of ${queue.length} waiting` : '0 waiting'}
            </span>
          </div>

          <button
            type="button"
            aria-label="More options"
            className="w-10 h-10 rounded-field hover:bg-track flex items-center justify-center text-ink cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </header>

        {/* Content Area */}
        {hasItem && current ? (
          <>
            <main className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3.5 no-scrollbar">
              {/* Asset Preview */}
              <div className="w-full aspect-square rounded-card overflow-hidden bg-track border border-border flex items-center justify-center">
                <img
                  src={current.imageUrl}
                  alt={current.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title & Context */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
                  {current.platform === 'shopify' && <ShopifyIcon className="w-3.5 h-3.5 shrink-0" />}
                  {current.platform === 'amazon' && <AmazonIcon className="w-3.5 h-3.5 shrink-0" />}
                  {current.platform === 'noon' && <NoonIcon className="w-3.5 h-3.5 shrink-0" />}
                  <span>{current.context}</span>
                </div>
                <h1 className="text-lg font-extrabold text-ink m-0 leading-snug">
                  {current.title}
                </h1>
              </div>

              {/* Quality Check Badges */}
              <div className="flex flex-wrap gap-1.5">
                <span className="h-7 px-2.5 rounded-full bg-ok-bg text-ok-fg text-xs font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>2000 × 2000 px</span>
                </span>
                <span className="h-7 px-2.5 rounded-full bg-ok-bg text-ok-fg text-xs font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Specs verified</span>
                </span>
                {current.warn && (
                  <span className="h-7 px-2.5 rounded-full bg-warn-bg text-warn-fg text-xs font-bold flex items-center gap-1">
                    <span>!</span>
                    <span>{current.warn}</span>
                  </span>
                )}
              </div>

              {/* Submitter Comment Box */}
              <div className="p-3 bg-track/60 border border-border rounded-card flex items-start gap-3 text-xs leading-relaxed">
                <span className="w-7 h-7 rounded-full bg-surface border border-border font-extrabold text-[11px] flex items-center justify-center shrink-0 text-ink">
                  {current.submitterInitials}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-ink">{current.submitter}</span>
                  <span className="text-muted">{current.comment}</span>
                </div>
              </div>
            </main>

            {/* Bottom 52px Actions */}
            <div className="p-3.5 border-t border-border bg-surface flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 h-[52px] rounded-button border border-border-strong bg-surface hover:bg-track text-ink text-sm font-bold transition cursor-pointer"
              >
                Send back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 h-[52px] rounded-button bg-brand hover:bg-brand-hover text-white text-sm font-bold shadow-sm transition cursor-pointer"
              >
                Approve
              </button>
            </div>
          </>
        ) : (
          /* All Caught Up Empty State */
          <main className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-ok-bg text-ok-fg flex items-center justify-center mb-1">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-extrabold text-ink m-0">All caught up</h1>
            <p className="text-xs text-muted leading-relaxed max-w-[260px] m-0">
              Nothing is waiting for your approval right now. We will notify you when new studio assets arrive.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-3 h-10 px-4 rounded-button border border-border bg-surface text-ink text-xs font-bold hover:bg-track transition cursor-pointer"
            >
              Start over (demo queue)
            </button>
          </main>
        )}
      </div>
    </div>
  );
}

