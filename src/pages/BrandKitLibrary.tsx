import { Badge } from '../components/ui/Badge';

export function BrandKitLibrary() {
  const categories = [
    { name: 'Kitchen Appliances', color: '#E11D2E', desc: 'Blenders, kettles, toasters, air fryers', tag: 'Primary' },
    { name: 'Personal Grooming', color: '#1B365D', desc: 'Hair dryers, trimmers, shavers, straighteners', tag: 'Navy' },
    { name: 'Home Cooling', color: '#00A3E0', desc: 'Fans, desert coolers, air conditioners', tag: 'Cyan' },
    { name: 'Lighting & Torches', color: '#FFB81C', desc: 'Emergency lamps, flashlights, search lights', tag: 'Gold' },
    { name: 'Air Cooler Gold', color: '#C5A059', desc: 'Premium metallic air cooler series', tag: 'Metallic' },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-ink tracking-tight m-0">
          Brand Kit & Guidelines
        </h1>
        <p className="text-sm text-muted m-0">
          Packaging artwork palettes, logos, Arabic typography, and category design rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="p-5 rounded-card bg-surface border border-border flex flex-col justify-between gap-4 shadow-2xs"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span
                  className="w-8 h-8 rounded-full border border-border-strong shadow-xs shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <Badge variant="neutral" size="sm">{cat.tag}</Badge>
              </div>
              <h3 className="text-sm font-bold text-ink m-0">{cat.name}</h3>
              <p className="text-xs text-muted m-0">{cat.desc}</p>
            </div>
            <div className="pt-3 border-t border-track flex items-center justify-between text-xs text-muted font-mono">
              <span>{cat.color}</span>
              <span className="text-ok-fg font-bold">Approved</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
