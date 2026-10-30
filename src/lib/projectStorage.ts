import { supabase } from './supabase';
import type { ProjectData, GenerationItem } from '../types';

export const projectStorage = {
  // Get all projects for user within the last 10 days
  async getProjects(userId: string): Promise<ProjectData[]> {
    if (!userId) return [];

    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

    try {
      const { data: projectsData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', tenDaysAgo)
        .order('created_at', { ascending: false });

      if (projErr) {
        console.warn('Error fetching projects from Supabase:', projErr.message);
        return [];
      }

      if (!projectsData || projectsData.length === 0) {
        return [];
      }

      const projectIds = projectsData.map((p) => p.id);
      const { data: gensData, error: gensErr } = await supabase
        .from('generations')
        .select('*')
        .in('project_id', projectIds)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (gensErr) {
        console.warn('Error fetching generations for projects:', gensErr.message);
      }

      const generationsByProject = new Map<string, GenerationItem[]>();
      (gensData || []).forEach((g: any) => {
        let publicUrl = g.image_url;
        if (!publicUrl && g.image_path) {
          const { data: urlData } = supabase.storage
            .from('generated-images')
            .getPublicUrl(g.image_path);
          publicUrl = urlData?.publicUrl || '';
        }

        const genItem: GenerationItem = {
          id: g.id,
          projectId: g.project_id,
          kind: g.kind || 'feature',
          slot: g.slot,
          theme: g.theme,
          slotTitle: g.slot_title,
          status: (g.status as any) || 'done',
          imageUrl: publicUrl,
          imagePath: g.image_path,
          prompt: g.prompt,
          usage: g.usage,
          selected: true,
        };

        const existing = generationsByProject.get(g.project_id) || [];
        existing.push(genItem);
        generationsByProject.set(g.project_id, existing);
      });

      return projectsData.map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        product_name: p.product_name,
        model_number: p.model_number || '',
        tagline: p.tagline || '',
        features: Array.isArray(p.features) ? p.features : [],
        colors: p.colors || '',
        dimensions: p.dimensions || '',
        weight: p.weight || '',
        whats_in_the_box: Array.isArray(p.whats_in_the_box) ? p.whats_in_the_box : [],
        warranty: p.warranty || '',
        feature_groups: Array.isArray(p.feature_groups) ? p.feature_groups : [],
        source_image_path: p.source_image_path || '',
        source_image_data_url: p.source_image_data_url || '',
        catalogue_preview_url: p.catalogue_preview_url || '',
        sanford_slots: Array.isArray(p.sanford_slots) ? p.sanford_slots : [],
        settings: p.settings || undefined,
        makePoster: p.make_poster ?? false,
        created_at: p.created_at,
        generations: generationsByProject.get(p.id) || [],
      }));
    } catch (err) {
      console.error('Failed to load projects from Supabase:', err);
      return [];
    }
  },

  // Get project by ID
  async getProjectById(projectId: string, userId: string): Promise<ProjectData | null> {
    if (!projectId || !userId) return null;

    try {
      const { data: p, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .maybeSingle();

      if (projErr || !p) {
        if (projErr) console.warn('Error fetching project by ID:', projErr.message);
        return null;
      }

      const { data: gensData } = await supabase
        .from('generations')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      const generations: GenerationItem[] = (gensData || []).map((g: any) => {
        let publicUrl = g.image_url;
        if (!publicUrl && g.image_path) {
          const { data: urlData } = supabase.storage
            .from('generated-images')
            .getPublicUrl(g.image_path);
          publicUrl = urlData?.publicUrl || '';
        }

        return {
          id: g.id,
          projectId: g.project_id,
          kind: g.kind || 'feature',
          slot: g.slot,
          theme: g.theme,
          slotTitle: g.slot_title,
          status: (g.status as any) || 'done',
          imageUrl: publicUrl,
          imagePath: g.image_path,
          prompt: g.prompt,
          usage: g.usage,
          selected: true,
        };
      });

      return {
        id: p.id,
        user_id: p.user_id,
        product_name: p.product_name,
        model_number: p.model_number || '',
        tagline: p.tagline || '',
        features: Array.isArray(p.features) ? p.features : [],
        colors: p.colors || '',
        dimensions: p.dimensions || '',
        weight: p.weight || '',
        whats_in_the_box: Array.isArray(p.whats_in_the_box) ? p.whats_in_the_box : [],
        warranty: p.warranty || '',
        feature_groups: Array.isArray(p.feature_groups) ? p.feature_groups : [],
        source_image_path: p.source_image_path || '',
        source_image_data_url: p.source_image_data_url || '',
        catalogue_preview_url: p.catalogue_preview_url || '',
        sanford_slots: Array.isArray(p.sanford_slots) ? p.sanford_slots : [],
        settings: p.settings || undefined,
        makePoster: p.make_poster ?? false,
        created_at: p.created_at,
        generations,
      };
    } catch (err) {
      console.error('Failed to get project from Supabase:', err);
      return null;
    }
  },

  // Save or update project
  async saveProject(project: ProjectData): Promise<void> {
    if (!project?.id || !project?.user_id) return;

    try {
      const { error } = await supabase.from('projects').upsert({
        id: project.id,
        user_id: project.user_id,
        product_name: project.product_name,
        model_number: project.model_number || '',
        tagline: project.tagline || '',
        features: project.features || [],
        colors: project.colors || '',
        dimensions: project.dimensions || '',
        weight: project.weight || '',
        whats_in_the_box: project.whats_in_the_box || [],
        warranty: project.warranty || '',
        feature_groups: project.feature_groups || [],
        source_image_path: project.source_image_path || '',
        source_image_data_url: project.source_image_data_url || '',
        catalogue_preview_url: project.catalogue_preview_url || '',
        sanford_slots: project.sanford_slots || [],
        settings: project.settings || {},
        make_poster: project.makePoster ?? false,
        created_at: project.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.warn('Could not upsert project to Supabase table:', error.message);
      }
    } catch (err) {
      console.warn('Failed to save project to Supabase:', err);
    }
  },

  // Delete project, its database rows, and its stored images
  async deleteProject(projectId: string, userId: string): Promise<void> {
    if (!projectId || !userId) return;

    try {
      // 1. Get generation image paths to remove from storage
      const { data: gens } = await supabase
        .from('generations')
        .select('image_path')
        .eq('project_id', projectId)
        .eq('user_id', userId);

      const paths = (gens || []).map((g) => g.image_path).filter(Boolean);
      if (paths.length > 0) {
        await supabase.storage.from('generated-images').remove(paths);
      }

      // 2. Remove source image from storage if present
      const { data: project } = await supabase
        .from('projects')
        .select('source_image_path')
        .eq('id', projectId)
        .eq('user_id', userId)
        .maybeSingle();

      if (project?.source_image_path) {
        await supabase.storage.from('source-images').remove([project.source_image_path]);
      }

      // 3. Delete database records (generations cascade or explicit)
      await supabase.from('generations').delete().eq('project_id', projectId).eq('user_id', userId);
      await supabase.from('projects').delete().eq('id', projectId).eq('user_id', userId);
    } catch (err) {
      console.error('Failed to delete project from Supabase:', err);
    }
  },
};
