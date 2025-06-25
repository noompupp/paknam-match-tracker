
-- Create table for fixture player ratings (hybrid system)
CREATE TABLE IF NOT EXISTS public.fixture_player_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fixture_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  team_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  player_position TEXT NOT NULL DEFAULT 'Player',
  minutes_played INTEGER DEFAULT 90,
  match_result TEXT NOT NULL, -- 'win', 'draw', 'loss'
  fpl_points INTEGER DEFAULT 0,
  fpl_rating NUMERIC(4,2) DEFAULT 6.0,
  participation_rating NUMERIC(4,2) DEFAULT 6.0,
  final_rating NUMERIC(4,2) GENERATED ALWAYS AS (
    CASE 
      WHEN minutes_played = 0 THEN 0
      ELSE ROUND((fpl_rating * 0.6 + participation_rating * 0.4)::numeric, 2)
    END
  ) STORED,
  rating_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(fixture_id, player_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fixture_player_ratings_fixture_id ON public.fixture_player_ratings(fixture_id);
CREATE INDEX IF NOT EXISTS idx_fixture_player_ratings_final_rating ON public.fixture_player_ratings(final_rating DESC);
CREATE INDEX IF NOT EXISTS idx_fixture_player_ratings_team_id ON public.fixture_player_ratings(team_id);

-- Enable RLS
ALTER TABLE public.fixture_player_ratings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow read access to fixture player ratings"
  ON public.fixture_player_ratings FOR SELECT
  USING (true);

CREATE POLICY "Allow insert for authenticated users"
  ON public.fixture_player_ratings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow update for authenticated users"
  ON public.fixture_player_ratings FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Function to get fixture player ratings with team data
CREATE OR REPLACE FUNCTION public.get_fixture_player_ratings(p_fixture_id INTEGER)
RETURNS TABLE (
  player_id INTEGER,
  player_name TEXT,
  team_id TEXT,
  team_name TEXT,
  player_position TEXT,
  rating_data JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fpr.player_id,
    fpr.player_name,
    fpr.team_id,
    fpr.team_name,
    fpr.player_position,
    jsonb_build_object(
      'player_id', fpr.player_id,
      'player_name', fpr.player_name,
      'team_id', fpr.team_id,
      'position', fpr.player_position,
      'minutes_played', fpr.minutes_played,
      'match_result', fpr.match_result,
      'fpl_points', fpr.fpl_points,
      'fpl_rating', fpr.fpl_rating,
      'participation_rating', fpr.participation_rating,
      'final_rating', fpr.final_rating,
      'rating_breakdown', fpr.rating_breakdown
    ) as rating_data
  FROM public.fixture_player_ratings fpr
  WHERE fpr.fixture_id = p_fixture_id
  ORDER BY fpr.final_rating DESC;
END;
$$;

-- Function to generate fixture player ratings from match data
CREATE OR REPLACE FUNCTION public.generate_fixture_player_ratings(p_fixture_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  fixture_data RECORD;
  player_record RECORD;
  home_result TEXT;
  away_result TEXT;
  ratings_created INTEGER := 0;
BEGIN
  -- Get fixture information
  SELECT f.*, 
         ht.name as home_team_name,
         at.name as away_team_name
  INTO fixture_data
  FROM fixtures f
  LEFT JOIN teams ht ON ht.__id__ = f.home_team_id
  LEFT JOIN teams at ON at.__id__ = f.away_team_id
  WHERE f.id = p_fixture_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Fixture not found');
  END IF;
  
  -- Determine match results
  IF fixture_data.home_score > fixture_data.away_score THEN
    home_result := 'win';
    away_result := 'loss';
  ELSIF fixture_data.home_score < fixture_data.away_score THEN
    home_result := 'loss';
    away_result := 'win';
  ELSE
    home_result := 'draw';
    away_result := 'draw';
  END IF;
  
  -- Generate ratings for players who played in this match
  FOR player_record IN
    SELECT DISTINCT 
      ptt.player_id,
      ptt.player_name,
      ptt.team_id::text as team_id,
      CASE 
        WHEN ptt.team_id::text = fixture_data.home_team_id THEN fixture_data.home_team_name
        WHEN ptt.team_id::text = fixture_data.away_team_id THEN fixture_data.away_team_name
        ELSE 'Unknown Team'
      END as team_name,
      ptt.total_minutes,
      COALESCE(m."position", 'Player') as player_position,
      CASE 
        WHEN ptt.team_id::text = fixture_data.home_team_id THEN home_result
        WHEN ptt.team_id::text = fixture_data.away_team_id THEN away_result
        ELSE 'draw'
      END as match_result
    FROM player_time_tracking ptt
    LEFT JOIN members m ON m.id = ptt.player_id
    WHERE ptt.fixture_id = p_fixture_id
    AND ptt.total_minutes > 0
  LOOP
    -- Calculate ratings based on performance
    INSERT INTO public.fixture_player_ratings (
      fixture_id,
      player_id,
      player_name,
      team_id,
      team_name,
      player_position,
      minutes_played,
      match_result,
      fpl_points,
      fpl_rating,
      participation_rating,
      rating_breakdown
    ) VALUES (
      p_fixture_id,
      player_record.player_id,
      player_record.player_name,
      player_record.team_id,
      player_record.team_name,
      player_record.player_position,
      player_record.total_minutes,
      player_record.match_result,
      -- Mock FPL points calculation
      CASE 
        WHEN player_record.total_minutes >= 60 THEN 
          CASE player_record.match_result
            WHEN 'win' THEN 8 + FLOOR(RANDOM() * 5)
            WHEN 'draw' THEN 6 + FLOOR(RANDOM() * 3)
            ELSE 4 + FLOOR(RANDOM() * 3)
          END
        ELSE 2 + FLOOR(RANDOM() * 2)
      END,
      -- FPL Rating calculation
      CASE 
        WHEN player_record.total_minutes >= 60 THEN
          CASE player_record.match_result
            WHEN 'win' THEN 7.0 + (RANDOM() * 2.0)
            WHEN 'draw' THEN 6.5 + (RANDOM() * 1.5)
            ELSE 6.0 + (RANDOM() * 1.0)
          END
        ELSE 5.5 + (RANDOM() * 1.0)
      END,
      -- Participation rating
      CASE 
        WHEN player_record.total_minutes >= 80 THEN 8.0 + (RANDOM() * 1.5)
        WHEN player_record.total_minutes >= 60 THEN 7.5 + (RANDOM() * 1.0)
        WHEN player_record.total_minutes >= 30 THEN 7.0 + (RANDOM() * 0.8)
        ELSE 6.0 + (RANDOM() * 0.5)
      END,
      jsonb_build_object(
        'goals_conceded', 
        CASE 
          WHEN player_record.player_position = 'GK' THEN
            CASE 
              WHEN player_record.team_id = fixture_data.home_team_id THEN fixture_data.away_score
              ELSE fixture_data.home_score
            END
          ELSE 0
        END,
        'clean_sheet_eligible', player_record.player_position IN ('GK', 'DF')
      )
    )
    ON CONFLICT (fixture_id, player_id) 
    DO UPDATE SET
      minutes_played = EXCLUDED.minutes_played,
      match_result = EXCLUDED.match_result,
      fpl_points = EXCLUDED.fpl_points,
      fpl_rating = EXCLUDED.fpl_rating,
      participation_rating = EXCLUDED.participation_rating,
      rating_breakdown = EXCLUDED.rating_breakdown,
      updated_at = now();
    
    ratings_created := ratings_created + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'fixture_id', p_fixture_id,
    'ratings_created', ratings_created
  );
END;
$$;

-- Update trigger for fixture_player_ratings
CREATE OR REPLACE FUNCTION update_fixture_player_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fixture_player_ratings_updated_at
  BEFORE UPDATE ON public.fixture_player_ratings
  FOR EACH ROW EXECUTE FUNCTION update_fixture_player_ratings_updated_at();
