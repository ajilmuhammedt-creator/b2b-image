import { supabaseAdmin } from './_lib/supabase-server';

export const config = {
  maxDuration: 120,
};

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Authorization: Only allow requests with Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header. Expected Bearer token.' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || token !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized: Invalid CRON_SECRET.' });
  }

  try {
    // 2. Cutoff calculation: 10 days ago
    const tenDaysAgoMs = 10 * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - tenDaysAgoMs).toISOString();

    // 3. Find generations older than 10 days
    const { data: oldGenerations, error: genFetchErr } = await supabaseAdmin
      .from('generations')
      .select('id, project_id, image_path')
      .lt('created_at', cutoffDate);

    if (genFetchErr) {
      if (genFetchErr.message?.includes('schema cache') || genFetchErr.code === 'PGRST205') {
        return res.status(200).json({
          success: true,
          message: 'Table public.generations does not exist yet. Please run supabase/schema.sql in Supabase SQL Editor.',
          generationsDeleted: 0,
          imageFilesRemoved: 0,
          projectsDeleted: 0,
          sourcePhotosRemoved: 0,
        });
      }
      console.error('Error fetching old generations:', genFetchErr);
      return res.status(500).json({ error: genFetchErr.message });
    }

    const generationsToDelete = oldGenerations || [];
    const imagePathsToDelete = generationsToDelete
      .map((g) => g.image_path)
      .filter((p): p is string => Boolean(p));

    // 4. Remove generated image files via Supabase Storage API
    if (imagePathsToDelete.length > 0) {
      const { error: storageRemoveErr } = await supabaseAdmin.storage
        .from('generated-images')
        .remove(imagePathsToDelete);

      if (storageRemoveErr) {
        console.warn('Storage file deletion warning:', storageRemoveErr.message);
      }
    }

    // 5. Delete database rows from generations table
    if (generationsToDelete.length > 0) {
      const genIds = generationsToDelete.map((g) => g.id);
      const { error: dbDeleteErr } = await supabaseAdmin
        .from('generations')
        .delete()
        .in('id', genIds);

      if (dbDeleteErr) {
        console.warn('Database generation deletion error:', dbDeleteErr.message);
      }
    }

    // 6. Find projects with no images left (and projects older than 10 days)
    const { data: oldProjects } = await supabaseAdmin
      .from('projects')
      .select('id, source_image_path')
      .lt('created_at', cutoffDate);

    const candidateProjectMap = new Map<string, string>();
    (oldProjects || []).forEach((p) => {
      candidateProjectMap.set(p.id, p.source_image_path || '');
    });

    // Also include any projects from deleted generations
    for (const g of generationsToDelete) {
      if (g.project_id && !candidateProjectMap.has(g.project_id)) {
        candidateProjectMap.set(g.project_id, '');
      }
    }

    const projectsToDelete: string[] = [];
    const sourcePhotosToRemove: string[] = [];

    for (const [projId, initialSourcePath] of candidateProjectMap.entries()) {
      // Check remaining generations for this project
      const { count, error: countErr } = await supabaseAdmin
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projId);

      if (!countErr && (count === 0 || count === null)) {
        projectsToDelete.push(projId);

        let sourcePath = initialSourcePath;
        if (!sourcePath) {
          const { data: projData } = await supabaseAdmin
            .from('projects')
            .select('source_image_path')
            .eq('id', projId)
            .maybeSingle();
          sourcePath = projData?.source_image_path || '';
        }

        if (sourcePath) {
          sourcePhotosToRemove.push(sourcePath);
        }
      }
    }

    // 7. Delete source photos from source-images storage bucket
    if (sourcePhotosToRemove.length > 0) {
      const { error: sourceStorageErr } = await supabaseAdmin.storage
        .from('source-images')
        .remove(sourcePhotosToRemove);

      if (sourceStorageErr) {
        console.warn('Source image deletion warning:', sourceStorageErr.message);
      }
    }

    // 8. Delete empty project rows from projects table
    if (projectsToDelete.length > 0) {
      const { error: projDeleteErr } = await supabaseAdmin
        .from('projects')
        .delete()
        .in('id', projectsToDelete);

      if (projDeleteErr) {
        console.warn('Project deletion error:', projDeleteErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: '10-day retention cleanup completed successfully.',
      cutoffDate,
      generationsDeleted: generationsToDelete.length,
      imageFilesRemoved: imagePathsToDelete.length,
      projectsDeleted: projectsToDelete.length,
      sourcePhotosRemoved: sourcePhotosToRemove.length,
    });
  } catch (err: any) {
    console.error('Error during cleanup routine:', err);
    return res.status(500).json({
      error: err.message || 'Cleanup job failed.',
    });
  }
}
