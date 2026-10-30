import { supabase } from './supabase';

/**
 * Custom fetch wrapper that automatically attaches the Supabase access token
 * in the Authorization: Bearer <token> header before calling any /api/* endpoint.
 */
export async function fetchApi(url: string, options: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
