-- Enhanced cumulative player stats calculation with matches_played
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
    ),
    player_matches_from_events AS (
      -- Count distinct fixtures where player has any recorded activity
      SELECT COUNT(DISTINCT me.fixture_id) as matches_from_events
      FROM match_events me
      WHERE me.player_name = player_record.name
      AND me.event_type IN ('goal', 'assist', 'yellow_card', 'red_card')
    ),
    player_matches_from_time AS (
      -- Count distinct fixtures where player has time tracking data
      SELECT COUNT(DISTINCT ptt.fixture_id) as matches_from_time
      FROM player_time_tracking ptt
      WHERE ptt.player_name = player_record.name
      AND ptt.total_minutes > 0
    ),
    combined_matches AS (
      -- Use the maximum of both methods to ensure we don't miss matches
      SELECT GREATEST(
        COALESCE((SELECT matches_from_events FROM player_matches_from_events), 0),
        COALESCE((SELECT matches_from_time FROM player_matches_from_time), 0)
      ) as total_matches_played
    )
    -- Update the member with calculated totals
    UPDATE members
    SET 
      goals = (SELECT total_goals FROM player_goals),
      assists = (SELECT total_assists FROM player_assists),
      yellow_cards = (SELECT total_yellow_cards FROM player_yellow_cards),
      red_cards = (SELECT total_red_cards FROM player_red_cards),
      matches_played = (SELECT total_matches_played FROM combined_matches),
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

-- Enhanced validation function that checks matches_played consistency
CREATE OR REPLACE FUNCTION public.validate_player_stats_with_participation()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
  player_record RECORD;
  validation_issues text[] := '{}';
  total_issues integer := 0;
BEGIN
  -- Check each player's stats for consistency
  FOR player_record IN
    SELECT DISTINCT m.id, m.name, m.goals, m.assists, m.yellow_cards, m.red_cards, m.matches_played
    FROM members m
    WHERE m.name IS NOT NULL
  LOOP
    -- Count events for this player
    WITH event_counts AS (
      SELECT 
        COUNT(*) FILTER (WHERE event_type = 'goal' AND is_own_goal = false) as event_goals,
        COUNT(*) FILTER (WHERE event_type = 'assist') as event_assists,
        COUNT(*) FILTER (WHERE event_type = 'yellow_card') as event_yellow_cards,
        COUNT(*) FILTER (WHERE event_type = 'red_card') as event_red_cards,
        COUNT(DISTINCT fixture_id) FILTER (WHERE event_type IN ('goal', 'assist', 'yellow_card', 'red_card')) as matches_with_events
      FROM match_events me
      WHERE me.player_name = player_record.name
    ),
    time_counts AS (
      SELECT COUNT(DISTINCT fixture_id) as matches_with_time
      FROM player_time_tracking ptt
      WHERE ptt.player_name = player_record.name
      AND ptt.total_minutes > 0
    )
    SELECT ec.*, tc.matches_with_time,
           GREATEST(ec.matches_with_events, tc.matches_with_time) as expected_matches
    INTO player_record
    FROM event_counts ec, time_counts tc;

    -- Check for discrepancies
    IF player_record.goals != player_record.event_goals THEN
      validation_issues := array_append(validation_issues, 
        player_record.name || ': Goals mismatch - Profile: ' || player_record.goals || ', Events: ' || player_record.event_goals);
      total_issues := total_issues + 1;
    END IF;

    IF player_record.assists != player_record.event_assists THEN
      validation_issues := array_append(validation_issues, 
        player_record.name || ': Assists mismatch - Profile: ' || player_record.assists || ', Events: ' || player_record.event_assists);
      total_issues := total_issues + 1;
    END IF;

    IF player_record.yellow_cards != player_record.event_yellow_cards THEN
      validation_issues := array_append(validation_issues, 
        player_record.name || ': Yellow cards mismatch - Profile: ' || player_record.yellow_cards || ', Events: ' || player_record.event_yellow_cards);
      total_issues := total_issues + 1;
    END IF;

    IF player_record.red_cards != player_record.event_red_cards THEN
      validation_issues := array_append(validation_issues, 
        player_record.name || ': Red cards mismatch - Profile: ' || player_record.red_cards || ', Events: ' || player_record.event_red_cards);
      total_issues := total_issues + 1;
    END IF;

    IF player_record.matches_played != player_record.expected_matches THEN
      validation_issues := array_append(validation_issues, 
        player_record.name || ': Matches played mismatch - Profile: ' || player_record.matches_played || 
        ', Expected: ' || player_record.expected_matches || 
        ' (Events: ' || player_record.matches_with_events || ', Time: ' || player_record.matches_with_time || ')');
      total_issues := total_issues + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'is_valid', total_issues = 0,
    'total_issues', total_issues,
    'issues', validation_issues,
    'validated_at', NOW()
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'total_issues', total_issues
  );
END;
$function$;