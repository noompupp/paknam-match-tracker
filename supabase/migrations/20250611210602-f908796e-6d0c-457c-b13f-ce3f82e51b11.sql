
-- Add enhanced own goal support and data integrity improvements
ALTER TABLE match_events 
ADD COLUMN IF NOT EXISTS is_own_goal BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS affected_team_id TEXT,
ADD COLUMN IF NOT EXISTS scoring_team_id TEXT;

-- Update existing own_goal column data to is_own_goal for consistency
UPDATE match_events 
SET is_own_goal = COALESCE(own_goal, FALSE)
WHERE event_type = 'goal';

-- Add validation trigger for own goal consistency
CREATE OR REPLACE FUNCTION validate_own_goal_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- For own goals, the affected team should be different from the player's team
  IF NEW.event_type = 'goal' AND NEW.is_own_goal = TRUE THEN
    -- Set scoring_team_id to the opposing team when it's an own goal
    IF NEW.team_id IS NOT NULL THEN
      -- We'll need to determine the opposing team from the fixture
      SELECT CASE 
        WHEN f.home_team_id = NEW.team_id THEN f.away_team_id
        WHEN f.away_team_id = NEW.team_id THEN f.home_team_id
        ELSE NEW.team_id
      END INTO NEW.scoring_team_id
      FROM fixtures f 
      WHERE f.id = NEW.fixture_id;
      
      NEW.affected_team_id = NEW.team_id;
    END IF;
    
    -- Update description for own goals
    NEW.description = COALESCE(NEW.description, 'Own Goal by ' || NEW.player_name);
  ELSE
    -- For regular goals, scoring team is the same as player's team
    NEW.scoring_team_id = NEW.team_id;
    NEW.affected_team_id = NEW.team_id;
    NEW.is_own_goal = FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for own goal validation
DROP TRIGGER IF EXISTS validate_own_goal_trigger ON match_events;
CREATE TRIGGER validate_own_goal_trigger
  BEFORE INSERT OR UPDATE ON match_events
  FOR EACH ROW
  EXECUTE FUNCTION validate_own_goal_consistency();

-- Add enhanced player time tracking integration
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS total_minutes_this_season INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_time_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to sync player time data
CREATE OR REPLACE FUNCTION sync_player_time_to_members()
RETURNS TRIGGER AS $$
BEGIN
  -- Update member's total minutes when player_time_tracking is updated
  UPDATE members 
  SET 
    total_minutes_played = COALESCE((
      SELECT SUM(total_minutes) 
      FROM player_time_tracking 
      WHERE player_id = NEW.player_id
    ), 0),
    total_minutes_this_season = COALESCE((
      SELECT SUM(total_minutes) 
      FROM player_time_tracking ptt
      JOIN fixtures f ON f.id = ptt.fixture_id
      WHERE ptt.player_id = NEW.player_id 
      AND f.match_date >= DATE_TRUNC('year', CURRENT_DATE)
    ), 0),
    last_time_sync = NOW()
  WHERE id = NEW.player_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for player time sync
DROP TRIGGER IF EXISTS sync_player_time_trigger ON player_time_tracking;
CREATE TRIGGER sync_player_time_trigger
  AFTER INSERT OR UPDATE OR DELETE ON player_time_tracking
  FOR EACH ROW
  EXECUTE FUNCTION sync_player_time_to_members();

-- Add duplicate prevention for league table operations
CREATE TABLE IF NOT EXISTS league_table_operations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fixture_id INTEGER NOT NULL,
  operation_type TEXT NOT NULL,
  home_team_id TEXT NOT NULL,
  away_team_id TEXT NOT NULL,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  operation_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (fixture_id) REFERENCES fixtures(id)
);

-- Create function to generate operation hash
CREATE OR REPLACE FUNCTION generate_league_operation_hash(
  p_fixture_id INTEGER,
  p_operation_type TEXT,
  p_home_score INTEGER,
  p_away_score INTEGER
) RETURNS TEXT AS $$
BEGIN
  RETURN md5(p_fixture_id::text || p_operation_type || p_home_score::text || p_away_score::text);
END;
$$ LANGUAGE plpgsql;

