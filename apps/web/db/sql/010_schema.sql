-- Domain enums.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'publish_status') then
    create type publish_status as enum ('DRAFT', 'ACTIVE', 'ARCHIVED');
  end if;

  if not exists (select 1 from pg_type where typname = 'import_job_status') then
    create type import_job_status as enum ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'PARTIAL');
  end if;

  if not exists (select 1 from pg_type where typname = 'import_job_type') then
    create type import_job_type as enum ('XLSX_IMPORT', 'CSV_IMPORT', 'SCRAPE_SYNC', 'MANUAL_PATCH');
  end if;

  if not exists (select 1 from pg_type where typname = 'source_type') then
    create type source_type as enum ('MANUAL', 'OFFICIAL_SITE', 'ECOMMERCE', 'SOCIAL', 'IMPORT_FILE', 'OTHER');
  end if;

  if not exists (select 1 from pg_type where typname = 'change_request_status') then
    create type change_request_status as enum ('PENDING', 'APPROVED', 'REJECTED');
  end if;
end $$;

-- Shared trigger to keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  source_type source_type not null,
  source_name text not null,
  source_url text,
  owner_label text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, source_name)
);

create table if not exists public.roasters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  slug text unique,
  country_code char(2),
  city text,
  description text,
  website_url text,
  instagram_handle text,
  logo_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_tsv tsvector
);

create table if not exists public.beans (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null,
  canonical_name_en text,
  origin_country text,
  origin_region text,
  farm text,
  producer text,
  variety text,
  process_method text,
  altitude_min_m int check (altitude_min_m is null or altitude_min_m >= 0),
  altitude_max_m int check (altitude_max_m is null or altitude_max_m >= altitude_min_m),
  harvest_year smallint check (harvest_year is null or harvest_year between 1990 and 2100),
  flavor_tags text[] not null default '{}',
  notes text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_tsv tsvector
);

create table if not exists public.bean_aliases (
  id uuid primary key default gen_random_uuid(),
  bean_id uuid not null references public.beans(id) on delete cascade,
  alias text not null,
  alias_lang text not null default 'zh-CN',
  source_id uuid references public.sources(id) on delete set null,
  confidence numeric(3, 2) not null default 1.00 check (confidence >= 0 and confidence <= 1),
  created_at timestamptz not null default now(),
  unique(bean_id, alias, alias_lang)
);

create table if not exists public.roaster_beans (
  id uuid primary key default gen_random_uuid(),
  roaster_id uuid not null references public.roasters(id) on delete cascade,
  bean_id uuid not null references public.beans(id) on delete restrict,
  source_id uuid references public.sources(id) on delete set null,
  display_name text not null,
  roast_level text,
  price_amount numeric(10, 2) check (price_amount is null or price_amount >= 0),
  price_currency char(3) not null default 'CNY',
  sales_count int check (sales_count is null or sales_count >= 0),
  weight_grams int check (weight_grams is null or weight_grams > 0),
  product_url text,
  status publish_status not null default 'DRAFT',
  is_in_stock boolean not null default true,
  release_at timestamptz,
  retire_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_tsv tsvector,
  unique (roaster_id, bean_id, display_name)
);

create table if not exists public.price_snapshots (
  id bigserial primary key,
  roaster_bean_id uuid not null references public.roaster_beans(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  price_amount numeric(10, 2) not null check (price_amount >= 0),
  price_currency char(3) not null default 'CNY',
  captured_at timestamptz not null default now()
);

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type import_job_type not null,
  status import_job_status not null default 'PENDING',
  source_id uuid references public.sources(id) on delete set null,
  file_name text,
  file_url text,
  row_count int not null default 0,
  error_count int not null default 0,
  summary jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ingestion_events (
  id bigserial primary key,
  import_job_id uuid references public.import_jobs(id) on delete set null,
  source_id uuid references public.sources(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  check (entity_type in ('ROASTER', 'BEAN', 'ROASTER_BEAN', 'ALIAS')),
  check (action in ('INSERT', 'UPDATE', 'UPSERT', 'SKIP', 'ERROR'))
);

create table if not exists public.change_requests (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  proposed_patch jsonb not null,
  reason text,
  status change_request_status not null default 'PENDING',
  requested_by uuid,
  reviewer_id uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (entity_type in ('ROASTER', 'BEAN', 'ROASTER_BEAN', 'ALIAS'))
);

-- Search vector maintenance.
create or replace function public.update_roaster_search_tsv()
returns trigger
language plpgsql
as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('simple', coalesce(unaccent(new.name), '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(unaccent(new.name_en), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(unaccent(new.city), '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(unaccent(new.description), '')), 'D');
  return new;
end;
$$;

create or replace function public.update_bean_search_tsv()
returns trigger
language plpgsql
as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('simple', coalesce(unaccent(new.canonical_name), '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(unaccent(new.canonical_name_en), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(unaccent(new.origin_country), '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(unaccent(new.origin_region), '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(unaccent(new.variety), '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(unaccent(array_to_string(new.flavor_tags, ' ')), '')), 'D');
  return new;
end;
$$;

create or replace function public.update_roaster_bean_search_tsv()
returns trigger
language plpgsql
as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('simple', coalesce(unaccent(new.display_name), '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(unaccent(new.roast_level), '')), 'C');
  return new;
end;
$$;

-- Triggers.
drop trigger if exists trg_sources_updated_at on public.sources;
create trigger trg_sources_updated_at
before update on public.sources
for each row execute function public.set_updated_at();

drop trigger if exists trg_roasters_updated_at on public.roasters;
create trigger trg_roasters_updated_at
before update on public.roasters
for each row execute function public.set_updated_at();

drop trigger if exists trg_beans_updated_at on public.beans;
create trigger trg_beans_updated_at
before update on public.beans
for each row execute function public.set_updated_at();

drop trigger if exists trg_roaster_beans_updated_at on public.roaster_beans;
create trigger trg_roaster_beans_updated_at
before update on public.roaster_beans
for each row execute function public.set_updated_at();

drop trigger if exists trg_import_jobs_updated_at on public.import_jobs;
create trigger trg_import_jobs_updated_at
before update on public.import_jobs
for each row execute function public.set_updated_at();

drop trigger if exists trg_change_requests_updated_at on public.change_requests;
create trigger trg_change_requests_updated_at
before update on public.change_requests
for each row execute function public.set_updated_at();

drop trigger if exists trg_roasters_search_tsv on public.roasters;
create trigger trg_roasters_search_tsv
before insert or update of name, name_en, city, description on public.roasters
for each row execute function public.update_roaster_search_tsv();

drop trigger if exists trg_beans_search_tsv on public.beans;
create trigger trg_beans_search_tsv
before insert or update of canonical_name, canonical_name_en, origin_country, origin_region, variety, flavor_tags on public.beans
for each row execute function public.update_bean_search_tsv();

drop trigger if exists trg_roaster_beans_search_tsv on public.roaster_beans;
create trigger trg_roaster_beans_search_tsv
before insert or update of display_name, roast_level on public.roaster_beans
for each row execute function public.update_roaster_bean_search_tsv();
