import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://ymesewobvdngegbuthuz.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltZXNld29idmRuZ2VnYnV0aHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0NDY5NDAsImV4cCI6MjEwOTAyMjk0MH0.BwDgHI93Ows7D8yVEGMFbJ_YCUS1V4-3lMXC7NJgaJk'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Warning: Supabase environment variables are missing. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

