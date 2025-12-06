-- Migration: Drop trigger and function that were causing signup 500 due to RLS context
-- Reason: Profile creation now handled in application code (ensureProfileForUser)
-- Safe to re-run: uses IF EXISTS

begin;

-- Drop trigger that auto-created profile
drop trigger if exists on_auth_user_created on auth.users;

-- Drop function used by the trigger
drop function if exists public.handle_new_user();

commit;
