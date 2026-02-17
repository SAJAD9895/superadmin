-- ============================================
-- STORAGE BUCKETS SETUP FOR SOUQ ROUTE ADMIN PANEL
-- ============================================
-- Run this in Supabase SQL Editor to create storage buckets

-- Create storage buckets for company assets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('company_logo', 'company_logo', true),
  ('cover_images', 'cover_images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES FOR company_logo BUCKET
-- ============================================

-- Allow authenticated users to upload their own logo
DROP POLICY IF EXISTS "Users can upload own company logo" ON storage.objects;
CREATE POLICY "Users can upload own company logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company_logo' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own logo
DROP POLICY IF EXISTS "Users can update own company logo" ON storage.objects;
CREATE POLICY "Users can update own company logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company_logo' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all logos
DROP POLICY IF EXISTS "Public can view company logos" ON storage.objects;
CREATE POLICY "Public can view company logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company_logo');

-- Allow users to delete their own logo
DROP POLICY IF EXISTS "Users can delete own company logo" ON storage.objects;
CREATE POLICY "Users can delete own company logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company_logo' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- STORAGE POLICIES FOR cover_images BUCKET
-- ============================================

-- Allow authenticated users to upload their own cover image
DROP POLICY IF EXISTS "Users can upload own cover image" ON storage.objects;
CREATE POLICY "Users can upload own cover image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cover_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own cover image
DROP POLICY IF EXISTS "Users can update own cover image" ON storage.objects;
CREATE POLICY "Users can update own cover image"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cover_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all cover images
DROP POLICY IF EXISTS "Public can view cover images" ON storage.objects;
CREATE POLICY "Public can view cover images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cover_images');

-- Allow users to delete their own cover image
DROP POLICY IF EXISTS "Users can delete own cover image" ON storage.objects;
CREATE POLICY "Users can delete own cover image"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cover_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  'Storage buckets created successfully!' AS status,
  COUNT(*) AS bucket_count
FROM storage.buckets
WHERE id IN ('company_logo', 'cover_images');
