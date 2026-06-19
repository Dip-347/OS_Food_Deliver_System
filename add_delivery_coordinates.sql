-- Add delivery coordinates to the orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_lat NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_lng NUMERIC;

-- Backfill missing coordinates for testing purposes (Optional but helpful)
UPDATE public.orders 
SET delivery_lat = 51.505, delivery_lng = -0.09 
WHERE delivery_lat IS NULL;
