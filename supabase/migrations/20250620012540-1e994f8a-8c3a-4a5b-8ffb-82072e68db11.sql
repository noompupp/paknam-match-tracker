
-- First, let's ensure the members table has a proper primary key on the id column
-- We need to handle this carefully in case there are existing constraints

-- Drop the existing primary key if it exists and recreate it properly
DO $$
BEGIN
    -- Check if there's already a primary key and drop it if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'members' 
        AND constraint_type = 'PRIMARY KEY'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.members DROP CONSTRAINT members_pkey;
    END IF;
    
    -- Now add the primary key constraint
    ALTER TABLE public.members ADD CONSTRAINT members_pkey PRIMARY KEY (id);
END $$;

-- Create the player_ratings table for storing user ratings
CREATE TABLE public.player_ratings (
  id SERIAL PRIMARY KEY,
  fixture_id INTEGER NOT NULL REFERENCES public.fixtures(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fixture_id, player_id, rater_id)
);

-- Enable Row Level Security
ALTER TABLE public.player_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view all ratings (for statistics)
CREATE POLICY "Users can view all ratings" ON public.player_ratings
  FOR SELECT USING (true);

-- RLS Policy: Users can insert their own ratings
CREATE POLICY "Users can insert their own ratings" ON public.player_ratings
  FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- RLS Policy: Users can update their own ratings
CREATE POLICY "Users can update their own ratings" ON public.player_ratings
  FOR UPDATE USING (auth.uid() = rater_id);

-- RLS Policy: Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings" ON public.player_ratings
  FOR DELETE USING (auth.uid() = rater_id);

-- Create index for performance
CREATE INDEX idx_player_ratings_fixture_rater ON public.player_ratings(fixture_id, rater_id);
CREATE INDEX idx_player_ratings_player ON public.player_ratings(player_id);

-- Add trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_player_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_player_ratings_updated_at_trigger
  BEFORE UPDATE ON public.player_ratings
  FOR EACH ROW EXECUTE FUNCTION update_player_ratings_updated_at();
