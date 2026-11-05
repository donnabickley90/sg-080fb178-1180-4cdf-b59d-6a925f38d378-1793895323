-- Add status column to songs table
ALTER TABLE public.songs 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Draft';

-- Create an index for status filtering
CREATE INDEX IF NOT EXISTS songs_status_idx ON public.songs(status);