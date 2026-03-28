-- Fix legacy Supabase projects where public.v_catalog_active is missing
-- process_method_raw / process_base / process_style.
--
-- Safe to run multiple times.

begin;

alter table public.beans
  add column if not exists process_method_raw text,
  add column if not exists process_base text,
  add column if not exists process_style text;

create or replace function public.normalize_bean_process_fields()
returns trigger
language plpgsql
as $$
declare
  normalized_raw text;
  source_text text;
begin
  normalized_raw := nullif(btrim(coalesce(new.process_method_raw, new.process_method)), '');
  new.process_method_raw := normalized_raw;
  source_text := lower(coalesce(normalized_raw, ''));

  if new.process_base is null or new.process_base not in ('washed', 'natural', 'honey', 'other') then
    if source_text ~ '(honey|蜜处理|密处理|黄蜜|红蜜|黑蜜)' then
      new.process_base := 'honey';
    elsif source_text ~ '(^|[^a-z])(washed|wash)([^a-z]|$)|水洗' then
      new.process_base := 'washed';
    elsif source_text ~ '(^|[^a-z])natural([^a-z]|$)|日晒|日曬|晒处理|曬處理' then
      new.process_base := 'natural';
    else
      new.process_base := 'other';
    end if;
  end if;

  if new.process_style is null or new.process_style not in ('traditional', 'anaerobic', 'yeast', 'carbonic_maceration', 'thermal_shock', 'other') then
    if source_text ~ 'thermal[[:space:]]*shock|热冲击|熱衝擊' then
      new.process_style := 'thermal_shock';
    elsif source_text ~ 'carbonic|二氧化碳' then
      new.process_style := 'carbonic_maceration';
    elsif source_text ~ 'yeast|酵母' then
      new.process_style := 'yeast';
    elsif source_text ~ 'anaerobic|厌氧|厭氧' then
      new.process_style := 'anaerobic';
    elsif new.process_base = 'other' then
      new.process_style := 'other';
    else
      new.process_style := 'traditional';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_beans_normalize_process on public.beans;

create trigger trg_beans_normalize_process
before insert or update of process_method, process_method_raw, process_base, process_style
on public.beans
for each row execute function public.normalize_bean_process_fields();

update public.beans
set
  process_method_raw = coalesce(nullif(btrim(process_method_raw), ''), nullif(btrim(process_method), '')),
  process_base = nullif(btrim(process_base), ''),
  process_style = nullif(btrim(process_style), '');

create index if not exists idx_beans_process_base_style on public.beans (process_base, process_style);

create or replace view public.v_catalog_active as
select
  rb.id as roaster_bean_id,
  r.id as roaster_id,
  r.name as roaster_name,
  r.city,
  b.id as bean_id,
  b.canonical_name as bean_name,
  b.origin_country,
  b.origin_region,
  b.farm,
  b.producer,
  b.process_method,
  b.variety,
  rb.display_name,
  rb.roast_level,
  rb.price_amount,
  rb.price_currency,
  rb.sales_count,
  rb.is_in_stock,
  rb.product_url,
  rb.image_url,
  rb.release_at,
  rb.updated_at,
  b.process_method_raw,
  b.process_base,
  b.process_style
from public.roaster_beans rb
join public.roasters r on r.id = rb.roaster_id
join public.beans b on b.id = rb.bean_id
where r.is_public = true
  and b.is_public = true
  and rb.status = 'ACTIVE';

create or replace view public.v_catalog_admin as
select
  rb.id as roaster_bean_id,
  rb.status,
  rb.is_in_stock,
  rb.display_name,
  rb.roast_level,
  rb.price_amount,
  rb.price_currency,
  rb.sales_count,
  rb.product_url,
  rb.image_url,
  rb.release_at,
  rb.retire_at,
  rb.created_at,
  rb.updated_at,
  r.id as roaster_id,
  r.name as roaster_name,
  r.city,
  r.country_code,
  b.id as bean_id,
  b.canonical_name as bean_name,
  b.origin_country,
  b.origin_region,
  b.farm,
  b.producer,
  b.process_method,
  b.variety,
  b.flavor_tags,
  s.source_type,
  s.source_name,
  s.source_url,
  b.process_method_raw,
  b.process_base,
  b.process_style
from public.roaster_beans rb
join public.roasters r on r.id = rb.roaster_id
join public.beans b on b.id = rb.bean_id
left join public.sources s on s.id = rb.source_id;

commit;

-- Verification 1: columns exist on beans.
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'beans'
  and column_name in ('process_method_raw', 'process_base', 'process_style')
order by column_name;

-- Verification 2: view exposes the new fields.
select *
from public.v_catalog_active
limit 1;

-- Verification 3: check backfilled values.
select
  process_method,
  process_method_raw,
  process_base,
  process_style
from public.beans
order by updated_at desc nulls last
limit 20;
