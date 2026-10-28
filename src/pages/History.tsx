import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { projectStorage } from '../lib/projectStorage';
import type { ProjectData } from '../types';
import {
  History as HistoryIcon,
  Calendar,
  Layers,
  ArrowRight,
  Trash2,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

export function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

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
      setProjects(data);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/studio?project=${projectId}`);
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!user?.id) return;
    if (confirm('Are you sure you want to delete this project from history?')) {
      await projectStorage.deleteProject(projectId, user.id);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <HistoryIcon className="w-5 h-5 text-indigo-400" />
              <span>Project History</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Past generated products and image sets. Click any project to reopen in Studio.
            </p>
          </div>

          <button
            onClick={() => navigate('/studio')}
            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Studio Run</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin h-7 w-7 border-2 border-indigo-500 border-t-transparent rounded-full" />
            <span className="text-xs text-slate-400">Loading your project library...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center">
              <ImageIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-white">No projects yet</h2>
              <p className="text-xs text-slate-400">
                Upload a product photo in the Studio to generate your first 5-image feature set + poster.
              </p>
            </div>
            <button
              onClick={() => navigate('/studio')}
              className="mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
            >
              Start First Studio Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {projects.map((project) => {
              const completedImages =
                project.generations?.filter((g) => g.status === 'done') || [];
              const thumbnail =
                completedImages[0]?.imageUrl || project.source_image_data_url;

              return (
                <div
                  key={project.id}
                  onClick={() => handleOpenProject(project.id)}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/70 rounded-2xl overflow-hidden cursor-pointer shadow-xl transition-all duration-200 group flex flex-col"
                >
                  {/* Thumbnail Banner */}
                  <div className="h-44 bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-800">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={project.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-600 space-y-1">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-[11px]">No preview</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-medium text-slate-300 border border-slate-800 flex items-center space-x-1">
                      <Layers className="w-3 h-3 text-indigo-400" />
                      <span>{completedImages.length} images</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {project.product_name}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {project.features?.join(' • ') || 'No features list'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(project.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteProject(e, project.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-indigo-400 font-medium flex items-center space-x-0.5">
                          <span>Reopen</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
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

