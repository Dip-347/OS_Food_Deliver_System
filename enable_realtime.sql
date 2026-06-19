-- Enable realtime for orders table
BEGIN;
  -- Add orders table to supabase_realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
COMMIT;
