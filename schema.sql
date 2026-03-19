-- DHL Training Simulator — Supabase Schema
-- Run this entire file in your Supabase project: Dashboard → SQL Editor → New Query → Paste → Run

-- ─────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  role text default 'employee' check (role in ('employee', 'manager')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Managers can read all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'manager'
    )
  );

create policy "Service role can insert profiles"
  on profiles for insert
  with check (true);

-- ─────────────────────────────────────────
-- SCENARIO ATTEMPTS
-- ─────────────────────────────────────────
create table if not exists scenario_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  scenario_id text not null,
  npc_name text not null,
  score integer not null,
  total_fields integer not null,
  correct_fields integer not null,
  time_spent integer not null,
  xp_earned integer not null default 0,
  bonus_xp integer not null default 0,
  difficulty text,
  created_at timestamptz default now()
);

alter table scenario_attempts enable row level security;

create policy "Users can insert own scenario attempts"
  on scenario_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can read own scenario attempts"
  on scenario_attempts for select
  using (auth.uid() = user_id);

create policy "Managers can read all scenario attempts"
  on scenario_attempts for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- ─────────────────────────────────────────
-- FIELD RESULTS (per scenario attempt)
-- ─────────────────────────────────────────
create table if not exists field_results (
  id uuid default gen_random_uuid() primary key,
  attempt_id uuid references scenario_attempts(id) on delete cascade not null,
  field text not null,
  label text not null,
  user_value text,
  correct_value text not null,
  is_correct boolean not null
);

alter table field_results enable row level security;

create policy "Users can insert own field results"
  on field_results for insert
  with check (
    exists (
      select 1 from scenario_attempts
      where id = attempt_id and user_id = auth.uid()
    )
  );

create policy "Users can read own field results"
  on field_results for select
  using (
    exists (
      select 1 from scenario_attempts
      where id = attempt_id and user_id = auth.uid()
    )
  );

create policy "Managers can read all field results"
  on field_results for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- ─────────────────────────────────────────
-- QUIZ ATTEMPTS
-- ─────────────────────────────────────────
create table if not exists quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  score integer not null,
  total_questions integer not null,
  correct_answers integer not null,
  time_spent integer not null,
  question_results jsonb default '[]',
  created_at timestamptz default now()
);

alter table quiz_attempts enable row level security;

create policy "Users can insert own quiz attempts"
  on quiz_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can read own quiz attempts"
  on quiz_attempts for select
  using (auth.uid() = user_id);

create policy "Managers can read all quiz attempts"
  on quiz_attempts for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- ─────────────────────────────────────────
-- CREATE YOUR MANAGER ACCOUNT
-- Run this AFTER creating your auth user in Supabase Dashboard
-- Replace 'YOUR-USER-ID-HERE' with your actual user UUID from auth.users
-- ─────────────────────────────────────────
-- insert into profiles (id, username, display_name, role)
-- values ('YOUR-USER-ID-HERE', 'manager', 'Manager', 'manager');
