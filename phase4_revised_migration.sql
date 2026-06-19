-- Revised Phase 4 Migration: Advanced Rider Module
-- Run this in your Supabase SQL Editor

-- 1. Upgrade riders table with earnings, ratings, and location tracking
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS earnings NUMERIC DEFAULT 0;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 5.0;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS total_deliveries INTEGER DEFAULT 0;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS current_lat NUMERIC;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS current_lng NUMERIC;

-- 2. Add OTP to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pickup_otp TEXT;

-- 3. Create Messages table for In-App Chat
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    receiver_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Set up GRANTS
GRANT ALL PRIVILEGES ON TABLE public.messages TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.messages TO anon;
GRANT ALL PRIVILEGES ON TABLE public.messages TO service_role;

-- 5. Enable RLS and Policies for Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow users to read messages they sent or received
CREATE POLICY "Allow users to read their messages" 
ON public.messages FOR SELECT TO authenticated 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Allow users to insert messages if they are the sender
CREATE POLICY "Allow users to insert messages" 
ON public.messages FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = sender_id);
