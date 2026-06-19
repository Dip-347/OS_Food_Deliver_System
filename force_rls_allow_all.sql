-- Run this in your Supabase SQL Editor to forcefully bypass the restrictive RLS

-- 1. Drop the existing restrictive policies we just created, as well as the public read policy just in case
DROP POLICY IF EXISTS "Allow users to insert their own restaurant" ON public.restaurants;
DROP POLICY IF EXISTS "Allow owners to update their restaurant" ON public.restaurants;
DROP POLICY IF EXISTS "Allow public read access to restaurants" ON public.restaurants;

-- 2. Forcefully add an 'Allow All' policy for authenticated users
CREATE POLICY "Allow all actions for authenticated users" 
ON public.restaurants 
FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
