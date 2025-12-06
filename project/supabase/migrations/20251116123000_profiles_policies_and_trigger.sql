-- Enable RLS on profiles and add safe owner policies
-- Also create a trigger to auto-create profiles on new auth.users using user_metadata

begin;

-- Ensure RLS is enabled on profiles
alter table if exists public.profiles enable row level security;

-- Policy: select own profile
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Select own profile'
  ) then
    create policy "Select own profile" on public.profiles
      for select
      using (auth.uid() = id);
  end if;
end$$;

-- Policy: insert own profile
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Insert own profile'
  ) then
    create policy "Insert own profile" on public.profiles
      for insert
      with check (auth.uid() = id);
  end if;
end$$;

-- Policy: update own profile
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Update own profile'
  ) then
    create policy "Update own profile" on public.profiles
      for update
      using (auth.uid() = id);
  end if;
end$$;

-- Optional: delete own profile (disabled by default). Uncomment if needed.
-- do $$
-- begin
--   if not exists (
--     select 1 from pg_policies
--     where schemaname = 'public'
--       and tablename = 'profiles'
--       and policyname = 'Delete own profile'
--   ) then
--     create policy "Delete own profile" on public.profiles
--       for delete
--       using (auth.uid() = id);
--   end if;
-- end$$;

-- Function to auto-create a profile when a user is created in auth.users
-- NOTE: This uses raw_user_meta_data to fill full_name and role if provided
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'full_name')::text, ''),
    coalesce((new.raw_user_meta_data->>'role')::text, 'client')::text
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger on auth.users to call the function after a new user is created
-- (if the trigger already exists, recreate it safely)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

commit;