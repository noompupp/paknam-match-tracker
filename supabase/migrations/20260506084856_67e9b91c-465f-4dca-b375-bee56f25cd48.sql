-- 1) Season-aware initialize_monthly_payments
CREATE OR REPLACE FUNCTION public.initialize_monthly_payments(target_month date)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  inserted_count integer := 0;
  v_season_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.auth_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin privileges required');
  END IF;

  v_season_id := public.get_current_season_id();

  INSERT INTO public.member_payments (member_id, payment_month, payment_status, updated_by, season_id)
  SELECT
    m.id,
    DATE_TRUNC('month', target_month)::date,
    'unpaid',
    auth.uid(),
    v_season_id
  FROM public.members m
  WHERE m.season_id = v_season_id
    AND NOT EXISTS (
      SELECT 1 FROM public.member_payments mp
      WHERE mp.member_id = m.id
        AND mp.payment_month = DATE_TRUNC('month', target_month)::date
        AND mp.season_id = v_season_id
    );

  GET DIAGNOSTICS inserted_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'inserted_count', inserted_count,
    'month', DATE_TRUNC('month', target_month)::date,
    'season_id', v_season_id
  );
END;
$$;

-- 2) Season-aware get_monthly_payment_summary
CREATE OR REPLACE FUNCTION public.get_monthly_payment_summary(target_month date)
RETURNS TABLE(
  total_members bigint,
  paid_count bigint,
  unpaid_count bigint,
  total_amount numeric,
  payment_month date
)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_season_id uuid;
BEGIN
  v_season_id := public.get_current_season_id();

  RETURN QUERY
  SELECT
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE mp.payment_status = 'paid')::bigint,
    COUNT(*) FILTER (WHERE mp.payment_status = 'unpaid')::bigint,
    COALESCE(SUM(mp.amount) FILTER (WHERE mp.payment_status = 'paid'), 0),
    DATE_TRUNC('month', target_month)::date
  FROM public.member_payments mp
  WHERE mp.payment_month = DATE_TRUNC('month', target_month)::date
    AND mp.season_id = v_season_id;
END;
$$;

-- 3) Season-aware get_payment_history
CREATE OR REPLACE FUNCTION public.get_payment_history(
  p_member_id integer,
  p_months_back integer DEFAULT 6,
  p_reference_month date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  history_months jsonb := '[]'::jsonb;
  current_month date;
  month_record jsonb;
  i integer;
  v_season_id uuid;
BEGIN
  v_season_id := public.get_current_season_id();

  FOR i IN 0..(p_months_back - 1) LOOP
    current_month := DATE_TRUNC('month', p_reference_month - INTERVAL '1 month' * i)::date;

    SELECT jsonb_build_object(
      'month', current_month,
      'status', COALESCE(mp.payment_status, 'unpaid'),
      'amount', mp.amount,
      'payment_date', mp.payment_date
    ) INTO month_record
    FROM member_payments mp
    WHERE mp.member_id = p_member_id
      AND mp.payment_month = current_month
      AND mp.season_id = v_season_id
    LIMIT 1;

    IF month_record IS NULL THEN
      month_record := jsonb_build_object(
        'month', current_month,
        'status', 'unpaid',
        'amount', NULL,
        'payment_date', NULL
      );
    END IF;

    history_months := history_months || jsonb_build_array(month_record);
  END LOOP;

  RETURN jsonb_build_object('member_id', p_member_id, 'months', history_months);
END;
$function$;

-- 4) Season-aware get_member_status
CREATE OR REPLACE FUNCTION public.get_member_status(p_member_id integer, p_reference_month date DEFAULT CURRENT_DATE)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  preceding_month date;
  current_month date;
  preceding_payment_status text;
  current_payment_status text;
  is_exempt boolean;
  v_season_id uuid;
BEGIN
  v_season_id := public.get_current_season_id();

  SELECT is_fee_exempt INTO is_exempt
  FROM members
  WHERE id = p_member_id;

  IF is_exempt THEN
    RETURN 'active';
  END IF;

  preceding_month := DATE_TRUNC('month', p_reference_month - INTERVAL '1 month')::date;
  current_month := DATE_TRUNC('month', p_reference_month)::date;

  SELECT mp.payment_status INTO preceding_payment_status
  FROM member_payments mp
  WHERE mp.member_id = p_member_id
    AND mp.payment_month = preceding_month
    AND mp.season_id = v_season_id
  LIMIT 1;

  IF preceding_payment_status = 'paid' THEN
    RETURN 'active';
  END IF;

  SELECT mp.payment_status INTO current_payment_status
  FROM member_payments mp
  WHERE mp.member_id = p_member_id
    AND mp.payment_month = current_month
    AND mp.season_id = v_season_id
  LIMIT 1;

  IF current_payment_status = 'paid' THEN
    RETURN 'active';
  END IF;

  RETURN 'inactive';
END;
$function$;

-- 5) Cleanup duplicate April 2026 payment rows that point to non-Season-10 members
DELETE FROM public.member_payments mp
USING public.members m
WHERE mp.payment_month = '2026-04-01'
  AND mp.season_id = '3ad28fff-225c-465e-b318-12647e2a0497'
  AND mp.member_id = m.id
  AND m.season_id <> '3ad28fff-225c-465e-b318-12647e2a0497';
