-- ============================================================================
-- CruceEP — initial schema
--
-- Tables: profiles, saved_routes, bridges, bridge_wait_snapshots, alerts,
--         cooling_centers, data_source_health
--
-- Security model:
--   * Row Level Security is enabled on every table.
--   * Public, non-sensitive reference data (bridges, alerts, cooling_centers,
--     bridge_wait_snapshots) is world-readable.
--   * saved_routes are private to their owner.
--   * Writes to admin-managed tables require the `admin` role (checked via the
--     profiles table). Server routes additionally use the service role key.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'es')),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Helper: is the current user an admin? (SECURITY DEFINER avoids RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- saved_routes
-- ---------------------------------------------------------------------------
create table if not exists public.saved_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  origin text not null,
  destination text not null,
  trip_type text,
  preferred_mode text,
  favorite_bridge text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_routes_user_id_idx on public.saved_routes (user_id);

create trigger saved_routes_set_updated_at
  before update on public.saved_routes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- bridges
-- ---------------------------------------------------------------------------
create table if not exists public.bridges (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  alternate_names text[] not null default '{}',
  city text,
  country_pair text,
  latitude numeric,
  longitude numeric,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger bridges_set_updated_at
  before update on public.bridges
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- bridge_wait_snapshots
-- ---------------------------------------------------------------------------
create table if not exists public.bridge_wait_snapshots (
  id uuid primary key default gen_random_uuid(),
  bridge_id uuid references public.bridges (id) on delete cascade,
  direction text,
  mode text,
  lane_type text,
  wait_minutes int,
  status text,
  source text,
  source_url text,
  confidence text,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists bridge_wait_snapshots_bridge_idx
  on public.bridge_wait_snapshots (bridge_id, observed_at desc);

-- ---------------------------------------------------------------------------
-- alerts
-- ---------------------------------------------------------------------------
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_es text not null,
  body_en text not null,
  body_es text not null,
  category text not null,
  severity text not null default 'info',
  affected_area text,
  source text not null,
  source_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists alerts_active_idx on public.alerts (active, updated_at desc);

create trigger alerts_set_updated_at
  before update on public.alerts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- cooling_centers
-- ---------------------------------------------------------------------------
create table if not exists public.cooling_centers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'cooling_center',
  address text not null,
  phone text,
  website text,
  hours_en text,
  hours_es text,
  latitude numeric,
  longitude numeric,
  source text not null,
  source_url text,
  last_verified_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cooling_centers_active_idx on public.cooling_centers (active);

create trigger cooling_centers_set_updated_at
  before update on public.cooling_centers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- data_source_health
-- ---------------------------------------------------------------------------
create table if not exists public.data_source_health (
  id uuid primary key default gen_random_uuid(),
  source_name text not null unique,
  status text not null default 'mock',
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger data_source_health_set_updated_at
  before update on public.data_source_health
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.saved_routes enable row level security;
alter table public.bridges enable row level security;
alter table public.bridge_wait_snapshots enable row level security;
alter table public.alerts enable row level security;
alter table public.cooling_centers enable row level security;
alter table public.data_source_health enable row level security;

-- profiles: owners read/update their own row; admins read all.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

-- saved_routes: fully private to the owner.
create policy "saved_routes_select_own" on public.saved_routes
  for select using (auth.uid() = user_id);
create policy "saved_routes_insert_own" on public.saved_routes
  for insert with check (auth.uid() = user_id);
create policy "saved_routes_update_own" on public.saved_routes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "saved_routes_delete_own" on public.saved_routes
  for delete using (auth.uid() = user_id);

-- bridges / snapshots: public read, admin write.
create policy "bridges_public_read" on public.bridges for select using (true);
create policy "bridges_admin_write" on public.bridges
  for all using (public.is_admin()) with check (public.is_admin());

create policy "snapshots_public_read" on public.bridge_wait_snapshots
  for select using (true);
create policy "snapshots_admin_write" on public.bridge_wait_snapshots
  for all using (public.is_admin()) with check (public.is_admin());

-- alerts: public read (active or admin), admin write.
create policy "alerts_public_read" on public.alerts
  for select using (active or public.is_admin());
create policy "alerts_admin_write" on public.alerts
  for all using (public.is_admin()) with check (public.is_admin());

-- cooling_centers: public read (active or admin), admin write.
create policy "cooling_centers_public_read" on public.cooling_centers
  for select using (active or public.is_admin());
create policy "cooling_centers_admin_write" on public.cooling_centers
  for all using (public.is_admin()) with check (public.is_admin());

-- data_source_health: admin read/write only.
create policy "dsh_admin_read" on public.data_source_health
  for select using (public.is_admin());
create policy "dsh_admin_write" on public.data_source_health
  for all using (public.is_admin()) with check (public.is_admin());
