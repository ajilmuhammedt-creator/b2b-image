import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { projectStorage } from '../lib/projectStorage';
import type { ProjectData, EcommercePlatform } from '../types';
import JSZip from 'jszip';
import { convertToWebpBlob } from '../lib/imageConversion';
import { getSeoImageFilename, getSeoFolderName, getSeoZipFilename } from '../lib/seoNaming';
import { ShopifyIcon, AmazonIcon, NoonIcon } from '../components/PlatformIcons';
import {
  Search,
  Plus,
  RefreshCw,
  Download,
  ExternalLink,
  Trash2,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export function History() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | EcommercePlatform>('all');
  const [downloadingProjectId, setDownloadingProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (user?.id) {
        loadProjects();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const loadProjects = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const data = await projectStorage.getProjects(user.id);
      // Ensure only projects within the last 10 days are displayed
      const now = Date.now();
      const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
      const valid = (data || []).filter((p) => {
        const created = new Date(p.created_at).getTime();
        return now - created <= tenDaysMs;
      });
      // Sort newest first
      valid.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setProjects(valid);
    } catch (err: any) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysRemaining = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    const elapsedMs = Date.now() - createdTime;
    const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
    const daysLeft = Math.ceil(10 - elapsedDays);
    return Math.max(1, Math.min(10, daysLeft));
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/studio?project=${projectId}`);
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!user?.id) return;
    if (confirm('Are you sure you want to permanently delete this project and its generated assets?')) {
      await projectStorage.deleteProject(projectId, user.id);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }
  };

  const handleDownloadAllZip = async (e: React.MouseEvent, project: ProjectData) => {
    e.stopPropagation();
    const completedGens = (project.generations || []).filter(
      (g) => g.status === 'done' && g.imageUrl
    );

    if (completedGens.length === 0) {
      alert('No generated images available to download for this project.');
      return;
    }

    setDownloadingProjectId(project.id);
    try {
      const zip = new JSZip();
      const seoFolder = getSeoFolderName({
        brand: 'Sanford',
        productName: project.product_name,
        modelNumber: project.model_number,
      });
      const zipFileName = getSeoZipFilename({
        brand: 'Sanford',
        productName: project.product_name,
        modelNumber: project.model_number,
      });

      await Promise.all(
        completedGens.map(async (gen, idx) => {
          try {
            const resp = await fetch(gen.imageUrl!);
            const rawBlob = await resp.blob();
            const webpBlob = await convertToWebpBlob(rawBlob);
            const fileName = getSeoImageFilename({
              brand: 'Sanford',
              productName: project.product_name,
              modelNumber: project.model_number,
              item: {
                kind: gen.kind,
                slot: gen.slot,
                slotTitle: (gen as any).slot_title || gen.slotTitle,
                sanfordSlot: gen.theme ? { theme: gen.theme as any } : undefined,
              },
              index: idx + 1,
            });
            zip.file(`${seoFolder}/${fileName}`, webpBlob);
          } catch (fetchErr) {
            console.error(`Failed to download WebP image for slot ${gen.slot}:`, fetchErr);
          }
        })
      );

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);
    } catch (err) {
      console.error('Error generating project zip archive:', err);
      alert('Failed to generate ZIP download. Please try again.');
    } finally {
      setDownloadingProjectId(null);
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      (p.product_name && p.product_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.model_number && p.model_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ((p as any).brand && (p as any).brand.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPlatform =
      platformFilter === 'all' ||
      (platformFilter === 'shopify' && (!p.platform || p.platform === 'shopify')) ||
      (platformFilter === 'amazon' && (p.platform === 'amazon' || p.platform === 'amazon_aplus')) ||
      (platformFilter === 'noon' && (p.platform === 'noon' || p.platform === 'noon_aplus'));

    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="min-h-full flex flex-col bg-background text-ink">
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex flex-col gap-6">
        {/* Header Title & New Run Button */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-ink m-0">
              Project History
            </h1>
            <p className="text-sm text-muted m-0">
              High-resolution assets are retained for 10 days. Reopen any run to inspect or re-download.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={loadProjects}
              loading={loading}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/studio')}
              icon={<Plus className="w-4 h-4" />}
            >
              New Studio Run
            </Button>
          </div>
        </div>

        {/* 10-Day Retention Notice Banner */}
        <div className="p-4 rounded-card bg-surface border border-border flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-track text-ink flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-muted truncate">
              <strong className="text-ink">Automated 10-Day Retention:</strong> Generated images and SEO folders are stored in high resolution for 10 days after generation.
            </span>
          </div>

          <span className="text-[11px] font-bold text-muted bg-track px-2 py-0.5 rounded-full shrink-0">
            {projects.length} saved run{projects.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Platform Segmented Tabs */}
          <div className="inline-flex items-center p-1 bg-track rounded-field gap-1 select-none">
            <button
              type="button"
              onClick={() => setPlatformFilter('all')}
              className={`h-8 px-3 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${
                platformFilter === 'all'
                  ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(20,22,27,0.14)]'
                  : 'text-muted hover:text-ink'
              }`}
            >
              All Runs
            </button>
            <button
              type="button"
              onClick={() => setPlatformFilter('shopify')}
              className={`h-8 px-3 rounded-[8px] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                platformFilter === 'shopify'
                  ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(20,22,27,0.14)]'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <ShopifyIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Shopify</span>
            </button>
            <button
              type="button"
              onClick={() => setPlatformFilter('amazon')}
              className={`h-8 px-3 rounded-[8px] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                platformFilter === 'amazon'
                  ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(20,22,27,0.14)]'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <AmazonIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Amazon</span>
            </button>
            <button
              type="button"
              onClick={() => setPlatformFilter('noon')}
              className={`h-8 px-3 rounded-[8px] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                platformFilter === 'noon'
                  ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(20,22,27,0.14)]'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <NoonIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Noon</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by SKU or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 pr-3 w-full text-xs bg-surface border border-border focus:border-border-strong rounded-field text-ink placeholder-muted focus:outline-none"
            />
          </div>
        </div>

        {/* Projects Data Table */}
        <section
          aria-label="History table"
          className="bg-surface border border-border rounded-card overflow-hidden shadow-2xs"
        >
          <div className="overflow-x-auto">
            <div role="table" aria-label="Projects" className="min-w-[800px] text-sm">
              {/* Table Header */}
              <div
                role="row"
                className="grid grid-cols-[2.8fr_1.3fr_1.5fr_1.2fr_180px] items-center bg-track/60 text-xs font-bold text-muted border-b border-border"
              >
                <span role="columnheader" className="py-2.5 px-4 sm:px-6">
                  Product
                </span>
                <span role="columnheader" className="py-2.5 px-3">
                  Target Platform
                </span>
                <span role="columnheader" className="py-2.5 px-3">
                  Created & Retention
                </span>
                <span role="columnheader" className="py-2.5 px-3">
                  Assets
                </span>
                <span role="columnheader" className="py-2.5 px-4 text-right">
                  Actions
                </span>
              </div>

              {/* Table Body */}
              {loading ? (
                <div className="p-12 text-center text-xs text-muted flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading project history...</span>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-track text-muted flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm text-ink">No projects found</span>
                    <span className="text-xs text-muted max-w-xs">
                      {searchQuery
                        ? 'Try modifying your search or platform filter.'
                        : 'Generate your first listing image set in the E-commerce Studio.'}
                    </span>
                  </div>
                </div>
              ) : (
                filteredProjects.map((project) => {
                  const completedGens = (project.generations || []).filter((g) => g.status === 'done');
                  const thumbnail =
                    completedGens[0]?.imageUrl || project.source_image_data_url || undefined;
                  const daysLeft = calculateDaysRemaining(project.created_at);
                  const createdDate = new Date(project.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  const platform = project.platform || 'shopify';

                  return (
                    <div
                      key={project.id}
                      role="row"
                      onClick={() => handleOpenProject(project.id)}
                      className="grid grid-cols-[2.8fr_1.3fr_1.5fr_1.2fr_180px] items-center border-b border-border hover:bg-track/30 transition-colors cursor-pointer"
                    >
                      {/* Product Thumbnail & Names */}
                      <span role="cell" className="py-3 px-4 sm:px-6 flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-field bg-track border border-track overflow-hidden shrink-0 flex items-center justify-center">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt=""
                              className="w-full h-full object-contain p-0.5"
                            />
                          ) : (
                            <ShoppingBag className="w-4 h-4 text-muted" />
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-ink truncate">
                            {project.model_number ? `${project.model_number} · ` : ''}
                            {project.product_name}
                          </span>
                          <span className="text-xs text-muted truncate">
                            {(project as any).brand || 'Sanford'} · {project.model_number || 'Standard SKU'}
                          </span>
                        </div>
                      </span>

                      {/* Target Platform */}
                      <span role="cell" className="py-3 px-3">
                        {platform === 'amazon' || platform === 'amazon_aplus' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-[#FF9900]/10 text-[#FF9900]">
                            <AmazonIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>Amazon</span>
                          </span>
                        ) : platform === 'noon' || platform === 'noon_aplus' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-[#FEEE00]/20 text-ink">
                            <NoonIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>Noon</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                            <ShopifyIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>Shopify</span>
                          </span>
                        )}
                      </span>

                      {/* Created Date & Retention */}
                      <span role="cell" className="py-3 px-3 flex flex-col min-w-0">
                        <span className="text-xs font-medium text-ink">{createdDate}</span>
                        <span className="text-[11px] text-muted">
                          {daysLeft > 1 ? (
                            <Badge variant="ok">{daysLeft} days left</Badge>
                          ) : (
                            <Badge variant="warn">1 day left</Badge>
                          )}
                        </span>
                      </span>

                      {/* Assets Count */}
                      <span role="cell" className="py-3 px-3 text-xs text-muted font-medium">
                        {completedGens.length} / {project.generations?.length || 6} generated
                      </span>

                      {/* Actions */}
                      <span
                        role="cell"
                        className="py-3 px-4 flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleDownloadAllZip(e, project)}
                          disabled={downloadingProjectId === project.id || completedGens.length === 0}
                          title="Download high-resolution ZIP"
                          className="w-8 h-8 rounded-field border border-border bg-surface hover:bg-track text-ink disabled:opacity-30 flex items-center justify-center cursor-pointer transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenProject(project.id)}
                          title="Reopen in Studio"
                          className="h-8 px-2.5 rounded-field bg-ink hover:bg-ink-hover text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteProject(e, project.id)}
                          title="Delete project"
                          className="w-8 h-8 rounded-field text-muted hover:text-fail-fg hover:bg-fail-bg/20 flex items-center justify-center cursor-pointer transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
