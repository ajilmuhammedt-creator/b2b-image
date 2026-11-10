import React from 'react';
import { Loader2, CheckCircle2, Clock, X, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ActiveJob {
  id: string;
  productName: string;
  modelNumber?: string;
  slotTitle: string;
  marketplace: string;
  progress: number;
  step: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
}

interface JobsTrayProps {
  isOpen: boolean;
  onClose: () => void;
  jobs?: ActiveJob[];
  onCancelJob?: (jobId: string) => void;
}

export const JobsTray: React.FC<JobsTrayProps> = ({
  isOpen,
  onClose,
  jobs = [],
  onCancelJob,
}) => {
  if (!isOpen) return null;

  const runningCount = jobs.filter((j) => j.status === 'running').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Generation jobs"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Surface Tray Panel */}
      <div className="fixed top-14 right-4 sm:right-6 w-full max-w-sm bg-surface border border-border rounded-sheet shadow-2xl z-10 overflow-hidden flex flex-col animate-in slide-in-from-top-3 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-track flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-ink m-0">Jobs Tray</h3>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                runningCount > 0 ? 'bg-ink text-white' : 'bg-track text-muted'
              }`}
            >
              {runningCount} running
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close jobs tray"
            className="text-muted hover:text-ink p-1 rounded-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-3 flex flex-col gap-2.5">
          {jobs.length === 0 ? (
            <div className="py-8 px-4 text-center flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-track text-muted flex items-center justify-center">
                <Clock className="w-5 h-5 stroke-[1.5]" />
              </div>
              <p className="text-xs font-bold text-ink m-0">No active generation jobs</p>
              <p className="text-[11px] text-muted m-0 max-w-[220px] leading-relaxed">
                When you initiate an image generation run in Studio, live progress will appear here.
              </p>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="p-3 rounded-card bg-page border border-border flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-ink truncate">
                      {job.productName}
                    </span>
                    <span className="text-[11px] text-muted truncate">
                      {job.slotTitle} · {job.marketplace}
                    </span>
                  </div>
                  {job.status === 'running' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {job.progress}%
                    </span>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-ok-fg" />
                  )}
                </div>

                {/* Progress bar */}
                {job.status === 'running' && (
                  <>
                    <div className="h-1.5 w-full bg-border-strong rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ink rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted">
                      <span>{job.step}</span>
                      {onCancelJob && (
                        <button
                          type="button"
                          onClick={() => onCancelJob(job.id)}
                          className="text-muted hover:text-brand font-semibold underline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-page border-t border-track flex items-center justify-between text-xs">
          <span className="text-muted text-[11px]">Sanford Generation Engine</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

