-- Fix the ambiguous fixture_id column reference in get_enhanced_match_summary function
CREATE OR REPLACE FUNCTION public.get_enhanced_match_summary(p_fixture_id integer)
RETURNS TABLE(fixture_id integer, home_team_id text, away_team_id text, home_score integer, away_score integer, goals jsonb, cards jsonb, player_times jsonb, summary_stats jsonb, timeline_events jsonb)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as fixture_id,
    f.home_team_id,
    f.away_team_id,
    COALESCE(f.home_score, 0) as home_score,
    COALESCE(f.away_score, 0) as away_score,
    
    -- Goals with comprehensive own goal handling
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', me.id,
          'playerId', COALESCE(
            (SELECT m.id FROM members m WHERE m.name = me.player_name AND m.team_id = me.team_id LIMIT 1),
            0
          ),
          'playerName', me.player_name,
          'team', COALESCE(
            (SELECT t.name FROM teams t WHERE t.__id__ = me.team_id LIMIT 1),
            me.team_id
          ),
          'teamId', me.team_id,
          'scoringTeamId', COALESCE(me.scoring_team_id, me.team_id),
          'affectedTeamId', COALESCE(me.affected_team_id, me.team_id),
          'type', me.event_type,
          'time', me.event_time,
          'timestamp', me.created_at,
          'assistPlayerName', null,
          'assistTeamId', null,
          'isOwnGoal', me.is_own_goal,
          'description', me.description
        ) ORDER BY me.event_time, me.created_at
      ) FROM match_events me WHERE me.fixture_id = p_fixture_id AND me.event_type IN ('goal', 'assist')),
      '[]'::jsonb
    ) as goals,
    
    -- Cards with proper team resolution
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', me.id,
          'playerId', COALESCE(
            (SELECT m.id FROM members m WHERE m.name = me.player_name AND m.team_id = me.team_id LIMIT 1),
            0
          ),
          'playerName', me.player_name,
          'team', COALESCE(
            (SELECT t.name FROM teams t WHERE t.__id__ = me.team_id LIMIT 1),
            me.team_id
          ),
          'teamId', me.team_id,
          'cardType', me.card_type,
          'type', me.card_type,
          'time', me.event_time,
          'timestamp', me.created_at
        ) ORDER BY me.event_time, me.created_at
      ) FROM match_events me WHERE me.fixture_id = p_fixture_id AND me.event_type IN ('yellow_card', 'red_card')),
      '[]'::jsonb
    ) as cards,
    
    -- Player times
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'playerId', ptt.player_id,
          'playerName', ptt.player_name,
          'team', COALESCE(
            (SELECT t.name FROM teams t WHERE t.id = ptt.team_id LIMIT 1),
            ptt.team_id::text
          ),
          'teamId', ptt.team_id::text,
          'totalMinutes', ptt.total_minutes,
          'periods', ptt.periods
        )
      ) FROM player_time_tracking ptt WHERE ptt.fixture_id = p_fixture_id),
      '[]'::jsonb
    ) as player_times,
    
    -- Enhanced summary statistics with proper own goal breakdown
    jsonb_build_object(
      'totalGoals', COALESCE((SELECT COUNT(*) FROM match_events me_stats WHERE me_stats.fixture_id = p_fixture_id AND me_stats.event_type = 'goal'), 0),
      'totalRegularGoals', COALESCE((SELECT COUNT(*) FROM match_events me_stats WHERE me_stats.fixture_id = p_fixture_id AND me_stats.event_type = 'goal' AND me_stats.is_own_goal = false), 0),
      'totalOwnGoals', COALESCE((SELECT COUNT(*) FROM match_events me_stats WHERE me_stats.fixture_id = p_fixture_id AND me_stats.event_type = 'goal' AND me_stats.is_own_goal = true), 0),
      'totalAssists', COALESCE((SELECT COUNT(*) FROM match_events me_stats WHERE me_stats.fixture_id = p_fixture_id AND me_stats.event_type = 'assist'), 0),
      'totalCards', COALESCE((SELECT COUNT(*) FROM match_events me_stats WHERE me_stats.fixture_id = p_fixture_id AND me_stats.event_type IN ('yellow_card', 'red_card')), 0),
      'homeTeamGoals', COALESCE((SELECT COUNT(*) FROM match_events me_stats WHERE me_stats.fixture_id = p_fixture_id AND me_stats.event_type = 'goal' AND COALESCE(me_stats.scoring_team_id, me_stats.team_id) = f.home_team_id), 0),
      'awayTeamGoals', COALESCE((SELECT COUNT(*) FROM match_events me_stats WHERE me_stats.fixture_id = p_fixture_id AND me_stats.event_type = 'goal' AND COALESCE(me_stats.scoring_team_id, me_stats.team_id) = f.away_team_id), 0),
      'homeTeamRegularGoals', COALESCE((SELECT COUNT(*) FROM match_events me_stats WHERE me_stats.fixture_id = p_fixture_id AND me_stats.event_type = 'goal' AND me_stats.team_id = f.home_team_id AND me_stats.is_own_goal = false), 0),
      'awayTeamRegularGoals', COALESCE((SELECT COUNT(*) FROM match_events me_stats WHERE me_stats.fixture_id = p_fixture_id AND me_stats.event_type = 'goal' AND me_stats.team_id = f.away_team_id AND me_stats.is_own_goal = false), 0),
      'homeTeamOwnGoals', COALESCE((SELECT COUNT(*) FROM match_events me_stats WHERE me_stats.fixture_id = p_fixture_id AND me_stats.event_type = 'goal' AND me_stats.team_id = f.home_team_id AND me_stats.is_own_goal = true), 0),
      'awayTeamOwnGoals', COALESCE((SELECT COUNT(*) FROM match_events me_stats WHERE me_stats.fixture_id = p_fixture_id AND me_stats.event_type = 'goal' AND me_stats.team_id = f.away_team_id AND me_stats.is_own_goal = true), 0),
      'homeTeamCards', COALESCE((SELECT COUNT(*) FROM match_events me_stats WHERE me_stats.fixture_id = p_fixture_id AND me_stats.event_type IN ('yellow_card', 'red_card') AND me_stats.team_id = f.home_team_id), 0),
      'awayTeamCards', COALESCE((SELECT COUNT(*) FROM match_events me_stats WHERE me_stats.fixture_id = p_fixture_id AND me_stats.event_type IN ('yellow_card', 'red_card') AND me_stats.team_id = f.away_team_id), 0),
      'playersTracked', COALESCE((SELECT COUNT(DISTINCT ptt_stats.player_id) FROM player_time_tracking ptt_stats WHERE ptt_stats.fixture_id = p_fixture_id), 0)
    ) as summary_stats,
    
    -- Timeline events with comprehensive card and goal support
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', me.id,
          'type', me.event_type,
          'time', me.event_time,
          'playerName', me.player_name,
          'teamId', me.team_id,
          'teamName', COALESCE(
            (SELECT t.name FROM teams t WHERE t.__id__ = me.team_id LIMIT 1),
            me.team_id
          ),
          'scoringTeamId', COALESCE(me.scoring_team_id, me.team_id),
          'cardType', me.card_type,
          'assistPlayerName', null,
          'assistTeamId', null,
          'description', me.description,
          'timestamp', me.created_at,
          'isOwnGoal', me.is_own_goal
        ) ORDER BY me.event_time, me.created_at
      ) FROM match_events me 
      WHERE me.fixture_id = p_fixture_id 
      AND me.event_type IN ('goal', 'assist', 'yellow_card', 'red_card')),
      '[]'::jsonb
    ) as timeline_events
    
  FROM fixtures f
  WHERE f.id = p_fixture_id;
END;
$function$;