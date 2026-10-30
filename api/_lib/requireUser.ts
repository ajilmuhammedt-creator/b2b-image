import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabase-server';

/**
 * Shared helper to enforce Supabase Authentication on all /api endpoints.
 *
 * Reads the Authorization: Bearer <access_token> header.
 * Returns 401 if missing, malformed, or invalid according to supabaseAdmin.auth.getUser(token).
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

    return data.user;
  } catch (err: any) {
    console.error('requireUser auth verification error:', err);
    res.status(401).json({ error: 'Unauthorized: Token verification failed.' });
    return null;
  }
}
