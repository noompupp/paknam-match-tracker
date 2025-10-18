-- Update get_payment_history to accept reference month parameter
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
  result jsonb;
  history_months jsonb := '[]'::jsonb;
  current_month date;
  month_record jsonb;
  i integer;
BEGIN
  -- Generate last N months relative to reference month
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
    LIMIT 1;
    
    -- If no record exists, mark as unpaid
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
  
  RETURN jsonb_build_object(
    'member_id', p_member_id,
    'months', history_months
  );
END;
$function$;

-- Create function to normalize payment_month to first day of month
CREATE OR REPLACE FUNCTION public.normalize_payment_month()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.payment_month := DATE_TRUNC('month', NEW.payment_month)::date;
  RETURN NEW;
END;
$function$;

-- Create trigger to auto-normalize payment_month on insert/update
DROP TRIGGER IF EXISTS trg_normalize_payment_month ON public.member_payments;
CREATE TRIGGER trg_normalize_payment_month
BEFORE INSERT OR UPDATE ON public.member_payments
FOR EACH ROW EXECUTE FUNCTION public.normalize_payment_month();

-- One-time normalization of existing data
UPDATE public.member_payments
SET payment_month = DATE_TRUNC('month', payment_month)::date
WHERE payment_month != DATE_TRUNC('month', payment_month)::date;