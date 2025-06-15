
-- Drop the old check constraint if it exists
ALTER TABLE public.auth_roles
DROP CONSTRAINT IF EXISTS auth_roles_role_check;

-- Add the new check constraint with the additional 'referee_rater' role
ALTER TABLE public.auth_roles
ADD CONSTRAINT auth_roles_role_check
CHECK (
  role IN ('admin', 'referee', 'referee_rater', 'viewer')
);
