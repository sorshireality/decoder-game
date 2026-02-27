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

alter table public.rooms
  drop constraint if exists rooms_mode_check;

alter table public.rooms
  add constraint rooms_mode_check check (mode in ('classic', 'plus_one', 'fog'));

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

-- PvP tables: strict participant-only access (auth-only PvP)
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.match_state enable row level security;

drop policy if exists "room_players_anon_all" on public.room_players;
drop policy if exists "rooms_auth_all" on public.rooms;
drop policy if exists "room_players_auth_all" on public.room_players;
drop policy if exists "match_state_auth_all" on public.match_state;

-- ROOMS
drop policy if exists "rooms_select_participant" on public.rooms;
create policy "rooms_select_participant" on public.rooms
for select to authenticated
using (host_player_id = auth.uid()::text or guest_player_id = auth.uid()::text);

drop policy if exists "rooms_insert_host_self" on public.rooms;
create policy "rooms_insert_host_self" on public.rooms
for insert to authenticated
with check (host_player_id = auth.uid()::text and guest_player_id is null);

drop policy if exists "rooms_update_participant" on public.rooms;
create policy "rooms_update_participant" on public.rooms
for update to authenticated
using (host_player_id = auth.uid()::text or guest_player_id = auth.uid()::text)
with check (host_player_id = auth.uid()::text or guest_player_id = auth.uid()::text);

drop policy if exists "rooms_join_waiting_as_guest" on public.rooms;
create policy "rooms_join_waiting_as_guest" on public.rooms
for update to authenticated
using (
  status = 'waiting_for_opponent'
  and guest_player_id is null
  and host_player_id <> auth.uid()::text
)
with check (guest_player_id = auth.uid()::text);

drop policy if exists "rooms_delete_host_only" on public.rooms;
create policy "rooms_delete_host_only" on public.rooms
for delete to authenticated
using (host_player_id = auth.uid()::text);

-- ROOM_PLAYERS
drop policy if exists "room_players_select_participant" on public.room_players;
create policy "room_players_select_participant" on public.room_players
for select to authenticated
using (
  exists (
    select 1 from public.rooms r
    where r.id = room_players.room_id
      and (r.host_player_id = auth.uid()::text or r.guest_player_id = auth.uid()::text)
  )
);

drop policy if exists "room_players_insert_self" on public.room_players;
create policy "room_players_insert_self" on public.room_players
for insert to authenticated
with check (
  user_id = auth.uid()
  and player_id = auth.uid()::text
  and exists (
    select 1 from public.rooms r
    where r.id = room_players.room_id
      and (r.host_player_id = auth.uid()::text or r.guest_player_id = auth.uid()::text)
  )
);

drop policy if exists "room_players_update_self" on public.room_players;
create policy "room_players_update_self" on public.room_players
for update to authenticated
using (user_id = auth.uid() and player_id = auth.uid()::text)
with check (user_id = auth.uid() and player_id = auth.uid()::text);

drop policy if exists "room_players_delete_self" on public.room_players;
create policy "room_players_delete_self" on public.room_players
for delete to authenticated
using (user_id = auth.uid() and player_id = auth.uid()::text);

-- MATCH_STATE
drop policy if exists "match_state_select_participant" on public.match_state;
create policy "match_state_select_participant" on public.match_state
for select to authenticated
using (
  exists (
    select 1 from public.rooms r
    where r.id = match_state.room_id
      and (r.host_player_id = auth.uid()::text or r.guest_player_id = auth.uid()::text)
  )
);

drop policy if exists "match_state_insert_host_only" on public.match_state;
create policy "match_state_insert_host_only" on public.match_state
for insert to authenticated
with check (
  exists (
    select 1 from public.rooms r
    where r.id = match_state.room_id
      and r.host_player_id = auth.uid()::text
  )
);

drop policy if exists "match_state_update_participant" on public.match_state;
create policy "match_state_update_participant" on public.match_state
for update to authenticated
using (
  exists (
    select 1 from public.rooms r
    where r.id = match_state.room_id
      and (r.host_player_id = auth.uid()::text or r.guest_player_id = auth.uid()::text)
  )
)
with check (
  exists (
    select 1 from public.rooms r
    where r.id = match_state.room_id
      and (r.host_player_id = auth.uid()::text or r.guest_player_id = auth.uid()::text)
  )
);
