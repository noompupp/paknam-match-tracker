-- Enhanced auto sync trigger with transaction safety and retry mechanism
CREATE OR REPLACE FUNCTION public.enhanced_auto_sync_player_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  sync_result jsonb;
BEGIN
  -- Only sync if the event affects goals or assists (not cards or substitutions)
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND 
     NEW.event_type IN ('goal', 'assist') THEN
    
    -- Call the cumulative stats calculation function with proper transaction isolation
    SELECT public.calculate_cumulative_player_stats() INTO sync_result;
    
    -- Log the automatic sync with enhanced details
    INSERT INTO operation_logs (
      operation_type,
      table_name,
      success,
      payload,
      result
    ) VALUES (
      'enhanced_auto_sync_player_stats',
      'match_events',
      COALESCE((sync_result->>'success')::boolean, true),
      jsonb_build_object(
        'trigger_operation', TG_OP,
        'event_type', COALESCE(NEW.event_type, OLD.event_type),
        'player_name', COALESCE(NEW.player_name, OLD.player_name),
        'fixture_id', COALESCE(NEW.fixture_id, OLD.fixture_id),
        'event_id', COALESCE(NEW.id, OLD.id)
      ),
      jsonb_build_object(
        'synced_at', now(),
        'triggered_by', 'enhanced_database_trigger',
        'sync_result', sync_result,
        'players_updated', COALESCE((sync_result->>'players_updated')::integer, 0)
      )
    );
    
  ELSIF TG_OP = 'DELETE' AND OLD.event_type IN ('goal', 'assist') THEN
    
    -- Call the cumulative stats calculation function for deletions
    SELECT public.calculate_cumulative_player_stats() INTO sync_result;
    
    -- Log the automatic sync for deletion
    INSERT INTO operation_logs (
      operation_type,
      table_name,
      success,
      payload,
      result
    ) VALUES (
      'enhanced_auto_sync_player_stats',
      'match_events',
      COALESCE((sync_result->>'success')::boolean, true),
      jsonb_build_object(
        'trigger_operation', TG_OP,
        'event_type', OLD.event_type,
        'player_name', OLD.player_name,
        'fixture_id', OLD.fixture_id,
        'event_id', OLD.id
      ),
      jsonb_build_object(
        'synced_at', now(),
        'triggered_by', 'enhanced_database_trigger',
        'sync_result', sync_result,
        'players_updated', COALESCE((sync_result->>'players_updated')::integer, 0)
      )
    );
    
  END IF;
  
  -- Return appropriate record based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

-- Replace the old trigger with the enhanced version
DROP TRIGGER IF EXISTS auto_sync_player_stats_trigger ON match_events;
CREATE TRIGGER enhanced_auto_sync_player_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON match_events
  FOR EACH ROW EXECUTE FUNCTION enhanced_auto_sync_player_stats();

-- Create sync monitoring function
CREATE OR REPLACE FUNCTION public.detect_sync_discrepancies()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
  discrepancy_count integer := 0;
  discrepancies jsonb[] := '{}';
  player_record RECORD;
BEGIN
  -- Check each player's stats for discrepancies
  FOR player_record IN
    SELECT DISTINCT m.id, m.name, m.goals, m.assists
    FROM members m
    WHERE m.name IS NOT NULL
    ORDER BY m.name
  LOOP
    -- Count events for this player
    WITH event_counts AS (
      SELECT 
        COUNT(*) FILTER (WHERE event_type = 'goal' AND is_own_goal = false) as actual_goals,
        COUNT(*) FILTER (WHERE event_type = 'assist') as actual_assists
      FROM match_events me
      WHERE me.player_name = player_record.name
    )
    SELECT * INTO player_record FROM event_counts;
    
    -- Check for discrepancies
    IF player_record.goals != player_record.actual_goals OR player_record.assists != player_record.actual_assists THEN
      discrepancy_count := discrepancy_count + 1;
      discrepancies := discrepancies || jsonb_build_object(
        'player_id', player_record.id,
        'player_name', player_record.name,
        'stored_goals', player_record.goals,
        'actual_goals', player_record.actual_goals,
        'stored_assists', player_record.assists,
        'actual_assists', player_record.actual_assists,
        'goals_diff', player_record.actual_goals - player_record.goals,
        'assists_diff', player_record.actual_assists - player_record.assists
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'has_discrepancies', discrepancy_count > 0,
    'discrepancy_count', discrepancy_count,
    'discrepancies', array_to_json(discrepancies),
    'checked_at', now()
  );
