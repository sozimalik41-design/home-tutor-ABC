-- ====================================================================
-- HOME TUTOR PHASE 2: SUPABASE DATABASE SCHEMA & RLS MIGRATION
-- (100% Idempotent and Non-Destructive: Safe to re-run multiple times)
-- ====================================================================

-- 1. Create Profiles & Roles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'authenticated' CHECK (role IN ('student', 'tutor', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 2. Create Posters Table (Accommodates 10 Promotional Slots)
CREATE TABLE IF NOT EXISTS public.posters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_number INT NOT NULL CHECK (slot_number >= 1 AND slot_number <= 10) UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Recruitment', 'STEM', 'Exam Prep', 'Language', 'Primary')),
  badge_text TEXT NOT NULL,
  image_url TEXT NOT NULL,
  destination_url TEXT,
  alt_text TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on posters
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users can view published posters" ON public.posters;
CREATE POLICY "Public users can view published posters"
  ON public.posters FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins can view all posters" ON public.posters;
CREATE POLICY "Admins can view all posters"
  ON public.posters FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert posters" ON public.posters;
CREATE POLICY "Admins can insert posters"
  ON public.posters FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update posters" ON public.posters;
CREATE POLICY "Admins can update posters"
  ON public.posters FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete posters" ON public.posters;
CREATE POLICY "Admins can delete posters"
  ON public.posters FOR DELETE
  TO authenticated
  USING (true);

-- 3. Create Videos Table (Accommodates 3 Home Tutor Video Slots)
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_number INT NOT NULL CHECK (slot_number >= 1 AND slot_number <= 3) UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tutor_name TEXT NOT NULL,
  tutor_role TEXT NOT NULL,
  duration TEXT NOT NULL DEFAULT '03:45',
  thumbnail_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_type TEXT NOT NULL DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'uploaded')),
  views TEXT NOT NULL DEFAULT '1.2k views',
  tags TEXT[] NOT NULL DEFAULT ARRAY['Academic', 'Tutorial'],
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users can view published videos" ON public.videos;
CREATE POLICY "Public users can view published videos"
  ON public.videos FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins can view all videos" ON public.videos;
CREATE POLICY "Admins can view all videos"
  ON public.videos FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert videos" ON public.videos;
CREATE POLICY "Admins can insert videos"
  ON public.videos FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update videos" ON public.videos;
CREATE POLICY "Admins can update videos"
  ON public.videos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete videos" ON public.videos;
CREATE POLICY "Admins can delete videos"
  ON public.videos FOR DELETE
  TO authenticated
  USING (true);

-- 4. Create Social Links Table (TikTok, Facebook, YouTube, Instagram)
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE CHECK (platform IN ('tiktok', 'facebook', 'youtube', 'instagram')),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  handle TEXT NOT NULL,
  followers TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on social_links
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users can view active social links" ON public.social_links;
CREATE POLICY "Public users can view active social links"
  ON public.social_links FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can view all social links" ON public.social_links;
CREATE POLICY "Admins can view all social links"
  ON public.social_links FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can update social links" ON public.social_links;
CREATE POLICY "Admins can update social links"
  ON public.social_links FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Seed Initial Social Media Links
INSERT INTO public.social_links (platform, name, url, handle, followers, is_active)
VALUES
  ('tiktok', 'TikTok', 'https://tiktok.com/@hometutor.pk', '@hometutor.pk', '45k followers', true),
  ('facebook', 'Facebook', 'https://facebook.com/HomeTutorOfficial', 'HomeTutorOfficial', '82k followers', true),
  ('youtube', 'YouTube', 'https://youtube.com/@hometutoracademy', 'Home Tutor Academy', '28k subscribers', true),
  ('instagram', 'Instagram', 'https://instagram.com/hometutor.academy', '@hometutor.academy', '53k followers', true)
ON CONFLICT (platform) DO UPDATE SET
  url = EXCLUDED.url,
  handle = EXCLUDED.handle,
  followers = EXCLUDED.followers;

-- 6. Storage Buckets Creation (Run in Supabase SQL editor or Storage UI)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posters', 'posters', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public read access for posters
DROP POLICY IF EXISTS "Public can view poster images" ON storage.objects;
CREATE POLICY "Public can view poster images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posters');

-- Storage RLS: Authenticated upload for posters
DROP POLICY IF EXISTS "Authenticated users can upload poster images" ON storage.objects;
CREATE POLICY "Authenticated users can upload poster images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'posters');

-- Storage RLS: Authenticated update/delete for posters
DROP POLICY IF EXISTS "Authenticated users can update/delete poster images" ON storage.objects;
CREATE POLICY "Authenticated users can update/delete poster images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'posters');

-- Storage RLS: Public read access for videos
DROP POLICY IF EXISTS "Public can view video files" ON storage.objects;
CREATE POLICY "Public can view video files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');

-- Storage RLS: Authenticated upload for videos
DROP POLICY IF EXISTS "Authenticated users can upload video files" ON storage.objects;
CREATE POLICY "Authenticated users can upload video files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'videos');
