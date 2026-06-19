-- Run this in your Supabase SQL Editor to fix the RLS permissions for Phase 3

-- 1. Policies for restaurants table
-- Note: Your database already has a "SELECT USING (true)" policy, so read access is already globally permitted.
CREATE POLICY "Allow users to insert their own restaurant"
ON public.restaurants FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow owners to update their restaurant"
ON public.restaurants FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- 2. Policies for menu_items table
-- I'm proactively adding these because you will immediately hit the same error when adding menu items!
CREATE POLICY "Allow owners to insert menu items"
ON public.menu_items FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = restaurant_id AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Allow owners to update menu items"
ON public.menu_items FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = restaurant_id AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Allow owners to delete menu items"
ON public.menu_items FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = restaurant_id AND r.user_id = auth.uid()
  )
);
