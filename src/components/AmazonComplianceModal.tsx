import type { AmazonComplianceResult, GenerationItem } from '../types';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2, X, ExternalLink } from 'lucide-react';

interface AmazonComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GenerationItem | null;
  compliance: AmazonComplianceResult | null;
  productName?: string;
  modelNumber?: string;
}

export function AmazonComplianceModal({
  isOpen,
  onClose,
  item,
  compliance,
  productName = 'Product',
  modelNumber = '',
}: AmazonComplianceModalProps) {
  if (!isOpen || !item || !compliance) return null;

  const slotNum = item.slot ?? 1;
  const isMain = slotNum === 1 || item.theme === 'hero';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0E131F] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                compliance.status === 'pass'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : compliance.status === 'review'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {compliance.status === 'pass' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : compliance.status === 'review' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">
                  Amazon Listing Compliance Assessment
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    compliance.status === 'pass'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : compliance.status === 'review'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {compliance.status === 'pass'
                    ? '100% Pass'
                    : compliance.status === 'review'
                    ? 'Needs Review'
                    : 'Action Needed'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isMain ? 'IMAGE 01 — MAIN Product Hero' : `IMAGE 0${slotNum} — Secondary Image`} ·{' '}
                {modelNumber ? `Model ${modelNumber}` : productName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Summary Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              compliance.status === 'pass'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : compliance.status === 'review'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">
                {compliance.summary}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Evaluated against official Amazon Seller Central catalog guidelines for India & International marketplaces.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold">{compliance.score}%</span>
              <span className="text-[10px] block text-slate-400">Compliance Score</span>
            </div>
          </div>

          {/* Thumbnail preview if available */}
          {item.imageUrl && (
            <div className="flex items-center space-x-4 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="w-16 h-16 rounded-lg bg-black/40 overflow-hidden border border-slate-700/60 flex-shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.slotTitle || 'Preview'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-xs space-y-1">
                <span className="font-semibold text-white block">{item.slotTitle}</span>
                <span className="text-[11px] text-slate-400 block">
                  Export resolution standard: <strong>2000 × 2000 px (1:1 square)</strong>
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Format: <strong>High-Fidelity sRGB JPEG</strong>
                </span>
              </div>
            </div>
          )}

          {/* Rules Checklist */}
          <div className="space-y-2.5">
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Automated Checkpoints ({compliance.rules.length})
            </h4>

            <div className="space-y-2">
              {compliance.rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-start space-x-3 text-xs"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {rule.status === 'pass' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : rule.status === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{rule.name}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          rule.status === 'pass'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : rule.status === 'warning'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{rule.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <a
            href="https://sellercentral.amazon.in/gp/help/external/G1881"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 transition"
          >
            <span>Amazon Product Image Guidelines</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
