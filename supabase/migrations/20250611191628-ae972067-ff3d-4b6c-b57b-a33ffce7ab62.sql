
-- Create match_referee_assignments table for real user-based assignments
CREATE TABLE public.match_referee_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fixture_id INTEGER NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_mode TEXT NOT NULL CHECK (workflow_mode IN ('two_referees', 'multi_referee')),
  assigned_role TEXT NOT NULL CHECK (assigned_role IN ('home_team', 'away_team', 'score_goals', 'cards_discipline', 'time_tracking', 'coordination')),
  team_assignment TEXT, -- For two_referees mode: 'home' or 'away'
  responsibilities TEXT[] DEFAULT '{}', -- Array of responsibilities for this assignment
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'active', 'completed')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique assignments per fixture and role
  UNIQUE(fixture_id, assigned_role)
);

-- Create a partial unique index for two_referees mode team assignments
CREATE UNIQUE INDEX idx_unique_team_assignment 
ON match_referee_assignments (fixture_id, team_assignment) 
WHERE workflow_mode = 'two_referees' AND team_assignment IS NOT NULL;

-- Add workflow configuration table to track current mode per fixture
CREATE TABLE public.match_workflow_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fixture_id INTEGER NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  workflow_mode TEXT NOT NULL CHECK (workflow_mode IN ('two_referees', 'multi_referee')),
  configured_by UUID NOT NULL REFERENCES auth.users(id),
  config_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(fixture_id)
);

-- Enable RLS on both tables
ALTER TABLE public.match_referee_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_workflow_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for match_referee_assignments
CREATE POLICY "Referees can view assignments for their fixtures" 
  ON public.match_referee_assignments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.auth_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'referee')
    )
  );

CREATE POLICY "Referees can create assignments" 
  ON public.match_referee_assignments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auth_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'referee')
    )
  );

CREATE POLICY "Referees can update their own assignments" 
  ON public.match_referee_assignments 
  FOR UPDATE 
  USING (
    referee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.auth_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS policies for match_workflow_config
CREATE POLICY "Referees can view workflow config" 
  ON public.match_workflow_config 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.auth_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'referee')
    )
  );

CREATE POLICY "Referees can create workflow config" 
  ON public.match_workflow_config 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auth_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'referee')
    )
  );

CREATE POLICY "Referees can update workflow config" 
  ON public.match_workflow_config 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.auth_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'referee')
    )
  );

-- Function to get current user assignments for a fixture
CREATE OR REPLACE FUNCTION public.get_user_fixture_assignments(p_fixture_id integer)
RETURNS TABLE(
  assignment_id uuid,
  assigned_role text,
  team_assignment text,
  responsibilities text[],
  status text,
  workflow_mode text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    mra.id as assignment_id,
    mra.assigned_role,
    mra.team_assignment,
    mra.responsibilities,
    mra.status,
    mra.workflow_mode
  FROM match_referee_assignments mra
  WHERE mra.fixture_id = p_fixture_id 
    AND mra.referee_id = auth.uid();
END;
$function$;

-- Function to get all assignments for a fixture (for coordination view)
CREATE OR REPLACE FUNCTION public.get_fixture_all_assignments(p_fixture_id integer)
RETURNS TABLE(
  assignment_id uuid,
  referee_id uuid,
  assigned_role text,
  team_assignment text,
  responsibilities text[],
  status text,
  workflow_mode text,
  assigned_at timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    mra.id as assignment_id,
    mra.referee_id,
    mra.assigned_role,
    mra.team_assignment,
    mra.responsibilities,
    mra.status,
    mra.workflow_mode,
    mra.assigned_at
  FROM match_referee_assignments mra
  WHERE mra.fixture_id = p_fixture_id
  ORDER BY mra.assigned_at;
END;
$function$;

-- Function to assign referee to role
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

  -- Insert or update assignment
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
    team_assignment = p_team_assignment,
    responsibilities = p_responsibilities,
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

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_match_referee_assignments_updated_at
  BEFORE UPDATE ON match_referee_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_workflow_config_updated_at
  BEFORE UPDATE ON match_workflow_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
