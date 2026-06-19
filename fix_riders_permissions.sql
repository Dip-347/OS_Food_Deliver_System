-- Fix permissions for riders table
GRANT ALL PRIVILEGES ON TABLE public.riders TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.riders TO anon;
GRANT ALL PRIVILEGES ON TABLE public.riders TO service_role;

-- Forcefully bypass restrictive RLS policies for MVP
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all actions for authenticated users" ON public.riders;
CREATE POLICY "Allow all actions for authenticated users" 
ON public.riders 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);
