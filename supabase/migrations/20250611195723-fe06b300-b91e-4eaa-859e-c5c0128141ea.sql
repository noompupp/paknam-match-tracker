
-- First, let's ensure the assignment status workflow is properly set up
-- Add any missing constraints and update the assignment table structure

-- Update match_referee_assignments to ensure proper workflow
ALTER TABLE match_referee_assignments 
ADD COLUMN IF NOT EXISTS completion_timestamp timestamp with time zone,
ADD COLUMN IF NOT EXISTS notes text;

-- Create index for better performance on assignment queries
CREATE INDEX IF NOT EXISTS idx_match_referee_assignments_fixture_role 
ON match_referee_assignments(fixture_id, assigned_role);

-- Create index for user assignment lookups
CREATE INDEX IF NOT EXISTS idx_match_referee_assignments_user_fixture 
ON match_referee_assignments(referee_id, fixture_id);

-- Update the assignment status function to handle completion
CREATE OR REPLACE FUNCTION public.complete_referee_assignment(
  p_assignment_id uuid,
  p_completion_notes text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check if user owns this assignment
  IF NOT EXISTS(
    SELECT 1 FROM match_referee_assignments 
    WHERE id = p_assignment_id 
    AND referee_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Assignment not found or not owned by user'
    );
  END IF;

  -- Update assignment to completed
  UPDATE match_referee_assignments SET
    status = 'completed',
    completion_timestamp = now(),
    notes = p_completion_notes,
    updated_at = now()
  WHERE id = p_assignment_id;

  RETURN jsonb_build_object(
    'success', true,
    'assignment_id', p_assignment_id,
    'completed_at', now()
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Create function to get coordination status with proper assignment data
CREATE OR REPLACE FUNCTION public.get_coordination_with_assignments(p_fixture_id integer)
RETURNS TABLE(
  fixture_id integer,
  workflow_mode text,
  assignments jsonb,
  user_assignments jsonb,
  completion_status jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_fixture_id as fixture_id,
    COALESCE(
      (SELECT mwc.workflow_mode FROM match_workflow_config mwc WHERE mwc.fixture_id = p_fixture_id),
      'two_referees'
    ) as workflow_mode,
    
    -- All assignments for this fixture
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'assignment_id', mra.id,
          'referee_id', mra.referee_id,
          'assigned_role', mra.assigned_role,
          'team_assignment', mra.team_assignment,
          'responsibilities', mra.responsibilities,
          'status', mra.status,
          'completion_timestamp', mra.completion_timestamp,
          'notes', mra.notes,
          'assigned_at', mra.assigned_at
        )
      ) FROM match_referee_assignments mra WHERE mra.fixture_id = p_fixture_id),
      '[]'::jsonb
    ) as assignments,
    
    -- Current user's assignments
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'assignment_id', mra.id,
          'assigned_role', mra.assigned_role,
          'team_assignment', mra.team_assignment,
          'responsibilities', mra.responsibilities,
          'status', mra.status,
          'completion_timestamp', mra.completion_timestamp,
          'notes', mra.notes
        )
      ) FROM match_referee_assignments mra 
      WHERE mra.fixture_id = p_fixture_id AND mra.referee_id = auth.uid()),
      '[]'::jsonb
    ) as user_assignments,
    
    -- Completion status summary
    jsonb_build_object(
      'total_assignments', (
        SELECT COUNT(*) FROM match_referee_assignments 
        WHERE fixture_id = p_fixture_id
      ),
      'completed_assignments', (
        SELECT COUNT(*) FROM match_referee_assignments 
        WHERE fixture_id = p_fixture_id AND status = 'completed'
      ),
      'in_progress_assignments', (
        SELECT COUNT(*) FROM match_referee_assignments 
        WHERE fixture_id = p_fixture_id AND status = 'active'
      ),
      'pending_assignments', (
        SELECT COUNT(*) FROM match_referee_assignments 
        WHERE fixture_id = p_fixture_id AND status = 'assigned'
      )
    ) as completion_status;
END;
$$;
