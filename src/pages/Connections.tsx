import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Switch } from '../components/ui/Switch';
import { Segmented } from '../components/ui/Segmented';
import { ShopifyIcon, AmazonIcon, NoonIcon } from '../components/PlatformIcons';
import {
  Database,
  Share2,
  Sparkles,
  Bot,
} from 'lucide-react';

interface ConnectionItem {
  id: string;
  name: string;
  does: string;
  connected: boolean;
  icon?: React.ReactNode;
  letter?: string;
}

interface ConnectionGroup {
  name: string;
  desc: string;
  isPublishing?: boolean;
  items: ConnectionItem[];
}

export function Connections() {
  const [level, setLevel] = useState<number>(1);
  const [publishVia, setPublishVia] = useState<'service' | 'direct'>('service');
  const [monthlyBudget, setMonthlyBudget] = useState('500');
  const [campaignBudget, setCampaignBudget] = useState('50');

  const [connections, setConnections] = useState<Record<string, boolean>>({
    erp: true,
    instagram: true,
    facebook: true,
    tiktok: false,
    whatsapp: false,
    shopify: true,
    amazon: true,
    noon: true,
    canva: true,
    drive: false,
    openai: true,
    gemini: true,
  });

  const [rules, setRules] = useState<boolean[]>([
    true, // campaign created -> draft deliverables
    true, // image set approved -> upload to matching listing
    true, // social post approved -> schedule
    true, // image fails check -> create review task
    false, // task overdue -> remind assignee
    true, // ERP specs change -> flag images
    true, // budget reaches 80% -> notify admin
  ]);

  const toggleConnection = (id: string) => {
    setConnections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRule = (idx: number) => {
    setRules((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const autonomyLevels = [
    {
      title: 'Suggest only',
      desc: 'Answers questions and drafts copy when asked. Nothing runs on its own.',
    },
    {
      title: 'Plan, then I approve',
      desc: 'Drafts campaign plans and tasks. Generation starts only after a person accepts the plan.',
    },
    {
      title: 'Run approved recipes',
      desc: 'Generates drafts on its own for proven recipes. People still review every item.',
    },
  ];

  const groups: ConnectionGroup[] = [
    {
      name: 'Company data',
      desc: 'Products, prices and barcodes come from here, so nobody retypes a fact.',
      items: [
        {
          id: 'erp',
          name: 'Sanford ERP',
          does: 'Syncs SKUs, specs, prices and barcodes directly into Products catalog.',
          connected: connections.erp,
          icon: <Database className="w-4 h-4 text-ink" />,
        },
      ],
    },
    {
      name: 'Publishing',
      desc:
        publishVia === 'service'
          ? 'Posts through a publishing service; no platform app review needed to start.'
          : 'Your own Meta and TikTok apps; requires individual platform review.',
      isPublishing: true,
      items: [
        {
          id: 'instagram',
          name: 'Instagram',
          does: 'Posts, stories and carousels automatically scheduled from the calendar.',
          connected: connections.instagram,
          letter: 'IG',
        },
        {
          id: 'facebook',
          name: 'Facebook Page',
          does: 'Feed and promotional product announcements from the calendar.',
          connected: connections.facebook,
          letter: 'FB',
        },
        {
          id: 'tiktok',
          name: 'TikTok',
          does: 'Vertical covers and promotional videos from the calendar.',
          connected: connections.tiktok,
          letter: 'TT',
        },
        {
          id: 'whatsapp',
          name: 'WhatsApp Business',
          does: 'Broadcast messages to opted-in B2B partners; status updates.',
          connected: connections.whatsapp,
          letter: 'WA',
        },
      ],
    },
    {
      name: 'Selling channels',
      desc: 'Approved image sets upload directly to matching marketplace listings.',
      items: [
        {
          id: 'shopify',
          name: 'Shopify',
          does: 'Adds approved images to BuySanford products by SKU in slot order.',
          connected: connections.shopify,
          icon: <ShopifyIcon className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'amazon',
          name: 'Amazon',
          does: 'Sends compliant 2000px JPEG sets to Seller Central listings via SP-API.',
          connected: connections.amazon,
          icon: <AmazonIcon className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'noon',
          name: 'Noon',
          does: 'Uploads official 6-view photographic angles to Noon Seller Lab catalog.',
          connected: connections.noon,
          icon: <NoonIcon className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      name: 'Design and files',
      desc: 'For the last mile delivery and archival backups.',
      items: [
        {
          id: 'canva',
          name: 'Canva',
          does: 'Opens flyers and posters for final hand edits and print touchups.',
          connected: connections.canva,
          letter: 'C',
        },
        {
          id: 'drive',
          name: 'Google Drive',
          does: 'Keeps an offsite cloud backup of every delivered print and web ZIP package.',
          connected: connections.drive,
          letter: 'GD',
        },
      ],
    },
    {
      name: 'AI engines',
      desc: 'API keys live securely on the server. Every call is logged with its exact cost.',
      items: [
        {
          id: 'openai',
          name: 'OpenAI (GPT-4o & DALL-E 3)',
          does: 'Plans campaigns, writes copy, extracts specs from PDFs, and generates studio images.',
          connected: connections.openai,
          icon: <Sparkles className="w-4 h-4 text-ink" />,
        },
        {
          id: 'gemini',
          name: 'Google Gemini 2.0',
          does: 'Multimodal vision and secondary high-resolution studio generation engine.',
          connected: connections.gemini,
          letter: 'G',
        },
      ],
    },
  ];

  const automationRules = [
    { when: 'a campaign is created', then: 'Draft its deliverables from the chosen recipe' },
    { when: 'an image set is approved', then: 'Upload it to the Shopify, Amazon, or Noon listing' },
    { when: 'a social post is approved', then: 'Schedule it on its calendar date automatically' },
    { when: 'an image fails a check', then: 'Create a review task for the designated studio owner' },
    { when: 'a task is one day overdue', then: 'Remind the assignee and the admin via email' },
    { when: 'ERP specs or prices change', then: 'Flag every image, pack, and flyer that prints them' },
    { when: 'the AI budget reaches 80%', then: 'Notify the admin and pause unattended background runs' },
  ];

  return (
    <div className="min-h-full flex flex-col bg-background text-ink">
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex flex-col gap-6">
        {/* Page Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-ink m-0">
            Settings
          </h1>
          <p className="text-sm text-muted m-0">
            Connect once as admin. Staff use connections without seeing any password or key.
          </p>
        </div>

        {/* Settings Navigation Tabs */}
        <nav
          aria-label="Settings"
          className="flex flex-wrap items-center gap-6 border-b border-border pb-px text-sm"
        >
          <Link
            to="/admin"
            className="h-10 flex items-center font-medium text-muted hover:text-ink transition-colors"
          >
            Team and roles
          </Link>
          <span className="h-10 flex items-center font-extrabold text-ink border-b-2 border-ink cursor-default">
            Connections and agent
          </span>
          <span className="h-10 flex items-center font-medium text-muted/60 cursor-not-allowed">
            AI usage
          </span>
          <span className="h-10 flex items-center font-medium text-muted/60 cursor-not-allowed">
            Audit log
          </span>
        </nav>

        {/* 2-Column Layout: Main Controls vs Automation Rules Sidebar */}
        <div className="flex flex-col lg:flex-row items-start gap-6 min-w-0">
          {/* Left Column: Autonomy & Services */}
          <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
            {/* Agent Autonomy Card */}
            <section
              aria-labelledby="agent-heading"
              className="bg-surface border border-border rounded-card p-5 sm:p-6 flex flex-col gap-4 shadow-2xs"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-ink" />
                  <h2 id="agent-heading" className="text-base font-extrabold text-ink m-0">
                    Agent autonomy
                  </h2>
                </div>
                <span className="text-xs text-muted">
                  Raise the level only when the first-try approval rate is high. The agent never approves or publishes on its own.
                </span>
              </div>

              {/* Autonomy Level Cards */}
              <div
                role="radiogroup"
                aria-label="Autonomy level"
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                {autonomyLevels.map((lvl, idx) => {
                  const isSelected = level === idx;
                  return (
                    <button
                      key={lvl.title}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setLevel(idx)}
                      className={`p-4 rounded-card text-left transition-all cursor-pointer flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-surface border-2 border-ink shadow-xs'
                          : 'bg-track/50 border border-border hover:bg-track hover:border-border-strong'
                      }`}
                    >
                      <span className="text-sm font-extrabold text-ink">{lvl.title}</span>
                      <span className="text-xs text-muted leading-relaxed">{lvl.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Budget Caps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-track">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cap-monthly" className="text-xs font-bold text-muted">
                    Monthly AI budget cap (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">
                      $
                    </span>
                    <input
                      id="cap-monthly"
                      type="number"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      className="h-10 pl-7 pr-3 w-full bg-track border border-transparent focus:border-border rounded-field text-sm font-mono text-ink focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cap-campaign" className="text-xs font-bold text-muted">
                    Cap per campaign (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">
                      $
                    </span>
                    <input
                      id="cap-campaign"
                      type="number"
                      value={campaignBudget}
                      onChange={(e) => setCampaignBudget(e.target.value)}
                      className="h-10 pl-7 pr-3 w-full bg-track border border-transparent focus:border-border rounded-field text-sm font-mono text-ink focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Connection Groups */}
            {groups.map((group) => (
              <section key={group.name} className="flex flex-col gap-3">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="text-base font-extrabold text-ink m-0">{group.name}</h2>
                    <span className="text-xs text-muted">{group.desc}</span>
                  </div>

                  {group.isPublishing && (
                    <Segmented
                      size="sm"
                      value={publishVia}
                      onChange={(val) => setPublishVia(val as any)}
                      options={[
                        { value: 'service', label: 'Publishing service' },
                        { value: 'direct', label: 'Direct apps' },
                      ]}
                      className="shrink-0"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {group.items.map((conn) => (
                    <article
                      key={conn.id}
                      className="bg-surface border border-border rounded-card p-4 flex flex-col justify-between gap-3 shadow-2xs hover:border-border-strong transition-colors"
                    >
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-field bg-track border border-track flex items-center justify-center shrink-0">
                            {conn.icon ? (
                              conn.icon
                            ) : (
                              <span className="font-extrabold text-xs text-ink">
                                {conn.letter}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm text-ink truncate">
                              {conn.name}
                            </span>
                            <span
                              className={`text-[11px] font-bold ${
                                conn.connected ? 'text-ok-fg' : 'text-muted'
                              }`}
                            >
                              {conn.connected ? 'Connected' : 'Not connected'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-muted leading-relaxed m-0">{conn.does}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleConnection(conn.id)}
                        className={`h-9 px-3.5 rounded-field text-xs font-bold transition-all cursor-pointer ${
                          conn.connected
                            ? 'bg-surface border border-border text-ink hover:bg-track'
                            : 'bg-ink text-white hover:bg-ink-hover'
                        }`}
                      >
                        {conn.connected ? 'Manage' : 'Connect'}
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Right Column: Automation Rules Aside (Matching Connections.reference.html) */}
          <aside
            aria-labelledby="rules-heading"
            className="w-full lg:w-[320px] xl:w-[350px] shrink-0 bg-surface border border-border rounded-card p-5 sm:p-6 flex flex-col gap-4 shadow-2xs"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-ink" />
                <h2 id="rules-heading" className="text-base font-extrabold text-ink m-0">
                  Automation rules
                </h2>
              </div>
              <p className="text-xs text-muted leading-relaxed m-0">
                Rules run after a person approves. They handle the busywork, not the decisions.
              </p>
            </div>

            <div className="flex flex-col divide-y divide-track">
              {automationRules.map((rule, idx) => (
                <div
                  key={rule.when}
                  className="py-3.5 first:pt-2 last:pb-0 flex items-start justify-between gap-3"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider">
                      When {rule.when}
                    </span>
                    <span className="text-xs font-semibold text-ink leading-snug">
                      {rule.then}
                    </span>
                  </div>

                  <Switch
                    checked={rules[idx]}
                    onChange={() => toggleRule(idx)}
                    aria-label={`Rule: ${rule.then}`}
                  />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
