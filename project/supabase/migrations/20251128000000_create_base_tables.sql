-- Migration: Create base tables for OficiosYa app
-- Creates: categories, technician_profiles, reviews, favorites, technician_images
-- Safe to re-run: uses IF NOT EXISTS

begin;

-- Categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  created_at timestamptz default now()
);

-- Technician profiles table
create table if not exists public.technician_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  description text,
  location text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  price_range text,
  whatsapp text,
  instagram text,
  facebook text,
  availability text default 'Disponible',
  is_approved boolean default false,
  is_featured boolean default false,
  average_rating decimal(3, 2) default 0,
  total_reviews integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Technician images table
create table if not exists public.technician_images (
  id uuid primary key default gen_random_uuid(),
  technician_id uuid not null references public.technician_profiles(id) on delete cascade,
  image_url text not null,
  caption text,
  order_index integer default 0,
  created_at timestamptz default now()
);

-- Reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  technician_id uuid not null references public.technician_profiles(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  is_approved boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Favorites table
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  technician_id uuid not null references public.technician_profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(client_id, technician_id)
);

-- Create indexes
create index if not exists idx_technician_profiles_category on public.technician_profiles(category_id);
create index if not exists idx_technician_profiles_approved on public.technician_profiles(is_approved);
create index if not exists idx_technician_profiles_location on public.technician_profiles(latitude, longitude);
create index if not exists idx_reviews_technician on public.reviews(technician_id);
create index if not exists idx_reviews_client on public.reviews(client_id);
create index if not exists idx_favorites_client on public.favorites(client_id);
create index if not exists idx_favorites_technician on public.favorites(technician_id);
create index if not exists idx_technician_images_technician on public.technician_images(technician_id);

-- Enable RLS
alter table public.categories enable row level security;
alter table public.technician_profiles enable row level security;
alter table public.technician_images enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;

-- Categories policies (public read)
create policy if not exists "Anyone can view categories"
  on public.categories for select
  using (true);

-- Technician profiles policies
create policy if not exists "Anyone can view approved technician profiles"
  on public.technician_profiles for select
  using (is_approved = true or auth.uid() = id);

create policy if not exists "Technicians can insert own profile"
  on public.technician_profiles for insert
  with check (auth.uid() = id);

create policy if not exists "Technicians can update own profile"
  on public.technician_profiles for update
  using (auth.uid() = id);

-- Technician images policies
create policy if not exists "Anyone can view technician images"
  on public.technician_images for select
  using (
    exists (
      select 1 from public.technician_profiles
      where id = technician_id and is_approved = true
    )
  );

create policy if not exists "Technicians can manage own images"
  on public.technician_images for all
  using (auth.uid() = technician_id);

-- Reviews policies
create policy if not exists "Anyone can view approved reviews"
  on public.reviews for select
  using (is_approved = true);

create policy if not exists "Clients can insert reviews"
  on public.reviews for insert
  with check (auth.uid() = client_id);

create policy if not exists "Clients can update own reviews"
  on public.reviews for update
  using (auth.uid() = client_id);

-- Favorites policies
create policy if not exists "Users can view own favorites"
  on public.favorites for select
  using (auth.uid() = client_id);

create policy if not exists "Users can insert own favorites"
  on public.favorites for insert
  with check (auth.uid() = client_id);

create policy if not exists "Users can delete own favorites"
  on public.favorites for delete
  using (auth.uid() = client_id);

commit;
