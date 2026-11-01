-- Sanford AI Image Studio - Schema & Migrations
-- Run this in your Supabase project's SQL Editor

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  model_number TEXT DEFAULT '',
  tagline TEXT DEFAULT '',
  features JSONB DEFAULT '[]'::jsonb,
  colors TEXT DEFAULT '',
  dimensions TEXT DEFAULT '',
  weight TEXT DEFAULT '',
  whats_in_the_box JSONB DEFAULT '[]'::jsonb,
  warranty TEXT DEFAULT '',
  feature_groups JSONB DEFAULT '[]'::jsonb,
  source_image_path TEXT DEFAULT '',
  source_image_data_url TEXT DEFAULT '',
  catalogue_preview_url TEXT DEFAULT '',
  sanford_slots JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  make_poster BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects RLS Policies
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Projects Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_created ON public.projects(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at);

-- 2. Generations Table
CREATE TABLE IF NOT EXISTS public.generations (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot INTEGER NULL,
  kind TEXT NOT NULL DEFAULT 'feature',
  theme TEXT NULL,
  slot_title TEXT NULL,
  model TEXT NULL,
  quality TEXT NULL,
  size TEXT NULL,
  settings JSONB NULL,
  prompt TEXT NULL,
  status TEXT NOT NULL DEFAULT 'done',
  image_path TEXT NOT NULL,
  image_url TEXT NULL,
  usage JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) for generations
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Generations RLS Policies
DROP POLICY IF EXISTS "Users can view own generations" ON public.generations;
CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own generations" ON public.generations;
CREATE POLICY "Users can insert own generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own generations" ON public.generations;
CREATE POLICY "Users can update own generations"
  ON public.generations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own generations" ON public.generations;
CREATE POLICY "Users can delete own generations"
  ON public.generations FOR DELETE
  USING (auth.uid() = user_id);

-- Generations Indexes
CREATE INDEX IF NOT EXISTS idx_generations_project_id ON public.generations(project_id);
CREATE INDEX IF NOT EXISTS idx_generations_user_created ON public.generations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at);

-- 3. Storage Buckets (if not already created)
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('source-images', 'source-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage Bucket Policies
DROP POLICY IF EXISTS "Allow public read on source-images" ON storage.objects;
CREATE POLICY "Allow public read on source-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'source-images');

DROP POLICY IF EXISTS "Allow authenticated upload to source-images" ON storage.objects;
CREATE POLICY "Allow authenticated upload to source-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'source-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update to source-images" ON storage.objects;
CREATE POLICY "Allow authenticated update to source-images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'source-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete from source-images" ON storage.objects;
CREATE POLICY "Allow authenticated delete from source-images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'source-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public read on generated-images" ON storage.objects;
CREATE POLICY "Allow public read on generated-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'generated-images');

DROP POLICY IF EXISTS "Allow authenticated upload to generated-images" ON storage.objects;
CREATE POLICY "Allow authenticated upload to generated-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'generated-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update to generated-images" ON storage.objects;
CREATE POLICY "Allow authenticated update to generated-images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'generated-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete from generated-images" ON storage.objects;
CREATE POLICY "Allow authenticated delete from generated-images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'generated-images' AND auth.role() = 'authenticated');

-- 5. User Profiles & Staff Approval Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'staff', -- 'admin' | 'staff'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  requested_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an approved admin without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'approved'
  );
$$;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Trigger to automatically create a profile when a new user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_first_admin boolean;
BEGIN
  is_first_admin := (NEW.email = 'ajilmuhammedt@gmail.com');

  INSERT INTO public.profiles (id, email, full_name, role, status, requested_at, approved_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN is_first_admin THEN 'admin' ELSE 'staff' END,
    CASE WHEN is_first_admin THEN 'approved' ELSE 'pending' END,
    now(),
    CASE WHEN is_first_admin THEN now() ELSE NULL END
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed primary admin
INSERT INTO public.profiles (id, email, full_name, role, status, approved_at)
SELECT id, email, 'Administrator', 'admin', 'approved', now()
FROM auth.users
WHERE email = 'ajilmuhammedt@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', status = 'approved';
