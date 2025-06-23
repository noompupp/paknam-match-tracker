
-- Create a function to update match participation based on actual playtime
CREATE OR REPLACE FUNCTION public.update_match_participation(p_fixture_id integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  updated_count integer := 0;
  player_record RECORD;
BEGIN
  -- Update matches_played for all players who have playtime in this match
  FOR player_record IN
    SELECT DISTINCT ptt.player_id, ptt.total_minutes
    FROM player_time_tracking ptt
    WHERE ptt.fixture_id = p_fixture_id
    AND ptt.total_minutes > 0
  LOOP
    -- Increment matches_played by 1 for players with actual playtime
    UPDATE members 
    SET 
      matches_played = matches_played + 1,
      updated_at = NOW()
    WHERE id = player_record.player_id;
    
    updated_count := updated_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'fixture_id', p_fixture_id,
    'players_updated', updated_count,
    'updated_at', NOW()
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'fixture_id', p_fixture_id
  );
END;
$$;

-- Create a function to sync existing data (one-time migration helper)
CREATE OR REPLACE FUNCTION public.sync_all_match_participation()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_updated integer := 0;
  fixture_record RECORD;
  player_participation_count integer;
BEGIN
  -- First, reset all matches_played to 0 to start fresh
  UPDATE members SET matches_played = 0, updated_at = NOW();
  
  -- For each fixture that has player time tracking data
  FOR fixture_record IN
    SELECT DISTINCT fixture_id
    FROM player_time_tracking
    WHERE total_minutes > 0
  LOOP
    -- Count players who participated in this match
    SELECT COUNT(DISTINCT player_id) INTO player_participation_count
    FROM player_time_tracking
    WHERE fixture_id = fixture_record.fixture_id
    AND total_minutes > 0;
    
    -- Update each player who participated
    UPDATE members 
    SET 
      matches_played = matches_played + 1,
      updated_at = NOW()
    WHERE id IN (
      SELECT DISTINCT player_id
      FROM player_time_tracking
      WHERE fixture_id = fixture_record.fixture_id
      AND total_minutes > 0
    );
    
    total_updated := total_updated + player_participation_count;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'total_players_updated', total_updated,
    'synced_at', NOW()
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;
