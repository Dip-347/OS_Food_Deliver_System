-- Delivery Boy Seeding Script
-- Run this in your Supabase SQL Editor

-- Enable pgcrypto if it isn't already enabled (needed for crypt() password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    db_data RECORD;
    uid UUID;
BEGIN
    -- Loop through the requested delivery boy data
    FOR db_data IN 
        SELECT * FROM (VALUES 
            ('deliveryboy4@gmail.com', 'deliveryboy4@12345', 'Delivery Boy 4'),
            ('deliveryboy5@gmail.com', 'deliveryboy5@12345', 'Delivery Boy 5'),
            ('deliveryboy6@gmail.com', 'deliveryboy6@12345', 'Delivery Boy 6'),
            ('deliveryboy7@gmail.com', 'deliveryboy7@12345', 'Delivery Boy 7'),
            ('deliveryboy8@gmail.com', 'deliveryboy8@12345', 'Delivery Boy 8'),
            ('deliveryboy9@gmail.com', 'deliveryboy9@12345', 'Delivery Boy 9'),
            ('deliveryboy10@gmail.com', 'deliveryboy10@12345', 'Delivery Boy 10')
        ) AS t(email, password, full_name)
    LOOP
        -- Check if user already exists to prevent duplicate key errors
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = db_data.email) THEN
            
            -- Generate a new UUID for the user
            uid := gen_random_uuid();
            
            -- 1. Insert into auth.users (Supabase Authentication system)
            INSERT INTO auth.users (
                id,
                instance_id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                raw_app_meta_data,
                raw_user_meta_data,
                created_at,
                updated_at,
                confirmation_token
            )
            VALUES (
                uid,
                '00000000-0000-0000-0000-000000000000',
                'authenticated',
                'authenticated',
                db_data.email,
                crypt(db_data.password, gen_salt('bf')), -- Properly hash the password
                now(),
                '{"provider":"email","providers":["email"]}',
                jsonb_build_object('full_name', db_data.full_name, 'role', 'rider'), -- Sets the role to rider for the trigger
                now(),
                now(),
                ''
            );

            -- Note: Your database already has a trigger (`on_auth_user_created`) 
            -- which will automatically insert this user into `public.users`.

            -- 2. Insert into public.riders so they appear in the dispatch system
            INSERT INTO public.riders (user_id, vehicle_type, is_available, is_active)
            VALUES (uid, 'Motorcycle', true, true);
            
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
