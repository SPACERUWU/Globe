-- ============================================================
-- Globe v2 — run this in Supabase SQL Editor AFTER supabase.sql
-- ============================================================

-- Add cover photo column to trips (idempotent)
alter table public.trips add column if not exists cover_photo_url text;

-- ── WISHLIST ──────────────────────────────────────────────
create table if not exists public.wishlist (
  id           uuid        default gen_random_uuid() primary key,
  user_id      uuid        references auth.users not null,
  country_name text        not null,
  country_code text        not null,
  country_geo  text        not null,
  note         text,
  created_at   timestamptz default now(),
  unique(user_id, country_code)
);

alter table public.wishlist enable row level security;

create policy "wishlist_all" on public.wishlist
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
