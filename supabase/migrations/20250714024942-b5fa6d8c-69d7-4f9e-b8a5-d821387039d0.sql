-- Fix RLS policy for weekly_totw table to ensure admin users can update records
-- Drop the existing policy and recreate it with proper admin access

DROP POLICY IF EXISTS "Raters can update weekly TOTW" ON public.weekly_totw;

-- Create a more explicit policy that ensures admin and rater roles can update
CREATE POLICY "Admin and raters can update weekly TOTW" 
ON public.weekly_totw 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 
      FROM public.auth_roles 
      WHERE auth_roles.user_id = auth.uid() 
      AND auth_roles.role IN ('admin', 'rater')
    )
  )
);