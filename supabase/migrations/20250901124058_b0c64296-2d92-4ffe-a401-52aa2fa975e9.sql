-- First, run immediate manual sync to fix current data discrepancies
SELECT public.calculate_cumulative_player_stats();

-- Create enhanced sync health monitoring function
CREATE OR REPLACE FUNCTION public.get_sync_health_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  sync_health text := 'healthy';
  last_sync_time timestamp with time zone;
  total_events integer;
  total_players integer;
  discrepancy_count integer := 0;
  discrepancies jsonb := '[]'::jsonb;
BEGIN
  -- Get last sync time
  SELECT MAX(created_at) INTO last_sync_time
  FROM operation_logs 
  WHERE operation_type IN ('auto_sync_player_stats', 'enhanced_auto_sync_player_stats', 'manual_sync_player_stats')
  AND success = true;
  
  -- Get total goal/assist events
  SELECT COUNT(*) INTO total_events
  FROM match_events 
  WHERE event_type IN ('goal', 'assist');
  
  -- Get total players with stats
  SELECT COUNT(*) INTO total_players
  FROM members 
  WHERE goals > 0 OR assists > 0;
  
  -- Check for discrepancies by comparing actual events vs stored stats
  WITH player_discrepancies AS (
    SELECT 
      m.name as player_name,
      m.goals as stored_goals,
      m.assists as stored_assists,
      COALESCE(goal_events.count, 0) as actual_goals,
      COALESCE(assist_events.count, 0) as actual_assists,
      (COALESCE(goal_events.count, 0) - m.goals) as goals_diff,
      (COALESCE(assist_events.count, 0) - m.assists) as assists_diff
    FROM members m
    LEFT JOIN (
      SELECT player_name, COUNT(*) as count
      FROM match_events 
      WHERE event_type = 'goal' AND is_own_goal = false
      GROUP BY player_name
    ) goal_events ON goal_events.player_name = m.name
    LEFT JOIN (
      SELECT player_name, COUNT(*) as count
      FROM match_events 
      WHERE event_type = 'assist'
      GROUP BY player_name
    ) assist_events ON assist_events.player_name = m.name
    WHERE (COALESCE(goal_events.count, 0) != m.goals) OR (COALESCE(assist_events.count, 0) != m.assists)
  )
  SELECT 
    COUNT(*)::integer,
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'player_name', player_name,
        'stored_goals', stored_goals,
        'actual_goals', actual_goals,
        'stored_assists', stored_assists,
        'actual_assists', actual_assists,
        'goals_diff', goals_diff,
        'assists_diff', assists_diff
      )
    ), '[]'::jsonb)
  INTO discrepancy_count, discrepancies
  FROM player_discrepancies;
  
  -- Determine sync health
  IF discrepancy_count > 0 THEN
    sync_health := 'unhealthy';
  ELSIF last_sync_time IS NULL OR last_sync_time < NOW() - INTERVAL '1 day' THEN
    sync_health := 'stale';
  END IF;
  
  RETURN jsonb_build_object(
    'sync_health', sync_health,
    'last_sync', last_sync_time,
    'total_goal_assist_events', total_events,
    'total_players_with_stats', total_players,
    'discrepancy_status', jsonb_build_object(
      'has_discrepancies', discrepancy_count > 0,
      'discrepancy_count', discrepancy_count,
      'discrepancies', discrepancies
    ),
    'sync_enabled', true,
    'status_checked_at', NOW()
  );
END;
$$;

-- Create manual sync function with better error handling
CREATE OR REPLACE FUNCTION public.manual_sync_player_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  sync_result jsonb;
  discrepancies_before integer;
  discrepancies_after integer;
  players_updated integer;
