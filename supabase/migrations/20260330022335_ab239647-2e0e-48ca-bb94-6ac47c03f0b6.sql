
-- Create hostel-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('hostel-images', 'hostel-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload hostel images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'hostel-images');

-- Allow anyone to view hostel images
CREATE POLICY "Anyone can view hostel images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'hostel-images');

-- Allow owners to delete their own hostel images
CREATE POLICY "Users can delete own hostel images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'hostel-images' AND (storage.foldername(name))[1] = auth.uid()::text);
