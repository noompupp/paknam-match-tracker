-- Fix function conflict: Drop the duplicate manual_sync_player_stats function with parameters
-- Keep the simpler version without parameters to resolve "Could not choose the best candidate function" error

DROP FUNCTION IF EXISTS public.manual_sync_player_stats(p_triggered_by uuid);

-- Ensure we have the correct function without parameters that calls calculate_cumulative_player_stats
CREATE OR REPLACE FUNCTION public.manual_sync_player_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  sync_result jsonb;
BEGIN
  -- Call the existing cumulative stats calculation function
  SELECT public.calculate_cumulative_player_stats() INTO sync_result;
  
  -- Log the manual sync operation
  INSERT INTO operation_logs (
    operation_type,
    table_name,
    success,
    payload,
    result
  ) VALUES (
    'manual_sync_player_stats',
    'members',
    COALESCE((sync_result->>'success')::boolean, true),
    jsonb_build_object(
      'triggered_by', 'manual_request',
      'sync_type', 'full_recalculation'
    ),
    jsonb_build_object(
      'synced_at', now(),
      'sync_result', sync_result,
      'players_updated', COALESCE((sync_result->>'players_updated')::integer, 0)
    )
  );
  
  RETURN jsonb_build_object(
    'success', COALESCE((sync_result->>'success')::boolean, true),
    'players_updated', COALESCE((sync_result->>'players_updated')::integer, 0),
    'synced_at', now(),
    'triggered_by', 'manual_request'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'synced_at', now()
  );
END;
$function$;