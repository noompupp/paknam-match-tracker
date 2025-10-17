-- Add real_name and is_fee_exempt fields to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS real_name text,
ADD COLUMN IF NOT EXISTS is_fee_exempt boolean NOT NULL DEFAULT false;

-- Create index for exempt members
CREATE INDEX IF NOT EXISTS idx_members_fee_exempt 
ON members(is_fee_exempt) 
WHERE is_fee_exempt = true;

-- Update get_member_status function to handle fee exemption
CREATE OR REPLACE FUNCTION public.get_member_status(
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
  
  -- Existing logic for non-exempt members
  preceding_month := DATE_TRUNC('month', p_reference_month - INTERVAL '1 month')::date;
  
  SELECT mp.payment_status INTO payment_status
  FROM member_payments mp
  WHERE mp.member_id = p_member_id
    AND mp.payment_month = preceding_month
  LIMIT 1;
  
  IF payment_status = 'paid' THEN
    RETURN 'active';
  ELSE
    RETURN 'inactive';
  END IF;
END;
$$;

-- Create validation function for bulk import
CREATE OR REPLACE FUNCTION public.validate_bulk_payment_import(
  p_records jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  record_item jsonb;
  error_count integer := 0;
  errors jsonb := '[]'::jsonb;
  member_count integer;
BEGIN
  -- Validate each record
  FOR record_item IN SELECT * FROM jsonb_array_elements(p_records)
  LOOP
    -- Check member exists
    SELECT COUNT(*) INTO member_count
    FROM members 
    WHERE id = (record_item->>'member_id')::integer;
    
    IF member_count = 0 THEN
      errors := errors || jsonb_build_object(
        'member_id', record_item->>'member_id',
        'error', 'Member ID not found in database'
      );
      error_count := error_count + 1;
      CONTINUE;
    END IF;
    
    -- Validate payment_status
    IF (record_item->>'payment_status') NOT IN ('paid', 'unpaid') THEN
      errors := errors || jsonb_build_object(
        'member_id', record_item->>'member_id',
        'month', record_item->>'payment_month',
        'error', 'Invalid payment status. Must be "paid" or "unpaid"'
      );
      error_count := error_count + 1;
    END IF;
    
    -- Validate date format (YYYY-MM-DD)
    BEGIN
      PERFORM (record_item->>'payment_month')::date;
    EXCEPTION WHEN OTHERS THEN
      errors := errors || jsonb_build_object(
        'member_id', record_item->>'member_id',
        'month', record_item->>'payment_month',
        'error', 'Invalid date format. Use YYYY-MM-DD'
      );
      error_count := error_count + 1;
    END;
  END LOOP;
  
  RETURN jsonb_build_object(
    'valid', error_count = 0,
    'error_count', error_count,
    'total_records', jsonb_array_length(p_records),
    'errors', errors
  );
END;
$$;