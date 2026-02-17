-- ============================================
-- FIX STORAGE RLS POLICIES
-- ============================================

-- 1. Ensure buckets exist and are public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company_logo', 'company_logo', true), ('cover_images', 'cover_images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop ALL existing policies to start fresh and avoid conflicts
DROP POLICY IF EXISTS "Users can upload own company logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own company logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own company logo" ON storage.objects;
DROP POLICY IF EXISTS "Public can view company logos" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload own cover image" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own cover image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own cover image" ON storage.objects;
DROP POLICY IF EXISTS "Public can view cover images" ON storage.objects;

-- 3. Create SIMPLIFIED and ROBUST policies for 'company_logo'

-- Allow authenticated users to upload to their own folder: user_id/filename
CREATE POLICY "Users can upload own company logo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'company_logo' AND
  (name LIKE auth.uid() || '/%')
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own company logo"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'company_logo' AND
  (name LIKE auth.uid() || '/%')
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own company logo"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'company_logo' AND
  (name LIKE auth.uid() || '/%')
);

-- Allow public access to view logos
CREATE POLICY "Public can view company logos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'company_logo');


-- 4. Create SIMPLIFIED and ROBUST policies for 'cover_images'

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own cover image"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'cover_images' AND
  (name LIKE auth.uid() || '/%')
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own cover image"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'cover_images' AND
  (name LIKE auth.uid() || '/%')
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own cover image"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'cover_images' AND
  (name LIKE auth.uid() || '/%')
);

-- Allow public access to view cover images
CREATE POLICY "Public can view cover images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'cover_images');

-- Verification
SELECT 'Storage policies fixed successfully!' as status;
