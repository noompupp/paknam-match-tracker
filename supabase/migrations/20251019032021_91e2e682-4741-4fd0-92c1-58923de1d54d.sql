-- Update get_member_status to support immediate activation when current month is paid
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
BEGIN
  -- Check if member is fee exempt
  SELECT is_fee_exempt INTO is_exempt
  FROM members
  WHERE id = p_member_id;
  
  -- Exempt members are always active
  IF is_exempt THEN
    RETURN 'active';
  END IF;
  
  -- Calculate months
  preceding_month := DATE_TRUNC('month', p_reference_month - INTERVAL '1 month')::date;
  current_month := DATE_TRUNC('month', p_reference_month)::date;
  
  -- Check M-1 (preceding month) payment status
  SELECT mp.payment_status INTO preceding_payment_status
  FROM member_payments mp
  WHERE mp.member_id = p_member_id
    AND mp.payment_month = preceding_month
  LIMIT 1;
  
  -- If M-1 is paid, member is active
  IF preceding_payment_status = 'paid' THEN
    RETURN 'active';
  END IF;
  
  -- If M-1 is unpaid, check current month (M) for immediate activation
  SELECT mp.payment_status INTO current_payment_status
  FROM member_payments mp
  WHERE mp.member_id = p_member_id
    AND mp.payment_month = current_month
  LIMIT 1;
  
  -- Immediate activation: if current month is paid, activate immediately
  IF current_payment_status = 'paid' THEN
    RETURN 'active';
  END IF;
  
  -- Otherwise, member is inactive
  RETURN 'inactive';
END;
$function$;