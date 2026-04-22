
-- 1. Create seasons table
CREATE TABLE public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_number integer NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  is_current_default boolean NOT NULL DEFAULT false,
  started_at date,
  ended_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX seasons_one_default_idx
  ON public.seasons ((is_current_default))
  WHERE is_current_default = true;

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to seasons"
  ON public.seasons FOR SELECT USING (true);

CREATE POLICY "Only admins can insert seasons"
  ON public.seasons FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can update seasons"
  ON public.seasons FOR UPDATE
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete seasons"
  ON public.seasons FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

CREATE TRIGGER update_seasons_updated_at
  BEFORE UPDATE ON public.seasons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Insert Season 9
INSERT INTO public.seasons (season_number, name, is_active, is_current_default, started_at)
VALUES (9, 'ปากน้ำฟุตบอลลีก ครั้งที่ 9', true, true, '2024-01-01');

-- 3-5. Add season_id columns, backfill, set NOT NULL
DO $$
DECLARE
  v_season9_id uuid;
BEGIN
  SELECT id INTO v_season9_id FROM public.seasons WHERE season_number = 9;

  ALTER TABLE public.teams                   ADD COLUMN season_id uuid REFERENCES public.seasons(id);
  ALTER TABLE public.members                 ADD COLUMN season_id uuid REFERENCES public.seasons(id);
  ALTER TABLE public.fixtures                ADD COLUMN season_id uuid REFERENCES public.seasons(id);
  ALTER TABLE public.match_events            ADD COLUMN season_id uuid REFERENCES public.seasons(id);
  ALTER TABLE public.player_time_tracking    ADD COLUMN season_id uuid REFERENCES public.seasons(id);
  ALTER TABLE public.member_payments         ADD COLUMN season_id uuid REFERENCES public.seasons(id);
  ALTER TABLE public.league_table_operations ADD COLUMN season_id uuid REFERENCES public.seasons(id);

  UPDATE public.teams                   SET season_id = v_season9_id WHERE season_id IS NULL;
  UPDATE public.members                 SET season_id = v_season9_id WHERE season_id IS NULL;
  UPDATE public.fixtures                SET season_id = v_season9_id WHERE season_id IS NULL;
  UPDATE public.match_events            SET season_id = v_season9_id WHERE season_id IS NULL;
  UPDATE public.player_time_tracking    SET season_id = v_season9_id WHERE season_id IS NULL;
  UPDATE public.member_payments         SET season_id = v_season9_id WHERE season_id IS NULL;
  UPDATE public.league_table_operations SET season_id = v_season9_id WHERE season_id IS NULL;

  ALTER TABLE public.teams                   ALTER COLUMN season_id SET NOT NULL;
  ALTER TABLE public.members                 ALTER COLUMN season_id SET NOT NULL;
  ALTER TABLE public.fixtures                ALTER COLUMN season_id SET NOT NULL;
  ALTER TABLE public.match_events            ALTER COLUMN season_id SET NOT NULL;
  ALTER TABLE public.player_time_tracking    ALTER COLUMN season_id SET NOT NULL;
  ALTER TABLE public.member_payments         ALTER COLUMN season_id SET NOT NULL;
  ALTER TABLE public.league_table_operations ALTER COLUMN season_id SET NOT NULL;
END $$;

-- 6. Indexes
CREATE INDEX idx_teams_season_id                   ON public.teams(season_id);
CREATE INDEX idx_members_season_id                 ON public.members(season_id);
CREATE INDEX idx_fixtures_season_id                ON public.fixtures(season_id);
CREATE INDEX idx_match_events_season_id            ON public.match_events(season_id);
CREATE INDEX idx_player_time_tracking_season_id    ON public.player_time_tracking(season_id);
CREATE INDEX idx_member_payments_season_id         ON public.member_payments(season_id);
CREATE INDEX idx_league_table_operations_season_id ON public.league_table_operations(season_id);

-- 7. Helper functions
CREATE OR REPLACE FUNCTION public.get_current_season_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.seasons WHERE is_current_default = true LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_active_season_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.seasons WHERE is_active = true AND is_current_default = true LIMIT 1;
$$;

-- 8. Defaults
ALTER TABLE public.teams                   ALTER COLUMN season_id SET DEFAULT public.get_current_season_id();
ALTER TABLE public.members                 ALTER COLUMN season_id SET DEFAULT public.get_current_season_id();
ALTER TABLE public.fixtures                ALTER COLUMN season_id SET DEFAULT public.get_current_season_id();
ALTER TABLE public.match_events            ALTER COLUMN season_id SET DEFAULT public.get_current_season_id();
ALTER TABLE public.player_time_tracking    ALTER COLUMN season_id SET DEFAULT public.get_current_season_id();
ALTER TABLE public.member_payments         ALTER COLUMN season_id SET DEFAULT public.get_current_season_id();
ALTER TABLE public.league_table_operations ALTER COLUMN season_id SET DEFAULT public.get_current_season_id();

