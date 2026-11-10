import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectStorage } from '../lib/projectStorage';
import type { ProjectData } from '../types';
import {
  ShoppingCart,
  Megaphone,
  Box,
  FileText,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentProjects, setRecentProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const data = await projectStorage.getProjects(user.id);
        setRecentProjects(data.slice(0, 4));
      } catch (err) {
        console.warn('Error loading recent projects:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  // Sample schedule posts matching Home.reference.html
  const scheduledPosts = [
    { dow: 'Tue', day: 10, title: 'Launch post', meta: '18:30 · Instagram, Facebook', status: 'Scheduled', badge: 'approved' as const },
    { dow: 'Tue', day: 10, title: 'Launch story', meta: '20:00 · Instagram', status: 'Scheduled', badge: 'approved' as const },
    { dow: 'Thu', day: 12, title: 'Pick your colour', meta: '12:00 · WhatsApp', status: 'Reminder', badge: 'draft' as const },
    { dow: 'Sat', day: 14, title: 'Fan demo cover', meta: '18:00 · TikTok', status: 'In review', badge: 'in_review' as const },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight m-0">
          Welcome back
        </h1>
        <p className="text-sm text-muted m-0">
          3 things need your attention today.
        </p>
      </div>

      {/* 1. "Needs you" Action Cards */}
      <section aria-labelledby="needs-heading" className="flex flex-col gap-3">
        <h2 id="needs-heading" className="text-base font-extrabold text-ink m-0">
          Needs you
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: In review */}
          <article className="p-4 rounded-card bg-surface border border-border flex gap-3.5 shadow-2xs">
            <div className="w-16 h-16 rounded-[10px] border border-track bg-surface flex items-center justify-center shrink-0 overflow-hidden">
              <ShoppingCart className="w-7 h-7 text-ink" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <Badge lifecycle="in_review" size="sm" className="self-start" />
              <h3 className="text-sm font-bold text-ink leading-tight m-0 truncate">
                Approve "Dimensions & warranty"
              </h3>
              <p className="text-xs text-muted m-0 truncate">
                SF935HFN · Amazon set · 1 warning
              </p>
              <button
                type="button"
                onClick={() => navigate('/studio')}
                className="text-xs font-bold text-ink hover:text-brand mt-1 flex items-center gap-1 cursor-pointer text-left"
              >
                <span>Review</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>

          {/* Card 2: Blocked */}
          <article className="p-4 rounded-card bg-surface border border-border flex gap-3.5 shadow-2xs">
            <div className="w-16 h-16 rounded-[10px] bg-warn-bg text-warn-fg flex items-center justify-center shrink-0">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="self-start h-5 px-2 rounded-full bg-warn-bg text-warn-fg text-[11px] font-bold inline-flex items-center">
                Blocked
              </span>
              <h3 className="text-sm font-bold text-ink leading-tight m-0 truncate">
                Rating label is waiting
              </h3>
              <p className="text-xs text-muted m-0 truncate">
                Needs lab test verification
              </p>
              <button
                type="button"
                onClick={() => navigate('/work')}
                className="text-xs font-bold text-ink hover:text-brand mt-1 flex items-center gap-1 cursor-pointer text-left"
              >
                <span>Open task</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>

          {/* Card 3: Not connected */}
          <article className="p-4 rounded-card bg-surface border border-border flex gap-3.5 shadow-2xs">
            <div className="w-16 h-16 rounded-[10px] bg-track text-ink flex items-center justify-center shrink-0">
              <LinkIcon className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <Badge channel="disconnected" size="sm" className="self-start" />
              <h3 className="text-sm font-bold text-ink leading-tight m-0 truncate">
                TikTok isn't connected
              </h3>
              <p className="text-xs text-muted m-0 truncate">
                1 scheduled post will be a reminder
              </p>
              <button
                type="button"
                onClick={() => navigate('/settings/connections')}
                className="text-xs font-bold text-ink hover:text-brand mt-1 flex items-center gap-1 cursor-pointer text-left"
              >
                <span>Connect</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* 2. "Start a project" Studio Launchers */}
      <section aria-labelledby="start-heading" className="flex flex-col gap-3">
        <h2 id="start-heading" className="text-base font-extrabold text-ink m-0">
          Start a project
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => navigate('/studio')}
            className="p-3.5 rounded-card border border-border bg-surface hover:border-border-strong hover:shadow-xs flex items-center gap-3.5 transition-all text-left cursor-pointer select-none group"
          >
            <div className="w-11 h-11 rounded-field bg-track text-ink flex items-center justify-center shrink-0 group-hover:bg-ink group-hover:text-white transition-colors">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-bold text-ink leading-tight">
                E-commerce set
              </span>
              <span className="text-xs text-muted leading-tight">
                Amazon, noon, Shopify
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/studio/social')}
            className="p-3.5 rounded-card border border-border bg-surface hover:border-border-strong hover:shadow-xs flex items-center gap-3.5 transition-all text-left cursor-pointer select-none group"
          >
            <div className="w-11 h-11 rounded-field bg-track text-ink flex items-center justify-center shrink-0 group-hover:bg-ink group-hover:text-white transition-colors">
              <Megaphone className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-bold text-ink leading-tight">
                Social posts
              </span>
              <span className="text-xs text-muted leading-tight">
                Posts, stories, posters
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/studio/packaging')}
            className="p-3.5 rounded-card border border-border bg-surface hover:border-border-strong hover:shadow-xs flex items-center gap-3.5 transition-all text-left cursor-pointer select-none group"
          >
            <div className="w-11 h-11 rounded-field bg-track text-ink flex items-center justify-center shrink-0 group-hover:bg-ink group-hover:text-white transition-colors">
              <Box className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-bold text-ink leading-tight">
                Packaging
              </span>
              <span className="text-xs text-muted leading-tight">
                Box, carton, label
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/studio/flyers')}
            className="p-3.5 rounded-card border border-border bg-surface hover:border-border-strong hover:shadow-xs flex items-center gap-3.5 transition-all text-left cursor-pointer select-none group"
          >
            <div className="w-11 h-11 rounded-field bg-track text-ink flex items-center justify-center shrink-0 group-hover:bg-ink group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-bold text-ink leading-tight">
                Retail flyer
              </span>
              <span className="text-xs text-muted leading-tight">
                Supermarket promotions
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* 3. "In progress" Projects & "This week's posts" */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* In progress list (2/3 width) */}
        <section aria-labelledby="in-progress-heading" className="lg:col-span-2 bg-surface border border-border rounded-card p-5 flex flex-col gap-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-track">
            <h2 id="in-progress-heading" className="text-base font-extrabold text-ink m-0">
              In progress
            </h2>
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="text-xs font-bold text-ink hover:text-brand"
            >
              All projects →
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-muted">
              Loading recent projects...
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
              <p className="text-xs font-bold text-ink m-0">No active projects yet</p>
              <p className="text-xs text-muted m-0">
                Launch the E-Commerce Studio to generate your first listing images.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-2"
                onClick={() => navigate('/studio')}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                New Studio Run
              </Button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-track">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate('/studio')}
                  className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-page/50 rounded-field px-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-field border border-track bg-surface flex items-center justify-center shrink-0 overflow-hidden">
                      {project.source_image_data_url ? (
                        <img
                          src={project.source_image_data_url}
                          alt=""
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <ShoppingCart className="w-5 h-5 text-muted" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-ink truncate leading-tight">
                        {project.product_name || 'Untitled Product'}
                      </span>
                      <span className="text-xs text-muted truncate">
                        {project.model_number ? `Model ${project.model_number}` : 'E-commerce set'} · {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge lifecycle="in_review" size="sm" />
                    <ArrowRight className="w-4 h-4 text-muted" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* This week's posts (1/3 width) */}
        <section aria-labelledby="schedule-heading" className="bg-surface border border-border rounded-card p-5 flex flex-col gap-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-track">
            <h2 id="schedule-heading" className="text-base font-extrabold text-ink m-0">
              This week's posts
            </h2>
            <button
              type="button"
              onClick={() => navigate('/calendar')}
              className="text-xs font-bold text-ink hover:text-brand"
            >
              Calendar →
            </button>
          </div>

          <div className="flex flex-col divide-y divide-track">
            {scheduledPosts.map((post, idx) => (
              <div key={idx} className="py-3 flex items-center gap-3">
                <div className="w-10 flex flex-col items-center shrink-0">
                  <span className="text-[11px] font-semibold text-muted">{post.dow}</span>
                  <span className="text-base font-extrabold text-ink leading-none">{post.day}</span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-ink truncate">{post.title}</span>
                  <span className="text-[11px] text-muted truncate">{post.meta}</span>
                </div>
                <Badge lifecycle={post.badge} size="sm">
                  {post.status}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
