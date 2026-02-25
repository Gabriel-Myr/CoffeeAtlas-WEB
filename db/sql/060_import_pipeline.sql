-- Import staging table (API writes here first, then SQL function upserts canonical tables).
create table if not exists public.staging_catalog_rows (
  id bigserial primary key,
  import_job_id uuid not null references public.import_jobs(id) on delete cascade,
  row_number int not null,
  roaster_name text not null,
  roaster_city text,
  roaster_country_code char(2),
  bean_name text not null,
  origin_country text,
  origin_region text,
  process_method text,
  variety text,
  display_name text not null,
  roast_level text,
  price_amount numeric(10, 2),
  price_currency char(3) not null default 'CNY',
  is_in_stock boolean not null default true,
  status publish_status not null default 'DRAFT',
  product_url text,
  flavor_tags text[] not null default '{}',
  source_url text,
  processed boolean not null default false,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  unique (import_job_id, row_number)
);

create index if not exists idx_staging_catalog_rows_job_processed
  on public.staging_catalog_rows (import_job_id, processed);

create index if not exists idx_staging_catalog_rows_job_errors
  on public.staging_catalog_rows (import_job_id)
  where error_message is not null;

alter table public.staging_catalog_rows enable row level security;

drop policy if exists staging_catalog_rows_admin_all on public.staging_catalog_rows;
create policy staging_catalog_rows_admin_all
on public.staging_catalog_rows
for all
to authenticated
using (public.has_platform_role(array['admin', 'editor']))
with check (public.has_platform_role(array['admin', 'editor']));

