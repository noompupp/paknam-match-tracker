-- Fix foreign key constraints for match_events table to properly reference teams table
-- Drop existing foreign key constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_match_events_team'
    ) THEN
        ALTER TABLE match_events DROP CONSTRAINT fk_match_events_team;
    END IF;
END $$;

-- Add proper foreign key constraint using teams.__id__ (text-based)
ALTER TABLE match_events 
ADD CONSTRAINT fk_match_events_team 
FOREIGN KEY (team_id) REFERENCES teams(__id__);

-- Also ensure scoring_team_id and affected_team_id reference teams properly
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_match_events_scoring_team'
    ) THEN
        ALTER TABLE match_events DROP CONSTRAINT fk_match_events_scoring_team;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_match_events_affected_team'
    ) THEN
        ALTER TABLE match_events DROP CONSTRAINT fk_match_events_affected_team;
    END IF;
END $$;

ALTER TABLE match_events 
ADD CONSTRAINT fk_match_events_scoring_team 
FOREIGN KEY (scoring_team_id) REFERENCES teams(__id__);

ALTER TABLE match_events 
ADD CONSTRAINT fk_match_events_affected_team 
FOREIGN KEY (affected_team_id) REFERENCES teams(__id__);

-- Create a function to validate team ID consistency before inserting/updating match events
CREATE OR REPLACE FUNCTION validate_match_event_team_ids()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure team_id exists in teams table
  IF NOT EXISTS (SELECT 1 FROM teams WHERE __id__ = NEW.team_id) THEN
    RAISE EXCEPTION 'Invalid team_id: %. Team must exist in teams table with matching __id__', NEW.team_id;
  END IF;
  
  -- Ensure scoring_team_id exists if provided
  IF NEW.scoring_team_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM teams WHERE __id__ = NEW.scoring_team_id) THEN
    RAISE EXCEPTION 'Invalid scoring_team_id: %. Team must exist in teams table with matching __id__', NEW.scoring_team_id;
  END IF;
  
  -- Ensure affected_team_id exists if provided
  IF NEW.affected_team_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM teams WHERE __id__ = NEW.affected_team_id) THEN
    RAISE EXCEPTION 'Invalid affected_team_id: %. Team must exist in teams table with matching __id__', NEW.affected_team_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate team IDs on insert/update
DROP TRIGGER IF EXISTS validate_match_event_team_ids_trigger ON match_events;
CREATE TRIGGER validate_match_event_team_ids_trigger
  BEFORE INSERT OR UPDATE ON match_events
  FOR EACH ROW
  EXECUTE FUNCTION validate_match_event_team_ids();

-- Add logging function for better debugging of team ID mapping issues
CREATE OR REPLACE FUNCTION log_match_event_team_mapping(
  p_event_type TEXT,
  p_fixture_team_ids JSONB,
  p_resolved_team_ids JSONB
) RETURNS VOID AS $$
BEGIN
  INSERT INTO operation_logs (
    operation_type,
    table_name,
    success,
    payload,
    result
  ) VALUES (
    'team_id_mapping',
    'match_events',
    true,
    jsonb_build_object(
      'event_type', p_event_type,
      'fixture_team_ids', p_fixture_team_ids
    ),
    jsonb_build_object(
      'resolved_team_ids', p_resolved_team_ids,
      'mapped_at', now()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;