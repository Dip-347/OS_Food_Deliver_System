-- Fix missing 'content' column in messages table
-- Run this in your Supabase SQL Editor

-- 1. If the column was accidentally named 'message', rename it to 'content':
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='messages' and column_name='message')
  THEN
      ALTER TABLE "public"."messages" RENAME COLUMN "message" TO "content";
  END IF;
END $$;

-- 2. If the column is entirely missing, add it:
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content TEXT;
