-- Database Seeding Script for Chattogram Restaurants
-- Run this in your Supabase SQL Editor

-- Enable pgcrypto if it isn't already enabled (needed for crypt() password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    r4_id UUID := gen_random_uuid();
    r5_id UUID := gen_random_uuid();
    r6_id UUID := gen_random_uuid();
    r7_id UUID := gen_random_uuid();
    r8_id UUID := gen_random_uuid();
    r9_id UUID := gen_random_uuid();
    r10_id UUID := gen_random_uuid();
    r11_id UUID := gen_random_uuid();
    r12_id UUID := gen_random_uuid();
    r13_id UUID := gen_random_uuid();
BEGIN
    -- 1. Update Existing KFC Restaurant Coordinates
    UPDATE public.restaurants 
    SET lat = 22.3592, lng = 91.8215
    WHERE name = 'KFC' OR user_id = (SELECT id FROM public.users WHERE email = 'restaurant3@gmail.com' LIMIT 1);

    -- 2. Insert New Users and Restaurants

    -- Restaurant 4: The Peninsula Chittagong
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at)
    VALUES (r4_id, '00000000-0000-0000-0000-000000000000', 'restaurant4@gmail.com', crypt('resturant4@12345', gen_salt('bf')), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"The Peninsula Chittagong","role":"restaurant"}', now(), now(), now());
    
    INSERT INTO public.restaurants (name, user_id, is_active, lat, lng, image_url)
    VALUES ('The Peninsula Chittagong', r4_id, true, 22.3595, 91.8212, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80');

    -- Restaurant 5: Barcode Cafe
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at)
    VALUES (r5_id, '00000000-0000-0000-0000-000000000000', 'restaurant5@gmail.com', crypt('resturant5@12345', gen_salt('bf')), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"Barcode Cafe","role":"restaurant"}', now(), now(), now());
    
    INSERT INTO public.restaurants (name, user_id, is_active, lat, lng, image_url)
    VALUES ('Barcode Cafe', r5_id, true, 22.3582, 91.8315, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80');

    -- Restaurant 6: Cafe Milano
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at)
    VALUES (r6_id, '00000000-0000-0000-0000-000000000000', 'restaurant6@gmail.com', crypt('resturant6@12345', gen_salt('bf')), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"Cafe Milano","role":"restaurant"}', now(), now(), now());
    
    INSERT INTO public.restaurants (name, user_id, is_active, lat, lng, image_url)
    VALUES ('Cafe Milano', r6_id, true, 22.3685, 91.8105, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80');

    -- Restaurant 7: PizzaBurg Chittagong
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at)
    VALUES (r7_id, '00000000-0000-0000-0000-000000000000', 'restaurant7@gmail.com', crypt('resturant7@12345', gen_salt('bf')), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"PizzaBurg Chittagong","role":"restaurant"}', now(), now(), now());
    
    INSERT INTO public.restaurants (name, user_id, is_active, lat, lng, image_url)
    VALUES ('PizzaBurg Chittagong', r7_id, true, 22.3630, 91.8180, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80');

    -- Restaurant 8: Ambrosia Restaurant
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at)
    VALUES (r8_id, '00000000-0000-0000-0000-000000000000', 'restaurant8@gmail.com', crypt('resturant8@12345', gen_salt('bf')), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"Ambrosia Restaurant","role":"restaurant"}', now(), now(), now());
    
    INSERT INTO public.restaurants (name, user_id, is_active, lat, lng, image_url)
    VALUES ('Ambrosia Restaurant', r8_id, true, 22.3275, 91.8125, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80');

    -- Restaurant 9: Chillox
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at)
    VALUES (r9_id, '00000000-0000-0000-0000-000000000000', 'restaurant9@gmail.com', crypt('resturant9@12345', gen_salt('bf')), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"Chillox","role":"restaurant"}', now(), now(), now());
    
    INSERT INTO public.restaurants (name, user_id, is_active, lat, lng, image_url)
    VALUES ('Chillox', r9_id, true, 22.3575, 91.8235, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80');

    -- Restaurant 10: Sultan's Dine
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at)
    VALUES (r10_id, '00000000-0000-0000-0000-000000000000', 'restaurant10@gmail.com', crypt('resturant10@12345', gen_salt('bf')), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"Sultans Dine","role":"restaurant"}', now(), now(), now());
    
    INSERT INTO public.restaurants (name, user_id, is_active, lat, lng, image_url)
    VALUES ('Sultan''s Dine', r10_id, true, 22.3485, 91.8270, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80');

    -- Restaurant 11: Mezzan Haile Aaiun
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at)
    VALUES (r11_id, '00000000-0000-0000-0000-000000000000', 'restaurant11@gmail.com', crypt('resturant11@12345', gen_salt('bf')), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"Mezzan Haile Aaiun","role":"restaurant"}', now(), now(), now());
    
    INSERT INTO public.restaurants (name, user_id, is_active, lat, lng, image_url)
    VALUES ('Mezzan Haile Aaiun', r11_id, true, 22.3540, 91.8230, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80');

    -- Restaurant 12: Da Signature Restaurant
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at)
    VALUES (r12_id, '00000000-0000-0000-0000-000000000000', 'restaurant12@gmail.com', crypt('resturant12@12345', gen_salt('bf')), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"Da Signature Restaurant","role":"restaurant"}', now(), now(), now());
    
    INSERT INTO public.restaurants (name, user_id, is_active, lat, lng, image_url)
    VALUES ('Da Signature Restaurant', r12_id, true, 22.3600, 91.8250, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80');

    -- Restaurant 13: Grand Mughal Restaurant
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at)
    VALUES (r13_id, '00000000-0000-0000-0000-000000000000', 'restaurant13@gmail.com', crypt('resturant13@12345', gen_salt('bf')), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"Grand Mughal Restaurant","role":"restaurant"}', now(), now(), now());
    
    INSERT INTO public.restaurants (name, user_id, is_active, lat, lng, image_url)
    VALUES ('Grand Mughal Restaurant', r13_id, true, 22.3520, 91.8240, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80');

END $$;
