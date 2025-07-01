
-- Fix the generate_fixture_player_ratings function to properly handle match results and team names
CREATE OR REPLACE FUNCTION public.generate_fixture_player_ratings(p_fixture_id integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  fixture_data RECORD;
  player_record RECORD;
  home_result TEXT;
  away_result TEXT;
  ratings_created INTEGER := 0;
  player_goals INTEGER;
  player_assists INTEGER;
  player_cards INTEGER;
  base_fpl_points INTEGER;
  fpl_rating_value NUMERIC(4,2);
  participation_rating_value NUMERIC(4,2);
  final_rating_value NUMERIC(4,2);
  clean_sheet_achieved BOOLEAN;
BEGIN
  -- Get fixture information with proper team name resolution
  SELECT f.*, 
         COALESCE(ht.name, f.home_team_id) as home_team_name,
         COALESCE(at.name, f.away_team_id) as away_team_name,
         COALESCE(f.home_score, 0) as home_score,
         COALESCE(f.away_score, 0) as away_score
  INTO fixture_data
  FROM fixtures f
  LEFT JOIN teams ht ON ht.__id__ = f.home_team_id
  LEFT JOIN teams at ON at.__id__ = f.away_team_id
  WHERE f.id = p_fixture_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Fixture not found');
  END IF;
  
  -- FIXED: Determine match results based on actual scores
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
      -- FIXED: Properly resolve team names with fallback logic
      COALESCE(
        CASE 
          WHEN ptt.team_id::text = fixture_data.home_team_id THEN fixture_data.home_team_name
          WHEN ptt.team_id::text = fixture_data.away_team_id THEN fixture_data.away_team_name
          ELSE NULL
        END,
        (SELECT t.name FROM teams t WHERE t.__id__ = ptt.team_id::text LIMIT 1),
        ptt.team_id::text
      ) as team_name,
      ptt.total_minutes,
      COALESCE(m."position", 'Player') as player_position,
      -- FIXED: Use proper match result based on team
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
    -- Count player's performance metrics
    SELECT COUNT(*) INTO player_goals
    FROM match_events 
    WHERE fixture_id = p_fixture_id 
    AND player_name = player_record.player_name 
    AND event_type = 'goal'
    AND COALESCE(is_own_goal, false) = false;
    
    SELECT COUNT(*) INTO player_assists
    FROM match_events 
    WHERE fixture_id = p_fixture_id 
    AND player_name = player_record.player_name 
    AND event_type = 'assist';
    
    SELECT COUNT(*) INTO player_cards
    FROM match_events 
    WHERE fixture_id = p_fixture_id 
    AND player_name = player_record.player_name 
    AND event_type IN ('yellow_card', 'red_card');
    
    -- Check clean sheet for defenders/goalkeepers
    clean_sheet_achieved := CASE 
      WHEN player_record.player_position IN ('GK', 'DF') THEN
        (player_record.team_id = fixture_data.home_team_id AND fixture_data.away_score = 0) OR
        (player_record.team_id = fixture_data.away_team_id AND fixture_data.home_score = 0)
      ELSE false
    END;
    
    -- Enhanced FPL points calculation for 7-a-side (50 minute matches)
    base_fpl_points := CASE 
      WHEN player_record.total_minutes >= 35 THEN 2  -- 70% of match (35/50)
      WHEN player_record.total_minutes >= 1 THEN 1 
      ELSE 0 
    END;
    
    -- Add points for performance
    base_fpl_points := base_fpl_points + 
      (player_goals * 4) + 
      (player_assists * 3) + 
      CASE player_record.match_result 
        WHEN 'win' THEN 3 
        WHEN 'draw' THEN 1 
        ELSE 0 
      END -
      (player_cards * 1); -- Deduct for cards
    
    -- Clean sheet bonus for defenders/goalkeepers
    IF player_record.player_position IN ('GK', 'DF') AND clean_sheet_achieved THEN
      base_fpl_points := base_fpl_points + 4;
    END IF;
    
    -- Calculate FPL rating based on points and performance
    fpl_rating_value := CASE 
      WHEN base_fpl_points >= 12 THEN 8.5 + (RANDOM() * 1.5)
      WHEN base_fpl_points >= 8 THEN 7.5 + (RANDOM() * 1.0)
      WHEN base_fpl_points >= 6 THEN 6.5 + (RANDOM() * 1.0)
      WHEN base_fpl_points >= 4 THEN 6.0 + (RANDOM() * 0.5)
      WHEN base_fpl_points >= 2 THEN 5.5 + (RANDOM() * 0.5)
      ELSE 5.0 + (RANDOM() * 0.5)
    END;
    
    -- Enhanced participation rating based on minutes (adjusted for 50-minute matches)
    participation_rating_value := CASE 
      WHEN player_record.total_minutes >= 45 THEN 8.0 + (RANDOM() * 1.5)  -- 90% of match
      WHEN player_record.total_minutes >= 35 THEN 7.5 + (RANDOM() * 1.0)  -- 70% of match
      WHEN player_record.total_minutes >= 25 THEN 7.0 + (RANDOM() * 0.8)  -- 50% of match
      WHEN player_record.total_minutes >= 15 THEN 6.5 + (RANDOM() * 0.5)  -- 30% of match
      ELSE 6.0 + (RANDOM() * 0.3)
    END;
    
    -- Adjust for performance
    IF player_goals > 0 THEN
      participation_rating_value := participation_rating_value + (player_goals * 0.5);
    END IF;
    
    IF player_assists > 0 THEN
      participation_rating_value := participation_rating_value + (player_assists * 0.3);
    END IF;
    
    -- Cap ratings at 10.0
    fpl_rating_value := LEAST(fpl_rating_value, 10.0);
    participation_rating_value := LEAST(participation_rating_value, 10.0);
    
    -- Calculate final rating (70% FPL, 30% Participation)
    final_rating_value := ROUND((fpl_rating_value * 0.7 + participation_rating_value * 0.3)::numeric, 2);
    
    -- Insert/update the rating record with final_rating column
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
      final_rating,
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
      base_fpl_points,
      fpl_rating_value,
      participation_rating_value,
      final_rating_value,
      jsonb_build_object(
        'goals', player_goals,
        'assists', player_assists,
        'cards', player_cards,
        'goals_conceded', 
        CASE 
          WHEN player_record.player_position = 'GK' THEN
            CASE 
              WHEN player_record.team_id = fixture_data.home_team_id THEN fixture_data.away_score
              ELSE fixture_data.home_score
            END
          ELSE 0
        END,
        'clean_sheet_eligible', player_record.player_position IN ('GK', 'DF'),
        'clean_sheet_achieved', clean_sheet_achieved
      )
    )
    ON CONFLICT (fixture_id, player_id) 
    DO UPDATE SET
      team_name = EXCLUDED.team_name,
      minutes_played = EXCLUDED.minutes_played,
      match_result = EXCLUDED.match_result,
      fpl_points = EXCLUDED.fpl_points,
      fpl_rating = EXCLUDED.fpl_rating,
      participation_rating = EXCLUDED.participation_rating,
      final_rating = EXCLUDED.final_rating,
      rating_breakdown = EXCLUDED.rating_breakdown,
      updated_at = now();
    
    ratings_created := ratings_created + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'fixture_id', p_fixture_id,
    'ratings_created', ratings_created,
    'home_result', home_result,
    'away_result', away_result,
    'home_score', fixture_data.home_score,
    'away_score', fixture_data.away_score,
    'debug_info', jsonb_build_object(
      'home_team_name', fixture_data.home_team_name,
      'away_team_name', fixture_data.away_team_name
    )
  );
END;
$function$;
