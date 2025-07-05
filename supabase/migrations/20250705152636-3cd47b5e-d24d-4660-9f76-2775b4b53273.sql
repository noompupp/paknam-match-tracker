-- Fix team name resolution in weekly TOTW generation
-- Update the aggregate_weekly_player_performance function to properly resolve team names

CREATE OR REPLACE FUNCTION public.aggregate_weekly_player_performance(p_week_start date, p_week_end date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSONB;
  performance_record RECORD;
  weekly_totw_record RECORD;
  aggregated_count INTEGER := 0;
BEGIN
  -- Get or create weekly TOTW record
  INSERT INTO public.weekly_totw (
    week_start_date,
    week_end_date,
    season_year,
    created_by
  ) VALUES (
    p_week_start,
    p_week_end,
    EXTRACT(YEAR FROM p_week_start),
    auth.uid()
  )
  ON CONFLICT (week_start_date, season_year)
  DO UPDATE SET updated_at = now()
  RETURNING * INTO weekly_totw_record;

  -- Clear existing performance data for this week
  DELETE FROM public.weekly_player_performance WHERE weekly_totw_id = weekly_totw_record.id;

  -- Aggregate player performance for the week with proper team name resolution
  FOR performance_record IN
    SELECT 
      fpr.player_id,
      fpr.player_name,
      fpr.team_id,
      -- Properly resolve team name from teams table
      COALESCE(t.name, fpr.team_name, fpr.team_id) as resolved_team_name,
      fpr.player_position,
      COUNT(*) as matches_played,
      SUM(fpr.minutes_played) as total_minutes,
      -- Add goal and assist aggregation from match_events
      SUM(COALESCE((
        SELECT COUNT(*)::integer FROM match_events me 
        WHERE me.fixture_id = fpr.fixture_id 
        AND me.player_name = fpr.player_name 
        AND me.event_type = 'goal'
        AND me.is_own_goal = false
      ), 0)) as total_goals,
      SUM(COALESCE((
        SELECT COUNT(*)::integer FROM match_events me 
        WHERE me.fixture_id = fpr.fixture_id 
        AND me.player_name = fpr.player_name 
        AND me.event_type = 'assist'
      ), 0)) as total_assists,
      SUM(COALESCE((
        SELECT COUNT(*)::integer FROM match_events me 
        WHERE me.fixture_id = fpr.fixture_id 
        AND me.player_name = fpr.player_name 
        AND me.event_type IN ('yellow_card', 'red_card')
      ), 0)) as total_cards,
      AVG(fpr.fpl_rating) as avg_fpl_rating,
      AVG(fpr.participation_rating) as avg_participation_rating,
      AVG(fpr.final_rating) as weighted_final_rating,
      array_agg(fpr.fixture_id) as fixtures_played,
      jsonb_agg(
        jsonb_build_object(
          'fixture_id', fpr.fixture_id,
          'fpl_rating', fpr.fpl_rating,
          'participation_rating', fpr.participation_rating,
          'final_rating', fpr.final_rating,
          'minutes_played', fpr.minutes_played,
          'match_result', fpr.match_result
        )
      ) as performance_breakdown
    FROM public.fixture_player_ratings fpr
    JOIN public.fixtures f ON f.id = fpr.fixture_id
    LEFT JOIN public.teams t ON t.__id__ = fpr.team_id
    WHERE f.match_date BETWEEN p_week_start AND p_week_end
    AND fpr.final_rating IS NOT NULL
    GROUP BY fpr.player_id, fpr.player_name, fpr.team_id, t.name, fpr.team_name, fpr.player_position
    HAVING COUNT(*) > 0
  LOOP
    INSERT INTO public.weekly_player_performance (
      weekly_totw_id,
      player_id,
      player_name,
      team_id,
      team_name,
      position,
      total_minutes,
      matches_played,
      total_goals,
      total_assists,
      total_cards,
      average_fpl_rating,
      average_participation_rating,
      weighted_final_rating,
      fixtures_played_in,
      performance_breakdown
    ) VALUES (
      weekly_totw_record.id,
      performance_record.player_id,
      performance_record.player_name,
      performance_record.team_id,
      performance_record.resolved_team_name,
      performance_record.player_position,
      performance_record.total_minutes,
      performance_record.matches_played,
      performance_record.total_goals,
      performance_record.total_assists,
      performance_record.total_cards,
      performance_record.avg_fpl_rating,
      performance_record.avg_participation_rating,
      performance_record.weighted_final_rating,
      performance_record.fixtures_played,
      performance_record.performance_breakdown
    );
    
    aggregated_count := aggregated_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'weekly_totw_id', weekly_totw_record.id,
    'week_start', p_week_start,
    'week_end', p_week_end,
    'players_aggregated', aggregated_count,
    'created_at', now()
  );
END;
$function$;