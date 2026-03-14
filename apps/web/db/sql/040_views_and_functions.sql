-- Public active catalog view.
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
  rb.release_at,
  rb.updated_at
from public.roaster_beans rb
join public.roasters r on r.id = rb.roaster_id
join public.beans b on b.id = rb.bean_id
where r.is_public = true
  and b.is_public = true
  and rb.status = 'ACTIVE';

-- Admin-focused view with status and source details.
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
  s.source_url
from public.roaster_beans rb
join public.roasters r on r.id = rb.roaster_id
join public.beans b on b.id = rb.bean_id
left join public.sources s on s.id = rb.source_id;

-- Weighted search function for catalog page and API.
create or replace function public.search_catalog(
  p_query text,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  roaster_bean_id uuid,
  roaster_name text,
  city text,
  bean_name text,
  display_name text,
  process_method text,
  roast_level text,
  price_amount numeric,
  price_currency char(3),
  is_in_stock boolean,
  rank_score real
)
language plpgsql
stable
as $$
declare
  safe_limit int := greatest(1, least(coalesce(p_limit, 50), 200));
  safe_offset int := greatest(0, coalesce(p_offset, 0));
  q text := btrim(coalesce(p_query, ''));
begin
  if q = '' then
    return query
    select
      v.roaster_bean_id,
      v.roaster_name,
      v.city,
      v.bean_name,
      v.display_name,
      v.process_method,
      v.roast_level,
      v.price_amount,
      v.price_currency,
      v.is_in_stock,
      0::real as rank_score
    from public.v_catalog_active v
    order by v.updated_at desc
    limit safe_limit
    offset safe_offset;
  end if;

  return query
  with tsq as (
    select websearch_to_tsquery('simple', q) as query
  )
  select
    rb.id as roaster_bean_id,
    r.name as roaster_name,
    r.city,
    b.canonical_name as bean_name,
    rb.display_name,
    b.process_method,
    rb.roast_level,
    rb.price_amount,
    rb.price_currency,
    rb.is_in_stock,
    ts_rank_cd(
      coalesce(rb.search_tsv, ''::tsvector) ||
      coalesce(b.search_tsv, ''::tsvector) ||
      coalesce(r.search_tsv, ''::tsvector),
      tsq.query
    ) as rank_score
  from public.roaster_beans rb
  join public.roasters r on r.id = rb.roaster_id
  join public.beans b on b.id = rb.bean_id
  cross join tsq
  where rb.status = 'ACTIVE'
    and r.is_public = true
    and b.is_public = true
    and (
      (
        coalesce(rb.search_tsv, ''::tsvector) ||
        coalesce(b.search_tsv, ''::tsvector) ||
        coalesce(r.search_tsv, ''::tsvector)
      ) @@ tsq.query
      or similarity(rb.display_name, q) > 0.2
      or similarity(b.canonical_name, q) > 0.2
      or similarity(r.name, q) > 0.2
    )
  order by rank_score desc, rb.updated_at desc
  limit safe_limit
  offset safe_offset;
end;
$$;
