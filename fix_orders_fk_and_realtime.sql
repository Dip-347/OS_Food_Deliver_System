-- Fix OrderManager.tsx fetching bug by adding the missing foreign key
ALTER TABLE public.orders 
ADD CONSTRAINT orders_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Enable Realtime for orders table
BEGIN;
  -- Remove to avoid duplicate errors if running multiple times
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.orders;
  -- Add the table to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
COMMIT;