BEGIN
  -- Get discrepancies before sync
  SELECT (get_sync_health_status()->>'discrepancy_status')::jsonb->>'discrepancy_count' INTO discrepancies_before;
  
  -- Run the cumulative stats calculation
  SELECT public.calculate_cumulative_player_stats() INTO sync_result;
  
  -- Get players updated count
  SELECT COALESCE((sync_result->>'players_updated')::integer, 0) INTO players_updated;
  
  -- Get discrepancies after sync
  SELECT (get_sync_health_status()->>'discrepancy_status')::jsonb->>'discrepancy_count' INTO discrepancies_after;
  
  -- Log the manual sync
  INSERT INTO operation_logs (
    operation_type,
    table_name,
    success,
    payload,
    result
  ) VALUES (
    'manual_sync_player_stats',
    'members',
    COALESCE((sync_result->>'success')::boolean, false),
    jsonb_build_object(
      'triggered_by', 'manual_request',
      'discrepancies_before', discrepancies_before
    ),
    jsonb_build_object(
      'players_updated', players_updated,
      'discrepancies_before', discrepancies_before,
      'discrepancies_after', discrepancies_after,
      'discrepancies_fixed', GREATEST(0, discrepancies_before::integer - discrepancies_after::integer),
      'sync_result', sync_result
    )
  );
  
  RETURN jsonb_build_object(
    'success', COALESCE((sync_result->>'success')::boolean, false),
    'players_updated', players_updated,
    'discrepancies_before', discrepancies_before::integer,
    'discrepancies_after', discrepancies_after::integer,
    'discrepancies_fixed', GREATEST(0, discrepancies_before::integer - discrepancies_after::integer),
    'sync_health_improved', discrepancies_after::integer < discrepancies_before::integer,
    'manual_sync_at', NOW()
  );
END;
$$;

-- Create function to detect sync discrepancies
CREATE OR REPLACE FUNCTION public.detect_sync_discrepancies()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  discrepancy_count integer;
  discrepancies jsonb;
BEGIN
  -- Get detailed discrepancy analysis
  WITH player_analysis AS (
    SELECT 
      m.id as player_id,
      m.name as player_name,
      m.goals as stored_goals,
      m.assists as stored_assists,
      COALESCE(goal_events.count, 0) as actual_goals,
      COALESCE(assist_events.count, 0) as actual_assists,
      (COALESCE(goal_events.count, 0) - m.goals) as goals_diff,
      (COALESCE(assist_events.count, 0) - m.assists) as assists_diff,
      m.last_time_sync
    FROM members m
    LEFT JOIN (
      SELECT player_name, COUNT(*) as count
      FROM match_events 
      WHERE event_type = 'goal' AND is_own_goal = false
      GROUP BY player_name
    ) goal_events ON goal_events.player_name = m.name
    LEFT JOIN (
      SELECT player_name, COUNT(*) as count
      FROM match_events 
      WHERE event_type = 'assist'
      GROUP BY player_name
    ) assist_events ON assist_events.player_name = m.name
    WHERE m.name IS NOT NULL
  ),
  discrepancy_details AS (
    SELECT *
    FROM player_analysis
    WHERE goals_diff != 0 OR assists_diff != 0
  )
  SELECT 
    COUNT(*)::integer,
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'player_id', player_id,
        'player_name', player_name,
        'stored_goals', stored_goals,
        'actual_goals', actual_goals,
        'stored_assists', stored_assists,
        'actual_assists', actual_assists,
        'goals_diff', goals_diff,
        'assists_diff', assists_diff,
        'last_sync', last_time_sync,
        'severity', CASE 
          WHEN ABS(goals_diff) > 5 OR ABS(assists_diff) > 5 THEN 'high'
          WHEN ABS(goals_diff) > 2 OR ABS(assists_diff) > 2 THEN 'medium'
          ELSE 'low'
        END
      )
    ), '[]'::jsonb)
  INTO discrepancy_count, discrepancies
  FROM discrepancy_details;
  
  RETURN jsonb_build_object(
    'has_discrepancies', discrepancy_count > 0,
    'discrepancy_count', discrepancy_count,
    'discrepancies', discrepancies,
    'detected_at', NOW(),
    'total_players_checked', (SELECT COUNT(*) FROM members WHERE name IS NOT NULL)
  );
END;
$$;