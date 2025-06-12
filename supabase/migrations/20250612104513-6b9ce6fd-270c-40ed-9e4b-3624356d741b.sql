
-- Create storage buckets for optimized image organization (only if they don't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('optimized-images', 'optimized-images', true, 52428800, ARRAY['image/webp', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('player-avatars', 'player-avatars', true, 51200, ARRAY['image/webp', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('tournament-assets', 'tournament-assets', true, 51200, ARRAY['image/webp', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Update existing team-logos bucket if it exists
UPDATE storage.buckets 
SET 
  file_size_limit = 51200,
  allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png']
WHERE id = 'team-logos';

-- Create storage policies for public access (drop existing if they exist)
DROP POLICY IF EXISTS "Public Access optimized-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access team-logos" ON storage.objects;
DROP POLICY IF EXISTS "Public Access player-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Access tournament-assets" ON storage.objects;

CREATE POLICY "Public Access optimized-images" ON storage.objects FOR SELECT USING (bucket_id = 'optimized-images');
CREATE POLICY "Public Access team-logos" ON storage.objects FOR SELECT USING (bucket_id = 'team-logos');
CREATE POLICY "Public Access player-avatars" ON storage.objects FOR SELECT USING (bucket_id = 'player-avatars');
CREATE POLICY "Public Access tournament-assets" ON storage.objects FOR SELECT USING (bucket_id = 'tournament-assets');

-- Authenticated upload policies
DROP POLICY IF EXISTS "Authenticated Upload optimized-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload team-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload player-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload tournament-assets" ON storage.objects;

CREATE POLICY "Authenticated Upload optimized-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'optimized-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated Upload team-logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'team-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated Upload player-avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'player-avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated Upload tournament-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tournament-assets' AND auth.role() = 'authenticated');

-- Create image metadata table
CREATE TABLE IF NOT EXISTS public.image_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url TEXT NOT NULL,
  bucket_id TEXT NOT NULL,
  object_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  format TEXT NOT NULL,
  variants JSONB DEFAULT '{}',
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on image metadata
ALTER TABLE public.image_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for image metadata (drop existing if they exist)
DROP POLICY IF EXISTS "Public read access" ON public.image_metadata;
DROP POLICY IF EXISTS "Authenticated insert" ON public.image_metadata;
DROP POLICY IF EXISTS "Owner update" ON public.image_metadata;

CREATE POLICY "Public read access" ON public.image_metadata FOR SELECT USING (true);
CREATE POLICY "Authenticated insert" ON public.image_metadata FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Owner update" ON public.image_metadata FOR UPDATE USING (auth.uid()::text = (string_to_array(object_path, '/'))[1]);

-- Add image optimization columns to existing tables
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS logo_metadata_id UUID REFERENCES public.image_metadata(id),
ADD COLUMN IF NOT EXISTS optimized_logo_url TEXT,
ADD COLUMN IF NOT EXISTS logo_variants JSONB DEFAULT '{}';

ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS avatar_metadata_id UUID REFERENCES public.image_metadata(id),
ADD COLUMN IF NOT EXISTS optimized_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_variants JSONB DEFAULT '{}';

-- Create function to clean up old image metadata
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.image_metadata 
  WHERE id NOT IN (
    SELECT logo_metadata_id FROM public.teams WHERE logo_metadata_id IS NOT NULL
    UNION
    SELECT avatar_metadata_id FROM public.members WHERE avatar_metadata_id IS NOT NULL
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create updated_at trigger for image_metadata
CREATE OR REPLACE FUNCTION update_image_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_image_metadata_updated_at ON public.image_metadata;
CREATE TRIGGER update_image_metadata_updated_at
  BEFORE UPDATE ON public.image_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_image_metadata_updated_at();
