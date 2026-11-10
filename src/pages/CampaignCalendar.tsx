import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function CampaignCalendar() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-ink tracking-tight m-0">
            Campaign Calendar
          </h1>
          <p className="text-sm text-muted m-0">
            Schedule social media posts, flyer drops, and listing updates across regional channels.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Schedule Post
        </Button>
      </div>

      <div className="p-12 rounded-card bg-surface border border-border flex flex-col items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-track text-ink flex items-center justify-center">
          <CalendarIcon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-ink m-0">November 2026 Campaign Schedule</h3>
        <p className="text-xs text-muted max-w-md m-0">
          Scheduled launches for Amazon India, Noon UAE, and Shopify will synchronize with your calendar view.
        </p>
      </div>
    </div>
  );
}
