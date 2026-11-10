import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Megaphone,
  FileText,
} from 'lucide-react';

interface CampaignItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  color: string;
  skus: string[];
  channels: string[];
  readyCount: number;
  totalCount: number;
  owner: string;
  notes: string;
}

export function CampaignCalendar() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [selectedCampaignId, setSelectedCampaignId] = useState('c1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const campaigns: CampaignItem[] = [
    {
      id: 'c1',
      name: 'UAE National Day 53 Offers',
      startDate: 'Nov 08',
      endDate: 'Dec 04',
      color: '#C8281E',
      skus: ['SF5905GM C', 'SF935HFN', 'SF6671HFN', 'SF9709HC'],
      channels: ['Retail Flyers (LuLu & Carrefour)', 'Instagram & WhatsApp', 'Amazon & Noon'],
      readyCount: 14,
      totalCount: 18,
      owner: 'Rashid Al-Nuaimi · Campaign Lead',
      notes: 'Major GCC holiday campaign across hypermarkets and direct e-commerce channels. Print deadline Nov 28.',
    },
    {
      id: 'c2',
      name: 'Winter Appliance Clearance',
      startDate: 'Nov 15',
      endDate: 'Nov 29',
      color: '#2170B4',
      skus: ['SF453EL', 'SF8112PAC'],
      channels: ['BuySanford Shopify', 'Social Media Feeds'],
      readyCount: 6,
      totalCount: 6,
      owner: 'Priya Sundaram · E-commerce Exec',
      notes: 'End of season clearance event on cooling fans and rechargeable lanterns.',
    },
    {
      id: 'c3',
      name: 'Ramadan Kitchen Preparation Pre-Launch',
      startDate: 'Dec 01',
      endDate: 'Dec 22',
      color: '#0A8141',
      skus: ['SF5901GM', 'SF5905GM C'],
      channels: ['Packaging Gift Boxes', 'Retail Flyers'],
      readyCount: 4,
      totalCount: 12,
      owner: 'Faisal Al-Kuwari · Packaging Team',
      notes: 'Bilingual packaging and flyer launch for Sanford flagship mixer grinders.',
    },
  ];

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calendar dates for Nov 2026 (starts Sunday Nov 1)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="min-h-full flex flex-col bg-background text-ink p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-6 select-none">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 py-2.5 px-4 rounded-xl shadow-lg border border-ok-fg/20 bg-ok-bg text-ok-fg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black text-ink m-0 tracking-tight">Campaign Calendar</h1>

          {/* Month Stepper */}
          <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl px-2 py-1 shadow-2xs">
            <button
              type="button"
              className="w-7 h-7 rounded-lg hover:bg-track flex items-center justify-center text-muted hover:text-ink cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-ink px-2">November 2026</span>
            <button
              type="button"
              className="w-7 h-7 rounded-lg hover:bg-track flex items-center justify-center text-muted hover:text-ink cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-3">
          <Segmented
            size="sm"
            value={viewMode}
            onChange={(val) => setViewMode(val as any)}
            options={[
              { value: 'month', label: 'Month' },
              { value: 'week', label: 'Week' },
              { value: 'list', label: 'List' },
            ]}
          />

          <Button
            variant="primary"
            onClick={() => showToast('Create new campaign modal')}
          >
            <Plus className="w-4 h-4" />
            <span>New campaign</span>
          </Button>
        </div>
      </div>

      {/* Timeline / Gantt Header Banner */}
      <section aria-label="Campaign Timeline" className="bg-surface border border-border rounded-card p-5 shadow-2xs flex flex-col gap-3">
        <div className="flex justify-between text-2xs font-bold text-muted uppercase">
          <span>Nov 1</span>
          <span>Nov 10 (Today)</span>
          <span>Nov 20</span>
          <span>Dec 02</span>
        </div>

        <div className="relative h-20 rounded-xl bg-track/30 p-2 flex flex-col justify-around overflow-hidden border border-track">
          {/* Today Indicator Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-brand z-10"
            style={{ left: '33%' }}
          >
            <span className="absolute -top-0 -translate-x-1/2 bg-brand text-white text-3xs font-extrabold px-1.5 py-0.5 rounded-full shadow-xs">
              Today
            </span>
          </div>

          {/* Campaign Bar 1 */}
          <div
            onClick={() => setSelectedCampaignId('c1')}
            className="h-6 rounded-lg text-white text-xs font-bold px-3 flex items-center cursor-pointer shadow-xs transition-opacity hover:opacity-90 relative"
            style={{
              backgroundColor: '#C8281E',
              width: '80%',
              left: '20%',
            }}
          >
            <span className="truncate">UAE National Day 53 Offers (14/18 assets ready)</span>
          </div>

          {/* Campaign Bar 2 */}
          <div
            onClick={() => setSelectedCampaignId('c2')}
            className="h-6 rounded-lg text-white text-xs font-bold px-3 flex items-center cursor-pointer shadow-xs transition-opacity hover:opacity-90 relative"
            style={{
              backgroundColor: '#2170B4',
              width: '45%',
              left: '45%',
            }}
          >
            <span className="truncate">Winter Appliance Clearance (Ready)</span>
          </div>
        </div>
      </section>

      {/* Main Grid: 7-Column Month View + Right Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Month Calendar Grid: 8 cols */}
        <section
          aria-label="Month Grid"
          className="lg:col-span-8 bg-surface border border-border rounded-card overflow-hidden shadow-2xs"
        >
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 border-b border-track bg-track/40 text-center text-2xs font-extrabold uppercase text-muted py-2.5">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-track text-xs">
            {daysInMonth.map((day) => {
              const isToday = day === 10;
              const hasNationalDay = day >= 8 && day <= 30;
              const hasWinterSale = day >= 15 && day <= 29;

              return (
                <div
                  key={day}
                  className={`min-h-[90px] p-2 flex flex-col justify-between transition-colors ${
                    isToday ? 'bg-brand/5 font-extrabold' : 'hover:bg-track/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold'
                          : 'text-ink font-semibold'
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  {/* Campaign pills */}
                  <div className="flex flex-col gap-1 mt-1">
                    {hasNationalDay && day === 10 && (
                      <span
                        onClick={() => setSelectedCampaignId('c1')}
                        className="text-3xs font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-200 truncate cursor-pointer"
                      >
                        National Day 53
                      </span>
                    )}

                    {hasWinterSale && day === 15 && (
                      <span
                        onClick={() => setSelectedCampaignId('c2')}
                        className="text-3xs font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-200 truncate cursor-pointer"
                      >
                        Winter Clearance
                      </span>
                    )}

                    {day === 28 && (
                      <span className="text-3xs font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200 truncate">
                        Flyer Print Due
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Detail Drawer: 4 cols */}
        <section
          aria-label="Campaign Detail"
          className="lg:col-span-4 bg-surface border border-border rounded-card p-5 flex flex-col gap-4 shadow-2xs select-none"
        >
          <div className="flex items-start justify-between pb-3 border-b border-track">
            <div className="flex flex-col gap-1">
              <span className="text-2xs font-bold text-muted uppercase">Selected Campaign</span>
              <h2 className="text-base font-black text-ink m-0 tracking-tight">
                {activeCampaign.name}
              </h2>
              <span className="text-xs text-muted">
                {activeCampaign.startDate} – {activeCampaign.endDate}
              </span>
            </div>
            <span
              className="w-4 h-4 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: activeCampaign.color }}
            />
          </div>

          {/* Progress Summary */}
          <div className="p-3.5 rounded-xl bg-track/40 border border-border flex flex-col gap-2 text-xs">
            <div className="flex justify-between font-bold">
              <span className="text-ink">Assets Production</span>
              <span className="text-brand">
                {activeCampaign.readyCount} of {activeCampaign.totalCount} ready
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-ink rounded-full transition-all duration-300"
                style={{
                  width: `${Math.round((activeCampaign.readyCount / activeCampaign.totalCount) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Attached SKUs */}
          <div className="flex flex-col gap-1.5 text-xs">
            <span className="text-2xs font-extrabold uppercase tracking-wider text-muted">
              Featured SKUs ({activeCampaign.skus.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeCampaign.skus.map((sku) => (
                <span
                  key={sku}
                  className="px-2.5 py-1 rounded-lg border border-border bg-surface font-mono font-bold text-ink"
                >
                  {sku}
                </span>
              ))}
            </div>
          </div>

          {/* Target Channels */}
          <div className="flex flex-col gap-1.5 text-xs">
            <span className="text-2xs font-extrabold uppercase tracking-wider text-muted">
              Distribution Channels
            </span>
            <ul className="text-2xs text-ink space-y-1 list-disc list-inside">
              {activeCampaign.channels.map((ch, idx) => (
                <li key={idx} className="font-medium">{ch}</li>
              ))}
            </ul>
          </div>

          {/* Campaign Notes */}
          <div className="p-3 rounded-xl border border-border bg-surface text-xs leading-relaxed text-muted">
            <strong className="text-ink">Lead:</strong> {activeCampaign.owner}
            <p className="mt-1 m-0">{activeCampaign.notes}</p>
          </div>

          {/* Studio Shortcuts */}
          <div className="flex flex-col gap-2 pt-2 border-t border-track mt-auto">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate('/studio/flyers')}
            >
              <FileText className="w-4 h-4 mr-2" />
              <span>Open in Retail Flyers Studio</span>
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/studio/social')}
            >
              <Megaphone className="w-4 h-4 mr-2" />
              <span>Open in Social Media Studio</span>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
