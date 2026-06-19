-- Run this in your Supabase SQL Editor to update your signup trigger
-- This ensures the role is correctly extracted from the metadata during registration

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(NULLIF(new.raw_user_meta_data->>'role', ''), 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
