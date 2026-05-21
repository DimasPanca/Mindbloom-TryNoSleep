-- ============================================================
-- MindBloom — Initial Schema
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. profiles
-- ────────────────────────────────────────────────────────────

create table public.profiles (
  id         uuid        primary key references auth.users (id) on delete cascade,
  name       text        not null,
  age        int         check (age >= 15 and age <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: owner select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: owner insert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles: owner delete"
  on public.profiles for delete
  using (auth.uid() = id);

-- ────────────────────────────────────────────────────────────
-- 2. screenings
-- ────────────────────────────────────────────────────────────

create table public.screenings (
  id                   uuid        primary key default gen_random_uuid(),
  user_id              uuid        not null references public.profiles (id) on delete cascade,
  fuzzy_score          float       check (fuzzy_score >= 0 and fuzzy_score <= 100),
  severity             text        not null check (severity in ('normal','ringan','sedang','berat')),
  factor_scores        jsonb,
  membership_degrees   jsonb,
  answers              jsonb,
  screening_type       text        not null default 'initial' check (screening_type in ('initial','retest')),
  parent_screening_id  uuid        references public.screenings (id) on delete set null,
  self_harm_flag       boolean     not null default false,
  created_at           timestamptz not null default now()
);

alter table public.screenings enable row level security;

create policy "screenings: owner select"
  on public.screenings for select
  using (auth.uid() = user_id);

create policy "screenings: owner insert"
  on public.screenings for insert
  with check (auth.uid() = user_id);

create policy "screenings: owner update"
  on public.screenings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "screenings: owner delete"
  on public.screenings for delete
  using (auth.uid() = user_id);

create index ix_screenings_user_created
  on public.screenings (user_id, created_at desc);

-- ────────────────────────────────────────────────────────────
-- 3. interventions
-- ────────────────────────────────────────────────────────────

create table public.interventions (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references public.profiles (id) on delete cascade,
  screening_id  uuid        not null references public.screenings (id) on delete cascade,
  type          text        not null check (type in ('music','video','journal')),
  notes         text,
  created_at    timestamptz not null default now()
);

alter table public.interventions enable row level security;

create policy "interventions: owner select"
  on public.interventions for select
  using (auth.uid() = user_id);

create policy "interventions: owner insert"
  on public.interventions for insert
  with check (auth.uid() = user_id);

create policy "interventions: owner update"
  on public.interventions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "interventions: owner delete"
  on public.interventions for delete
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 4. journal_entries
-- ────────────────────────────────────────────────────────────

create table public.journal_entries (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references public.profiles (id) on delete cascade,
  screening_id  uuid        references public.screenings (id) on delete set null,
  content       text        not null,
  created_at    timestamptz not null default now()
);

alter table public.journal_entries enable row level security;

create policy "journal_entries: owner select"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "journal_entries: owner insert"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "journal_entries: owner update"
  on public.journal_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "journal_entries: owner delete"
  on public.journal_entries for delete
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 5. mood_checkins
-- ────────────────────────────────────────────────────────────

create table public.mood_checkins (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles (id) on delete cascade,
  mood       text        not null check (mood in ('buruk','kurang','biasa','baik','sangat_baik')),
  created_at timestamptz not null default now()
);

alter table public.mood_checkins enable row level security;

create policy "mood_checkins: owner select"
  on public.mood_checkins for select
  using (auth.uid() = user_id);

create policy "mood_checkins: owner insert"
  on public.mood_checkins for insert
  with check (auth.uid() = user_id);

create policy "mood_checkins: owner update"
  on public.mood_checkins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mood_checkins: owner delete"
  on public.mood_checkins for delete
  using (auth.uid() = user_id);

create index ix_mood_checkins_user_created
  on public.mood_checkins (user_id, created_at desc);

-- ────────────────────────────────────────────────────────────
-- Trigger: auto-create profile on auth.users insert
-- ────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- Trigger: keep profiles.updated_at current
-- ────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
