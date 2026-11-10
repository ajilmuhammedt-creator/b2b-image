import React, { ReactNode } from 'react';
import { StudioHeader } from './StudioHeader';
import { StudioBriefPanel } from './StudioBriefPanel';
import { StudioCanvas } from './StudioCanvas';
import { StudioInspector } from './StudioInspector';
import { StudioDeliveryFooter } from './StudioDeliveryFooter';
import type { EcommercePlatform, GenerationItem, SanfordSlotSpec, StudioSettings } from '../../types';

export interface StudioLayoutProps {
  // Header
  productName: string;
  modelNumber?: string;
  sourceImageUrl?: string;
  platform: EcommercePlatform | null;
  stageIndex: number;
  onStepClick?: (idx: number) => void;
  isGeneratingAll: boolean;
  onGenerateAll: () => void;

  // Brief Panel
  briefCollapsed: boolean;
  onToggleBriefCollapse: () => void;
  onSelectPlatform: (platform: EcommercePlatform) => void;
  sanfordSlots: SanfordSlotSpec[];
  slotStatuses: Record<number, 'draft' | 'pending' | 'review' | 'approved' | 'failed'>;
  settings: StudioSettings;
  onUpdateSettings: (settings: Partial<StudioSettings>) => void;
  onOpenUploadModal: () => void;
  onOpenSpecsModal: () => void;

  // Canvas
  items: GenerationItem[];
  selectedSlotId: string | null;
  onSelectSlot: (id: string) => void;
  onToggleSelectCheckbox: (id: string) => void;

  // Inspector
  onApproveItem: (id: string) => void;
  onSendBackItem: (id: string, note: string) => void;
  onRetrySlot: (slot: number | 'poster') => void;
  onCancelJob?: (id: string) => void;
  onOpenComplianceModal?: (item: GenerationItem) => void;

  // Delivery Footer
  approvedCount: number;
  totalCount: number;
  formatLabel: string;
  isZipping?: boolean;
  onDownloadZip: () => void;
  onPhoneShare?: () => void;
  onFolderSave?: () => void;
  onDeliver: () => void;
  onOpenPlatformModal?: () => void;

  // Modals & Extras
  children?: ReactNode;
}

export const StudioLayout: React.FC<StudioLayoutProps> = ({
  productName,
  modelNumber,
  sourceImageUrl,
  platform,
  stageIndex,
  onStepClick,
  isGeneratingAll,
  onGenerateAll,
  briefCollapsed,
  onToggleBriefCollapse,
  onSelectPlatform,
  sanfordSlots,
  slotStatuses,
  settings,
  onUpdateSettings,
  onOpenUploadModal,
  onOpenSpecsModal,
  items,
  selectedSlotId,
  onSelectSlot,
  onToggleSelectCheckbox,
  onApproveItem,
  onSendBackItem,
  onRetrySlot,
  onCancelJob,
  onOpenComplianceModal,
  approvedCount,
  totalCount,
  formatLabel,
  isZipping,
  onDownloadZip,
  onPhoneShare,
  onFolderSave,
  onDeliver,
  onOpenPlatformModal,
  children,
}) => {
  const platformLabel =
    platform === 'amazon'
      ? 'Amazon'
      : platform === 'amazon_aplus'
      ? 'Amazon A+'
      : platform === 'noon'
      ? 'Noon'
      : platform === 'noon_aplus'
      ? 'Noon A+'
      : platform === 'shopify'
      ? 'Shopify'
      : 'Select Platform';

  const marketplaceName =
    platform === 'amazon' || platform === 'amazon_aplus'
      ? 'Amazon'
      : platform === 'noon' || platform === 'noon_aplus'
      ? 'Noon'
      : 'Shopify';

  const activeItem = items.find((i) => i.id === selectedSlotId) || items[0] || null;

  return (
    <div className="min-h-full flex flex-col bg-background text-ink">
      {/* Studio Header */}
      <StudioHeader
        productName={productName}
        modelNumber={modelNumber}
        sourceImageUrl={sourceImageUrl}
        platform={platform}
        platformLabel={platformLabel}
        stageIndex={stageIndex}
        onStepClick={onStepClick}
        primaryActionLabel="Generate set"
        isGenerating={isGeneratingAll}
        onPrimaryAction={onGenerateAll}
        onOpenPlatformModal={onOpenPlatformModal}
      />

      {/* 3-Column Studio Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch min-w-0 p-4 lg:p-6 gap-6 overflow-x-hidden">
        {/* Left: Brief Panel */}
        <StudioBriefPanel
          collapsed={briefCollapsed}
          onToggleCollapse={onToggleBriefCollapse}
          platform={platform}
          onSelectPlatform={onSelectPlatform}
          sanfordSlots={sanfordSlots}
          slotStatuses={slotStatuses}
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          onOpenUploadModal={onOpenUploadModal}
          onOpenSpecsModal={onOpenSpecsModal}
          onRegenerateSet={onGenerateAll}
          isGeneratingAll={isGeneratingAll}
        />

        {/* Center: Canvas (Responsive Image Tiles Grid) */}
        <StudioCanvas
          items={items}
          selectedId={selectedSlotId}
          onSelectSlot={onSelectSlot}
          onRetrySlot={onRetrySlot}
          onToggleSelectCheckbox={onToggleSelectCheckbox}
        />

        {/* Right: Inspector */}
        <StudioInspector
          item={activeItem}
          onApprove={onApproveItem}
          onSendBack={onSendBackItem}
          onRetry={onRetrySlot}
          onCancelJob={onCancelJob}
          onOpenComplianceModal={onOpenComplianceModal}
        />
      </div>

      {/* Sticky Delivery Footer */}
      <StudioDeliveryFooter
        approvedCount={approvedCount}
        totalCount={totalCount}
        marketplaceName={marketplaceName}
        formatLabel={formatLabel}
        isZipping={isZipping}
        onDownloadZip={onDownloadZip}
        onPhoneShare={onPhoneShare}
        onFolderSave={onFolderSave}
        onDeliver={onDeliver}
      />

      {/* Injected Modals */}
      {children}
    </div>
  );
};

