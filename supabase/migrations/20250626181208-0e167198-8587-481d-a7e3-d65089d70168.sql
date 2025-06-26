
-- Update approved_player_ratings table to store both original and adjusted values
ALTER TABLE public.approved_player_ratings 
ADD COLUMN original_fpl_rating NUMERIC(4,2),
ADD COLUMN original_participation_rating NUMERIC(4,2),
ADD COLUMN adjusted_fpl_rating NUMERIC(4,2),
ADD COLUMN adjusted_participation_rating NUMERIC(4,2),
ADD COLUMN was_adjusted BOOLEAN DEFAULT FALSE;

-- Update the approve_player_rating function to handle adjusted values
CREATE OR REPLACE FUNCTION public.approve_player_rating(
  p_fixture_id INTEGER,
  p_player_id INTEGER,
  p_player_name TEXT,
  p_team_id TEXT,
  p_position TEXT DEFAULT 'Player',
  p_adjusted_fpl_rating NUMERIC(4,2) DEFAULT NULL,
  p_adjusted_participation_rating NUMERIC(4,2) DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  original_rating RECORD;
  final_fpl_rating NUMERIC(4,2);
  final_participation_rating NUMERIC(4,2);
  final_rating_value NUMERIC(4,2);
  was_adjusted BOOLEAN := FALSE;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
  END IF;

  -- Get original rating data from fixture_player_ratings
  SELECT 
    fpl_rating,
    participation_rating,
    final_rating
  INTO original_rating
  FROM public.fixture_player_ratings
  WHERE fixture_id = p_fixture_id AND player_id = p_player_id;

  -- If no original rating found, use defaults
  IF NOT FOUND THEN
    original_rating.fpl_rating := 6.0;
    original_rating.participation_rating := 6.0;
    original_rating.final_rating := 6.0;
  END IF;

  -- Determine final values (use adjusted if provided, otherwise original)
  IF p_adjusted_fpl_rating IS NOT NULL THEN
    final_fpl_rating := p_adjusted_fpl_rating;
    was_adjusted := TRUE;
  ELSE
    final_fpl_rating := original_rating.fpl_rating;
  END IF;

  IF p_adjusted_participation_rating IS NOT NULL THEN
    final_participation_rating := p_adjusted_participation_rating;
    was_adjusted := TRUE;
  ELSE
    final_participation_rating := original_rating.participation_rating;
  END IF;

  -- Calculate final rating (70% FPL, 30% Participation)
  final_rating_value := ROUND((final_fpl_rating * 0.7 + final_participation_rating * 0.3)::numeric, 2);

  -- Insert or update approved rating
  INSERT INTO public.approved_player_ratings (
    fixture_id,
    player_id,
    player_name,
    team_id,
    position,
    fpl_rating,
    participation_rating,
    final_rating,
    original_fpl_rating,
    original_participation_rating,
    adjusted_fpl_rating,
    adjusted_participation_rating,
    was_adjusted,
    approved_by,
    rating_data
  ) VALUES (
    p_fixture_id,
    p_player_id,
    p_player_name,
    p_team_id,
    p_position,
    final_fpl_rating,
    final_participation_rating,
    final_rating_value,
    original_rating.fpl_rating,
    original_rating.participation_rating,
    CASE WHEN was_adjusted THEN p_adjusted_fpl_rating ELSE NULL END,
    CASE WHEN was_adjusted THEN p_adjusted_participation_rating ELSE NULL END,
    was_adjusted,
    auth.uid(),
    jsonb_build_object(
      'player_id', p_player_id,
      'player_name', p_player_name,
      'team_id', p_team_id,
      'position', p_position,
      'minutes_played', 90,
      'match_result', 'win',
      'fpl_points', 8,
      'fpl_rating', final_fpl_rating,
      'participation_rating', final_participation_rating,
      'final_rating', final_rating_value,
      'original_fpl_rating', original_rating.fpl_rating,
      'original_participation_rating', original_rating.participation_rating,
      'was_adjusted', was_adjusted,
      'rating_breakdown', jsonb_build_object(
        'goals_conceded', 0,
        'clean_sheet_eligible', true
      )
    )
  )
  ON CONFLICT (fixture_id, player_id) 
  DO UPDATE SET
    fpl_rating = EXCLUDED.fpl_rating,
    participation_rating = EXCLUDED.participation_rating,
    final_rating = EXCLUDED.final_rating,
    original_fpl_rating = EXCLUDED.original_fpl_rating,
    original_participation_rating = EXCLUDED.original_participation_rating,
    adjusted_fpl_rating = EXCLUDED.adjusted_fpl_rating,
    adjusted_participation_rating = EXCLUDED.adjusted_participation_rating,
    was_adjusted = EXCLUDED.was_adjusted,
    approved_by = auth.uid(),
    approved_at = now(),
    updated_at = now(),
    rating_data = EXCLUDED.rating_data;

  RETURN jsonb_build_object(
    'success', true,
    'player_id', p_player_id,
    'was_adjusted', was_adjusted,
    'final_rating', final_rating_value,
    'approved_at', now()
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;
