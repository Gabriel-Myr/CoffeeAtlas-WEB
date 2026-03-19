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
  rb.image_url,
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
  s.source_url
from public.roaster_beans rb
join public.roasters r on r.id = rb.roaster_id
join public.beans b on b.id = rb.bean_id
left join public.sources s on s.id = rb.source_id;

-- Weighted search helper and wrappers for catalog page and API.
create or replace function public.search_catalog_matches(
  p_query text
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
  rank_score real,
  updated_at timestamptz
)
language sql
stable
as $$
  with normalized as (
    select btrim(coalesce(p_query, '')) as q
  ),
  tsq as (
    select
      normalized.q,
      case
        when normalized.q = '' then null::tsquery
        else websearch_to_tsquery('simple', normalized.q)
      end as query
    from normalized
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
    case
      when tsq.q = '' then 0::real
      else ts_rank_cd(
        coalesce(rb.search_tsv, ''::tsvector) ||
        coalesce(b.search_tsv, ''::tsvector) ||
        coalesce(r.search_tsv, ''::tsvector),
        tsq.query
      )
    end as rank_score,
    rb.updated_at
  from public.roaster_beans rb
  join public.roasters r on r.id = rb.roaster_id
  join public.beans b on b.id = rb.bean_id
  cross join tsq
  where rb.status = 'ACTIVE'
    and r.is_public = true
    and b.is_public = true
    and (
      tsq.q = ''
      or (
        coalesce(rb.search_tsv, ''::tsvector) ||
        coalesce(b.search_tsv, ''::tsvector) ||
        coalesce(r.search_tsv, ''::tsvector)
      ) @@ tsq.query
      or similarity(rb.display_name, tsq.q) > 0.2
      or similarity(b.canonical_name, tsq.q) > 0.2
      or similarity(r.name, tsq.q) > 0.2
    );
$$;

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
language sql
stable
as $$
  select
    matches.roaster_bean_id,
    matches.roaster_name,
    matches.city,
    matches.bean_name,
    matches.display_name,
    matches.process_method,
    matches.roast_level,
    matches.price_amount,
    matches.price_currency,
    matches.is_in_stock,
    matches.rank_score
  from public.search_catalog_matches(p_query) matches
  order by matches.rank_score desc, matches.updated_at desc
  limit greatest(1, least(coalesce(p_limit, 50), 200))
  offset greatest(0, coalesce(p_offset, 0));
$$;

create or replace function public.search_catalog_count(
  p_query text
)
returns bigint
language sql
stable
as $$
  select count(*)::bigint
  from public.search_catalog_matches(p_query) matches;
$$;
