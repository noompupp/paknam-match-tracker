-- Phase 1: Database Layer Updates

-- 1.1 Update member_payments table - Set default amount to 500 THB
ALTER TABLE member_payments 
ALTER COLUMN amount SET DEFAULT 500.00;

-- Update existing NULL amounts to 500
UPDATE member_payments 
SET amount = 500.00 
WHERE amount IS NULL;

-- 1.2 Create get_payment_history function
CREATE OR REPLACE FUNCTION get_payment_history(
  p_member_id integer,
  p_months_back integer DEFAULT 6
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  history_months jsonb := '[]'::jsonb;
  current_month date;
  month_record jsonb;
  i integer;
BEGIN
  -- Generate last N months
  FOR i IN 0..(p_months_back - 1) LOOP
    current_month := DATE_TRUNC('month', NOW() - INTERVAL '1 month' * i)::date;
    
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
$$;

-- 1.3 Create get_member_status function
CREATE OR REPLACE FUNCTION get_member_status(
  p_member_id integer,
  p_reference_month date DEFAULT CURRENT_DATE
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  preceding_month date;
  payment_status text;
BEGIN
  -- Calculate the month immediately before the reference month
  preceding_month := DATE_TRUNC('month', p_reference_month - INTERVAL '1 month')::date;
  
  -- Check if payment exists for preceding month
  SELECT mp.payment_status INTO payment_status
  FROM member_payments mp
  WHERE mp.member_id = p_member_id
    AND mp.payment_month = preceding_month
  LIMIT 1;
  
  -- If paid in preceding month, status is "active"
  -- Otherwise "inactive"
  IF payment_status = 'paid' THEN
    RETURN 'active';
  ELSE
    RETURN 'inactive';
  END IF;
END;
$$;

-- 1.4 Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_member_payments_member_month 
ON member_payments(member_id, payment_month DESC);

CREATE INDEX IF NOT EXISTS idx_members_text_id 
ON members(__id__);