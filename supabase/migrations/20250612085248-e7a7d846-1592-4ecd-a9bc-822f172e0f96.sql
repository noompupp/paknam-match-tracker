
-- Comprehensive Own Goal Fix Plan - Database Schema Cleanup and Improvements

-- 1. Standardize the is_own_goal column and remove legacy own_goal column
ALTER TABLE match_events 
DROP COLUMN IF EXISTS own_goal;

-- Ensure is_own_goal column exists with proper settings
ALTER TABLE match_events 
ALTER COLUMN is_own_goal SET DEFAULT false;

-- Update any null values to false
UPDATE match_events 
SET is_own_goal = false 
WHERE is_own_goal IS NULL;

-- Make is_own_goal non-nullable
ALTER TABLE match_events 
ALTER COLUMN is_own_goal SET NOT NULL;

-- 2. Add missing columns for better own goal tracking
ALTER TABLE match_events 
ADD COLUMN IF NOT EXISTS scoring_team_id text,
ADD COLUMN IF NOT EXISTS affected_team_id text;

-- 3. Create an improved own goal consistency trigger
CREATE OR REPLACE FUNCTION public.validate_own_goal_consistency()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- For own goals, determine the correct scoring and affected teams
  IF NEW.event_type = 'goal' AND NEW.is_own_goal = TRUE THEN
    -- Get fixture team information
    SELECT 
      CASE 
        WHEN f.home_team_id = NEW.team_id THEN f.away_team_id
        WHEN f.away_team_id = NEW.team_id THEN f.home_team_id
        ELSE NEW.team_id -- fallback to same team if no match
      END,
      NEW.team_id
    INTO NEW.scoring_team_id, NEW.affected_team_id
    FROM fixtures f 
    WHERE f.id = NEW.fixture_id;
    
    -- Ensure description reflects own goal
    IF NEW.description IS NULL OR NEW.description = '' THEN
      NEW.description = 'Own goal by ' || NEW.player_name;
    END IF;
  ELSE
    -- For regular goals, scoring team is the same as player's team
    NEW.scoring_team_id = NEW.team_id;
    NEW.affected_team_id = NEW.team_id;
    NEW.is_own_goal = FALSE;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS validate_own_goal_consistency_trigger ON match_events;
CREATE TRIGGER validate_own_goal_consistency_trigger
  BEFORE INSERT OR UPDATE ON match_events
  FOR EACH ROW
  EXECUTE FUNCTION validate_own_goal_consistency();

-- 4. Update the enhanced match summary function to handle own goals properly
CREATE OR REPLACE FUNCTION public.get_enhanced_match_summary(p_fixture_id integer)
RETURNS TABLE(
  fixture_id integer, 
  home_team_id text, 
  away_team_id text, 
  home_score integer, 
  away_score integer, 
  goals jsonb, 
  cards jsonb, 
  player_times jsonb, 
  summary_stats jsonb, 
  timeline_events jsonb
)
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
    
    -- Cards (unchanged)
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
    
    -- Player times (unchanged)
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
      'totalGoals', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'goal'), 0),
      'totalRegularGoals', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'goal' AND is_own_goal = false), 0),
      'totalOwnGoals', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'goal' AND is_own_goal = true), 0),
      'totalAssists', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'assist'), 0),
      'totalCards', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type IN ('yellow_card', 'red_card')), 0),
      'homeTeamGoals', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'goal' AND COALESCE(scoring_team_id, team_id) = f.home_team_id), 0),
      'awayTeamGoals', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'goal' AND COALESCE(scoring_team_id, team_id) = f.away_team_id), 0),
      'homeTeamRegularGoals', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'goal' AND team_id = f.home_team_id AND is_own_goal = false), 0),
      'awayTeamRegularGoals', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'goal' AND team_id = f.away_team_id AND is_own_goal = false), 0),
      'homeTeamOwnGoals', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'goal' AND team_id = f.home_team_id AND is_own_goal = true), 0),
      'awayTeamOwnGoals', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'goal' AND team_id = f.away_team_id AND is_own_goal = true), 0),
      'homeTeamCards', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type IN ('yellow_card', 'red_card') AND team_id = f.home_team_id), 0),
      'awayTeamCards', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type IN ('yellow_card', 'red_card') AND team_id = f.away_team_id), 0),
      'playersTracked', COALESCE((SELECT COUNT(DISTINCT player_id) FROM player_time_tracking WHERE fixture_id = p_fixture_id), 0)
    ) as summary_stats,
    
    -- Timeline events with comprehensive own goal support
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

-- 5. Update the match event validation function
CREATE OR REPLACE FUNCTION public.validate_match_event_data()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Validate player name
  IF NOT public.validate_player_name(NEW.player_name) THEN
    RAISE EXCEPTION 'Invalid player name provided';
  END IF;
  
  -- Validate event time is reasonable (0-200 minutes)
  IF NEW.event_time < 0 OR NEW.event_time > 12000 THEN -- 200 minutes in seconds
    RAISE EXCEPTION 'Invalid event time provided';
  END IF;
  
  -- Validate event type
  IF NEW.event_type NOT IN ('goal', 'assist', 'yellow_card', 'red_card', 'substitution') THEN
    RAISE EXCEPTION 'Invalid event type provided';
  END IF;
  
  -- Ensure is_own_goal is properly set for goals
  IF NEW.event_type = 'goal' AND NEW.is_own_goal IS NULL THEN
    NEW.is_own_goal = FALSE;
  END IF;
  
  -- Own goals can only be set for goal events
  IF NEW.event_type != 'goal' AND NEW.is_own_goal = TRUE THEN
    RAISE EXCEPTION 'is_own_goal flag can only be true for goal events';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create or update the trigger for match event validation
DROP TRIGGER IF EXISTS validate_match_event_data_trigger ON match_events;
CREATE TRIGGER validate_match_event_data_trigger
  BEFORE INSERT OR UPDATE ON match_events
  FOR EACH ROW
  EXECUTE FUNCTION validate_match_event_data();

-- 6. Clean up any existing malformed own goal data
UPDATE match_events 
SET is_own_goal = false 
WHERE event_type != 'goal' AND is_own_goal = true;

-- Set scoring_team_id and affected_team_id for existing own goals
UPDATE match_events 
SET 
  scoring_team_id = CASE 
    WHEN f.home_team_id = match_events.team_id THEN f.away_team_id
    WHEN f.away_team_id = match_events.team_id THEN f.home_team_id
    ELSE match_events.team_id
  END,
  affected_team_id = match_events.team_id
FROM fixtures f
WHERE match_events.fixture_id = f.id 
  AND match_events.event_type = 'goal' 
  AND match_events.is_own_goal = true
  AND match_events.scoring_team_id IS NULL;

-- Set scoring_team_id for regular goals where missing
UPDATE match_events 
SET scoring_team_id = team_id,
    affected_team_id = team_id
WHERE event_type = 'goal' 
  AND (is_own_goal = false OR is_own_goal IS NULL)
  AND scoring_team_id IS NULL;
