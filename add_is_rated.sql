-- Adding is_rated to prevent multiple ratings
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_rated BOOLEAN DEFAULT false;
