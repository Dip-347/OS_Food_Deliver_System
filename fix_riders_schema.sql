-- Fix missing columns in the riders table
-- This adds the necessary columns if the riders table was created previously without them.

ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS current_lat NUMERIC;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS current_lng NUMERIC;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
