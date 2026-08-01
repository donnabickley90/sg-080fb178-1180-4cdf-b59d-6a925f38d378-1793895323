-- Create albums table first
CREATE TABLE albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  cover_art_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create songs table with proper album reference
CREATE TABLE songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  album_id uuid REFERENCES albums(id) ON DELETE SET NULL,
  lyrics text,
  mp3_url text,
  video_url text,
  cover_art_url text,
  status text NOT NULL DEFAULT 'Needs Lyrics Work' CHECK (status IN ('Needs Lyrics Work', 'Needs Mixing', 'Needs Remixing', 'To Be Released', 'Released')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create album_songs junction table for ordering
CREATE TABLE album_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES albums(id) ON DELETE CASCADE NOT NULL,
  song_id uuid REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(album_id, song_id)
);

-- Enable RLS on all tables
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_songs ENABLE ROW LEVEL SECURITY;

-- RLS policies for songs (T1: private user data)
CREATE POLICY "select_own_songs" ON songs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_songs" ON songs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_songs" ON songs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_songs" ON songs FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for albums (T1: private user data)
CREATE POLICY "select_own_albums" ON albums FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_albums" ON albums FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_albums" ON albums FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_albums" ON albums FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for album_songs (access based on album ownership)
CREATE POLICY "select_own_album_songs" ON album_songs FOR SELECT 
  USING (EXISTS (SELECT 1 FROM albums WHERE albums.id = album_songs.album_id AND albums.user_id = auth.uid()));
CREATE POLICY "insert_own_album_songs" ON album_songs FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM albums WHERE albums.id = album_songs.album_id AND albums.user_id = auth.uid()));
CREATE POLICY "update_own_album_songs" ON album_songs FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM albums WHERE albums.id = album_songs.album_id AND albums.user_id = auth.uid()));
CREATE POLICY "delete_own_album_songs" ON album_songs FOR DELETE 
  USING (EXISTS (SELECT 1 FROM albums WHERE albums.id = album_songs.album_id AND albums.user_id = auth.uid()));

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('song-files', 'song-files', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('video-files', 'video-files', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('cover-art', 'cover-art', false);

-- Storage policies for song-files bucket
CREATE POLICY "User can upload own song files" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'song-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User can view own song files" ON storage.objects FOR SELECT 
  USING (bucket_id = 'song-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User can update own song files" ON storage.objects FOR UPDATE 
  USING (bucket_id = 'song-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User can delete own song files" ON storage.objects FOR DELETE 
  USING (bucket_id = 'song-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for video-files bucket
CREATE POLICY "User can upload own video files" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'video-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User can view own video files" ON storage.objects FOR SELECT 
  USING (bucket_id = 'video-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User can update own video files" ON storage.objects FOR UPDATE 
  USING (bucket_id = 'video-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User can delete own video files" ON storage.objects FOR DELETE 
  USING (bucket_id = 'video-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for cover-art bucket
CREATE POLICY "User can upload own cover art" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'cover-art' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User can view own cover art" ON storage.objects FOR SELECT 
  USING (bucket_id = 'cover-art' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User can update own cover art" ON storage.objects FOR UPDATE 
  USING (bucket_id = 'cover-art' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User can delete own cover art" ON storage.objects FOR DELETE 
  USING (bucket_id = 'cover-art' AND auth.uid()::text = (storage.foldername(name))[1]);