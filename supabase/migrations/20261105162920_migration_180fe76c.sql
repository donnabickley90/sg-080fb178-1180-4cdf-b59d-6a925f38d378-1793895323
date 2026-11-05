-- Create albums table
CREATE TABLE IF NOT EXISTS public.albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  artist text,
  cover_art_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create songs table
CREATE TABLE IF NOT EXISTS public.songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  album_id uuid REFERENCES public.albums(id) ON DELETE SET NULL,
  title text NOT NULL,
  artist text,
  duration integer,
  file_url text,
  cover_art_url text,
  video_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- RLS policies for albums (private user data)
CREATE POLICY "Users can view own albums" ON public.albums
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own albums" ON public.albums
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own albums" ON public.albums
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own albums" ON public.albums
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for songs (private user data)
CREATE POLICY "Users can view own songs" ON public.songs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own songs" ON public.songs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own songs" ON public.songs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own songs" ON public.songs
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS albums_user_id_idx ON public.albums(user_id);
CREATE INDEX IF NOT EXISTS songs_user_id_idx ON public.songs(user_id);
CREATE INDEX IF NOT EXISTS songs_album_id_idx ON public.songs(album_id);