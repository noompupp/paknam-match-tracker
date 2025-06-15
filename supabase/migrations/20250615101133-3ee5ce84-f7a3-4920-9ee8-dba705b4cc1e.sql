
-- Update `record_id` column in operation_logs to TEXT.
ALTER TABLE public.operation_logs
ALTER COLUMN record_id TYPE text
USING record_id::text;

-- Update the log_operation function so its p_record_id parameter is type TEXT (not UUID).
CREATE OR REPLACE FUNCTION public.log_operation(
  p_operation_type text,
  p_table_name text DEFAULT NULL::text,
  p_record_id text DEFAULT NULL::text,
  p_payload jsonb DEFAULT NULL::jsonb,
  p_result jsonb DEFAULT NULL::jsonb,
  p_error_message text DEFAULT NULL::text,
  p_success boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO operation_logs (
    operation_type,
    table_name,
    record_id,
    payload,
    result,
    error_message,
    success
  ) VALUES (
    p_operation_type,
    p_table_name,
    p_record_id,
    p_payload,
    p_result,
    p_error_message,
    p_success
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

