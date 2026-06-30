-- Fix Missing Auth Identities for Manually Seeded Users
-- Run this in your Supabase SQL Editor

DO $$
DECLARE
    u RECORD;
BEGIN
    -- Loop through all users in auth.users that DO NOT have an associated identity
    FOR u IN 
        SELECT id, email FROM auth.users 
        WHERE NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = auth.users.id)
    LOOP
        -- Supabase GoTrue Auth requires a corresponding row in auth.identities 
        -- for email/password logins to work.
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            u.id,
            format('{"sub":"%s","email":"%s"}', u.id::text, u.email)::jsonb,
            'email',
            u.id::text, -- For email provider, provider_id is typically the user UUID as text
            now(),
            now(),
            now()
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;
