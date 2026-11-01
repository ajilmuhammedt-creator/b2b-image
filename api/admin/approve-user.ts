import { requireAdmin } from '../_lib/requireUser';
import { supabaseAdmin } from '../_lib/supabase-server';
import { sendAccountApprovedEmail } from '../_lib/email';

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
    // 1. Fetch user profile
    const { data: profile, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (findError || !profile) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // 2. Mark profile as approved
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: auth.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update profile status:', updateError);
      return res.status(500).json({ error: updateError.message });
    }

    // 3. Confirm user in Supabase Auth so they are not blocked by unconfirmed email
    try {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        email_confirm: true,
      });
    } catch (confErr) {
      console.warn('Note: Could not explicitly confirm user in auth:', confErr);
    }

    // 4. Generate action login link
    const origin =
      (req.headers?.origin as string) ||
      (req.headers?.referer ? new URL(req.headers.referer as string).origin : '') ||
      process.env.SITE_URL ||
      'http://localhost:5173';

    let actionUrl = `${origin}/signin`;
    try {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: profile.email,
        options: {
          redirectTo: `${origin}/studio`,
        },
      });

      if (!linkError && linkData?.properties?.action_link) {
        actionUrl = linkData.properties.action_link;
      }
    } catch (linkGenErr) {
      console.warn('Could not generate magic action link, using default signin URL:', linkGenErr);
    }

    // 5. Send approval notification email
    const emailResult = await sendAccountApprovedEmail({
      toEmail: profile.email,
      fullName: profile.full_name,
      loginUrl: actionUrl,
      adminEmail: auth.user.email,
    });

    return res.status(200).json({
      success: true,
      message: `User ${profile.email} approved successfully. Notification email dispatched.`,
      emailResult,
      loginUrl: actionUrl,
    });
  } catch (err: any) {
    console.error('admin/approve-user handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

