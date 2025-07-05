-- Create weekly TOTW aggregation infrastructure
CREATE TABLE IF NOT EXISTS public.weekly_totw (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  season_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  fixtures_included INTEGER[] NOT NULL DEFAULT '{}',
  team_of_the_week JSONB NOT NULL DEFAULT '[]'::jsonb,
  captain_of_the_week JSONB NULL,
  selection_method TEXT NOT NULL DEFAULT 'automatic' CHECK (selection_method IN ('automatic', 'manual', 'hybrid')),
  is_finalized BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NULL,
  approved_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(week_start_date, season_year)
);

-- Create weekly player performance aggregation
CREATE TABLE IF NOT EXISTS public.weekly_player_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  weekly_totw_id UUID NOT NULL REFERENCES public.weekly_totw(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  team_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'Player',
  
  -- Performance aggregates
  total_minutes INTEGER NOT NULL DEFAULT 0,
  matches_played INTEGER NOT NULL DEFAULT 0,
  total_goals INTEGER NOT NULL DEFAULT 0,
  total_assists INTEGER NOT NULL DEFAULT 0,
  total_cards INTEGER NOT NULL DEFAULT 0,
  
  -- Rating aggregates
  average_fpl_rating NUMERIC(4,2) NOT NULL DEFAULT 6.0,
  average_participation_rating NUMERIC(4,2) NOT NULL DEFAULT 6.0,
  weighted_final_rating NUMERIC(4,2) NOT NULL DEFAULT 6.0,
  
  -- Weekly context
  fixtures_played_in INTEGER[] NOT NULL DEFAULT '{}',
  performance_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(weekly_totw_id, player_id)
);

