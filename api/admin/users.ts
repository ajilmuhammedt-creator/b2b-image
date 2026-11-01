import { requireAdmin } from '../_lib/requireUser';
import { supabaseAdmin } from '../_lib/supabase-server';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = await requireAdmin(req, res);
  if (!auth) return;

  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ users: profiles || [] });
  } catch (err: any) {
    console.error('admin/users handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
