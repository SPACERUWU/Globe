-- ============================================================
-- Globe — Travel Memory App · Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ── TRIPS ────────────────────────────────────────────────────
create table if not exists public.trips (
  id              uuid        default gen_random_uuid() primary key,
  user_id         uuid        references auth.users not null,
  title           text        not null,
  country_name    text        not null,
  country_code    text        not null,  -- ISO alpha-2 e.g. "JP"
  country_geo     text        not null,  -- world-atlas name e.g. "Japan"
  city            text,
  start_date      date,
  end_date        date,
  description     text,
  created_at      timestamptz default now()
);

create index if not exists trips_user_id_idx on public.trips(user_id);

-- ── MEMORIES ─────────────────────────────────────────────────
create table if not exists public.memories (
  id              uuid        default gen_random_uuid() primary key,
  trip_id         uuid        references public.trips(id) on delete cascade not null,
  user_id         uuid        references auth.users not null,
  caption         text,
  photo_url       text,
  location_name   text,
  memory_date     date,
  category        text        default 'moment',  -- place | moment | food | people
  created_at      timestamptz default now()
);

create index if not exists memories_trip_id_idx  on public.memories(trip_id);
create index if not exists memories_user_id_idx  on public.memories(user_id);

-- ── ROW-LEVEL SECURITY ───────────────────────────────────────
alter table public.trips    enable row level security;
alter table public.memories enable row level security;

-- Trips: full access to owner only
create policy "trips_select" on public.trips for select using (auth.uid() = user_id);
create policy "trips_insert" on public.trips for insert with check (auth.uid() = user_id);
create policy "trips_update" on public.trips for update using (auth.uid() = user_id);
create policy "trips_delete" on public.trips for delete using (auth.uid() = user_id);

-- Memories: full access to owner only
create policy "memories_select" on public.memories for select using (auth.uid() = user_id);
create policy "memories_insert" on public.memories for insert with check (auth.uid() = user_id);
create policy "memories_update" on public.memories for update using (auth.uid() = user_id);
create policy "memories_delete" on public.memories for delete using (auth.uid() = user_id);

-- ── STORAGE BUCKET ───────────────────────────────────────────
-- Run separately if needed:
insert into storage.buckets (id, name, public)
values ('memories', 'memories', true)
on conflict do nothing;

create policy "memories_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'memories');

create policy "memories_read" on storage.objects
  for select using (bucket_id = 'memories');

create policy "memories_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'memories' and (storage.foldername(name))[1] = auth.uid()::text);
