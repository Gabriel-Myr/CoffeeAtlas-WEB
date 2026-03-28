begin;

create table if not exists public.roaster_source_bindings (
  id uuid primary key default gen_random_uuid(),
  roaster_id uuid not null references public.roasters(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  canonical_shop_url text not null,
  canonical_shop_name text not null,
  search_keyword text,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (roaster_id, source_id)
);

alter table public.roaster_beans
add column if not exists source_item_id text,
add column if not exists source_sku_id text;

drop trigger if exists trg_roaster_source_bindings_updated_at on public.roaster_source_bindings;
create trigger trg_roaster_source_bindings_updated_at
before update on public.roaster_source_bindings
for each row execute function public.set_updated_at();

create index if not exists idx_roaster_source_bindings_roaster_id on public.roaster_source_bindings (roaster_id);
create index if not exists idx_roaster_source_bindings_source_id on public.roaster_source_bindings (source_id);
create index if not exists idx_roaster_source_bindings_active_sync on public.roaster_source_bindings (is_active, last_synced_at desc);
create unique index if not exists idx_roaster_beans_source_identity_unique
on public.roaster_beans (source_id, source_item_id, coalesce(source_sku_id, ''))
where source_id is not null and source_item_id is not null;

alter table public.roaster_source_bindings enable row level security;

drop policy if exists roaster_source_bindings_admin_all on public.roaster_source_bindings;
create policy roaster_source_bindings_admin_all
on public.roaster_source_bindings
for all
to authenticated
using (public.has_platform_role(array['admin', 'editor']))
with check (public.has_platform_role(array['admin', 'editor']));

commit;
