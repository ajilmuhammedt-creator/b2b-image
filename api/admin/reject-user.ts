import { requireAdmin } from '../_lib/requireUser.js';
import { supabaseAdmin } from '../_lib/supabase-server.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = await requireAdmin(req, res);
  if (!auth) return;

  const { userId } = req.body || {};
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Missing required field: userId' });
  }

  try {
    const { data: profile, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (findError || !profile) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to reject profile:', updateError);
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({
      success: true,
      message: `User ${profile.email} access was declined.`,
    });
  } catch (err: any) {
    console.error('admin/reject-user handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

