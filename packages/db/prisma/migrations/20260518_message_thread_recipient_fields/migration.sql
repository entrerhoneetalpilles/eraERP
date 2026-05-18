-- Add missing to_email and to_name columns to message_threads
-- These columns were in the Prisma schema but never added via migration
SET statement_timeout = 0;

ALTER TABLE "message_threads"
  ADD COLUMN IF NOT EXISTS "to_email" TEXT,
  ADD COLUMN IF NOT EXISTS "to_name" TEXT;
