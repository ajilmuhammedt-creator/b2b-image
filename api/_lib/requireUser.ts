import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabase-server';

export interface AdminAuthResult {
  user: User;
  profile: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    status: string;
  };
}

/**
 * Shared helper to enforce Supabase Authentication on all /api endpoints.
 *
 * Reads the Authorization: Bearer <access_token> header.
 * Returns 401 if missing, malformed, or invalid according to supabaseAdmin.auth.getUser(token).
 * Returns 403 if the user profile is pending or rejected.
 * Returns the verified User on success.
 */
export async function requireUser(req: any, res: any): Promise<User | null> {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    res.status(401).json({ error: 'Unauthorized: Missing Authorization header.' });
    return null;
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    res.status(401).json({ error: 'Unauthorized: Malformed Authorization header. Expected Bearer <token>.' });
    return null;
  }

  const token = match[1].trim();
  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Empty access token.' });
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      res.status(401).json({ error: 'Unauthorized: Invalid or expired access token.' });
      return null;
    }

    // Check status in profiles table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('status, role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profile && profile.status !== 'approved') {
      res.status(403).json({
        error: `Forbidden: Your staff account status is "${profile.status}". Administrator approval is required to access studio tools.`,
      });
      return null;
    }

    return data.user;
  } catch (err: any) {
    console.error('requireUser auth verification error:', err);
    res.status(401).json({ error: 'Unauthorized: Token verification failed.' });
    return null;
  }
}

/**
 * Helper to enforce that the calling user has role 'admin' and status 'approved'.
 */
export async function requireAdmin(req: any, res: any): Promise<AdminAuthResult | null> {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    res.status(401).json({ error: 'Unauthorized: Missing Authorization header.' });
    return null;
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    res.status(401).json({ error: 'Unauthorized: Malformed Authorization header.' });
    return null;
  }

  const token = match[1].trim();
  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Empty access token.' });
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      res.status(401).json({ error: 'Unauthorized: Invalid or expired access token.' });
      return null;
    }

    const { data: profile, error: profError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, status')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profError || !profile) {
      res.status(403).json({ error: 'Forbidden: Profile not found.' });
      return null;
    }

    if (profile.role !== 'admin' || profile.status !== 'approved') {
      res.status(403).json({ error: 'Forbidden: Administrator privileges required.' });
      return null;
    }

    return { user: data.user, profile };
  } catch (err: any) {
    console.error('requireAdmin error:', err);
    res.status(401).json({ error: 'Unauthorized: Token verification failed.' });
    return null;
  }
}
