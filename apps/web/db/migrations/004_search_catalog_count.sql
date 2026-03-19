begin;

create or replace function public.search_catalog_count(
  p_query text
)
returns bigint
language plpgsql
stable
as $$
declare
  q text := btrim(coalesce(p_query, ''));
begin
  if q = '' then
    return (
      select count(*)::bigint
      from public.v_catalog_active
    );
  end if;

  return (
    with tsq as (
      select websearch_to_tsquery('simple', q) as query
    )
    select count(*)::bigint
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
  );
end;
$$;

commit;
