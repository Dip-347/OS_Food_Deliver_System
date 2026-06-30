-- Setup Script: Proximity Dispatch & Rejection Flow
-- Run this in your Supabase SQL Editor

BEGIN;

-- 1. Enable PostGIS for accurate geographic distance calculation
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Ensure rejected_by array column exists on orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rejected_by UUID[] DEFAULT '{}'::UUID[];

-- 3. Proximity Search Function using PostGIS
CREATE OR REPLACE FUNCTION get_nearest_riders(p_restaurant_id UUID)
RETURNS TABLE (
    rider_id UUID,
    full_name TEXT,
    distance_meters FLOAT
) AS $$
DECLARE
    v_rest_lat NUMERIC;
    v_rest_lng NUMERIC;
BEGIN
    -- Get restaurant coordinates
    SELECT lat, lng INTO v_rest_lat, v_rest_lng
    FROM public.restaurants WHERE id = p_restaurant_id;

    -- Calculate distance to all available riders using PostGIS
    RETURN QUERY
    SELECT 
        r.id as rider_id,
        u.full_name,
        -- Cast to geography to get distance in exact meters
        ST_Distance(
            ST_SetSRID(ST_MakePoint(r.current_lng, r.current_lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(v_rest_lng, v_rest_lat), 4326)::geography
        ) as distance_meters
    FROM public.riders r
    JOIN public.users u ON u.id = r.user_id
    WHERE r.is_available = true 
      AND r.is_active = true
      AND r.current_lat IS NOT NULL
      AND r.current_lng IS NOT NULL
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;

-- 4. Auto-Assign Function (Rejection Flow)
CREATE OR REPLACE FUNCTION assign_nearest_rider_on_reject()
RETURNS TRIGGER AS $$
DECLARE
    v_next_rider_id UUID;
    v_rest_id UUID;
BEGIN
    -- Only trigger if the rejected_by array actually changed
    IF NEW.rejected_by IS DISTINCT FROM OLD.rejected_by THEN
        
        -- Get the restaurant ID for this order
        v_rest_id := NEW.restaurant_id;

        -- Find the nearest rider who is NOT in the rejected_by array
        SELECT rider_id INTO v_next_rider_id
        FROM get_nearest_riders(v_rest_id)
        WHERE NOT (rider_id = ANY(NEW.rejected_by))
        LIMIT 1;

        -- If a new rider is found, auto-assign them. 
        -- If none found, rider_id becomes NULL and order is stuck in ready_for_pickup
        NEW.rider_id := v_next_rider_id;
        
        -- If we successfully reassigned, we should probably set status back to pending_rider
        -- so the new rider sees the incoming request (adjust based on your exact app flow)
        IF v_next_rider_id IS NOT NULL THEN
            NEW.status := 'ready_for_pickup'; -- Or 'pending_rider' depending on your flow
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create Trigger for Rejection Flow
DROP TRIGGER IF EXISTS trg_reassign_on_reject ON public.orders;
CREATE TRIGGER trg_reassign_on_reject
    BEFORE UPDATE OF rejected_by ON public.orders
    FOR EACH ROW
    EXECUTE PROCEDURE assign_nearest_rider_on_reject();

COMMIT;
