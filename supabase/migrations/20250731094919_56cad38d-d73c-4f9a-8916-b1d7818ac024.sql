-- Create a trigger function that automatically syncs player stats when match events change
CREATE OR REPLACE FUNCTION public.auto_sync_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if the event affects goals or assists (not cards or substitutions)
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND 
     NEW.event_type IN ('goal', 'assist') THEN
    
    -- Call the cumulative stats calculation function
    PERFORM public.calculate_cumulative_player_stats();
    
    -- Log the automatic sync
    INSERT INTO operation_logs (
      operation_type,
      table_name,
      success,
      payload,
      result
    ) VALUES (
      'auto_sync_player_stats',
      'match_events',
      true,
      jsonb_build_object(
        'trigger_operation', TG_OP,
        'event_type', COALESCE(NEW.event_type, OLD.event_type),
        'player_name', COALESCE(NEW.player_name, OLD.player_name),
        'fixture_id', COALESCE(NEW.fixture_id, OLD.fixture_id)
      ),
      jsonb_build_object(
        'synced_at', now(),
        'triggered_by', 'database_trigger'
      )
    );
    
  ELSIF TG_OP = 'DELETE' AND OLD.event_type IN ('goal', 'assist') THEN
    
    -- Call the cumulative stats calculation function for deletions
    PERFORM public.calculate_cumulative_player_stats();
    
    -- Log the automatic sync for deletion
    INSERT INTO operation_logs (
      operation_type,
      table_name,
      success,
      payload,
      result
    ) VALUES (
      'auto_sync_player_stats',
      'match_events',
      true,
      jsonb_build_object(
        'trigger_operation', TG_OP,
        'event_type', OLD.event_type,
        'player_name', OLD.player_name,
        'fixture_id', OLD.fixture_id
      ),
      jsonb_build_object(
        'synced_at', now(),
        'triggered_by', 'database_trigger'
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on match_events table
DROP TRIGGER IF EXISTS trigger_auto_sync_player_stats ON public.match_events;

CREATE TRIGGER trigger_auto_sync_player_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.match_events
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_sync_player_stats();

-- Create a function to get sync status information
CREATE OR REPLACE FUNCTION public.get_player_stats_sync_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  last_sync_time timestamp with time zone;
  total_events integer;
  total_players integer;
BEGIN
  -- Get the last auto sync time
  SELECT MAX(created_at) INTO last_sync_time
  FROM operation_logs 
  WHERE operation_type = 'auto_sync_player_stats'
  AND success = true;
  
  -- Get total match events for goals and assists
  SELECT COUNT(*) INTO total_events
  FROM match_events 
  WHERE event_type IN ('goal', 'assist');
  
  -- Get total players with stats
  SELECT COUNT(*) INTO total_players
  FROM members 
  WHERE goals > 0 OR assists > 0;
  
  RETURN jsonb_build_object(
    'last_auto_sync', last_sync_time,
    'total_goal_assist_events', total_events,
    'total_players_with_stats', total_players,
    'sync_enabled', true,
    'status_checked_at', now()
  );
END;
$$;