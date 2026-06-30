-- Hard Delete Corrupted Users Script
-- Run this in your Supabase SQL Editor

-- Because the original manual inserts were missing critical internal GoTrue metadata,
-- the Supabase Admin API is crashing (500 Error) when it tries to delete them.
-- We must aggressively delete them using raw SQL to clear the corruption.

BEGIN;

-- 1. Delete from public.riders
DELETE FROM public.riders 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN (
        'deliveryboy4@gmail.com',
        'deliveryboy5@gmail.com',
        'deliveryboy6@gmail.com',
        'deliveryboy7@gmail.com',
        'deliveryboy8@gmail.com',
        'deliveryboy9@gmail.com',
        'deliveryboy10@gmail.com'
    )
);

-- 2. Delete from public.users
DELETE FROM public.users 
WHERE email IN (
    'deliveryboy4@gmail.com',
    'deliveryboy5@gmail.com',
    'deliveryboy6@gmail.com',
    'deliveryboy7@gmail.com',
    'deliveryboy8@gmail.com',
    'deliveryboy9@gmail.com',
    'deliveryboy10@gmail.com'
);

-- 3. Delete from auth.users (This is the critical step to clear the corruption)
DELETE FROM auth.users 
WHERE email IN (
    'deliveryboy4@gmail.com',
    'deliveryboy5@gmail.com',
    'deliveryboy6@gmail.com',
    'deliveryboy7@gmail.com',
    'deliveryboy8@gmail.com',
    'deliveryboy9@gmail.com',
    'deliveryboy10@gmail.com'
);

COMMIT;
