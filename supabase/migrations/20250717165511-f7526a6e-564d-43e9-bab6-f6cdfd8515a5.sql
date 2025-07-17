-- Create database function for accurate cumulative player statistics
-- This function calculates total goals and assists for each player from ALL match events

CREATE OR REPLACE FUNCTION public.calculate_cumulative_player_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
  player_record RECORD;
  updated_count integer := 0;
BEGIN
  -- Loop through all players and calculate their cumulative stats
  FOR player_record IN
    SELECT DISTINCT m.id, m.name
    FROM members m
    WHERE m.name IS NOT NULL
  LOOP
    -- Calculate total goals (excluding own goals)
    WITH player_goals AS (
      SELECT COUNT(*) as total_goals
      FROM match_events me
      WHERE me.player_name = player_record.name
      AND me.event_type = 'goal'
      AND me.is_own_goal = false
    ),
    player_assists AS (
      SELECT COUNT(*) as total_assists
      FROM match_events me
      WHERE me.player_name = player_record.name
      AND me.event_type = 'assist'
    ),
    player_yellow_cards AS (
      SELECT COUNT(*) as total_yellow_cards
      FROM match_events me
      WHERE me.player_name = player_record.name
      AND me.event_type = 'yellow_card'
    ),
    player_red_cards AS (
      SELECT COUNT(*) as total_red_cards
      FROM match_events me
      WHERE me.player_name = player_record.name
      AND me.event_type = 'red_card'
    )
    -- Update the member with calculated totals
    UPDATE members
    SET 
      goals = (SELECT total_goals FROM player_goals),
      assists = (SELECT total_assists FROM player_assists),
      yellow_cards = (SELECT total_yellow_cards FROM player_yellow_cards),
      red_cards = (SELECT total_red_cards FROM player_red_cards),
      updated_at = NOW()
    WHERE id = player_record.id;
    
    updated_count := updated_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'players_updated', updated_count,
    'calculated_at', NOW()
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'players_updated', updated_count
  );
END;
$function$;