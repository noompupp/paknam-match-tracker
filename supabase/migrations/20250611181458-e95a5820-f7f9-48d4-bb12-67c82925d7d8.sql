
-- Create match_coordination table for multi-referee workflow
CREATE TABLE public.match_coordination (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fixture_id INTEGER NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  coordinator_referee_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'ready_for_review', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completion_summary JSONB DEFAULT '{}'::jsonb,
  final_review_data JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(fixture_id)
);

-- Create referee_assignments table for task assignments
CREATE TABLE public.referee_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_coordination_id UUID NOT NULL REFERENCES match_coordination(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES auth.users(id),
  assigned_role TEXT NOT NULL CHECK (assigned_role IN ('score_goals', 'cards_discipline', 'time_tracking', 'coordination')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  data JSONB DEFAULT '{}'::jsonb,
  completion_timestamp TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(match_coordination_id, referee_id),
  UNIQUE(match_coordination_id, assigned_role)
);

-- Create coordination_events table for audit trail
CREATE TABLE public.coordination_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_coordination_id UUID NOT NULL REFERENCES match_coordination(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('assignment_created', 'task_started', 'task_completed', 'review_initiated', 'match_finalized')),
  referee_id UUID REFERENCES auth.users(id),
  event_data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all coordination tables
ALTER TABLE public.match_coordination ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referee_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordination_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for match_coordination
CREATE POLICY "Referees can view match coordination" 
  ON public.match_coordination 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.auth_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'referee')
    )
  );

CREATE POLICY "Referees can create match coordination" 
  ON public.match_coordination 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auth_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'referee')
    )
  );

CREATE POLICY "Referees can update match coordination" 
  ON public.match_coordination 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.auth_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'referee')
    )
  );

-- RLS policies for referee_assignments
CREATE POLICY "Referees can view assignments" 
  ON public.referee_assignments 
  FOR SELECT 
  USING (
    referee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.auth_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'referee')
    )
  );

CREATE POLICY "Referees can create assignments" 
  ON public.referee_assignments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auth_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'referee')
    )
  );

CREATE POLICY "Referees can update their assignments" 
  ON public.referee_assignments 
  FOR UPDATE 
  USING (
    referee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.auth_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS policies for coordination_events
CREATE POLICY "Referees can view coordination events" 
  ON public.coordination_events 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.auth_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'referee')
    )
  );

CREATE POLICY "Referees can create coordination events" 
  ON public.coordination_events 
  FOR INSERT 
  WITH CHECK (
    referee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.auth_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'referee')
    )
  );

-- Create function to get match coordination status
CREATE OR REPLACE FUNCTION public.get_match_coordination_status(p_fixture_id integer)
RETURNS TABLE(
  coordination_id uuid,
  fixture_id integer,
  status text,
  assignments jsonb,
  completion_summary jsonb,
  ready_for_review boolean
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    mc.id as coordination_id,
    mc.fixture_id,
    mc.status,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', ra.id,
          'referee_id', ra.referee_id,
          'assigned_role', ra.assigned_role,
          'status', ra.status,
          'completion_timestamp', ra.completion_timestamp,
          'notes', ra.notes
        )
      ) FROM referee_assignments ra WHERE ra.match_coordination_id = mc.id),
      '[]'::jsonb
    ) as assignments,
    mc.completion_summary,
    (
      SELECT COUNT(*) = 4 AND 
             COUNT(CASE WHEN ra.status = 'completed' THEN 1 END) = 4
      FROM referee_assignments ra 
      WHERE ra.match_coordination_id = mc.id
    ) as ready_for_review
  FROM match_coordination mc
  WHERE mc.fixture_id = p_fixture_id;
END;
$function$;

-- Create function to finalize match coordination
CREATE OR REPLACE FUNCTION public.finalize_match_coordination(
  p_coordination_id uuid,
  p_final_review_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
  ready_for_review boolean;
BEGIN
  -- Check if all tasks are completed
  SELECT (
    COUNT(*) = 4 AND 
    COUNT(CASE WHEN ra.status = 'completed' THEN 1 END) = 4
  ) INTO ready_for_review
  FROM referee_assignments ra 
  WHERE ra.match_coordination_id = p_coordination_id;
  
  IF NOT ready_for_review THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not all referee tasks are completed'
    );
  END IF;
  
  -- Update coordination status
  UPDATE match_coordination SET
    status = 'completed',
    final_review_data = p_final_review_data,
    updated_at = now()
  WHERE id = p_coordination_id;
  
  -- Log finalization event
  INSERT INTO coordination_events (
    match_coordination_id,
    event_type,
    referee_id,
    event_data
  ) VALUES (
    p_coordination_id,
    'match_finalized',
    auth.uid(),
    jsonb_build_object('finalized_at', now())
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'coordination_id', p_coordination_id,
    'finalized_at', now()
  );
END;
$function$;

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_match_coordination_updated_at
  BEFORE UPDATE ON match_coordination
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referee_assignments_updated_at
  BEFORE UPDATE ON referee_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
