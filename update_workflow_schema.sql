-- 1. Add rejected_by array to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rejected_by UUID[] DEFAULT '{}';

-- 2. Update default status for new orders
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending_restaurant';

-- 3. Replace the existing SSTF Dispatch Function to work on UPDATE
CREATE OR REPLACE FUNCTION public.assign_closest_rider()
RETURNS TRIGGER AS $$
DECLARE
    rest_lat NUMERIC;
    rest_lng NUMERIC;
    best_rider_id UUID;
    shortest_distance NUMERIC;
    random_otp TEXT;
BEGIN
    -- Only attempt assignment when status transitions to 'ready_for_pickup'
    IF (OLD.status != 'ready_for_pickup' OR OLD.status IS NULL) AND NEW.status = 'ready_for_pickup' THEN
        
        -- Get the restaurant's coordinates
        SELECT lat, lng INTO rest_lat, rest_lng 
        FROM public.restaurants 
        WHERE id = NEW.restaurant_id;

        IF rest_lat IS NOT NULL AND rest_lng IS NOT NULL THEN
            -- Find the closest available rider who hasn't rejected this order
            SELECT id, 
                   ( 6371 * acos( cos( radians(rest_lat) ) * cos( radians( current_lat ) ) * cos( radians( current_lng ) - radians(rest_lng) ) + sin( radians(rest_lat) ) * sin( radians( current_lat ) ) ) ) AS distance 
            INTO best_rider_id, shortest_distance
            FROM public.riders
            WHERE is_available = true
              AND current_lat IS NOT NULL 
              AND current_lng IS NOT NULL
              AND NOT (id = ANY(NEW.rejected_by))
            ORDER BY distance ASC
            LIMIT 1;

            -- Check if a rider is found AND is within the 5km radius
            IF best_rider_id IS NOT NULL AND shortest_distance <= 5.0 THEN
                NEW.rider_id := best_rider_id;
                
                -- Generate a random 4-digit OTP securely on the server
                random_otp := floor(random() * (9999-1000+1) + 1000)::text;
                NEW.pickup_otp := random_otp;
                
                -- Update status to pending_rider so the Rider is notified to accept/reject
                NEW.status := 'pending_rider';
            ELSE
                -- Fallback Mechanism: No riders available or none within 5km range
                NEW.status := 'ready_for_pickup_no_rider';
                NEW.rider_id := NULL;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Drop the old INSERT trigger and create the new UPDATE trigger
DROP TRIGGER IF EXISTS trigger_assign_rider ON public.orders;

CREATE TRIGGER trigger_assign_rider_on_update
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.assign_closest_rider();