-- Enhanced match summary function with own goal support
CREATE OR REPLACE FUNCTION get_enhanced_match_summary_v2(p_fixture_id INTEGER)
RETURNS TABLE(
  fixture_id INTEGER,
  home_team_id TEXT,
  away_team_id TEXT,
  home_score INTEGER,
  away_score INTEGER,
  goals JSONB,
  cards JSONB,
  player_times JSONB,
  summary_stats JSONB,
  timeline_events JSONB,
  own_goals_summary JSONB
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as fixture_id,
    f.home_team_id,
    f.away_team_id,
    COALESCE(f.home_score, 0) as home_score,
    COALESCE(f.away_score, 0) as away_score,
    
    -- Enhanced goals with proper own goal handling
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
          'scoringTeamId', me.scoring_team_id,
          'affectedTeamId', me.affected_team_id,
          'type', me.event_type,
          'time', me.event_time,
          'timestamp', me.created_at,
          'isOwnGoal', COALESCE(me.is_own_goal, false),
          'description', me.description
        ) ORDER BY me.event_time, me.created_at
      ) FROM match_events me WHERE me.fixture_id = p_fixture_id AND me.event_type = 'goal'),
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
    
    -- Enhanced player times with team integration
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'playerId', ptt.player_id,
          'playerName', ptt.player_name,
          'team', COALESCE(
            (SELECT t.name FROM teams t WHERE t.__id__ = ptt.team_id::text LIMIT 1),
            ptt.team_id::text
          ),
          'teamId', ptt.team_id::text,
          'totalMinutes', ptt.total_minutes,
          'periods', ptt.periods,
          'seasonTotal', COALESCE(
            (SELECT m.total_minutes_this_season FROM members m WHERE m.id = ptt.player_id),
            0
          )
        )
      ) FROM player_time_tracking ptt WHERE ptt.fixture_id = p_fixture_id),
      '[]'::jsonb
    ) as player_times,
    
    -- Enhanced summary with own goal breakdown
    jsonb_build_object(
      'totalGoals', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'goal'), 0),
      'regularGoals', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'goal' AND COALESCE(is_own_goal, false) = false), 0),
      'ownGoals', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'goal' AND is_own_goal = true), 0),
      'totalAssists', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'assist'), 0),
      'totalCards', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type IN ('yellow_card', 'red_card')), 0),
      'homeTeamGoals', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'goal' AND scoring_team_id = f.home_team_id), 0),
      'awayTeamGoals', COALESCE((SELECT COUNT(*) FROM match_events WHERE fixture_id = p_fixture_id AND event_type = 'goal' AND scoring_team_id = f.away_team_id), 0),
      'playersTracked', COALESCE((SELECT COUNT(DISTINCT player_id) FROM player_time_tracking WHERE fixture_id = p_fixture_id), 0)
    ) as summary_stats,
    
    -- Enhanced timeline with own goal details
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
          'scoringTeamId', me.scoring_team_id,
          'isOwnGoal', COALESCE(me.is_own_goal, false),
          'cardType', me.card_type,
          'description', me.description,
          'timestamp', me.created_at
        ) ORDER BY me.event_time, me.created_at
      ) FROM match_events me 
      WHERE me.fixture_id = p_fixture_id 
      AND me.event_type IN ('goal', 'assist', 'yellow_card', 'red_card')),
      '[]'::jsonb
    ) as timeline_events,
    
    -- Own goals summary for detailed analysis
    jsonb_build_object(
      'homeTeamOwnGoals', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'playerName', me.player_name,
            'time', me.event_time,
            'affectedTeam', me.team_id,
            'beneficiaryTeam', me.scoring_team_id
          )
        )
        FROM match_events me 
        WHERE me.fixture_id = p_fixture_id 
        AND me.event_type = 'goal' 
        AND me.is_own_goal = true 
        AND me.team_id = f.home_team_id
      ), '[]'::jsonb),
      'awayTeamOwnGoals', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'playerName', me.player_name,
            'time', me.event_time,
            'affectedTeam', me.team_id,
            'beneficiaryTeam', me.scoring_team_id
          )
        )
        FROM match_events me 
        WHERE me.fixture_id = p_fixture_id 
        AND me.event_type = 'goal' 
        AND me.is_own_goal = true 
        AND me.team_id = f.away_team_id
      ), '[]'::jsonb)
    ) as own_goals_summary
    
  FROM fixtures f
  WHERE f.id = p_fixture_id;
END;
$$;

-- Create index for performance optimization
CREATE INDEX IF NOT EXISTS idx_match_events_own_goal ON match_events(fixture_id, event_type, is_own_goal);
CREATE INDEX IF NOT EXISTS idx_match_events_scoring_team ON match_events(fixture_id, scoring_team_id);
CREATE INDEX IF NOT EXISTS idx_player_time_tracking_player ON player_time_tracking(player_id, fixture_id);
CREATE INDEX IF NOT EXISTS idx_league_operations_hash ON league_table_operations(operation_hash);
