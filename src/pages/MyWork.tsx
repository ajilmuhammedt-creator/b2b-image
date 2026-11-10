import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Inbox, ShoppingCart } from 'lucide-react';

export function MyWork() {
  const [activeTab, setActiveTab] = useState<'all' | 'approvals' | 'tasks'>('all');
  const navigate = useNavigate();

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-ink tracking-tight m-0">
          My Work
        </h1>
        <p className="text-sm text-muted m-0">
          Tasks, listing approvals, and mentions assigned to your staff account.
        </p>
      </div>

      <Tabs
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        tabs={[
          { id: 'all', label: 'All Items', count: 2 },
          { id: 'approvals', label: 'Approvals', count: 1 },
          { id: 'tasks', label: 'Tasks', count: 1 },
        ]}
      />

      {/* Work items list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-card bg-surface border border-border flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-field bg-track text-ink flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-muted uppercase">E-Commerce Approval</span>
              <h3 className="text-sm font-bold text-ink m-0">Review SF935HFN Amazon Image Set</h3>
              <p className="text-xs text-muted m-0">3 of 6 slots approved · Owner Marketplace executive</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/studio')}
          >
            Review
          </Button>
        </div>

        <div className="p-4 rounded-card bg-surface border border-border flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-field bg-warn-bg text-warn-fg flex items-center justify-center shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-warn-fg uppercase">Task</span>
              <h3 className="text-sm font-bold text-ink m-0">Rating label verification</h3>
              <p className="text-xs text-muted m-0">Attach certified lab test report for model SF935HFN</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {}}
          >
            Open
          </Button>
        </div>
      </div>
    </div>
  );
}
