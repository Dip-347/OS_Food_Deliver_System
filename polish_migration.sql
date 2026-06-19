-- Polish Sprint Migration: System Notifications
-- Run this in your Supabase SQL Editor

CREATE TABLE public.system_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_role TEXT NOT NULL CHECK (target_role IN ('all', 'customer', 'restaurant', 'rider')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read access to notifications so clients can subscribe
CREATE POLICY "Allow public read access to notifications" ON public.system_notifications FOR SELECT USING (true);

-- Allow all actions for MVP so Admin UI can insert
CREATE POLICY "Allow all actions for notifications" ON public.system_notifications FOR ALL USING (true);
