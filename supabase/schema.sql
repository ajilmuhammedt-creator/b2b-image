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
