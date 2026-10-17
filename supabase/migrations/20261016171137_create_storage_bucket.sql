/*
# Create storage bucket for images

1. Storage
- Create a public bucket named `images` for product photos and hero slides.
- Public read access so visitors can see images without authentication.
- Authenticated users can upload, update, and delete files.

2. Security (Storage policies)
- SELECT (read) is public for everyone (anon + authenticated).
- INSERT/UPDATE/DELETE restricted to authenticated users (admin).
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_images" ON storage.objects;
CREATE POLICY "public_read_images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'images');

DROP POLICY IF EXISTS "admin_upload_images" ON storage.objects;
CREATE POLICY "admin_upload_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "admin_update_images" ON storage.objects;
CREATE POLICY "admin_update_images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'images') WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "admin_delete_images" ON storage.objects;
CREATE POLICY "admin_delete_images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'images');
