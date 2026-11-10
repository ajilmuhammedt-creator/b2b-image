import { useState } from 'react';
import {
  Button,
  IconButton,
  Field,
  Select,
  Textarea,
  Segmented,
  Tabs,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Dialog,
  Drawer,
  Skeleton,
  EmptyState,
  Switch,
  Avatar,
  StageBar,
  ImageTile,
  useToast,
  ToastProvider,
} from '../components/ui';
import {
  Sparkles,
  Download,
  Trash2,
  Search,
  Bell,
  Settings,
  Plus,
  FolderOpen,
  ExternalLink,
} from 'lucide-react';

function DevComponentsContent() {
  const { showToast } = useToast();

  // Interactive states for testing
  const [activeTab, setActiveTab] = useState('all');
  const [selectedMarketplace, setSelectedMarketplace] = useState<'amazon' | 'noon' | 'shopify'>('amazon');
  const [selectedQuality, setSelectedQuality] = useState<'draft' | 'standard' | 'high'>('standard');
  const [switch1, setSwitch1] = useState(true);
  const [switch2, setSwitch2] = useState(false);
  const [stageIndex, setStageIndex] = useState(2); // Review stage
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTile, setSelectedTile] = useState<number>(3);
  const [checkedTiles, setCheckedTiles] = useState<Record<number, boolean>>({ 1: true, 3: true });

  const toggleTileCheck = (id: number) => {
    setCheckedTiles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-page text-ink font-sans selection:bg-brand-tint selection:text-brand pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-xl tracking-tight">
              sanford<span className="text-brand">Ai</span>
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-ink text-white">
              Component Kit · Phase 1
            </span>
            <span className="text-xs text-muted hidden sm:inline">
              docs/design/02-DESIGN-SYSTEM.md
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => (window.location.href = '/studio')}
            >
              Back to Studio
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={() =>
                showToast({
                  type: 'ok',
                  title: 'Single Primary Action Triggered',
                  message: 'This follows the strict One Red Button per screen rule.',
                })
              }
            >
              One Primary Action
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="max-w-7xl mx-auto px-6 pt-8 flex flex-col gap-12">
        {/* Intro Banner */}
        <section className="bg-surface border border-border rounded-card p-6 shadow-xs flex flex-col gap-3">
          <h1 className="text-2xl font-extrabold text-ink tracking-tight m-0">
            Design Tokens & Unified Component Library
          </h1>
          <p className="text-sm text-muted max-w-3xl leading-relaxed m-0">
            Restyled strictly according to the Sanford AI Studio Design System. Color system: white and red.
            One primary action button per screen in Sanford red (<code className="text-brand font-bold">#C8281E</code>).
            Selection is a 2px ink ring (<code className="text-ink font-bold">#14161B</code>). All controls have minimum 44px touch targets.
          </p>

          {/* Color token swatches */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 mt-3 pt-4 border-t border-track">
            {[
              { name: '--brand', val: '#C8281E', text: 'text-white', desc: 'Primary Action' },
              { name: '--brand-hover', val: '#A8201A', text: 'text-white', desc: 'Hover / Links' },
              { name: '--ink', val: '#14161B', text: 'text-white', desc: 'Pill / Ring' },
              { name: '--page', val: '#F5F6F8', text: 'text-ink', border: true, desc: 'Canvas / Bg' },
              { name: '--surface', val: '#FFFFFF', text: 'text-ink', border: true, desc: 'Panels / Cards' },
              { name: '--track', val: '#EEF0F3', text: 'text-ink', border: true, desc: 'Segmented Track' },
              { name: '--ok-bg', val: '#E7F6EC', text: 'text-[#126C34]', desc: 'Pass / Approved' },
              { name: '--warn-bg', val: '#FFF4D6', text: 'text-[#7A4F00]', desc: 'Warning / Review' },
            ].map((token) => (
              <div
                key={token.name}
                className={`p-2.5 rounded-field flex flex-col gap-1 ${
                  token.border ? 'border border-border-strong' : ''
                }`}
                style={{ backgroundColor: token.val }}
              >
                <span className={`text-[11px] font-bold ${token.text}`}>{token.name}</span>
                <span className={`text-[10px] opacity-80 ${token.text}`}>{token.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 1. BUTTONS */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-ink m-0">1. Button</h2>
              <p className="text-xs text-muted m-0">
                Primary (Red, one per screen), Secondary (White outline), Ghost (Transparent), Destructive (Red hover).
              </p>
            </div>
            <span className="text-xs text-muted font-mono">src/components/ui/Button.tsx</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Primary */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Button</CardTitle>
                <CardDescription>Strictly 1 per screen for the main action</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button variant="primary">Generate set (44px)</Button>
                <Button variant="primary" size="lg" icon={<Sparkles className="w-4 h-4" />}>
                  Deliver to Amazon (48px)
                </Button>
                <Button variant="primary" size="sm">
                  Quick Save (36px)
                </Button>
                <Button variant="primary" loading>
                  Generating...
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </CardContent>
            </Card>

            {/* Secondary */}
            <Card>
              <CardHeader>
                <CardTitle>Secondary Button</CardTitle>
                <CardDescription>White surface, border-strong, ink text</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button variant="secondary">Regenerate set</Button>
                <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
                  Download ZIP
                </Button>
                <Button variant="secondary" icon={<FolderOpen className="w-4 h-4" />} iconPosition="right">
                  Open folder
                </Button>
                <Button variant="secondary" loading>
                  Processing...
                </Button>
                <Button variant="secondary" disabled>
                  Disabled
                </Button>
              </CardContent>
            </Card>

            {/* Ghost */}
            <Card>
              <CardHeader>
                <CardTitle>Ghost Button</CardTitle>
                <CardDescription>Transparent, grey hover, zero border</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button variant="ghost">Cancel</Button>
                <Button variant="ghost" icon={<Settings className="w-4 h-4" />}>
                  More options
                </Button>
                <Button variant="ghost" size="sm">
                  View full history
                </Button>
                <Button variant="ghost" loading>
                  Loading
                </Button>
                <Button variant="ghost" disabled>
                  Disabled
                </Button>
              </CardContent>
            </Card>

            {/* Destructive */}
            <Card>
              <CardHeader>
                <CardTitle>Destructive Button</CardTitle>
                <CardDescription>Safe outlined by default; brand red hover</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button variant="destructive" icon={<Trash2 className="w-4 h-4" />}>
                  Delete project
                </Button>
                <Button variant="destructive" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />}>
                  Remove photo
                </Button>
                <Button variant="destructive" loading>
                  Deleting...
                </Button>
                <Button variant="destructive" disabled>
                  Disabled
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 2. ICON BUTTONS & AVATAR */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-ink m-0">2. IconButton & Avatar</h2>
              <p className="text-xs text-muted m-0">
                Minimum 44×44px touch targets with mandatory accessible labels.
              </p>
            </div>
            <span className="text-xs text-muted font-mono">src/components/ui/IconButton.tsx</span>
          </div>

          <Card>
            <CardContent className="flex flex-wrap items-center gap-6 py-6">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-ink-2">Secondary Outline</span>
                <div className="flex items-center gap-2">
                  <IconButton aria-label="Notifications" size="sm">
                    <Bell className="w-4 h-4" />
                  </IconButton>
                  <IconButton aria-label="Notifications" size="md">
                    <Bell className="w-4 h-4" />
                  </IconButton>
                  <IconButton aria-label="Notifications" size="lg">
                    <Bell className="w-5 h-5" />
                  </IconButton>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-ink-2">Ghost</span>
                <div className="flex items-center gap-2">
                  <IconButton aria-label="Settings" variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </IconButton>
                  <IconButton aria-label="Settings" variant="ghost" size="md">
                    <Settings className="w-4 h-4" />
                  </IconButton>
                  <IconButton aria-label="Settings" variant="ghost" size="lg">
                    <Settings className="w-5 h-5" />
                  </IconButton>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-ink-2">Dark Pill</span>
                <div className="flex items-center gap-2">
                  <IconButton aria-label="Add item" variant="dark" size="sm">
                    <Plus className="w-4 h-4" />
                  </IconButton>
                  <IconButton aria-label="Add item" variant="dark" size="md">
                    <Plus className="w-4 h-4" />
                  </IconButton>
                  <IconButton aria-label="Add item" variant="dark" size="lg">
                    <Plus className="w-5 h-5" />
                  </IconButton>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-ink-2">User Avatars (Ink + Initials)</span>
                <div className="flex items-center gap-2">
                  <Avatar name="Administrator" size="sm" />
                  <Avatar name="Sanford Studio" size="md" />
                  <Avatar name="Ajil Muhammed" size="lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 3. FORM CONTROLS */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-ink m-0">3. Field, Select & Textarea</h2>
              <p className="text-xs text-muted m-0">
                10px radius, 44px input height, label above, helper / error below.
              </p>
            </div>
            <span className="text-xs text-muted font-mono">Field · Select · Textarea</span>
          </div>

          <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
              <div className="flex flex-col gap-4">
                <Field
                  label="Product Name"
                  required
                  placeholder="e.g. Sanford 1200W Garment Steamer"
                  defaultValue="Sanford Hair Dryer SF935HFN"
                />
                <Field
                  label="Model Number"
                  required
                  placeholder="e.g. SF935HFN"
                  defaultValue="SF935HFN"
                  helperText="Exact Sanford model code from product packaging"
                />
                <Field
                  label="Search Catalogue"
                  prefixIcon={<Search className="w-4 h-4" />}
                  placeholder="Type to filter..."
                />
              </div>

              <div className="flex flex-col gap-4">
                <Select
                  label="E-Commerce Marketplace"
                  required
                  defaultValue="amazon"
                  options={[
                    { value: 'amazon', label: 'Amazon India / Global (2000×2000 JPEG)' },
                    { value: 'noon', label: 'Noon UAE (2000×2000 JPEG - 6 Views)' },
                    { value: 'shopify', label: 'Shopify / BuySanford (WebP)' },
                  ]}
                  helperText="Enforces dedicated compliance requirements"
                />

                <Field
                  label="Field with Error"
                  error="Model number is required to generate Amazon SEO assets"
                  defaultValue=""
                  placeholder="Enter model number"
                />

                <Select
                  label="Disabled Select"
                  disabled
                  defaultValue="locked"
                  options={[{ value: 'locked', label: 'Inherited from Brand Kit' }]}
                />
              </div>

              <div className="flex flex-col gap-4">
                <Textarea
                  label="Verified Specifications"
                  required
                  rows={4}
                  defaultValue="1200 Watts High Power&#10;Foldable Handle Design&#10;2 Speed Heat Settings&#10;Overheat Safety Protection"
                  helperText="One verified spec per line. Never invent specifications."
                />

                <Textarea
                  label="Request a Change (Inspector)"
                  placeholder="Describe specific visual adjustments..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. SEGMENTED & TABS */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-ink m-0">4. Segmented Control & Tabs</h2>
              <p className="text-xs text-muted m-0">
                Segmented = universal pick-one (raised white on grey track). Tabs = page section navigation (ink underline).
              </p>
            </div>
            <span className="text-xs text-muted font-mono">Segmented · Tabs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Segmented Controls</CardTitle>
                <CardDescription>White raised segment on #EEF0F3 grey track</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div>
                  <span className="text-xs font-bold text-ink-2 mb-2 block">Marketplace Target</span>
                  <Segmented
                    value={selectedMarketplace}
                    onChange={(val) => setSelectedMarketplace(val as any)}
                    options={[
                      { value: 'amazon', label: 'Amazon', badge: 'JPEG' },
                      { value: 'noon', label: 'noon UAE', badge: 'JPEG' },
                      { value: 'shopify', label: 'Shopify', badge: 'WebP' },
                    ]}
                  />
                </div>

                <div>
                  <span className="text-xs font-bold text-ink-2 mb-2 block">Generation Quality</span>
                  <Segmented
                    value={selectedQuality}
                    onChange={(val) => setSelectedQuality(val as any)}
                    options={[
                      { value: 'draft', label: 'Draft' },
                      { value: 'standard', label: 'Standard' },
                      { value: 'high', label: 'High' },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Page Tabs</CardTitle>
                <CardDescription>Ink text + 2px ink underline when active</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Tabs
                  activeId={activeTab}
                  onChange={setActiveTab}
                  tabs={[
                    { id: 'all', label: 'All Images', count: 6 },
                    { id: 'approved', label: 'Approved', count: 3 },
                    { id: 'in_review', label: 'In Review', count: 2 },
                    { id: 'failed', label: 'Failed', count: 1 },
                  ]}
                />
                <p className="text-xs text-muted">
                  Active filter tab: <strong className="text-ink">{activeTab}</strong>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 5. BADGES */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-ink m-0">5. Badges (Lifecycle, Checks & Channels)</h2>
              <p className="text-xs text-muted m-0">
                Pass is green. Warning is amber. Fail is ALWAYS black with white text, never red!
              </p>
            </div>
            <span className="text-xs text-muted font-mono">src/components/ui/Badge.tsx</span>
          </div>

          <Card>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-ink-2">Lifecycle Badges</span>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge lifecycle="draft" />
                  <Badge lifecycle="generating" />
                  <Badge lifecycle="in_review" />
                  <Badge lifecycle="approved" />
                  <Badge lifecycle="delivered" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-ink-2">Compliance Checks Badges</span>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge check="pass">2000 × 2000 px</Badge>
                  <Badge check="warning">Small labels</Badge>
                  <Badge check="fail">Low contrast (Fail is Black!)</Badge>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-ink-2">Channel Connection Status</span>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge channel="connected">Amazon Central</Badge>
                  <Badge channel="disconnected">Shopify Store</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 6. STAGEBAR */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-ink m-0">6. StageBar Stepper</h2>
              <p className="text-xs text-muted m-0">
                Brief → Generate → Review → Deliver. Done = ink circle + check, Current = ink ring.
              </p>
            </div>
            <span className="text-xs text-muted font-mono">src/components/ui/StageBar.tsx</span>
          </div>

          <Card>
            <CardContent className="py-6 flex flex-col gap-4">
              <StageBar
                currentStepIndex={stageIndex}
                onStepClick={(idx) => setStageIndex(idx)}
              />
              <div className="flex items-center gap-2 pt-2 border-t border-track">
                <span className="text-xs text-muted">Test stepper state:</span>
                {[0, 1, 2, 3].map((step) => (
                  <Button
                    key={step}
                    size="sm"
                    variant={stageIndex === step ? 'primary' : 'secondary'}
                    onClick={() => setStageIndex(step)}
                  >
                    Step {step + 1}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 7. IMAGE TILES */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-ink m-0">7. ImageTile (Canvas Component)</h2>
              <p className="text-xs text-muted m-0">
                Slot name on its own line (no truncation). Checkbox top-left. Status badge corner. Selection ring.
              </p>
            </div>
            <span className="text-xs text-muted font-mono">src/components/ui/ImageTile.tsx</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <ImageTile
              slotNumber={1}
              title="Hero · White Background"
              imageUrl="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80"
              status="approved"
              isSelected={selectedTile === 1}
              isChecked={checkedTiles[1]}
              onSelect={() => setSelectedTile(1)}
              onCheckChange={() => toggleTileCheck(1)}
            />

            <ImageTile
              slotNumber={2}
              title="Lifestyle In-Use Scene"
              imageUrl="https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80"
              status="in_review"
              isSelected={selectedTile === 2}
              isChecked={checkedTiles[2]}
              onSelect={() => setSelectedTile(2)}
              onCheckChange={() => toggleTileCheck(2)}
            />

            <ImageTile
              slotNumber={3}
              title="Specifications Infographic Part 1"
              imageUrl="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80"
              status="approved"
              isSelected={selectedTile === 3}
              isChecked={checkedTiles[3]}
              onSelect={() => setSelectedTile(3)}
              onCheckChange={() => toggleTileCheck(3)}
            />

            <ImageTile
              slotNumber={4}
              title="Dimensions & Warranty Seal"
              status="failed"
              statusLabel="Check failed"
              isSelected={selectedTile === 4}
              isChecked={checkedTiles[4]}
              onSelect={() => setSelectedTile(4)}
              onCheckChange={() => toggleTileCheck(4)}
              onRetry={() =>
                showToast({
                  type: 'info',
                  title: 'Retrying Slot 4',
                  message: 'Sending image back to generation queue...',
                })
              }
            />

            <ImageTile
              slotNumber={5}
              title="Available Color Variants"
              status="generating"
              generatingProgress={65}
              generatingStep="Step 2 of 3 · Rendering"
              isSelected={selectedTile === 5}
              isChecked={checkedTiles[5]}
              onSelect={() => setSelectedTile(5)}
              onCheckChange={() => toggleTileCheck(5)}
            />
          </div>
        </section>

        {/* 8. SWITCH, SKELETON & EMPTY STATE */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-ink m-0">8. Switch, Skeleton & EmptyState</h2>
              <p className="text-xs text-muted m-0">
                Accessible toggles, responsive pulse skeletons, and clear next-step empty states.
              </p>
            </div>
            <span className="text-xs text-muted font-mono">Switch · Skeleton · EmptyState</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Switch */}
            <Card>
              <CardHeader>
                <CardTitle>Accessible Switches</CardTitle>
                <CardDescription>44px minimum touch targets with dark active state</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Switch
                  checked={switch1}
                  onChange={setSwitch1}
                  label="Style Reference Lock"
                  description="Use approved Slot 1 hero image as visual anchor"
                />
                <Switch
                  checked={switch2}
                  onChange={setSwitch2}
                  label="Auto-Deliver to Amazon"
                  description="Push listing directly once all 6 slots are approved"
                />
                <Switch
                  checked={false}
                  disabled
                  onChange={() => {}}
                  label="ERP Price Sync"
                  description="Disabled · Requires Admin permission"
                />
              </CardContent>
            </Card>

            {/* Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>Loading Skeletons</CardTitle>
                <CardDescription>Subtle #EEF0F3 pulse animation</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" width={40} height={40} />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Skeleton width="60%" height={14} />
                    <Skeleton width="40%" height={10} />
                  </div>
                </div>
                <Skeleton width="100%" height={80} />
                <div className="flex gap-2">
                  <Skeleton width="50%" height={36} />
                  <Skeleton width="50%" height={36} />
                </div>
              </CardContent>
            </Card>

            {/* Empty State */}
            <EmptyState
              title="No Projects in Queue"
              description="Upload a Sanford product catalogue PDF to start generating listing images."
              action={
                <Button variant="secondary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                  New Catalogue Upload
                </Button>
              }
            />
          </div>
        </section>

        {/* 9. OVERLAYS: DIALOG, DRAWER & TOAST */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-ink m-0">9. Dialog, Drawer & Toast Notifications</h2>
              <p className="text-xs text-muted m-0">
                Smooth transitions, keyboard focus traps, and accessible dismiss triggers.
              </p>
            </div>
            <span className="text-xs text-muted font-mono">Dialog · Drawer · Toast</span>
          </div>

          <Card>
            <CardContent className="flex flex-wrap items-center gap-4 py-6">
              <Button
                variant="secondary"
                onClick={() => setIsDialogOpen(true)}
              >
                Open Confirmation Dialog
              </Button>

              <Button
                variant="secondary"
                onClick={() => setIsDrawerOpen(true)}
              >
                Open Side Drawer
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  showToast({
                    type: 'ok',
                    title: 'Asset Approved',
                    message: 'Slot 1 Hero Image approved for Amazon export.',
                  })
                }
              >
                Show Success Toast
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  showToast({
                    type: 'warn',
                    title: 'Resolution Warning',
                    message: 'Image size is 1600px; Amazon recommends 2000px.',
                  })
                }
              >
                Show Warning Toast
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  showToast({
                    type: 'fail',
                    title: 'Compliance Check Failed',
                    message: 'Text detected on primary hero background.',
                  })
                }
              >
                Show Fail Toast
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Interactive Dialog Demo */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Approve Listing Image Set?"
        description="This will lock all 6 generated images and mark the project ready for export."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsDialogOpen(false);
                showToast({
                  type: 'ok',
                  title: 'Listing Set Approved',
                  message: 'Ready for WebP / 2000px JPEG export.',
                });
              }}
            >
              Confirm Approval
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 py-2 text-sm text-muted">
          <p className="m-0">
            Please ensure you have reviewed all compliance checks against the target marketplace guidelines:
          </p>
          <ul className="m-0 pl-5 space-y-1 list-disc text-ink-2">
            <li>Pure white background on hero slot (#FFFFFF)</li>
            <li>No promotional text or warranty seals on primary view</li>
            <li>Verified specifications match packaging and user manual</li>
          </ul>
        </div>
      </Dialog>

      {/* Interactive Drawer Demo */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Image Inspector"
        description="Slot 3 · Specifications Part 1"
        footer={
          <div className="flex gap-2 w-full">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setIsDrawerOpen(false)}
            >
              Send Back
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setIsDrawerOpen(false);
                showToast({ type: 'ok', title: 'Slot 3 Approved' });
              }}
            >
              Approve
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="aspect-square w-full rounded-button overflow-hidden bg-track flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80"
              alt="Preview"
              className="w-full h-full object-contain p-4"
            />
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-bold text-ink m-0">Compliance Evaluation</h4>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs p-2 rounded-field bg-ok-bg text-ok-fg">
                <span>Aspect ratio 1:1 Square</span>
                <span className="font-bold">✓ Pass</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-field bg-ok-bg text-ok-fg">
                <span>Resolution 2000 × 2000px</span>
                <span className="font-bold">✓ Pass</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-field bg-warn-bg text-warn-fg">
                <span>Font readability on mobile</span>
                <span className="font-bold">! Check</span>
              </div>
            </div>
          </div>

          <Textarea
            label="Inspector Note"
            placeholder="Add change request for the designer/model..."
            rows={3}
          />
        </div>
      </Drawer>
    </div>
  );
}

export default function DevComponents() {
  return (
    <ToastProvider>
      <DevComponentsContent />
    </ToastProvider>
  );
}
