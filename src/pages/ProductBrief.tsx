import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Box,
  ShoppingCart,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface FactRow {
  id: string;
  field: string;
  value: string;
  status: 'verified' | 'missing' | 'erp';
  printsOn: string;
  category: 'required' | 'specs' | 'regulatory';
}

export function ProductBrief() {
  const [filter, setFilter] = useState<'all' | 'required' | 'missing' | 'erp'>('all');
  const [toastMessage] = useState<string | null>(null);

  const facts: FactRow[] = [
    {
      id: '1',
      field: 'Model Number',
      value: 'SF5905GM C',
      status: 'verified',
      printsOn: 'Gift box, Rating label, Manual, Carton',
      category: 'required',
    },
    {
      id: '2',
      field: 'Product Name (English)',
      value: '750W Heavy Duty Mixer Grinder',
      status: 'verified',
      printsOn: 'Gift box, Manual, Carton',
      category: 'required',
    },
    {
      id: '3',
      field: 'Product Name (Arabic)',
      value: 'خلاط ومطحنة كهربائية ٧٥٠ واط',
      status: 'verified',
      printsOn: 'Gift box, Manual, Carton',
      category: 'required',
    },
    {
      id: '4',
      field: 'Rated Power',
      value: '750 Watts',
      status: 'verified',
      printsOn: 'Gift box front, Rating label, Manual',
      category: 'required',
    },
    {
      id: '5',
      field: 'Rated Voltage & Frequency',
      value: '220–240 V ~ 50/60 Hz',
      status: 'erp',
      printsOn: 'Rating label, Technical side panel',
      category: 'regulatory',
    },
    {
      id: '6',
      field: 'EAN-13 Barcode',
      value: '6291100590512',
      status: 'erp',
      printsOn: 'Gift box back, Master carton',
      category: 'regulatory',
    },
    {
      id: '7',
      field: 'Jar Capacities',
      value: '1.5L Wet Jar, 1.0L Multi Jar, 0.4L Chutney Jar',
      status: 'verified',
      printsOn: 'Gift box side panel, Feature callouts',
      category: 'specs',
    },
    {
      id: '8',
      field: 'Motor Construction',
      value: '100% Pure Copper Winding with Thermal Overload',
      status: 'verified',
      printsOn: 'Front badge, Technical specs',
      category: 'specs',
    },
    {
      id: '9',
      field: 'Speed Control',
      value: '3 Speed Rotary Switch with Incher/Pulse',
      status: 'verified',
      printsOn: 'Gift box, Manual',
      category: 'specs',
    },
    {
      id: '10',
      field: 'Country of Origin',
      value: 'Made in India',
      status: 'erp',
      printsOn: 'Rating label, Master carton',
      category: 'regulatory',
    },
    {
      id: '11',
      field: 'Warranty Coverage',
      value: '2 Years Sanford Warranty',
      status: 'verified',
      printsOn: 'Warranty ribbon badge, Manual card',
      category: 'required',
    },
    {
      id: '12',
      field: 'Net / Gross Weight',
      value: '4.2 kg / 5.1 kg',
      status: 'missing',
      printsOn: 'Master carton outer shipping mark',
      category: 'regulatory',
    },
  ];

  const filteredFacts = facts.filter((f) => {
    if (filter === 'required') return f.category === 'required';
    if (filter === 'missing') return f.status === 'missing';
    if (filter === 'erp') return f.status === 'erp';
    return true;
  });

  const missingCount = facts.filter((f) => f.status === 'missing').length;
  const verifiedCount = facts.filter((f) => f.status === 'verified').length;
  const completionPercent = Math.round((verifiedCount / (facts.length - 1)) * 100);

  return (
    <div className="min-h-full flex flex-col bg-background text-ink p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-6 select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 py-2.5 px-4 rounded-xl shadow-lg border border-ok-fg/20 bg-ok-bg text-ok-fg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-border">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src="https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=128&q=80"
            alt="Mixer grinder"
            className="w-16 h-16 rounded-xl border border-track object-contain p-1.5 bg-surface shadow-2xs shrink-0"
          />
          <div className="flex flex-col min-w-0 gap-1.5">
            <span className="text-xs font-bold text-muted">
              <Link to="/products" className="text-muted hover:text-ink no-underline">
                Products
              </Link>{' '}
              / SF5905GM C
            </span>
            <h1 className="text-2xl font-black text-ink m-0 tracking-tight">
              SF5905GM C · Mixer Grinder
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="h-6 px-2.5 rounded-full bg-[#0A8141] text-white text-xs font-bold flex items-center">
                Kitchen
              </span>
              <Badge variant="neutral">Green GR01</Badge>
              <Badge variant="neutral">GCC / UAE · English + Arabic</Badge>
            </div>
          </div>
        </div>

        {/* Progress summary */}
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-ink">Brief {completionPercent}% complete</span>
            <span className="text-muted">{missingCount} missing field</span>
          </div>
          <div className="w-full h-2 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-ink rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <span className="text-2xs text-muted">1 fact missing before final print release</span>
        </div>
      </div>

      {/* Brand Kit Rule Banner */}
      <div className="p-4 rounded-xl bg-surface border border-border shadow-2xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-brand shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-ink">
          <strong className="text-brand">Rule from the Brand Kit:</strong> Every number on a pack
          or listing comes from this verified product brief, never from another product's artwork.
          ERP fields (EAN, prices) sync in directly; all specifications are verified by QA before
          printing.
        </div>
      </div>

      {/* Main Grid: Facts Table + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Table: 8 cols */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-card overflow-hidden shadow-2xs">
          {/* Table Header & Filters */}
          <div className="p-4 border-b border-track flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-extrabold text-ink m-0">Facts the Packs Print</h2>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`h-8 px-3 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  filter === 'all' ? 'bg-ink text-white' : 'bg-surface border border-border text-ink hover:bg-track'
                }`}
              >
                All {facts.length}
              </button>
              <button
                type="button"
                onClick={() => setFilter('required')}
                className={`h-8 px-3 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'required' ? 'bg-ink text-white' : 'bg-surface border border-border text-ink hover:bg-track'
                }`}
              >
                Required
              </button>
              <button
                type="button"
                onClick={() => setFilter('erp')}
                className={`h-8 px-3 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'erp' ? 'bg-ink text-white' : 'bg-surface border border-border text-ink hover:bg-track'
                }`}
              >
                ERP Synced
              </button>
              <button
                type="button"
                onClick={() => setFilter('missing')}
                className={`h-8 px-3 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'missing' ? 'bg-ink text-white' : 'bg-surface border border-border text-ink hover:bg-track'
                }`}
              >
                Missing {missingCount}
              </button>
            </div>
          </div>

          {/* Table Rows */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-track/50 text-muted uppercase text-3xs font-extrabold border-b border-track">
                <tr>
                  <th className="py-2.5 px-4">Field</th>
                  <th className="py-2.5 px-4">Verified Value</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4">Prints On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-track">
                {filteredFacts.map((row) => (
                  <tr key={row.id} className="hover:bg-track/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-ink whitespace-nowrap">{row.field}</td>
                    <td className="py-3 px-4 text-ink font-medium">{row.value}</td>
                    <td className="py-3 px-3">
                      {row.status === 'verified' && (
                        <Badge variant="ok" size="sm">
                          Verified
                        </Badge>
                      )}
                      {row.status === 'erp' && (
                        <Badge variant="neutral" size="sm">
                          ERP Sync
                        </Badge>
                      )}
                      {row.status === 'missing' && (
                        <Badge variant="fail" size="sm">
                          Missing
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted text-2xs">{row.printsOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: Quick Actions & Photos (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Studio Quick Jump */}
          <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-3 shadow-2xs">
            <span className="text-xs font-extrabold text-ink">Launch in Studios</span>
            <div className="flex flex-col gap-2">
              <Link to="/studio/packaging" className="no-underline">
                <Button variant="primary" className="w-full justify-start">
                  <Box className="w-4 h-4 mr-2" />
                  <span>Open in Gift Box Studio</span>
                </Button>
              </Link>
              <Link to="/studio" className="no-underline">
                <Button variant="secondary" className="w-full justify-start">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  <span>Open in E-commerce Studio</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Product Photos */}
          <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-3 shadow-2xs">
            <span className="text-xs font-extrabold text-ink">Product Visual Assets</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-square rounded-xl border border-track bg-surface p-2 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=300&q=80"
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="aspect-square rounded-xl border border-track bg-surface p-2 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80"
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <span className="text-2xs text-muted">
              Master cutouts verified for packaging and high-res print.
            </span>
          </div>

          {/* Brand Kit Card */}
          <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-2 shadow-2xs">
            <span className="text-xs font-extrabold text-ink">Brand Kit Assignment</span>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-track/40 border border-border">
              <span className="w-5 h-5 rounded-full bg-[#0A8141] shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-ink">Kitchen Category</span>
                <span className="text-2xs font-mono text-muted">#0A8141 (Deep #073E25)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
