-- Phase 4: Server-Side SSTF Dispatching Setup
-- Run this in your Supabase SQL Editor

-- 1. Add coordinates to restaurants table (so we can calculate distance)
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS lat NUMERIC;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS lng NUMERIC;

-- 2. Update existing restaurants with dummy coordinates for testing (e.g., center of New York)
UPDATE public.restaurants SET lat = 40.7128, lng = -74.0060 WHERE lat IS NULL;

-- 3. Create the SSTF Dispatch Function
CREATE OR REPLACE FUNCTION public.assign_closest_rider()
RETURNS TRIGGER AS $$
DECLARE
    rest_lat NUMERIC;
    rest_lng NUMERIC;
    best_rider_id UUID;
    shortest_distance NUMERIC;
    random_otp TEXT;
BEGIN
    -- Only attempt assignment if the order is new and pending
    IF NEW.status = 'pending' THEN
        
        -- Get the restaurant's coordinates
        SELECT lat, lng INTO rest_lat, rest_lng 
        FROM public.restaurants 
        WHERE id = NEW.restaurant_id;

        IF rest_lat IS NOT NULL AND rest_lng IS NOT NULL THEN
            -- Find the closest available rider using the Haversine formula
            -- 6371 is the radius of the Earth in kilometers
            SELECT id, 
                   ( 6371 * acos( cos( radians(rest_lat) ) * cos( radians( current_lat ) ) * cos( radians( current_lng ) - radians(rest_lng) ) + sin( radians(rest_lat) ) * sin( radians( current_lat ) ) ) ) AS distance 
            INTO best_rider_id, shortest_distance
            FROM public.riders
            WHERE is_available = true
              AND current_lat IS NOT NULL 
              AND current_lng IS NOT NULL
            ORDER BY distance ASC
            LIMIT 1;

            -- Check if a rider is found AND is within the 5km radius
            IF best_rider_id IS NOT NULL AND shortest_distance <= 5.0 THEN
                NEW.rider_id := best_rider_id;
                
                -- Generate a random 4-digit OTP securely on the server
                random_otp := floor(random() * (9999-1000+1) + 1000)::text;
                NEW.pickup_otp := random_otp;
                
                -- Update status to accepted so the Rider and Restaurant see it immediately
                NEW.status := 'accepted';
            ELSE
                -- Fallback Mechanism: No riders available or none within 5km range
                NEW.status := 'pending_no_rider';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create the Trigger
DROP TRIGGER IF EXISTS trigger_assign_rider ON public.orders;
CREATE TRIGGER trigger_assign_rider
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.assign_closest_rider();
