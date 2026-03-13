-- Schema migrations for Tech Mantra Judging System
-- Run these in your Supabase project's SQL editor.

-- 1) EVENTS: add rounds and track
alter table public.events
  add column if not exists rounds integer not null default 1,
  add column if not exists track text null;

-- 2) SCORES: add round_number
alter table public.scores
  add column if not exists round_number integer not null default 1;

-- 3) SCORING CRITERIA TABLE
create table if not exists public.scoring_criteria (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  max_score integer not null,
  sort_order integer not null default 1
);

create index if not exists scoring_criteria_event_id_idx
  on public.scoring_criteria (event_id, sort_order);

-- 4) EVENT COORDINATORS TABLE
create table if not exists public.event_coordinators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  username text not null unique,
  password text not null,
  event_ids uuid[] not null default '{}'::uuid[]
);

