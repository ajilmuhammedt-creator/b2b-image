import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { projectStorage } from '../lib/projectStorage';
import type { ProjectData } from '../types';
import JSZip from 'jszip';
import {
  History as HistoryIcon,
  Calendar,
  Layers,
  ExternalLink,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  Clock,
  Download,
  Loader2,
} from 'lucide-react';

export function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingProjectId, setDownloadingProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user?.id) return;
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
    } catch (err) {
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
    if (confirm('Are you sure you want to permanently delete this project and its images?')) {
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
      const productSlug = (project.product_name || 'project')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 30);

      await Promise.all(
        completedGens.map(async (gen, idx) => {
          try {
            const resp = await fetch(gen.imageUrl!);
            const blob = await resp.blob();
            const fileName =
              gen.kind === 'poster'
                ? `${productSlug}-poster.png`
                : `${productSlug}-slot-${gen.slot ?? idx + 1}.png`;
            zip.file(fileName, blob);
          } catch (fetchErr) {
            console.error(`Failed to download image for slot ${gen.slot}:`, fetchErr);
          }
        })
      );

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `${productSlug}-10day-archive.zip`;
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090B10] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-200 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
              <HistoryIcon className="w-5 h-5 text-[var(--brand)] dark:text-indigo-400" />
              <span>Project History (10-Day Retention)</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Generated assets are automatically retained for 10 days before deletion. Reopen any project to continue editing.
            </p>
          </div>

          <button
            onClick={() => navigate('/studio')}
            className="self-start sm:self-auto py-2 px-4 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 transition shadow-sm dark:shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Studio Run</span>
          </button>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin h-7 w-7 border-2 border-[var(--brand)] dark:border-indigo-500 border-t-transparent rounded-full" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Loading your project library...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
              <ImageIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">No active projects found</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Projects created within the last 10 days appear here. Start a new run in Studio to generate product photos.
              </p>
            </div>
            <button
              onClick={() => navigate('/studio')}
              className="mt-2 py-2 px-4 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white rounded-xl text-xs font-semibold transition shadow-sm"
            >
              Start First Studio Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {projects.map((project) => {
              const completedImages =
                project.generations?.filter((g) => g.status === 'done' && g.imageUrl) || [];
              const thumbnail =
                completedImages[0]?.imageUrl || project.source_image_data_url;
              const daysLeft = calculateDaysRemaining(project.created_at);
              const isDownloading = downloadingProjectId === project.id;

              return (
                <div
                  key={project.id}
                  onClick={() => handleOpenProject(project.id)}
                  className="bg-[var(--surface)] dark:bg-slate-900/90 border border-[var(--border)] dark:border-slate-800/80 hover:border-[var(--brand)] dark:hover:border-indigo-500/60 rounded-[14px] overflow-hidden cursor-pointer shadow-[0_1px_2px_rgba(15,23,42,0.05)] dark:shadow-xl transition-all duration-200 group flex flex-col relative"
                >
                  {/* Thumbnail Banner */}
                  <div className="h-48 bg-[var(--subtle)] dark:bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-[var(--border)] dark:border-slate-800/80">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={project.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 space-y-1">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-[11px]">No preview</span>
                      </div>
                    )}

                    {/* Retention countdown badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold backdrop-blur-md border flex items-center space-x-1.5 shadow-sm ${
                          daysLeft <= 2
                            ? 'bg-[var(--error-bg)] text-[var(--error)] border-red-200 dark:bg-rose-950/85 dark:text-rose-300 dark:border-rose-800/60'
                            : daysLeft <= 4
                            ? 'bg-[var(--warn-bg)] text-[var(--warn)] border-amber-200 dark:bg-amber-950/85 dark:text-amber-300 dark:border-amber-800/60'
                            : 'bg-white/90 text-slate-700 border-slate-200 dark:bg-slate-900/85 dark:text-slate-300 dark:border-slate-800'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>
                          {daysLeft === 1 ? 'Deletes in 1 day' : `Deletes in ${daysLeft} days`}
                        </span>
                      </span>
                    </div>

                    {/* Image count pill */}
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center space-x-1 shadow-sm">
                      <Layers className="w-3 h-3 text-[var(--brand)] dark:text-indigo-400" />
                      <span>{completedImages.length} images</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[var(--brand)] dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {project.product_name || 'Untitled Product'}
                      </h3>
                      {project.model_number && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                          Model: {project.model_number}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                        {project.features?.join(' • ') || 'No features list'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--border)] dark:border-slate-800/80 flex flex-col space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(project.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteProject(e, project.id)}
                          className="p-1 text-slate-400 hover:text-[var(--error)] dark:hover:text-rose-400 transition"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Action buttons: Open & Download all (ZIP) */}
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProject(project.id);
                          }}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:border-transparent dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[var(--brand)] dark:text-indigo-400" />
                          <span>Open</span>
                        </button>

                        <button
                          type="button"
                          disabled={completedImages.length === 0 || isDownloading}
                          onClick={(e) => handleDownloadAllZip(e, project)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-[var(--brand-tint)] hover:bg-[var(--brand-tint)]/80 text-[var(--brand-ink)] border border-[var(--brand)]/30 dark:bg-indigo-600/20 dark:hover:bg-indigo-600/30 dark:text-indigo-300 dark:border-indigo-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Download all generated images as ZIP"
                        >
                          {isDownloading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--brand)] dark:text-indigo-400" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-[var(--brand)] dark:text-indigo-400" />
                          )}
                          <span>{isDownloading ? 'Archiving...' : 'Download (ZIP)'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
