import type { PaginatedResult, RoasterDetail, RoasterSummary, RoastersQueryParams } from '../../types/index.ts';
import type { CatalogClient, RoasterRow } from './shared-core.ts';
import { DEFAULT_ROASTER_PAGE_SIZE, sanitizeFilterToken } from './shared-core.ts';
import { fetchCatalogRows } from './beans.ts';
import { mapRoasterDetail, mapRoasterSummary } from './shared-mappers.ts';
import { createEmptyRoasterAggregate, fetchRoasterAggregates, matchesRoasterFeature } from './shared-roasters.ts';

export async function listRoastersWithSupabase(
  client: CatalogClient,
  params?: RoastersQueryParams
): Promise<PaginatedResult<RoasterSummary>> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? DEFAULT_ROASTER_PAGE_SIZE;

  let query = client
    .from('roasters')
    .select('id, name, city, description, logo_url, website_url, instagram_handle')
    .eq('is_public', true)
    .order('name');

  if (params?.q) {
    const wildcard = `%${sanitizeFilterToken(params.q)}%`;
    query = query.or(`name.ilike.${wildcard},description.ilike.${wildcard}`);
  }
  if (params?.city) {
    query = query.ilike('city', `%${params.city}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`加载烘焙商目录失败：${error.message}`);
  }

  const rows = (data ?? []) as RoasterRow[];
  const aggregates = await fetchRoasterAggregates(client, rows.map((row) => row.id));
  const filteredItems = rows
    .map((row) => mapRoasterSummary(row, aggregates.get(row.id) ?? createEmptyRoasterAggregate()))
    .filter((roaster) => matchesRoasterFeature(roaster, params?.feature));

  const offset = (page - 1) * pageSize;
  const items = filteredItems.slice(offset, offset + pageSize);

  return {
    items,
    pageInfo: {
      page,
      pageSize,
      total: filteredItems.length,
      hasNextPage: offset + items.length < filteredItems.length,
    },
  };
}

export async function getRoasterDetailWithSupabase(client: CatalogClient, id: string): Promise<RoasterDetail> {
  const { data, error } = await client
    .from('roasters')
    .select('id, name, city, description, logo_url, website_url, instagram_handle')
    .eq('is_public', true)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`加载烘焙商详情失败：${error.message}`);
  }

  if (!data) {
    throw new Error('烘焙商不存在');
  }

  const [aggregates, beansResult] = await Promise.all([
    fetchRoasterAggregates(client, [id]),
    fetchCatalogRows(client, {
      roasterId: id,
      page: 1,
      pageSize: 60,
      sort: 'updated_desc',
    }),
  ]);

  return mapRoasterDetail(
    data as RoasterRow,
    aggregates.get(id) ?? createEmptyRoasterAggregate(),
    beansResult.items
  );
}
