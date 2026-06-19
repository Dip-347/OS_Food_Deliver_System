-- Update the auto-assign trigger to respect the new 'rejected_by' array
CREATE OR REPLACE FUNCTION public.auto_assign_rider()
RETURNS TRIGGER AS $$
DECLARE
  available_rider RECORD;
BEGIN
  -- Only trigger when an order becomes ready for pickup
  IF NEW.status = 'ready_for_pickup' THEN
    -- Find an available rider who HAS NOT rejected this order
    SELECT * INTO available_rider 
    FROM public.riders 
    WHERE is_available = true 
      AND (NEW.rejected_by IS NULL OR NOT (id = ANY(NEW.rejected_by)))
    ORDER BY total_deliveries ASC 
    LIMIT 1;

    IF FOUND THEN
      -- Rider found! Assign them and change status
      NEW.status := 'pending_rider';
      NEW.rider_id := available_rider.id;
      
      -- Generate pickup OTP if it doesn't exist
      IF NEW.pickup_otp IS NULL THEN
        NEW.pickup_otp := floor(random() * 9000 + 1000)::text;
      END IF;
    ELSE
      -- No riders available or all available riders rejected it
      NEW.status := 'ready_for_pickup_no_rider';
      NEW.rider_id := null;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
