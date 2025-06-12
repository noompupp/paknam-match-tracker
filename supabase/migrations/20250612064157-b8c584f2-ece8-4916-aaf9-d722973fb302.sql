
-- Create function to initialize referee assignments based on workflow mode
CREATE OR REPLACE FUNCTION public.initialize_referee_assignments(
  p_fixture_id integer,
  p_workflow_mode text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
  assignment_count integer := 0;
BEGIN
  -- Check if user is authenticated referee
  IF NOT EXISTS(
    SELECT 1 FROM public.auth_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'referee')
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not authorized'
    );
  END IF;

  -- Delete any existing assignments for this fixture to start fresh
  DELETE FROM match_referee_assignments WHERE fixture_id = p_fixture_id;

  -- Create assignments based on workflow mode
  IF p_workflow_mode = 'two_referees' THEN
    -- Two Referees Mode: Create home and away team assignments
    INSERT INTO match_referee_assignments (
      fixture_id,
      referee_id,
      workflow_mode,
      assigned_role,
      team_assignment,
      responsibilities,
      status,
      assigned_by
    ) VALUES 
    (
      p_fixture_id,
      '00000000-0000-0000-0000-000000000000'::uuid, -- Placeholder UUID for unassigned
      p_workflow_mode,
      'home_team',
      'home',
      ARRAY['score_goals', 'cards_discipline', 'time_tracking'],
      'assigned',
      auth.uid()
    ),
    (
      p_fixture_id,
      '00000000-0000-0000-0000-000000000000'::uuid, -- Placeholder UUID for unassigned
      p_workflow_mode,
      'away_team', 
      'away',
      ARRAY['score_goals', 'cards_discipline', 'time_tracking'],
      'assigned',
      auth.uid()
    );
    
    assignment_count := 2;
    
  ELSIF p_workflow_mode = 'multi_referee' THEN
    -- Multi-Referee Mode: Create specialized role assignments
    INSERT INTO match_referee_assignments (
      fixture_id,
      referee_id,
      workflow_mode,
      assigned_role,
      team_assignment,
      responsibilities,
      status,
      assigned_by
    ) VALUES 
    (
      p_fixture_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      p_workflow_mode,
      'score_goals',
      NULL,
      ARRAY['score_goals'],
      'assigned',
      auth.uid()
    ),
    (
      p_fixture_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      p_workflow_mode,
      'cards_discipline',
      NULL,
      ARRAY['cards_discipline'],
      'assigned',
      auth.uid()
    ),
    (
      p_fixture_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      p_workflow_mode,
      'time_tracking',
      NULL,
      ARRAY['time_tracking'],
      'assigned',
      auth.uid()
    ),
    (
      p_fixture_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      p_workflow_mode,
      'coordination',
      NULL,
      ARRAY['coordination'],
      'assigned',
      auth.uid()
    );
    
    assignment_count := 4;
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid workflow mode'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'fixture_id', p_fixture_id,
    'workflow_mode', p_workflow_mode,
    'assignments_created', assignment_count,
    'created_at', now()
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;

-- Update the assign_referee_to_role function to handle placeholder UUIDs
CREATE OR REPLACE FUNCTION public.assign_referee_to_role(
  p_fixture_id integer,
  p_assigned_role text,
  p_workflow_mode text,
  p_team_assignment text DEFAULT NULL,
  p_responsibilities text[] DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
  assignment_id uuid;
BEGIN
  -- Check if user is authenticated referee
  IF NOT EXISTS(
    SELECT 1 FROM public.auth_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'referee')
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not authorized'
    );
  END IF;

  -- Insert or update assignment (handle both new assignments and claiming existing ones)
  INSERT INTO match_referee_assignments (
    fixture_id,
    referee_id,
    workflow_mode,
    assigned_role,
    team_assignment,
    responsibilities,
    assigned_by
  ) VALUES (
    p_fixture_id,
    auth.uid(),
    p_workflow_mode,
    p_assigned_role,
    p_team_assignment,
    p_responsibilities,
    auth.uid()
  )
  ON CONFLICT (fixture_id, assigned_role) 
  DO UPDATE SET
    referee_id = auth.uid(),
    team_assignment = COALESCE(p_team_assignment, EXCLUDED.team_assignment),
    responsibilities = CASE 
      WHEN array_length(p_responsibilities, 1) > 0 THEN p_responsibilities 
      ELSE EXCLUDED.responsibilities 
    END,
    assigned_by = auth.uid(),
    updated_at = now()
  RETURNING id INTO assignment_id;

  RETURN jsonb_build_object(
    'success', true,
    'assignment_id', assignment_id,
    'assigned_role', p_assigned_role,
    'team_assignment', p_team_assignment
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;
