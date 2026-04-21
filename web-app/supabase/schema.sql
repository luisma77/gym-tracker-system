create extension if not exists pgcrypto;

create table if not exists public.exercise_catalog (
  id bigint generated always as identity primary key,
  base text not null,
  variant text not null,
  kind text not null check (kind in ('disco', 'mancuerna', 'polea', 'peso_corporal')),
  excel_name text not null,
  muscle_group text not null,
  equipment text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (base, variant, kind)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  username text,
  full_name text,
  current_week integer not null default 1,
  block_type text not null default 'HIP' check (block_type in ('HIP', 'FUE')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  add column if not exists username text;

create unique index if not exists idx_profiles_username_unique
  on public.profiles (lower(username))
  where username is not null;

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  training_day text not null,
  week_number integer not null default 1,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.session_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id bigint not null references public.exercise_catalog (id),
  position integer not null,
  reps integer not null,
  rir integer not null,
  weight_kg numeric(8,2) not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  measured_at date not null default current_date,
  weight_kg numeric(6,2),
  body_fat_percent numeric(5,2),
  chest_cm numeric(6,2),
  waist_cm numeric(6,2),
  hip_cm numeric(6,2),
  arm_cm numeric(6,2),
  thigh_cm numeric(6,2),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_workout_sessions_user_created_at
  on public.workout_sessions (user_id, created_at desc);

create index if not exists idx_session_sets_session_position
  on public.session_sets (session_id, position);

create index if not exists idx_body_measurements_user_measured_at
  on public.body_measurements (user_id, measured_at desc);

alter table public.profiles enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.session_sets enable row level security;
alter table public.body_measurements enable row level security;
alter table public.exercise_catalog enable row level security;

create policy "exercise catalog readable by authenticated users"
on public.exercise_catalog
for select
to authenticated
using (true);

create policy "profiles readable by owner"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles insert by owner"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles update by owner"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.resolve_login_identifier(login_identifier text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_identifier text := lower(trim(login_identifier));
  resolved_email text;
begin
  if normalized_identifier is null or normalized_identifier = '' then
    return null;
  end if;

  if position('@' in normalized_identifier) > 0 then
    return normalized_identifier;
  end if;

  select email
  into resolved_email
  from public.profiles
  where lower(username) = normalized_identifier
  limit 1;

  return resolved_email;
end;
$$;

grant execute on function public.resolve_login_identifier(text) to anon, authenticated;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'No authenticated user found';
  end if;

  delete from auth.users
  where id = current_user_id;
end;
$$;

grant execute on function public.delete_my_account() to authenticated;

create policy "sessions owner all"
on public.workout_sessions
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "sets owner all"
on public.session_sets
for all
to authenticated
using (
  exists (
    select 1
    from public.workout_sessions ws
    where ws.id = session_id
      and ws.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workout_sessions ws
    where ws.id = session_id
      and ws.user_id = auth.uid()
  )
);

create policy "measurements owner all"
on public.body_measurements
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