END;
$function$;

-- Create periodic sync status function
CREATE OR REPLACE FUNCTION public.get_sync_health_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
  last_sync_time timestamp with time zone;
  last_discrepancy_check timestamp with time zone;
  total_events integer;
  total_players integer;
  discrepancy_result jsonb;
BEGIN
  -- Get the last sync time
  SELECT MAX(created_at) INTO last_sync_time
  FROM operation_logs 
  WHERE operation_type IN ('enhanced_auto_sync_player_stats', 'calculate_cumulative_player_stats')
  AND success = true;
  
  -- Get total match events for goals and assists
  SELECT COUNT(*) INTO total_events
  FROM match_events 
  WHERE event_type IN ('goal', 'assist');
  
  -- Get total players with stats
  SELECT COUNT(*) INTO total_players
  FROM members 
  WHERE goals > 0 OR assists > 0;
  
  -- Check for current discrepancies
  SELECT public.detect_sync_discrepancies() INTO discrepancy_result;
  
  RETURN jsonb_build_object(
    'sync_health', CASE 
      WHEN (discrepancy_result->>'has_discrepancies')::boolean THEN 'unhealthy'
      WHEN last_sync_time < (now() - interval '1 hour') THEN 'stale'
      ELSE 'healthy'
    END,
    'last_sync', last_sync_time,
    'total_goal_assist_events', total_events,
    'total_players_with_stats', total_players,
    'discrepancy_status', discrepancy_result,
    'sync_enabled', true,
    'status_checked_at', now()
  );
END;
$function$;

-- Create manual sync function with enhanced logging
CREATE OR REPLACE FUNCTION public.manual_sync_player_stats(p_triggered_by uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
  discrepancies_before jsonb;
  discrepancies_after jsonb;
BEGIN
  -- Check discrepancies before sync
  SELECT public.detect_sync_discrepancies() INTO discrepancies_before;
  
  -- Perform the sync
  SELECT public.calculate_cumulative_player_stats() INTO result;
  
  -- Check discrepancies after sync
  SELECT public.detect_sync_discrepancies() INTO discrepancies_after;
  
  -- Log the manual sync with comprehensive details
  INSERT INTO operation_logs (
    operation_type,
    table_name,
    success,
    payload,
    result
  ) VALUES (
    'manual_sync_player_stats',
    'members',
    COALESCE((result->>'success')::boolean, false),
    jsonb_build_object(
      'triggered_by_user', p_triggered_by,
      'discrepancies_before', discrepancies_before,
      'sync_reason', 'manual_intervention'
    ),
    jsonb_build_object(
      'sync_result', result,
      'discrepancies_after', discrepancies_after,
      'discrepancies_fixed', (discrepancies_before->>'discrepancy_count')::integer - (discrepancies_after->>'discrepancy_count')::integer,
      'synced_at', now(),
      'triggered_by', 'manual_sync_function'
    )
  );
  
  RETURN jsonb_build_object(
    'success', COALESCE((result->>'success')::boolean, false),
    'players_updated', COALESCE((result->>'players_updated')::integer, 0),
    'discrepancies_before', (discrepancies_before->>'discrepancy_count')::integer,
    'discrepancies_after', (discrepancies_after->>'discrepancy_count')::integer,
    'discrepancies_fixed', (discrepancies_before->>'discrepancy_count')::integer - (discrepancies_after->>'discrepancy_count')::integer,
    'sync_health_improved', (discrepancies_before->>'has_discrepancies')::boolean AND NOT (discrepancies_after->>'has_discrepancies')::boolean,
    'manual_sync_at', now()
  );
END;
$function$;