-- Create captain selection history
CREATE TABLE IF NOT EXISTS public.captain_selection_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  weekly_totw_id UUID NOT NULL REFERENCES public.weekly_totw(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  team_id TEXT NOT NULL,
  selection_type TEXT NOT NULL CHECK (selection_type IN ('totw_captain', 'captain_of_week', 'manual_override')),
  selection_reason TEXT,
  performance_score NUMERIC(6,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  selected_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weekly_totw ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_player_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captain_selection_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for weekly_totw
CREATE POLICY "Public can view weekly TOTW" ON public.weekly_totw FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create weekly TOTW" ON public.weekly_totw FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Raters can update weekly TOTW" ON public.weekly_totw FOR UPDATE USING (
  EXISTS(SELECT 1 FROM auth_roles WHERE user_id = auth.uid() AND role IN ('admin', 'rater'))
);

-- RLS Policies for weekly_player_performance
CREATE POLICY "Public can view weekly performance" ON public.weekly_player_performance FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage weekly performance" ON public.weekly_player_performance FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for captain_selection_history
CREATE POLICY "Public can view captain history" ON public.captain_selection_history FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create captain selections" ON public.captain_selection_history FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weekly_totw_date ON public.weekly_totw(week_start_date, season_year);
CREATE INDEX IF NOT EXISTS idx_weekly_performance_player ON public.weekly_player_performance(player_id, weekly_totw_id);
CREATE INDEX IF NOT EXISTS idx_captain_history_weekly ON public.captain_selection_history(weekly_totw_id, is_active);

-- Create function to get current week boundaries
CREATE OR REPLACE FUNCTION public.get_current_week_boundaries()
RETURNS TABLE(week_start DATE, week_end DATE) 
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 1)::DATE as week_start,
    (CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7)::DATE as week_end;
END;
$function$;

-- Create function to aggregate weekly player performance
CREATE OR REPLACE FUNCTION public.aggregate_weekly_player_performance(
  p_week_start DATE,
  p_week_end DATE
) RETURNS JSONB
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

  -- Aggregate player performance for the week
  FOR performance_record IN
    SELECT 
      fpr.player_id,
      fpr.player_name,
      fpr.team_id,
      fpr.team_name,
      fpr.player_position,
      COUNT(*) as matches_played,
      SUM(fpr.minutes_played) as total_minutes,
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
    WHERE f.match_date BETWEEN p_week_start AND p_week_end
    AND fpr.final_rating IS NOT NULL
    GROUP BY fpr.player_id, fpr.player_name, fpr.team_id, fpr.team_name, fpr.player_position
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
      performance_record.team_name,
      performance_record.player_position,
      performance_record.total_minutes,
      performance_record.matches_played,
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

-- Create function to generate weekly TOTW
CREATE OR REPLACE FUNCTION public.generate_weekly_totw(
  p_week_start DATE DEFAULT NULL,
  p_week_end DATE DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  week_boundaries RECORD;
  weekly_totw_record RECORD;
  selected_totw JSONB := '[]'::jsonb;
  selected_captain JSONB := NULL;
  result JSONB;
BEGIN
  -- Get week boundaries
  IF p_week_start IS NULL OR p_week_end IS NULL THEN
    SELECT * INTO week_boundaries FROM public.get_current_week_boundaries();
    p_week_start := week_boundaries.week_start;
    p_week_end := week_boundaries.week_end;
  END IF;

  -- Aggregate weekly performance first
  PERFORM public.aggregate_weekly_player_performance(p_week_start, p_week_end);

  -- Get the weekly TOTW record
  SELECT * INTO weekly_totw_record 
  FROM public.weekly_totw 
  WHERE week_start_date = p_week_start 
  AND season_year = EXTRACT(YEAR FROM p_week_start);

  -- Generate TOTW using enhanced selection algorithm
  WITH position_rankings AS (
    SELECT 
      wpp.*,
      ROW_NUMBER() OVER (
        PARTITION BY 
          CASE 
            WHEN position ILIKE '%GK%' OR position ILIKE '%GOALKEEPER%' THEN 'GK'
            WHEN position ILIKE '%DF%' OR position ILIKE '%DEF%' OR position ILIKE '%CB%' OR position ILIKE '%LB%' OR position ILIKE '%RB%' THEN 'DF'
            WHEN position ILIKE '%MF%' OR position ILIKE '%MID%' OR position ILIKE '%CM%' OR position ILIKE '%CDM%' OR position ILIKE '%CAM%' THEN 'MF'
            WHEN position ILIKE '%WG%' OR position ILIKE '%WING%' OR position ILIKE '%LW%' OR position ILIKE '%RW%' THEN 'WG'
            WHEN position ILIKE '%FW%' OR position ILIKE '%FORWARD%' OR position ILIKE '%ST%' OR position ILIKE '%CF%' THEN 'FW'
            ELSE 'MF'
          END
        ORDER BY weighted_final_rating DESC, total_minutes DESC
      ) as position_rank
    FROM public.weekly_player_performance wpp
    WHERE wpp.weekly_totw_id = weekly_totw_record.id
    AND wpp.matches_played > 0
  ),
  balanced_selection AS (
    -- Select top players by position, ensuring balanced representation
    SELECT pr.* FROM position_rankings pr
    WHERE pr.position_rank <= 2
    ORDER BY pr.weighted_final_rating DESC
    LIMIT 7
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'player_id', bs.player_id,
      'player_name', bs.player_name,
      'team_id', bs.team_id,
      'team_name', bs.team_name,
      'position', bs.position,
      'weighted_final_rating', bs.weighted_final_rating,
      'matches_played', bs.matches_played,
      'total_minutes', bs.total_minutes,
      'isCaptain', bs.weighted_final_rating = (SELECT MAX(weighted_final_rating) FROM balanced_selection),
      'rating_data', jsonb_build_object(
        'final_rating', bs.weighted_final_rating,
        'fpl_rating', bs.average_fpl_rating,
        'participation_rating', bs.average_participation_rating
      )
    )
  ) INTO selected_totw
  FROM balanced_selection bs;

  -- Update weekly TOTW record
  UPDATE public.weekly_totw SET
    team_of_the_week = COALESCE(selected_totw, '[]'::jsonb),
    captain_of_the_week = selected_captain,
    selection_method = 'automatic',
    updated_at = now()
  WHERE id = weekly_totw_record.id;

  RETURN jsonb_build_object(
    'success', true,
    'weekly_totw_id', weekly_totw_record.id,
    'team_of_the_week', selected_totw,
    'captain_of_the_week', selected_captain,
    'week_start', p_week_start,
    'week_end', p_week_end
  );
END;
$function$;

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_weekly_totw_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER update_weekly_totw_updated_at
  BEFORE UPDATE ON public.weekly_totw
  FOR EACH ROW
  EXECUTE FUNCTION public.update_weekly_totw_updated_at();

CREATE TRIGGER update_weekly_performance_updated_at
  BEFORE UPDATE ON public.weekly_player_performance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_weekly_totw_updated_at();