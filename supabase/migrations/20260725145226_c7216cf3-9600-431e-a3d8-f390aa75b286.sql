ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS image_path text;

-- Backfill image_path from existing image_url values (path begins after the bucket name)
UPDATE public.messages
SET image_path = substring(image_url from '/chat-images/(.*)$')
WHERE image_url IS NOT NULL AND image_path IS NULL;

-- Strip any query string from backfilled signed URLs
UPDATE public.messages
SET image_path = split_part(image_path, '?', 1)
WHERE image_path IS NOT NULL AND image_path LIKE '%?%';

DROP POLICY IF EXISTS "Chat participants view chat images" ON storage.objects;

CREATE POLICY "Chat participants view chat images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.image_path = objects.name
        AND (m.sender_id = auth.uid() OR m.receiver_id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Owners update own hostel images" ON storage.objects;
CREATE POLICY "Owners update own hostel images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hostel-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'hostel-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Owner update chat image" ON storage.objects;
CREATE POLICY "Owner update chat image"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'chat-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'chat-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);