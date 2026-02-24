-- Google Auth + profile/progress + PvP nicknames support
-- Run in Supabase SQL Editor

-- 1) Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nickname text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Player progress (cloud save for main game)
create table if not exists public.player_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  unlocked_level integer not null default 1,
  has_ability boolean not null default false,
  lang text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Optional future score table (rating foundation)
create table if not exists public.player_scores (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rating_score integer not null default 0,
  main_game_score integer not null default 0,
  daily_score integer not null default 0,
  pvp_score integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 4) Extend PvP players rows
alter table public.room_players
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.room_players
  add column if not exists nickname text;

alter table public.match_state
  add column if not exists rematch_status text not null default 'idle'
  check (rematch_status in ('idle', 'pending', 'accepted', 'declined'));

alter table public.match_state
  add column if not exists rematch_requested_by text;

-- 5) updated_at trigger reuse
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_player_progress_updated_at on public.player_progress;
create trigger trg_player_progress_updated_at
before update on public.player_progress
for each row execute function public.set_updated_at();

drop trigger if exists trg_player_scores_updated_at on public.player_scores;
create trigger trg_player_scores_updated_at
before update on public.player_scores
for each row execute function public.set_updated_at();

-- 6) RLS
alter table public.profiles enable row level security;
alter table public.player_progress enable row level security;
alter table public.player_scores enable row level security;

-- Own profile/progress/score
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "progress_select_own" on public.player_progress;
create policy "progress_select_own" on public.player_progress
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "progress_upsert_own" on public.player_progress;
create policy "progress_upsert_own" on public.player_progress
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "scores_select_own" on public.player_scores;
create policy "scores_select_own" on public.player_scores
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "scores_upsert_own" on public.player_scores;
create policy "scores_upsert_own" on public.player_scores
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public read for leaderboard (Top 10)
drop policy if exists "profiles_public_select" on public.profiles;
create policy "profiles_public_select" on public.profiles
for select to anon, authenticated using (true);

drop policy if exists "scores_public_select" on public.player_scores;
create policy "scores_public_select" on public.player_scores
for select to anon, authenticated using (true);

-- PvP tables stay permissive for MVP guest/auth mixed mode (adjust later)
-- If not created earlier, these will fail; that's okay for existing setup only.
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.match_state enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'room_players' and policyname = 'room_players_anon_all'
  ) then
    create policy "room_players_anon_all" on public.room_players
    for all to anon using (true) with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'rooms' and policyname = 'rooms_auth_all'
  ) then
    create policy "rooms_auth_all" on public.rooms
    for all to authenticated using (true) with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'room_players' and policyname = 'room_players_auth_all'
  ) then
    create policy "room_players_auth_all" on public.room_players
    for all to authenticated using (true) with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'match_state' and policyname = 'match_state_auth_all'
  ) then
    create policy "match_state_auth_all" on public.match_state
    for all to authenticated using (true) with check (true);
  end if;
end $$;
