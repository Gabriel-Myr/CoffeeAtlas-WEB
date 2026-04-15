-- Add the user_badge_progress table to existing Supabase projects.
-- Safe to run multiple times.

begin;

create table if not exists public.user_badge_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  badge_id text not null check (btrim(badge_id) <> ''),
  unlocked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

drop trigger if exists trg_user_badge_progress_updated_at on public.user_badge_progress;
create trigger trg_user_badge_progress_updated_at
before update on public.user_badge_progress
for each row execute function public.set_updated_at();

create index if not exists idx_user_badge_progress_user_unlocked on public.user_badge_progress (user_id, unlocked_at desc);
create index if not exists idx_user_badge_progress_badge_id on public.user_badge_progress (badge_id);

alter table public.user_badge_progress enable row level security;

commit;
