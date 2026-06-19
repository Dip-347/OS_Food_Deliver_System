-- Run this in your Supabase SQL Editor to link restaurants to their owners

-- 1. Add the user_id column
ALTER TABLE public.restaurants 
ADD COLUMN user_id UUID REFERENCES public.users(id);

-- 2. (Optional but recommended) Update existing mock restaurants to avoid null issues later if you care about them.
-- If you created a restaurant account, you can manually set the user_id to that user's ID later.
