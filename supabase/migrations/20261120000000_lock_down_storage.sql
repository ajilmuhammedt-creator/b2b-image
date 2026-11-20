-- Migration: Lock Down Storage (Task 2)
-- 1. Make source-images and generated-images buckets private
UPDATE storage.buckets
SET public = false
WHERE id IN ('source-images', 'generated-images');

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('source-images', 'source-images', false),
  ('generated-images', 'generated-images', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. Drop legacy / public storage policies
DROP POLICY IF EXISTS "Allow public read on source-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload to source-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update to source-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from source-images" ON storage.objects;

DROP POLICY IF EXISTS "Allow public read on generated-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload to generated-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update to generated-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from generated-images" ON storage.objects;

-- Drop previous versions of user-isolated policies if any
DROP POLICY IF EXISTS "Users can view own source images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own source images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own source images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own source images" ON storage.objects;

DROP POLICY IF EXISTS "Users can view own generated images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own generated images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own generated images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own generated images" ON storage.objects;

-- 3. Replace storage policies so users can only access objects whose first folder is auth.uid()::text
-- source-images policies
CREATE POLICY "Users can view own source images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'source-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload own source images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'source-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own source images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'source-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'source-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own source images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'source-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

-- generated-images policies
CREATE POLICY "Users can view own generated images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'generated-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload own generated images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'generated-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own generated images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'generated-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'generated-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own generated images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'generated-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
