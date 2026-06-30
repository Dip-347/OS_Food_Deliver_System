-- Bypass Onboarding Script for Delivery Boys
-- Run this in your Supabase SQL Editor

-- 1. Ensure all necessary columns exist on the riders table
ALTER TABLE public.riders 
  ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'Motorcycle',
  ADD COLUMN IF NOT EXISTS license_plate TEXT,
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS current_lat NUMERIC,
  ADD COLUMN IF NOT EXISTS current_lng NUMERIC;

-- 2. Upsert the rider profiles for the specific emails
DO $$
DECLARE
    target_email TEXT;
    target_user_id UUID;
BEGIN
    -- Loop through all the newly seeded delivery boy emails
    FOR target_email IN 
        SELECT unnest(ARRAY[
            'deliveryboy4@gmail.com',
            'deliveryboy5@gmail.com',
            'deliveryboy6@gmail.com',
            'deliveryboy7@gmail.com',
            'deliveryboy8@gmail.com',
            'deliveryboy9@gmail.com',
            'deliveryboy10@gmail.com'
        ])
    LOOP
        -- Find the user_id for this email from the Auth system
        SELECT id INTO target_user_id FROM auth.users WHERE email = target_email LIMIT 1;
        
        IF target_user_id IS NOT NULL THEN
            -- Check if a rider profile already exists
            IF EXISTS (SELECT 1 FROM public.riders WHERE user_id = target_user_id) THEN
                -- Update existing profile to auto-approve and set default coordinates
                UPDATE public.riders
                SET 
                    vehicle_type = 'Motorcycle',
                    is_active = true,
                    is_available = true,
                    current_lat = COALESCE(current_lat, 22.3569 + (random() * 0.05 - 0.025)),
                    current_lng = COALESCE(current_lng, 91.7832 + (random() * 0.05 - 0.025))
                WHERE user_id = target_user_id;
            ELSE
                -- Insert missing profile to bypass the UI form
                INSERT INTO public.riders (
                    user_id, 
                    vehicle_type, 
                    is_available, 
                    is_active,
                    current_lat,
                    current_lng
                )
                VALUES (
                    target_user_id, 
                    'Motorcycle', 
                    true, 
                    true,
                    22.3569 + (random() * 0.05 - 0.025),
                    91.7832 + (random() * 0.05 - 0.025)
                );
            END IF;
            
            -- Ensure their role is correctly set to 'rider' in public.users
            UPDATE public.users SET role = 'rider' WHERE id = target_user_id;
            
            -- Ensure auth.users raw_user_meta_data reflects the rider role for JWT stability
            UPDATE auth.users 
            SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"rider"')
            WHERE id = target_user_id;

        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
