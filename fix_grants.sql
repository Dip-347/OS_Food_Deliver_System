-- Run this in your Supabase SQL Editor to fix database role privileges

-- When you see "permission denied for table X", it is usually NOT an RLS issue.
-- It means the Postgres database roles (like 'authenticated' or 'anon') do not have 
-- the actual SQL permissions (GRANTs) to INSERT/UPDATE/SELECT on the table.

-- This explicitly grants all necessary table permissions to the standard Supabase roles
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Also grant usage on sequences (important for any auto-incrementing IDs if used)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
