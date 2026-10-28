import { supabase } from './supabase';
import type { ProjectData } from '../types';

const LOCAL_STORAGE_KEY = 'octopus_image_studio_projects';

export const projectStorage = {
  // Get all projects for user
  async getProjects(userId: string): Promise<ProjectData[]> {
    const localProjects = this.getLocalProjects(userId);

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        // Merge with local storage
        const combined = [...data];
        for (const lp of localProjects) {
          if (!combined.some((p) => p.id === lp.id)) {
            combined.push(lp);
          }
        }
        return combined;
      }
    } catch {
      // Supabase table not created yet or RLS blocked
    }

    return localProjects;
  },

  // Get project by ID
  async getProjectById(projectId: string, userId: string): Promise<ProjectData | null> {
    const localProjects = this.getLocalProjects(userId);
    const foundLocal = localProjects.find((p) => p.id === projectId);

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (!error && data) {
        return {
          ...data,
          generations: foundLocal?.generations || [],
        };
      }
    } catch {
      // Fallback to local
    }

    return foundLocal || null;
  },

  // Save or update project
  async saveProject(project: ProjectData): Promise<void> {
    // 1. Save to local storage
    this.saveLocalProject(project);

    // 2. Try saving to Supabase projects table
    try {
      await supabase.from('projects').upsert({
        id: project.id,
        user_id: project.user_id,
        product_name: project.product_name,
        features: project.features,
        colors: project.colors ? [project.colors] : [],
        feature_groups: project.feature_groups,
        source_image_path: project.source_image_path || '',
        created_at: project.created_at,
      });
    } catch (err) {
      console.warn('Could not upsert project to Supabase table:', err);
    }
  },

  // Delete project
  async deleteProject(projectId: string, userId: string): Promise<void> {
    // 1. Remove from local storage
    const localProjects = this.getLocalProjects(userId).filter((p) => p.id !== projectId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localProjects));

    // 2. Remove from Supabase
    try {
      await supabase.from('projects').delete().eq('id', projectId);
    } catch {
      // Ignore
    }
  },

  // Local storage helpers
  getLocalProjects(userId: string): ProjectData[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return [];
      const all: ProjectData[] = JSON.parse(raw);
      return all.filter((p) => p.user_id === userId || !p.user_id || userId === 'demo-user');
    } catch {
      return [];
    }
  },

  saveLocalProject(project: ProjectData): void {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      let all: ProjectData[] = raw ? JSON.parse(raw) : [];
      const idx = all.findIndex((p) => p.id === project.id);
      if (idx >= 0) {
        all[idx] = project;
      } else {
        all.unshift(project);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  },
};
