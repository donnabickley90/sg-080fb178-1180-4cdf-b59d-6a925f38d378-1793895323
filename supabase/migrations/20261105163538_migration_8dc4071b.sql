-- Add missing columns to songs table
ALTER TABLE public.songs 
ADD COLUMN IF NOT EXISTS lyrics text,
ADD COLUMN IF NOT EXISTS mp3_url text;

-- If file_url exists and mp3_url doesn't have data, copy it over
UPDATE public.songs 
SET mp3_url = file_url 
WHERE mp3_url IS NULL AND file_url IS NOT NULL;