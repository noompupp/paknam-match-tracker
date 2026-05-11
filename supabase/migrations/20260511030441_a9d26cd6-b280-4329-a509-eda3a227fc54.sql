CREATE OR REPLACE FUNCTION public.canonical_member_key(p_id text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO 'public'
AS $$ SELECT regexp_replace(COALESCE(p_id, ''), '_s[0-9]+$', ''); $$;

CREATE OR REPLACE FUNCTION public.get_payment_history(
  p_member_id integer, p_months_back integer DEFAULT 6, p_reference_month date DEFAULT CURRENT_DATE
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  history_months jsonb := '[]'::jsonb; current_month date; month_record jsonb; i integer;
  v_canonical text; v_member_ids integer[];
BEGIN
  SELECT public.canonical_member_key(__id__) INTO v_canonical FROM members WHERE id = p_member_id;
  SELECT array_agg(id) INTO v_member_ids FROM members WHERE public.canonical_member_key(__id__) = v_canonical;
  IF v_member_ids IS NULL THEN v_member_ids := ARRAY[p_member_id]; END IF;
  FOR i IN 0..(p_months_back - 1) LOOP
    current_month := DATE_TRUNC('month', p_reference_month - INTERVAL '1 month' * i)::date;
    SELECT jsonb_build_object('month', current_month, 'status', COALESCE(mp.payment_status,'unpaid'),
      'amount', mp.amount, 'payment_date', mp.payment_date) INTO month_record
    FROM member_payments mp WHERE mp.member_id = ANY(v_member_ids) AND mp.payment_month = current_month
    ORDER BY (mp.payment_status = 'paid') DESC, mp.payment_date DESC NULLS LAST LIMIT 1;
    IF month_record IS NULL THEN
      month_record := jsonb_build_object('month', current_month, 'status','unpaid','amount',NULL,'payment_date',NULL);
    END IF;
    history_months := history_months || jsonb_build_array(month_record);
  END LOOP;
  RETURN jsonb_build_object('member_id', p_member_id, 'months', history_months);
END; $function$;

CREATE OR REPLACE FUNCTION public.get_member_status(p_member_id integer, p_reference_month date DEFAULT CURRENT_DATE)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  preceding_month date; current_month date;
  preceding_payment_status text; current_payment_status text;
  is_exempt boolean; v_canonical text; v_member_ids integer[];
BEGIN
  SELECT is_fee_exempt, public.canonical_member_key(__id__) INTO is_exempt, v_canonical
  FROM members WHERE id = p_member_id;
  IF is_exempt THEN RETURN 'active'; END IF;
  SELECT array_agg(id) INTO v_member_ids FROM members WHERE public.canonical_member_key(__id__) = v_canonical;
  IF v_member_ids IS NULL THEN v_member_ids := ARRAY[p_member_id]; END IF;
  preceding_month := DATE_TRUNC('month', p_reference_month - INTERVAL '1 month')::date;
  current_month := DATE_TRUNC('month', p_reference_month)::date;
  SELECT mp.payment_status INTO preceding_payment_status FROM member_payments mp
  WHERE mp.member_id = ANY(v_member_ids) AND mp.payment_month = preceding_month
  ORDER BY (mp.payment_status = 'paid') DESC LIMIT 1;
  IF preceding_payment_status = 'paid' THEN RETURN 'active'; END IF;
  SELECT mp.payment_status INTO current_payment_status FROM member_payments mp
  WHERE mp.member_id = ANY(v_member_ids) AND mp.payment_month = current_month
  ORDER BY (mp.payment_status = 'paid') DESC LIMIT 1;
  IF current_payment_status = 'paid' THEN RETURN 'active'; END IF;
  RETURN 'inactive';
END; $function$;