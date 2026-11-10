import { Package, Plus, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { EmptyState } from '../components/ui/EmptyState';

export function ProductsList() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-ink tracking-tight m-0">
            Products & SKUs
          </h1>
          <p className="text-sm text-muted m-0">
            Verified product specifications, models, packaging dimensions, and visual assets.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Product SKU
        </Button>
      </div>

      <div className="max-w-sm">
        <Field
          placeholder="Filter by SKU or model number..."
          prefixIcon={<Search className="w-4 h-4" />}
        />
      </div>

      <EmptyState
        icon={<Package className="w-6 h-6" />}
        title="Sanford Master Product Database"
        description="Extract products directly by dropping a catalogue PDF in the E-commerce Studio."
      />
    </div>
  );
}
