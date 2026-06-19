-- Run this in your Supabase SQL Editor if you already ran the previous migration script
-- This will rename the 'owner_id' column to 'user_id' to match the new refactored logic

DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='restaurants' and column_name='owner_id')
  THEN
      ALTER TABLE "public"."restaurants" RENAME COLUMN "owner_id" TO "user_id";
  END IF;
END $$;
