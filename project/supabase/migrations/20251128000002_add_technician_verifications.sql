-- Migration: Add technician identity verification table
-- Stores DNI information (front/back), selfie, and verification status with processing metadata

begin;

create table if not exists public.technician_verifications (
  id uuid primary key default gen_random_uuid(),
  technician_id uuid not null references public.technician_profiles(id) on delete cascade,
  dni_number text not null,
  verification_status text default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add new columns if upgrading from earlier schema
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'technician_verifications' and column_name = 'dni_front_url'
  ) then
    alter table public.technician_verifications add column dni_front_url text;
  end if;
  
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'technician_verifications' and column_name = 'dni_back_url'
  ) then
    alter table public.technician_verifications add column dni_back_url text;
  end if;
  
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'technician_verifications' and column_name = 'selfie_url'
  ) then
    alter table public.technician_verifications add column selfie_url text;
  end if;
  
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'technician_verifications' and column_name = 'ocr_data'
  ) then
    alter table public.technician_verifications add column ocr_data jsonb;
  end if;
  
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'technician_verifications' and column_name = 'face_match_score'
  ) then
    alter table public.technician_verifications add column face_match_score decimal(5,2);
  end if;
  
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'technician_verifications' and column_name = 'liveness_score'
  ) then
    alter table public.technician_verifications add column liveness_score decimal(5,2);
  end if;
  
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'technician_verifications' and column_name = 'processing_status'
  ) then
    alter table public.technician_verifications add column processing_status text default 'pending' check (processing_status in ('pending','processing','completed','failed'));
  end if;
  
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'technician_verifications' and column_name = 'verification_notes'
  ) then
    alter table public.technician_verifications add column verification_notes text;
  end if;
  
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'technician_verifications' and column_name = 'failure_reason'
  ) then
    alter table public.technician_verifications add column failure_reason text;
  end if;
  
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'technician_verifications' and column_name = 'verified_at'
  ) then
    alter table public.technician_verifications add column verified_at timestamptz;
  end if;
  
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'technician_verifications' and column_name = 'verified_by'
  ) then
    alter table public.technician_verifications add column verified_by uuid references auth.users(id);
  end if;
  
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'technician_verifications' and column_name = 'consent_given_at'
  ) then
    alter table public.technician_verifications add column consent_given_at timestamptz default now();
  end if;
  
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'technician_verifications' and column_name = 'auto_approved'
  ) then
    alter table public.technician_verifications add column auto_approved boolean default false;
  end if;
end $$;

-- Create indexes
create index if not exists idx_technician_verifications_technician on public.technician_verifications(technician_id);
create index if not exists idx_technician_verifications_status on public.technician_verifications(verification_status);
create index if not exists idx_technician_verifications_submitted on public.technician_verifications(submitted_at desc);

-- Create index on processing_status only if column exists
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='technician_verifications' and column_name='processing_status'
  ) then
    create index if not exists idx_technician_verifications_processing on public.technician_verifications(processing_status);
  end if;
end $$;

-- Enable RLS
alter table public.technician_verifications enable row level security;

-- RLS Policies
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' 
    and tablename='technician_verifications' 
    and policyname='Technicians can view own verification'
  ) then
    create policy "Technicians can view own verification" 
      on public.technician_verifications for select
      using (auth.uid() = technician_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' 
    and tablename='technician_verifications' 
    and policyname='Technicians can insert own verification'
  ) then
    create policy "Technicians can insert own verification"
      on public.technician_verifications for insert
      with check (auth.uid() = technician_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' 
    and tablename='technician_verifications' 
    and policyname='Technicians can update own verification'
  ) then
    create policy "Technicians can update own verification"
      on public.technician_verifications for update
      using (auth.uid() = technician_id);
  end if;
end $$;

-- Storage bucket for identity documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'identity-documents',
  'identity-documents',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/jpg']
)
on conflict (id) do nothing;

-- Storage policies: Users can only upload their own documents
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='storage' 
    and tablename='objects' 
    and policyname='Users can upload own identity documents'
  ) then
    create policy "Users can upload own identity documents"
      on storage.objects for insert
      with check (
        bucket_id = 'identity-documents' and
        (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='storage' 
    and tablename='objects' 
    and policyname='Users can view own identity documents'
  ) then
    create policy "Users can view own identity documents"
      on storage.objects for select
      using (
        bucket_id = 'identity-documents' and
        (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='storage' 
    and tablename='objects' 
    and policyname='Users can update own identity documents'
  ) then
    create policy "Users can update own identity documents"
      on storage.objects for update
      using (
        bucket_id = 'identity-documents' and
        (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='storage' 
    and tablename='objects' 
    and policyname='Users can delete own identity documents'
  ) then
    create policy "Users can delete own identity documents"
      on storage.objects for delete
      using (
        bucket_id = 'identity-documents' and
        (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

commit;
