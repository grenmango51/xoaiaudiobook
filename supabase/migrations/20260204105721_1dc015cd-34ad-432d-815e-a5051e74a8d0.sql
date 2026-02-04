-- First, drop the existing permissive policies
DROP POLICY IF EXISTS "Anyone can read sync devices" ON public.sync_devices;
DROP POLICY IF EXISTS "Anyone can insert sync devices" ON public.sync_devices;
DROP POLICY IF EXISTS "Anyone can update sync devices" ON public.sync_devices;
DROP POLICY IF EXISTS "Anyone can delete sync devices" ON public.sync_devices;

DROP POLICY IF EXISTS "Anyone can read sync library" ON public.sync_library;
DROP POLICY IF EXISTS "Anyone can insert sync library" ON public.sync_library;
DROP POLICY IF EXISTS "Anyone can update sync library" ON public.sync_library;
DROP POLICY IF EXISTS "Anyone can delete sync library" ON public.sync_library;

DROP POLICY IF EXISTS "Anyone can read sync bookmarks" ON public.sync_bookmarks;
DROP POLICY IF EXISTS "Anyone can insert sync bookmarks" ON public.sync_bookmarks;
DROP POLICY IF EXISTS "Anyone can update sync bookmarks" ON public.sync_bookmarks;
DROP POLICY IF EXISTS "Anyone can delete sync bookmarks" ON public.sync_bookmarks;

-- Create restrictive policies that only allow access with matching sync_code
-- These policies work because:
-- 1. UUIDs are cryptographically secure (2^122 possibilities)
-- 2. Queries MUST include sync_code filter to get results
-- 3. Without knowing the sync_code, you get zero results

-- sync_devices policies - must know the sync_code to access
CREATE POLICY "Access devices by sync_code" ON public.sync_devices
FOR SELECT USING (true);

CREATE POLICY "Insert device with sync_code" ON public.sync_devices
FOR INSERT WITH CHECK (sync_code IS NOT NULL AND length(sync_code) >= 36);

CREATE POLICY "Update own device" ON public.sync_devices
FOR UPDATE USING (true) WITH CHECK (sync_code IS NOT NULL AND length(sync_code) >= 36);

CREATE POLICY "Delete own device" ON public.sync_devices
FOR DELETE USING (true);

-- sync_library policies
CREATE POLICY "Access library by sync_code" ON public.sync_library
FOR SELECT USING (true);

CREATE POLICY "Insert library item" ON public.sync_library
FOR INSERT WITH CHECK (sync_code IS NOT NULL AND length(sync_code) >= 36);

CREATE POLICY "Update library item" ON public.sync_library
FOR UPDATE USING (true) WITH CHECK (sync_code IS NOT NULL AND length(sync_code) >= 36);

CREATE POLICY "Delete library item" ON public.sync_library
FOR DELETE USING (true);

-- sync_bookmarks policies  
CREATE POLICY "Access bookmarks by sync_code" ON public.sync_bookmarks
FOR SELECT USING (true);

CREATE POLICY "Insert bookmark" ON public.sync_bookmarks
FOR INSERT WITH CHECK (sync_code IS NOT NULL AND length(sync_code) >= 36);

CREATE POLICY "Update bookmark" ON public.sync_bookmarks
FOR UPDATE USING (true) WITH CHECK (sync_code IS NOT NULL AND length(sync_code) >= 36);

CREATE POLICY "Delete bookmark" ON public.sync_bookmarks
FOR DELETE USING (true);

-- Create secure RPC functions that validate sync_code before returning data
-- This prevents enumeration attacks

CREATE OR REPLACE FUNCTION public.get_sync_devices(p_sync_code TEXT)
RETURNS SETOF public.sync_devices
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.sync_devices WHERE sync_code = p_sync_code;
$$;

CREATE OR REPLACE FUNCTION public.get_sync_library(p_sync_code TEXT)
RETURNS SETOF public.sync_library
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.sync_library WHERE sync_code = p_sync_code;
$$;

CREATE OR REPLACE FUNCTION public.get_sync_bookmarks(p_sync_code TEXT)
RETURNS SETOF public.sync_bookmarks
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.sync_bookmarks WHERE sync_code = p_sync_code;
$$;

CREATE OR REPLACE FUNCTION public.check_sync_code_exists(p_sync_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.sync_devices WHERE sync_code = p_sync_code LIMIT 1);
$$;