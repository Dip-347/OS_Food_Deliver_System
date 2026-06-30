-- Update any existing riders to have dummy coordinates so the SSTF algorithm can find them
UPDATE public.riders 
SET current_lat = 22.3569, current_lng = 91.7832 
WHERE current_lat IS NULL OR current_lng IS NULL;

-- Ensure existing riders are available for testing
UPDATE public.riders 
SET is_available = true 
WHERE is_available IS NULL;
