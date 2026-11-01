import { supabaseAdmin } from './_lib/supabase-server';
import { sendAdminStaffAlertEmail } from './_lib/email';

// In-memory cooldown map (key: email:eventType, value: timestamp)
const notificationCooldowns = new Map<string, number>();
const COOLDOWN_MS = 60 * 1000; // 1 minute cooldown per staff email per event type

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { staffEmail, staffName, eventType = 'signup_request' } = req.body || {};

    if (!staffEmail || typeof staffEmail !== 'string') {
      return res.status(400).json({ error: 'Missing required field: staffEmail' });
    }

    const cleanEmail = staffEmail.trim().toLowerCase();
    const cooldownKey = `${cleanEmail}:${eventType}`;
    const now = Date.now();
    const lastSent = notificationCooldowns.get(cooldownKey);

    if (lastSent && now - lastSent < COOLDOWN_MS) {
      return res.status(200).json({
        success: true,
        throttled: true,
        message: 'Notification already sent recently (throttled).',
      });
    }

    // Inspect user profile in DB to get role & status if available
    let resolvedStaffName = typeof staffName === 'string' && staffName.trim() ? staffName.trim() : undefined;
    try {
      const { data: staffProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, status, role')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (staffProfile) {
        if (!resolvedStaffName && staffProfile.full_name) {
          resolvedStaffName = staffProfile.full_name;
        }

        // If the user logging in is an administrator, do not send alert
        if (staffProfile.role === 'admin') {
          return res.status(200).json({
            success: true,
            skipped: true,
            message: 'User is an administrator, no notification needed.',
          });
        }

        // If event is pending_login_attempt but user is already approved, no alert needed
        if (eventType === 'pending_login_attempt' && staffProfile.status === 'approved') {
          return res.status(200).json({
            success: true,
            skipped: true,
            message: 'Staff user is already approved.',
          });
        }
      }
    } catch (profErr) {
      console.warn('Could not query staff profile:', profErr);
    }

    // Determine admin email:
    // 1. Env variable ADMIN_ALERT_EMAIL
    // 2. Query admin profile from database
    // 3. Fallback: ajilmuhammedt@gmail.com
    let targetAdminEmail = process.env.ADMIN_ALERT_EMAIL || 'ajilmuhammedt@gmail.com';

    try {
      const { data: adminRows } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('role', 'admin')
        .order('created_at', { ascending: true })
        .limit(1);

      if (adminRows && adminRows.length > 0 && adminRows[0].email) {
        targetAdminEmail = adminRows[0].email;
      }
    } catch (dbErr) {
      console.warn('Could not query admin email from DB, falling back to default:', dbErr);
    }

    const origin =
      (req.headers?.origin as string) ||
      (req.headers?.referer ? new URL(req.headers.referer as string).origin : '') ||
      process.env.SITE_URL ||
      'https://b2b-image.vercel.app';

    const result = await sendAdminStaffAlertEmail({
      adminEmail: targetAdminEmail,
      staffEmail: cleanEmail,
      staffName: resolvedStaffName,
      eventType: eventType as 'signup_request' | 'pending_login_attempt' | 'staff_login',
      origin,
    });

    notificationCooldowns.set(cooldownKey, now);

    return res.status(200).json({
      success: true,
      delivered: result.sent,
      provider: result.provider,
      adminEmail: targetAdminEmail,
    });
  } catch (err: any) {
    console.error('Error in notify-admin-staff-login handler:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
