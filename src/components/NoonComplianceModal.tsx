import type { NoonComplianceResult, GenerationItem } from '../types';
import { AlertTriangle, XCircle, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { NoonIcon } from './PlatformIcons';
import { Badge, Button, IconButton } from './ui';

interface NoonComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GenerationItem | null;
  compliance: NoonComplianceResult | null;
  productName?: string;
  modelNumber?: string;
}

export function NoonComplianceModal({
  isOpen,
  onClose,
  item,
  compliance,
  productName = 'Product',
  modelNumber = '',
}: NoonComplianceModalProps) {
  if (!isOpen || !item || !compliance) return null;

  const slotNum = item.slot ?? 1;
  const isMain = slotNum === 1 || item.theme === 'noon_front' || item.theme === 'hero';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0E131F] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEEE00]/10 border border-[#FEEE00]/30 flex items-center justify-center">
              <NoonIcon className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">
                  Noon UAE Seller Compliance Assessment
                </h3>
                <Badge
                  check={
                    compliance.status === 'pass'
                      ? 'pass'
                      : compliance.status === 'review'
                      ? 'warning'
                      : 'fail'
                  }
                  size="sm"
                >
                  {compliance.status === 'pass'
                    ? 'Compliant'
                    : compliance.status === 'review'
                    ? 'Needs Review'
                    : 'Action Required'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {item.sanfordSlot?.title || `Slot ${slotNum}`} ·{' '}
                {productName} {modelNumber ? `(${modelNumber})` : ''}
              </p>
            </div>
          </div>

          <IconButton
            aria-label="Close Noon compliance assessment"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        {/* Score & Summary Banner */}
        <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div
                className={`text-2xl font-black ${
                  compliance.score >= 90
                    ? 'text-emerald-400'
                    : compliance.score >= 70
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {compliance.score}%
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Audit Score
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div>
              <p className="text-xs text-slate-200 font-medium">{compliance.summary}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isMain
                  ? 'Evaluated against Noon UAE Primary Image (#FFFFFF Pure White, Front-Facing, Zero Overlays) rules.'
                  : 'Evaluated against Noon UAE Secondary Gallery specifications.'}
              </p>
            </div>
          </div>

          <a
            href="https://helpcenter.noon.partners/en/category/product-listing/image-requirements-and-rejection-reasons-for-the-seller-sku"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center space-x-1.5 text-xs text-[#FEEE00] hover:text-[#FFF566] transition underline underline-offset-4"
          >
            <span>Noon Guidelines</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Rules Checklist */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {compliance.rules.map((rule) => {
            return (
              <div
                key={rule.id}
                className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start space-x-3 transition hover:border-slate-700/80"
              >
                <div className="mt-0.5 flex-shrink-0">
                  {rule.status === 'pass' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {rule.status === 'warning' && (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  {rule.status === 'fail' && (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      {rule.name}
                    </span>
                    <Badge
                      check={
                        rule.status === 'pass'
                          ? 'pass'
                          : rule.status === 'warning'
                          ? 'warning'
                          : 'fail'
                      }
                      size="sm"
                    />
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {rule.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
          <span>
            Internal pre-flight check based on official Noon Seller Help Center guidelines.
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
