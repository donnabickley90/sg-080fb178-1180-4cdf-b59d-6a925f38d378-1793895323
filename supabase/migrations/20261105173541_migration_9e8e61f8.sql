-- Create album-covers bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'album-covers',
  'album-covers',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create song-files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'song-files',
  'song-files',
  false,
  104857600, -- 100MB limit for audio files
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
)
ON CONFLICT (id) DO NOTHING;

-- Create song-covers bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'song-covers',
  'song-covers',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for album-covers bucket
CREATE POLICY "Users can upload own album covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'album-covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own album covers"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'album-covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own album covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'album-covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own album covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'album-covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for song-files bucket
CREATE POLICY "Users can upload own song files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'song-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own song files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'song-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own song files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'song-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own song files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'song-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for song-covers bucket
CREATE POLICY "Users can upload own song covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'song-covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own song covers"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'song-covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own song covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'song-covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own song covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'song-covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);