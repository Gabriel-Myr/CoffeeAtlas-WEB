begin;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  wechat_openid text not null unique,
  wechat_unionid text,
  nickname text,
  avatar_url text,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  target_type text not null check (target_type in ('bean', 'roaster')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create trigger trg_app_users_updated_at
before update on public.app_users
for each row execute function public.set_updated_at();

create trigger trg_user_favorites_updated_at
before update on public.user_favorites
for each row execute function public.set_updated_at();

create index if not exists idx_app_users_openid on public.app_users (wechat_openid);
create index if not exists idx_user_favorites_user_created on public.user_favorites (user_id, created_at desc);
create index if not exists idx_user_favorites_target on public.user_favorites (target_type, target_id);

alter table public.app_users enable row level security;
alter table public.user_favorites enable row level security;

commit;
