-- ============================================
-- PHASE 1: Remove Ratings Feature
-- ============================================

-- Drop rating-related tables (cascade will handle foreign keys)
DROP TABLE IF EXISTS public.captain_selection_history CASCADE;
DROP TABLE IF EXISTS public.weekly_player_performance CASCADE;
DROP TABLE IF EXISTS public.weekly_totw CASCADE;
DROP TABLE IF EXISTS public.approved_player_ratings CASCADE;
DROP TABLE IF EXISTS public.fixture_player_ratings CASCADE;
DROP TABLE IF EXISTS public.player_ratings CASCADE;

-- Drop rating-related functions
DROP FUNCTION IF EXISTS public.update_player_ratings_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.get_fixture_player_ratings(integer) CASCADE;
DROP FUNCTION IF EXISTS public.generate_fixture_player_ratings(integer) CASCADE;
DROP FUNCTION IF EXISTS public.approve_player_rating(integer, integer, text, text, text, numeric, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.get_current_week_boundaries() CASCADE;
DROP FUNCTION IF EXISTS public.generate_weekly_totw(date, date) CASCADE;
DROP FUNCTION IF EXISTS public.aggregate_weekly_player_performance(date, date) CASCADE;
DROP FUNCTION IF EXISTS public.update_fixture_player_ratings_updated_at() CASCADE;

-- ============================================
-- PHASE 2: Add Membership Feature
-- ============================================

-- Add LINE information to members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS line_id text,
ADD COLUMN IF NOT EXISTS line_name text;

-- Create member_payments table
CREATE TABLE IF NOT EXISTS public.member_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id integer NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  payment_month date NOT NULL,
  payment_status text NOT NULL CHECK (payment_status IN ('paid', 'unpaid')),
  payment_date date,
  amount numeric(10,2),
  payment_method text,
  notes text,
  updated_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(member_id, payment_month)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_member_payments_month ON public.member_payments(payment_month);
CREATE INDEX IF NOT EXISTS idx_member_payments_status ON public.member_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_member_payments_member ON public.member_payments(member_id);

-- Enable RLS on member_payments
ALTER TABLE public.member_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can view payment status
CREATE POLICY "Public can view payment status"
ON public.member_payments
FOR SELECT
USING (true);

-- RLS Policy: Only admins can insert payment records
CREATE POLICY "Only admins can insert payment records"
ON public.member_payments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.auth_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- RLS Policy: Only admins can update payment records
CREATE POLICY "Only admins can update payment records"
ON public.member_payments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.auth_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- RLS Policy: Only admins can delete payment records
CREATE POLICY "Only admins can delete payment records"
ON public.member_payments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.auth_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Function: Initialize payment records for all members for a given month
CREATE OR REPLACE FUNCTION public.initialize_monthly_payments(target_month date)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  inserted_count integer := 0;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.auth_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Admin privileges required'
    );
  END IF;

  -- Insert payment records for all members who don't have one for this month
  INSERT INTO public.member_payments (member_id, payment_month, payment_status, updated_by)
  SELECT 
    m.id,
    DATE_TRUNC('month', target_month)::date,
    'unpaid',
    auth.uid()
  FROM public.members m
  WHERE NOT EXISTS (
    SELECT 1 FROM public.member_payments mp
    WHERE mp.member_id = m.id
    AND mp.payment_month = DATE_TRUNC('month', target_month)::date
  );

  GET DIAGNOSTICS inserted_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'inserted_count', inserted_count,
    'month', DATE_TRUNC('month', target_month)::date
  );
END;
$$;

-- Function: Get payment summary for a specific month
CREATE OR REPLACE FUNCTION public.get_monthly_payment_summary(target_month date)
RETURNS TABLE(
  total_members bigint,
  paid_count bigint,
  unpaid_count bigint,
  total_amount numeric,
  payment_month date
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_members,
    COUNT(*) FILTER (WHERE mp.payment_status = 'paid')::bigint as paid_count,
    COUNT(*) FILTER (WHERE mp.payment_status = 'unpaid')::bigint as unpaid_count,
    COALESCE(SUM(mp.amount) FILTER (WHERE mp.payment_status = 'paid'), 0) as total_amount,
    DATE_TRUNC('month', target_month)::date as payment_month
  FROM public.member_payments mp
  WHERE mp.payment_month = DATE_TRUNC('month', target_month)::date;
END;
$$;

-- Trigger: Update updated_at on member_payments
CREATE OR REPLACE FUNCTION public.update_member_payments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_member_payments_updated_at
BEFORE UPDATE ON public.member_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_member_payments_updated_at();