-- Resync sequences before bulk inserts
SELECT setval('public.members_id_seq', COALESCE((SELECT MAX(id) FROM public.members), 1), true);
SELECT setval('public.teams_id_seq',   COALESCE((SELECT MAX(id) FROM public.teams), 1), true);

-- 9. Clone function
CREATE OR REPLACE FUNCTION public.clone_season(
  p_source_season_id uuid,
  p_target_season_name text,
  p_target_season_number integer
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_target_season_id uuid;
  v_teams_copied integer := 0;
  v_members_copied integer := 0;
  v_team_id_map jsonb := '{}'::jsonb;
  v_team_record RECORD;
  v_member_record RECORD;
  v_new_team_id text;
  v_new_member_id text;
BEGIN
  IF get_user_role(auth.uid()) <> 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin privileges required');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.seasons WHERE id = p_source_season_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Source season not found');
  END IF;

  IF EXISTS (SELECT 1 FROM public.seasons WHERE season_number = p_target_season_number) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Season number already exists');
  END IF;

  -- Resync sequences
  PERFORM setval('public.members_id_seq', COALESCE((SELECT MAX(id) FROM public.members), 1), true);
  PERFORM setval('public.teams_id_seq',   COALESCE((SELECT MAX(id) FROM public.teams), 1), true);

  INSERT INTO public.seasons (season_number, name, is_active, is_current_default, started_at)
  VALUES (p_target_season_number, p_target_season_name, true, false, CURRENT_DATE)
  RETURNING id INTO v_target_season_id;

  FOR v_team_record IN SELECT * FROM public.teams WHERE season_id = p_source_season_id
  LOOP
    v_new_team_id := v_team_record.__id__ || '_s' || p_target_season_number::text;

    INSERT INTO public.teams (
      __id__, name, captain, color, logo, "logoURL", optimized_logo_url,
      logo_metadata_id, logo_variants, founded, position, previous_position,
      played, won, drawn, lost, goals_for, goals_against, goal_difference, points,
      season_id
    ) VALUES (
      v_new_team_id, v_team_record.name, v_team_record.captain, v_team_record.color,
      v_team_record.logo, v_team_record."logoURL", v_team_record.optimized_logo_url,
      v_team_record.logo_metadata_id, v_team_record.logo_variants, v_team_record.founded,
      v_team_record.position, NULL,
      0, 0, 0, 0, 0, 0, 0, 0,
      v_target_season_id
    );

    v_team_id_map := v_team_id_map || jsonb_build_object(v_team_record.__id__, v_new_team_id);
    v_teams_copied := v_teams_copied + 1;
  END LOOP;

  FOR v_member_record IN SELECT * FROM public.members WHERE season_id = p_source_season_id
  LOOP
    v_new_member_id := v_member_record.__id__ || '_s' || p_target_season_number::text;

    INSERT INTO public.members (
      __id__, name, real_name, nickname, number, position, role,
      team_id, line_id, line_name, "ProfileURL", optimized_avatar_url,
      avatar_metadata_id, avatar_variants, is_fee_exempt,
      goals, assists, yellow_cards, red_cards,
      matches_played, total_minutes_played, total_minutes_this_season,
      season_id, sync_status, validation_status
    ) VALUES (
      v_new_member_id, v_member_record.name, v_member_record.real_name, v_member_record.nickname,
      v_member_record.number, v_member_record.position, v_member_record.role,
      COALESCE(v_team_id_map->>v_member_record.team_id, v_member_record.team_id),
      v_member_record.line_id, v_member_record.line_name, v_member_record."ProfileURL",
      v_member_record.optimized_avatar_url, v_member_record.avatar_metadata_id,
      v_member_record.avatar_variants, v_member_record.is_fee_exempt,
      0, 0, 0, 0, 0, 0, 0,
      v_target_season_id, 'synced', 'valid'
    );

    v_members_copied := v_members_copied + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'target_season_id', v_target_season_id,
    'teams_copied', v_teams_copied,
    'members_copied', v_members_copied,
    'team_id_map', v_team_id_map
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 10. set_current_season
CREATE OR REPLACE FUNCTION public.set_current_season(p_season_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF get_user_role(auth.uid()) <> 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin privileges required');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.seasons WHERE id = p_season_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Season not found');
  END IF;
  UPDATE public.seasons SET is_current_default = false WHERE is_current_default = true;
  UPDATE public.seasons SET is_current_default = true  WHERE id = p_season_id;
  RETURN jsonb_build_object('success', true, 'season_id', p_season_id);
END;
$$;

-- 11. Auto-clone Season 10 from Season 9
DO $$
DECLARE
  v_season9_id uuid;
  v_season10_id uuid;
