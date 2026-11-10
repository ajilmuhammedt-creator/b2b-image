import React, { useState } from 'react';
import type { EcommercePlatform, SanfordSlotSpec, StudioSettings } from '../../types';
import { Segmented } from '../ui/Segmented';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import {
  ChevronDown,
  ChevronUp,
  UploadCloud,
  FileText,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface StudioBriefPanelProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  platform: EcommercePlatform | null;
  onSelectPlatform: (platform: EcommercePlatform) => void;
  sanfordSlots: SanfordSlotSpec[];
  slotStatuses: Record<number, 'draft' | 'pending' | 'review' | 'approved' | 'failed'>;
  settings: StudioSettings;
  onUpdateSettings: (settings: Partial<StudioSettings>) => void;
  onOpenUploadModal: () => void;
  onOpenSpecsModal: () => void;
  onRegenerateSet: () => void;
  isGeneratingAll?: boolean;
}

export const StudioBriefPanel: React.FC<StudioBriefPanelProps> = ({
  collapsed,
  onToggleCollapse,
  platform,
  onSelectPlatform,
  sanfordSlots,
  slotStatuses,
  settings,
  onUpdateSettings,
  onOpenUploadModal,
  onOpenSpecsModal,
  onRegenerateSet,
  isGeneratingAll = false,
}) => {
  const [moreSettingsOpen, setMoreSettingsOpen] = useState(false);

  // Simplified marketplace value
  const marketplaceValue =
    platform === 'amazon' || platform === 'amazon_aplus'
      ? 'amazon'
      : platform === 'noon' || platform === 'noon_aplus'
      ? 'noon'
      : 'shopify';

  const dotColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-ok-fg';
      case 'review':
        return 'bg-warn-fg';
      case 'failed':
        return 'bg-fail-bg';
      case 'pending':
        return 'bg-muted animate-pulse';
      default:
        return 'bg-border-strong';
    }
  };

  if (collapsed) {
    return (
      <aside className="w-12 shrink-0 bg-surface border border-border rounded-card p-2 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Expand Brief Panel"
          className="w-8 h-8 rounded-button text-muted hover:text-ink hover:bg-track flex items-center justify-center cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-muted -rotate-90 whitespace-nowrap mt-6">
          Brief
        </span>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Brief"
      className="w-full lg:w-[260px] xl:w-[270px] shrink-0 bg-surface border border-border rounded-card flex flex-col select-none shadow-2xs overflow-hidden"
    >
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-track flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-ink m-0">Brief</h2>
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Collapse brief"
          className="w-7 h-7 rounded-button text-muted hover:text-ink hover:bg-track flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 sm:p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-220px)] no-scrollbar">
        {/* Marketplace Selection */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">
            Marketplace
          </span>
          <Segmented
            size="sm"
            value={marketplaceValue}
            onChange={(val) => {
              if (val === 'amazon') onSelectPlatform('amazon');
              else if (val === 'noon') onSelectPlatform('noon');
              else onSelectPlatform('shopify');
            }}
            options={[
              { value: 'amazon', label: 'Amazon' },
              { value: 'noon', label: 'noon' },
              { value: 'shopify', label: 'Shopify' },
            ]}
          />
        </div>

        {/* Catalogue Upload & Specs Action buttons */}
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={onOpenUploadModal}
            icon={<UploadCloud className="w-3.5 h-3.5" />}
          >
            Upload Catalogue PDF
          </Button>

          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={onOpenSpecsModal}
            icon={<FileText className="w-3.5 h-3.5" />}
          >
            Edit Specifications
          </Button>
        </div>

        {/* Image Plan List */}
        <div className="flex flex-col gap-2 pt-2 border-t border-track">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Image Plan
            </span>
            <span className="text-[11px] font-semibold text-muted">
              {sanfordSlots.length} slots
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {sanfordSlots.map((slot) => {
              const status = slotStatuses[slot.slot];
              return (
                <div
                  key={slot.slot}
                  className="flex items-center gap-2.5 text-xs text-ink py-1 px-1.5 rounded-field hover:bg-track/50 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor(status)}`} />
                  <span className="truncate font-medium flex-1">
                    {slot.slot}. {slot.title.split('·')[0].split('(')[0].trim()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality Segmented Control */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-track">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">
            Quality
          </span>
          <Segmented
            size="sm"
            value={settings.quality === 'low' ? 'draft' : settings.quality === 'high' ? 'high' : 'standard'}
            onChange={(val) => {
              const q = val === 'draft' ? 'low' : val === 'high' ? 'high' : 'medium';
              onUpdateSettings({ quality: q });
            }}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'standard', label: 'Standard' },
              { value: 'high', label: 'High' },
            ]}
          />
        </div>

        {/* "More settings" Accordion */}
        <div className="flex flex-col gap-2 pt-2 border-t border-track">
          <button
            type="button"
            onClick={() => setMoreSettingsOpen(!moreSettingsOpen)}
            className="flex items-center justify-between text-xs font-bold text-ink py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-muted" />
              <span>More Settings</span>
            </span>
            {moreSettingsOpen ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
          </button>

          {moreSettingsOpen && (
            <div className="flex flex-col gap-3 pt-2 text-xs">
              <Switch
                checked={Boolean(settings.styleLock)}
                onChange={(checked) => onUpdateSettings({ styleLock: checked })}
                label="Style Lock"
                description="Use Slot 1 as visual anchor"
              />

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-muted">AI Image Model</span>
                <Segmented
                  size="sm"
                  value={settings.model === 'gpt-image-2.5-flare' ? 'flare' : 'sunburst'}
                  onChange={(val) =>
                    onUpdateSettings({
                      model: val === 'flare' ? 'gpt-image-2.5-flare' : 'gpt-image-2.5-sunburst',
                    })
                  }
                  options={[
                    { value: 'sunburst', label: 'Sunburst' },
                    { value: 'flare', label: 'Flare' },
                  ]}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-muted">Background Tone</span>
                <Segmented
                  size="sm"
                  value={settings.background || 'white'}
                  onChange={(val) => onUpdateSettings({ background: val as any })}
                  options={[
                    { value: 'white', label: 'Pure White' },
                    { value: 'pale tint', label: 'Pale Tint' },
                  ]}
                />
              </div>
            </div>
          )}
        </div>

        {/* Regenerate Set Button */}
        <Button
          variant="secondary"
          size="md"
          fullWidth
          loading={isGeneratingAll}
          onClick={onRegenerateSet}
          icon={<Sparkles className="w-4 h-4" />}
          className="mt-1"
        >
          Regenerate set
        </Button>
      </div>
    </aside>
  );
};
