-- Ensure video-files bucket exists (might be missing)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('video-files', 'video-files', false, 524288000, ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo'])
ON CONFLICT (id) DO NOTHING;

-- Recreate all storage policies to ensure they exist
DROP POLICY IF EXISTS "album_covers_select" ON storage.objects;
DROP POLICY IF EXISTS "album_covers_insert" ON storage.objects;
DROP POLICY IF EXISTS "album_covers_update" ON storage.objects;
DROP POLICY IF EXISTS "album_covers_delete" ON storage.objects;

DROP POLICY IF EXISTS "song_covers_select" ON storage.objects;
DROP POLICY IF EXISTS "song_covers_insert" ON storage.objects;
DROP POLICY IF EXISTS "song_covers_update" ON storage.objects;
DROP POLICY IF EXISTS "song_covers_delete" ON storage.objects;

DROP POLICY IF EXISTS "song_files_select" ON storage.objects;
DROP POLICY IF EXISTS "song_files_insert" ON storage.objects;
DROP POLICY IF EXISTS "song_files_update" ON storage.objects;
DROP POLICY IF EXISTS "song_files_delete" ON storage.objects;

DROP POLICY IF EXISTS "video_files_select" ON storage.objects;
DROP POLICY IF EXISTS "video_files_insert" ON storage.objects;
DROP POLICY IF EXISTS "video_files_update" ON storage.objects;
DROP POLICY IF EXISTS "video_files_delete" ON storage.objects;

-- Album covers policies
CREATE POLICY "album_covers_select" ON storage.objects FOR SELECT USING (bucket_id = 'album-covers');
CREATE POLICY "album_covers_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'album-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "album_covers_update" ON storage.objects FOR UPDATE USING (bucket_id = 'album-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "album_covers_delete" ON storage.objects FOR DELETE USING (bucket_id = 'album-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Song covers policies
CREATE POLICY "song_covers_select" ON storage.objects FOR SELECT USING (bucket_id = 'song-covers');
CREATE POLICY "song_covers_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'song-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "song_covers_update" ON storage.objects FOR UPDATE USING (bucket_id = 'song-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "song_covers_delete" ON storage.objects FOR DELETE USING (bucket_id = 'song-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Song files policies
CREATE POLICY "song_files_select" ON storage.objects FOR SELECT USING (bucket_id = 'song-files');
CREATE POLICY "song_files_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'song-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "song_files_update" ON storage.objects FOR UPDATE USING (bucket_id = 'song-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "song_files_delete" ON storage.objects FOR DELETE USING (bucket_id = 'song-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Video files policies
CREATE POLICY "video_files_select" ON storage.objects FOR SELECT USING (bucket_id = 'video-files');
CREATE POLICY "video_files_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'video-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "video_files_update" ON storage.objects FOR UPDATE USING (bucket_id = 'video-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "video_files_delete" ON storage.objects FOR DELETE USING (bucket_id = 'video-files' AND auth.uid()::text = (storage.foldername(name))[1]);