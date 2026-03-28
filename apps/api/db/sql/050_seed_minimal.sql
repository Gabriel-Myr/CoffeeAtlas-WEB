-- Minimal sample seed for local development (idempotent).
with source_row as (
  insert into public.sources (source_type, source_name, source_url, owner_label)
  values ('MANUAL', 'internal-seed', null, 'platform-admin')
  on conflict (source_type, source_name) do update set owner_label = excluded.owner_label
  returning id
), roaster_upsert as (
  insert into public.roasters (name, city, country_code, description, is_public)
  select 'Captain George', 'Guiyang', 'CN', 'Specialty roaster seed entry', true
  where not exists (
    select 1 from public.roasters r where lower(r.name) = lower('Captain George')
  )
  returning id
), roaster_row as (
  select id from roaster_upsert
  union all
  select r.id from public.roasters r where lower(r.name) = lower('Captain George') limit 1
), bean_upsert as (
  insert into public.beans (canonical_name, origin_country, origin_region, process_method, variety, flavor_tags, is_public)
  select 'Ethiopia Yirgacheffe G1', 'Ethiopia', 'Yirgacheffe', 'Washed', 'Heirloom', array['jasmine', 'lemon'], true
  where not exists (
    select 1 from public.beans b where lower(b.canonical_name) = lower('Ethiopia Yirgacheffe G1')
  )
  returning id
), bean_row as (
  select id from bean_upsert
  union all
  select b.id from public.beans b where lower(b.canonical_name) = lower('Ethiopia Yirgacheffe G1') limit 1
)
insert into public.roaster_beans (
  roaster_id,
  bean_id,
  source_id,
  display_name,
  roast_level,
  price_amount,
  price_currency,
  is_in_stock,
  status
)
select
  (select id from roaster_row),
  (select id from bean_row),
  (select id from source_row),
  'Black Cat Blend - Ethiopia Lot',
  'Light',
  128,
  'CNY',
  true,
  'ACTIVE'
where not exists (
  select 1
  from public.roaster_beans rb
  where rb.roaster_id = (select id from roaster_row)
    and rb.bean_id = (select id from bean_row)
    and rb.display_name = 'Black Cat Blend - Ethiopia Lot'
);
