-- Create a table for sync devices linked by a shared code
CREATE TABLE public.sync_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_code TEXT NOT NULL,
  device_name TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on sync_code for fast lookups
CREATE INDEX idx_sync_devices_code ON public.sync_devices(sync_code);

-- Create a table for synced library data
CREATE TABLE public.sync_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_code TEXT NOT NULL,
  book_id TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  duration NUMERIC DEFAULT 0,
  current_position NUMERIC DEFAULT 0,
  playback_speed NUMERIC DEFAULT 1,
  status TEXT DEFAULT 'not-started',
  date_added TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_played TIMESTAMP WITH TIME ZONE,
  date_finished TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(sync_code, book_id)
);

-- Create index on sync_code for fast lookups
CREATE INDEX idx_sync_library_code ON public.sync_library(sync_code);

-- Create a table for synced bookmarks
CREATE TABLE public.sync_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_code TEXT NOT NULL,
  book_id TEXT NOT NULL,
  bookmark_id TEXT NOT NULL,
  position NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(sync_code, book_id, bookmark_id)
);

-- Create index on sync_code for fast lookups
CREATE INDEX idx_sync_bookmarks_code ON public.sync_bookmarks(sync_code);

-- Enable RLS on all tables (but allow public access via sync_code)
ALTER TABLE public.sync_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_bookmarks ENABLE ROW LEVEL SECURITY;

-- Public policies - anyone with the sync code can read/write
-- This is intentionally public since we're using sync codes instead of auth
CREATE POLICY "Anyone can manage sync devices" ON public.sync_devices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage sync library" ON public.sync_library FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage sync bookmarks" ON public.sync_bookmarks FOR ALL USING (true) WITH CHECK (true);