
CREATE POLICY "Authenticated upload chat images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated view chat images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'chat-images');

CREATE POLICY "Owner delete chat image"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text);
