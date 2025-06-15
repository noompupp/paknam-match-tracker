
-- 1. Create a table to log modifications to match events in completed fixtures
CREATE TABLE IF NOT EXISTS public.modification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- e.g. "goal_edit", "card_deleted", etc.
  action TEXT NOT NULL,     -- e.g. "edit", "delete", "create"
  prev_data JSONB NOT NULL, -- snapshot of previous event state
  new_data JSONB,           -- snapshot of new state (if relevant)
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable row level security
ALTER TABLE public.modification_logs ENABLE ROW LEVEL SECURITY;

-- 3. Authenticated users can insert logs for their own actions
CREATE POLICY "Users can insert their own logs" ON public.modification_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Admins can select all logs, normal users only their own
CREATE POLICY "Admins can view all logs" ON public.modification_logs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.auth_roles ar 
    WHERE ar.user_id = auth.uid() AND ar.role = 'admin'
  ) OR user_id = auth.uid()
);

-- 5. Admins can insert logs for anyone (for delegated changes)
CREATE POLICY "Admins can insert logs for anyone" ON public.modification_logs
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.auth_roles ar 
    WHERE ar.user_id = auth.uid() AND ar.role = 'admin'
  ) OR user_id = auth.uid()
);

-- 6. No update/delete allowed for logs (immutable logs)
REVOKE UPDATE ON public.modification_logs FROM PUBLIC;
REVOKE DELETE ON public.modification_logs FROM PUBLIC;
