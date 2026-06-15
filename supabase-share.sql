-- Globe — Share trip feature
-- Run in Supabase SQL Editor

-- Add sharing columns to trips
alter table public.trips add column if not exists is_public boolean default false;
alter table public.trips add column if not exists public_slug text;

create unique index if not exists trips_public_slug_idx
  on public.trips(public_slug) where public_slug is not null;

-- Allow unauthenticated users to read public trips
drop policy if exists "trips_select" on public.trips;
create policy "trips_select" on public.trips for select using (
  auth.uid() = user_id or is_public = true
);

-- Allow reading memories that belong to public trips (for share view)
drop policy if exists "memories_select" on public.memories;
create policy "memories_select" on public.memories for select using (
  auth.uid() = user_id
  or exists (
    select 1 from public.trips
    where trips.id = memories.trip_id and trips.is_public = true
  )
);
