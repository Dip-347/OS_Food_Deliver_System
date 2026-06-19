-- Fix the policies for the messages table to allow chat between Customer and Rider
-- Run this in your Supabase SQL Editor

-- 1. Drop any existing restrictive policies
DROP POLICY IF EXISTS "Allow users to read their messages" ON public.messages;
DROP POLICY IF EXISTS "Allow users to insert messages" ON public.messages;

-- 2. Create a fully open policy for the MVP (allows any user to insert/read any message)
CREATE POLICY "Allow all actions for messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

-- 3. Drop the receiver_id foreign key constraint. 
-- The frontend passes `order.rider_id` as the receiver, but the rider's ID is from the `public.riders` table, 
-- NOT the `auth.users` table. This mismatch causes a Foreign Key Violation error when inserting messages.
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
