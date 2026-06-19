-- Final Delivery Polish Migration
-- Run this in your Supabase SQL Editor

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS rejected_by UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS delivery_otp TEXT;