create or replace function public.process_staging_import(
  p_job_id uuid,
  p_source_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted_roasters int := 0;
  v_inserted_beans int := 0;
  v_inserted_roaster_beans int := 0;
  v_updated_roaster_beans int := 0;
  v_processed_rows int := 0;
  v_error_rows int := 0;
begin
  update public.import_jobs
  set status = 'RUNNING',
      started_at = coalesce(started_at, now())
  where id = p_job_id;

  if not found then
    raise exception 'import_job % not found', p_job_id;
  end if;

  -- Required field validation.
  update public.staging_catalog_rows
  set error_message = 'Missing required fields: roaster_name, bean_name, or display_name',
      processed = true,
      processed_at = now()
  where import_job_id = p_job_id
    and processed = false
    and (
      coalesce(btrim(roaster_name), '') = ''
      or coalesce(btrim(bean_name), '') = ''
      or coalesce(btrim(display_name), '') = ''
    );

  get diagnostics v_error_rows = row_count;

  -- Insert missing roasters by case-insensitive name.
  with src as (
    select distinct
      btrim(roaster_name) as roaster_name,
      nullif(btrim(roaster_city), '') as roaster_city,
      case
        when nullif(btrim(roaster_country_code), '') is null then null
        else upper(btrim(roaster_country_code))::char(2)
      end as roaster_country_code
    from public.staging_catalog_rows
    where import_job_id = p_job_id
      and processed = false
      and error_message is null
  ), ins as (
    insert into public.roasters (name, city, country_code, is_public)
    select
      s.roaster_name,
      s.roaster_city,
      s.roaster_country_code,
      true
    from src s
    where not exists (
      select 1
      from public.roasters r
      where lower(r.name) = lower(s.roaster_name)
    )
    returning id
  )
  select count(*) into v_inserted_roasters from ins;

  -- Insert missing canonical beans by case-insensitive canonical name.
  with src as (
    select distinct
      btrim(bean_name) as bean_name,
      nullif(btrim(origin_country), '') as origin_country,
      nullif(btrim(origin_region), '') as origin_region,
      nullif(btrim(process_method), '') as process_method,
      nullif(btrim(variety), '') as variety,
      case
        when flavor_tags is null then '{}'::text[]
        else flavor_tags
      end as flavor_tags
    from public.staging_catalog_rows
    where import_job_id = p_job_id
      and processed = false
      and error_message is null
  ), ins as (
    insert into public.beans (
      canonical_name,
      origin_country,
      origin_region,
      process_method,
      variety,
      flavor_tags,
      is_public
    )
    select
      s.bean_name,
      s.origin_country,
      s.origin_region,
      s.process_method,
      s.variety,
      s.flavor_tags,
      true
    from src s
    where not exists (
      select 1
      from public.beans b
      where lower(b.canonical_name) = lower(s.bean_name)
    )
    returning id
  )
  select count(*) into v_inserted_beans from ins;

  -- Insert new roaster_beans rows.
  with normalized as (
    select
      s.id as staging_id,
      r.id as roaster_id,
      b.id as bean_id,
      btrim(s.display_name) as display_name,
      nullif(btrim(s.roast_level), '') as roast_level,
      s.price_amount,
      left(upper(coalesce(nullif(btrim(s.price_currency), ''), 'CNY')), 3)::char(3) as price_currency,
      nullif(btrim(s.product_url), '') as product_url,
      coalesce(s.is_in_stock, true) as is_in_stock,
      coalesce(s.status, 'DRAFT'::publish_status) as status,
      p_source_id as source_id
    from public.staging_catalog_rows s
    join lateral (
      select r0.id
      from public.roasters r0
      where lower(r0.name) = lower(btrim(s.roaster_name))
      order by r0.created_at asc
      limit 1
    ) r on true
    join lateral (
      select b0.id
      from public.beans b0
      where lower(b0.canonical_name) = lower(btrim(s.bean_name))
      order by b0.created_at asc
      limit 1
    ) b on true
    where s.import_job_id = p_job_id
      and s.processed = false
      and s.error_message is null
  ), ins as (
    insert into public.roaster_beans (
      roaster_id,
      bean_id,
      source_id,
      display_name,
      roast_level,
      price_amount,
      price_currency,
      product_url,
      is_in_stock,
      status
    )
    select
      n.roaster_id,
      n.bean_id,
      n.source_id,
      n.display_name,
      n.roast_level,
      n.price_amount,
      n.price_currency,
      n.product_url,
      n.is_in_stock,
      n.status
    from normalized n
    where not exists (
      select 1
      from public.roaster_beans rb
      where rb.roaster_id = n.roaster_id
        and rb.bean_id = n.bean_id
        and lower(rb.display_name) = lower(n.display_name)
    )
    returning id
  )
  select count(*) into v_inserted_roaster_beans from ins;

  -- Update existing roaster_beans rows only when values changed.
  with normalized as (
    select
      s.id as staging_id,
      r.id as roaster_id,
      b.id as bean_id,
      btrim(s.display_name) as display_name,
      nullif(btrim(s.roast_level), '') as roast_level,
      s.price_amount,
      left(upper(coalesce(nullif(btrim(s.price_currency), ''), 'CNY')), 3)::char(3) as price_currency,
      nullif(btrim(s.product_url), '') as product_url,
      coalesce(s.is_in_stock, true) as is_in_stock,
      coalesce(s.status, 'DRAFT'::publish_status) as status,
      p_source_id as source_id
    from public.staging_catalog_rows s
    join lateral (
      select r0.id
      from public.roasters r0
      where lower(r0.name) = lower(btrim(s.roaster_name))
      order by r0.created_at asc
      limit 1
    ) r on true
    join lateral (
      select b0.id
      from public.beans b0
      where lower(b0.canonical_name) = lower(btrim(s.bean_name))
      order by b0.created_at asc
      limit 1
    ) b on true
    where s.import_job_id = p_job_id
      and s.processed = false
      and s.error_message is null
  )
  update public.roaster_beans rb
  set
    source_id = coalesce(rb.source_id, n.source_id),
    roast_level = n.roast_level,
    price_amount = n.price_amount,
    price_currency = n.price_currency,
    product_url = n.product_url,
    is_in_stock = n.is_in_stock,
    status = n.status,
    updated_at = now()
  from normalized n
  where rb.roaster_id = n.roaster_id
    and rb.bean_id = n.bean_id
    and lower(rb.display_name) = lower(n.display_name)
    and (
      rb.roast_level is distinct from n.roast_level
      or rb.price_amount is distinct from n.price_amount
      or rb.price_currency is distinct from n.price_currency
      or rb.product_url is distinct from n.product_url
      or rb.is_in_stock is distinct from n.is_in_stock
      or rb.status is distinct from n.status
      or (rb.source_id is null and n.source_id is not null)
    );

  get diagnostics v_updated_roaster_beans = row_count;

  -- Mark successful staging rows.
  update public.staging_catalog_rows
  set processed = true,
      processed_at = now()
  where import_job_id = p_job_id
    and processed = false
    and error_message is null;

  get diagnostics v_processed_rows = row_count;

  insert into public.ingestion_events (
    import_job_id,
    source_id,
    entity_type,
    action,
    payload
  )
  values (
    p_job_id,
    p_source_id,
    'ROASTER_BEAN',
    'UPSERT',
    jsonb_build_object(
      'inserted_roasters', v_inserted_roasters,
      'inserted_beans', v_inserted_beans,
      'inserted_roaster_beans', v_inserted_roaster_beans,
      'updated_roaster_beans', v_updated_roaster_beans,
      'processed_rows', v_processed_rows,
      'error_rows', v_error_rows
    )
  );

  update public.import_jobs
  set
    status = case when v_error_rows > 0 then 'PARTIAL' else 'SUCCEEDED' end,
    error_count = v_error_rows,
    completed_at = now(),
    summary = coalesce(summary, '{}'::jsonb) || jsonb_build_object(
      'inserted_roasters', v_inserted_roasters,
      'inserted_beans', v_inserted_beans,
      'inserted_roaster_beans', v_inserted_roaster_beans,
      'updated_roaster_beans', v_updated_roaster_beans,
      'processed_rows', v_processed_rows,
      'error_rows', v_error_rows
    )
  where id = p_job_id;

  return jsonb_build_object(
    'insertedRoasters', v_inserted_roasters,
    'insertedBeans', v_inserted_beans,
    'insertedRoasterBeans', v_inserted_roaster_beans,
    'updatedRoasterBeans', v_updated_roaster_beans,
    'processedRows', v_processed_rows,
    'errorRows', v_error_rows
  );
exception
  when others then
    update public.import_jobs
    set
      status = 'FAILED',
      completed_at = now(),
      summary = coalesce(summary, '{}'::jsonb) || jsonb_build_object('error', sqlerrm)
    where id = p_job_id;

    raise;
end;
$$;
