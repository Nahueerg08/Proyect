-- Migration: Cleanup triggers and policies causing server_error on email confirmation
-- Reason: Triggers on auth.users (on_auth_user_created, trigger_update_profile_email_verified)
-- were causing RLS context issues during signup and email confirmation.
-- Profile creation now handled in application code.
-- Safe to re-run: uses IF EXISTS

begin;

-- Drop trigger that updates profile when email is verified
drop trigger if exists trigger_update_profile_email_verified on auth.users;

-- Drop trigger that auto-created profile on signup
drop trigger if exists on_auth_user_created on auth.users;

-- Drop functions used by the triggers
drop function if exists public.update_profile_email_verified();
drop function if exists public.handle_new_user();

-- Drop policy that was only needed for trigger-based profile creation
drop policy if exists "Insert profile from trigger" on public.profiles;

commit;
