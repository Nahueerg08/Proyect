-- Fix signup 500 error: allow trigger to insert into profiles when RLS blocks
-- Context: Previous policy "Insert own profile" requires auth.uid() = id, but
-- during auth.signUp the trigger runs without a normal auth.uid() context, causing
-- RLS rejection and a 500 "Database error saving new user".
-- Solution: Add a policy that permits insert when either the requesting role is the
-- internal service role OR the row matches auth.uid(). This covers both direct client
-- inserts (if ever used) and trigger-based creation.

begin;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public'
      and tablename='profiles'
      and policyname='Insert profile from trigger'
  ) then
    create policy "Insert profile from trigger" on public.profiles
      for insert
      with check (auth.uid() = id OR auth.role() = 'service_role');
  end if;
end$$;

commit;
