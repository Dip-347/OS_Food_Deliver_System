-- Phase 4 Migration: Rider Module Setup
-- Run this in your Supabase SQL Editor

-- 1. Create the riders table
CREATE TABLE IF NOT EXISTS public.riders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_type TEXT NOT NULL,
    license_plate TEXT,
    is_available BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true, -- Auto-approve for MVP
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Add rider_id to the orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rider_id UUID REFERENCES public.riders(id);

-- 3. Set up GRANTS to prevent permission denied errors
GRANT ALL PRIVILEGES ON TABLE public.riders TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.riders TO anon;
GRANT ALL PRIVILEGES ON TABLE public.riders TO service_role;

-- 4. Enable RLS
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for riders table
-- Allow public read
CREATE POLICY "Allow public read access to riders" ON public.riders FOR SELECT USING (true);

-- Allow authenticated users to insert their own rider profile
CREATE POLICY "Allow users to insert their own rider profile" 
ON public.riders FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow riders to update their own profile (like toggling is_available)
CREATE POLICY "Allow riders to update their own profile" 
ON public.riders FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

-- Update orders RLS policies (We already forcefully set "Allow all actions" in phase 3, but just in case)
DROP POLICY IF EXISTS "Allow all actions for orders" ON public.orders;
CREATE POLICY "Allow all actions for orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
