-- Phase 6 Migration: Admin Panel & Approval Workflows
-- Run this in your Supabase SQL Editor

-- 1. Add is_approved column to restaurants
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Update existing mock restaurants so they don't break
UPDATE public.restaurants SET is_approved = true WHERE is_approved = false;

-- 2. Add is_approved column to riders
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Update existing mock riders so they don't break
UPDATE public.riders SET is_approved = true WHERE is_approved = false;