BEGIN
  SELECT id INTO v_season9_id FROM public.seasons WHERE season_number = 9;

  -- Resync sequences
  PERFORM setval('public.members_id_seq', COALESCE((SELECT MAX(id) FROM public.members), 1), true);
  PERFORM setval('public.teams_id_seq',   COALESCE((SELECT MAX(id) FROM public.teams), 1), true);

  INSERT INTO public.seasons (season_number, name, is_active, is_current_default, started_at)
  VALUES (10, 'ปากน้ำฟุตบอลลีก ครั้งที่ 10', true, false, CURRENT_DATE)
  RETURNING id INTO v_season10_id;

  INSERT INTO public.teams (
    __id__, name, captain, color, logo, "logoURL", optimized_logo_url,
    logo_metadata_id, logo_variants, founded,
    position, previous_position,
    played, won, drawn, lost, goals_for, goals_against, goal_difference, points,
    season_id
  )
  SELECT
    __id__ || '_s10', name, captain, color, logo, "logoURL", optimized_logo_url,
    logo_metadata_id, logo_variants, founded,
    position, NULL,
    0, 0, 0, 0, 0, 0, 0, 0,
    v_season10_id
  FROM public.teams WHERE season_id = v_season9_id;

  INSERT INTO public.members (
    __id__, name, real_name, nickname, number, position, role,
    team_id, line_id, line_name, "ProfileURL", optimized_avatar_url,
    avatar_metadata_id, avatar_variants, is_fee_exempt,
    goals, assists, yellow_cards, red_cards,
    matches_played, total_minutes_played, total_minutes_this_season,
    season_id, sync_status, validation_status
  )
  SELECT
    m.__id__ || '_s10', m.name, m.real_name, m.nickname, m.number, m.position, m.role,
    CASE WHEN m.team_id IS NOT NULL THEN m.team_id || '_s10' ELSE NULL END,
    m.line_id, m.line_name, m."ProfileURL", m.optimized_avatar_url,
    m.avatar_metadata_id, m.avatar_variants, m.is_fee_exempt,
    0, 0, 0, 0, 0, 0, 0,
    v_season10_id, 'synced', 'valid'
  FROM public.members m WHERE m.season_id = v_season9_id;

  UPDATE public.seasons SET is_current_default = false WHERE is_current_default = true;
  UPDATE public.seasons SET is_current_default = true  WHERE id = v_season10_id;
END $$;

-- 12. Update calculate_cumulative_player_stats to be season-scoped
CREATE OR REPLACE FUNCTION public.calculate_cumulative_player_stats()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  player_record RECORD;
  updated_count integer := 0;
BEGIN
  FOR player_record IN
    SELECT DISTINCT m.id, m.name, m.season_id
    FROM members m WHERE m.name IS NOT NULL
  LOOP
    WITH player_goals AS (
      SELECT COUNT(*) as total_goals FROM match_events me
      WHERE me.player_name = player_record.name AND me.season_id = player_record.season_id
        AND me.event_type = 'goal' AND me.is_own_goal = false
    ),
    player_assists AS (
      SELECT COUNT(*) as total_assists FROM match_events me
      WHERE me.player_name = player_record.name AND me.season_id = player_record.season_id
        AND me.event_type = 'assist'
    ),
    player_yellow_cards AS (
      SELECT COUNT(*) as total_yellow_cards FROM match_events me
      WHERE me.player_name = player_record.name AND me.season_id = player_record.season_id
        AND me.event_type = 'yellow_card'
    ),
    player_red_cards AS (
      SELECT COUNT(*) as total_red_cards FROM match_events me
      WHERE me.player_name = player_record.name AND me.season_id = player_record.season_id
        AND me.event_type = 'red_card'
    ),
    player_matches_from_events AS (
      SELECT COUNT(DISTINCT me.fixture_id) as matches_from_events FROM match_events me
      WHERE me.player_name = player_record.name AND me.season_id = player_record.season_id
        AND me.event_type IN ('goal', 'assist', 'yellow_card', 'red_card')
    ),
    player_matches_from_time AS (
      SELECT COUNT(DISTINCT ptt.fixture_id) as matches_from_time FROM player_time_tracking ptt
      WHERE ptt.player_name = player_record.name AND ptt.season_id = player_record.season_id
        AND ptt.total_minutes > 0
    ),
    combined_matches AS (
      SELECT GREATEST(
        COALESCE((SELECT matches_from_events FROM player_matches_from_events), 0),
        COALESCE((SELECT matches_from_time FROM player_matches_from_time), 0)
      ) as total_matches_played
    )
    UPDATE members SET
      goals = (SELECT total_goals FROM player_goals),
      assists = (SELECT total_assists FROM player_assists),
      yellow_cards = (SELECT total_yellow_cards FROM player_yellow_cards),
      red_cards = (SELECT total_red_cards FROM player_red_cards),
      matches_played = (SELECT total_matches_played FROM combined_matches),
      updated_at = NOW()
    WHERE id = player_record.id;
    updated_count := updated_count + 1;
  END LOOP;
  RETURN jsonb_build_object('success', true, 'players_updated', updated_count, 'calculated_at', NOW());
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'players_updated', updated_count);
END;
$$;
