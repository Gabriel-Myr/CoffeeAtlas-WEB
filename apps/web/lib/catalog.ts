import type { RoasterFeature } from '@coffee-atlas/shared-types';

import { hasSupabaseServerEnv, requireSupabaseServer } from '@/lib/supabase';
import { normalizeSalesCount } from '@/lib/sales';
import { sampleCatalog } from '@/lib/sample-data';

export interface CoffeeBean {
  id: string;
  name: string;
  roasterId: string;
  roasterName: string;
  city: string;
  originCountry: string;
  originRegion: string;
  farm: string;
  variety: string;
  process: string;
  roastLevel: string;
  price: number;
  discountedPrice: number;
  currency: string;
  salesCount: number;
  tastingNotes: string[];
  imageUrl: string | null;
  isNewArrival: boolean;
  isInStock: boolean;
}

export interface Roaster {
  id: string;
  name: string;
  city: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  websiteUrl: string | null;
  instagramHandle: string | null;
  taobaoUrl: string | null;
  xiaohongshuUrl: string | null;
  beanCount: number;
}

export interface CatalogBeanFilters {
  origin?: string;
  process?: string;
  roastLevel?: string;
  roasterId?: string;
}

export interface CatalogBeansQuery extends CatalogBeanFilters {
  limit?: number;
  offset?: number;
}

export interface RoastersQuery {
  limit?: number;
  offset?: number;
  q?: string;
  city?: string;
  feature?: RoasterFeature;
}

type RoasterBeanRow = {
  id: string;
  display_name: string;
  roaster_id: string | null;
  bean_id: string | null;
  roast_level: string | null;
  price_amount: number | string | null;
  price_currency: string | null;
  sales_count: unknown;
  image_url: string | null;
  product_url?: string | null;
  updated_at?: string | null;
  is_in_stock: boolean | null;
};

type RoasterRow = {
  id: string;
  name: string;
  city: string | null;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  instagram_handle: string | null;
};

type BeanRow = {
  id: string;
  canonical_name: string | null;
  origin_country: string | null;
  origin_region: string | null;
  farm: string | null;
  variety: string | null;
  process_method: string | null;
  flavor_tags: string[] | null;
};

type SearchCatalogRow = {
  roaster_bean_id: string;
  roaster_name: string | null;
  city: string | null;
  bean_name: string | null;
  display_name: string | null;
  process_method: string | null;
  roast_level: string | null;
  price_amount: number | string | null;
  price_currency: string | null;
  is_in_stock: boolean | null;
};

type RoasterAggregateRow = {
  roaster_id: string | null;
  image_url: string | null;
  product_url: string | null;
};

interface RoasterAggregate {
  beanCount: number;
  coverImageUrl: string | null;
  taobaoUrl: string | null;
  xiaohongshuUrl: string | null;
}

const NEW_ARRIVAL_WINDOW_DAYS = 30;

function isNewArrivalTimestamp(value: string | null | undefined): boolean {
  if (!value) return false;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return false;
  return Date.now() - timestamp <= NEW_ARRIVAL_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function mapCoffeeBean(item: RoasterBeanRow, roaster?: RoasterRow, bean?: BeanRow): CoffeeBean {
  return {
    id: item.id,
    name: item.display_name,
    roasterId: item.roaster_id ?? '',
    roasterName: roaster?.name ?? '',
    city: roaster?.city ?? '',
    originCountry: bean?.origin_country ?? '',
    originRegion: bean?.origin_region ?? '',
    farm: bean?.farm ?? '',
    variety: bean?.variety ?? '',
    process: bean?.process_method ?? '',
    roastLevel: item.roast_level ?? '',
    price: toNumber(item.price_amount),
    discountedPrice: toNumber(item.price_amount),
    currency: item.price_currency ?? 'CNY',
    salesCount: normalizeSalesCount(item.sales_count) ?? 0,
    tastingNotes: Array.isArray(bean?.flavor_tags) ? bean.flavor_tags : [],
    imageUrl: item.image_url,
    isNewArrival: isNewArrivalTimestamp(item.updated_at),
    isInStock: item.is_in_stock ?? true,
  };
}

function mapRoaster(row: RoasterRow, aggregate: RoasterAggregate): Roaster {
  return {
    id: row.id,
    name: row.name,
    city: row.city ?? '',
    description: row.description,
    logoUrl: row.logo_url,
    coverImageUrl: aggregate.coverImageUrl ?? normalizeOptionalString(row.logo_url),
    websiteUrl: row.website_url,
    instagramHandle: row.instagram_handle,
    taobaoUrl: aggregate.taobaoUrl,
    xiaohongshuUrl: aggregate.xiaohongshuUrl,
    beanCount: aggregate.beanCount,
  };
}

function createCatalogError(message: string): Error {
  return new Error(`catalog:${message}`);
}

function mapSampleCatalogRow(row: (typeof sampleCatalog)[number]): CoffeeBean {
  return {
    id: row.roasterBeanId,
    name: row.displayName,
    roasterId: row.roasterName,
    roasterName: row.roasterName,
    city: row.city ?? '',
    originCountry: '',
    originRegion: '',
    farm: '',
    variety: row.beanName,
    process: row.processMethod ?? '',
    roastLevel: row.roastLevel ?? '',
    price: row.priceAmount ?? 0,
    discountedPrice: row.priceAmount ?? 0,
    currency: row.priceCurrency,
    salesCount: row.salesCount ?? 0,
    tastingNotes: [],
    imageUrl: null,
    isNewArrival: false,
    isInStock: row.isInStock,
  };
}

function getSampleBeans(): CoffeeBean[] {
  return sampleCatalog
    .filter((row) => row.status === 'ACTIVE')
    .map(mapSampleCatalogRow);
}

export async function getCatalogBeans(limit?: number): Promise<CoffeeBean[]> {
  return getCatalogBeansPage(typeof limit === 'number' ? { limit } : {});
}

async function resolveBeanIdsForFilters(filters: CatalogBeanFilters): Promise<string[] | null> {
  const supabaseServer = requireSupabaseServer();
  if (!filters.origin && !filters.process) return null;

  let query = supabaseServer.from('beans').select('id');
  if (filters.origin) query = query.ilike('origin_country', filters.origin);
  if (filters.process) query = query.ilike('process_method', filters.process);

  const { data, error } = await query;
  if (error) throw createCatalogError(`failed_to_filter_beans:${error.message}`);

  return (data ?? [])
    .map((row) => row.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
}

async function fetchBeanContext(rows: RoasterBeanRow[]): Promise<{
  roastersMap: Map<string, RoasterRow>;
  beansMap: Map<string, BeanRow>;
}> {
  const supabaseServer = requireSupabaseServer();
  const roasterIds = [...new Set(rows.map((row) => row.roaster_id).filter((id): id is string => Boolean(id)))];
  const beanIds = [...new Set(rows.map((row) => row.bean_id).filter((id): id is string => Boolean(id)))];

  const [roastersRes, beansRes] = await Promise.all([
    roasterIds.length > 0
      ? supabaseServer.from('roasters').select('id, name, city, description, logo_url, website_url, instagram_handle').in('id', roasterIds)
      : Promise.resolve({ data: [], error: null }),
    beanIds.length > 0
      ? supabaseServer
          .from('beans')
          .select('id, canonical_name, origin_country, origin_region, farm, variety, process_method, flavor_tags')
          .in('id', beanIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (roastersRes.error) throw createCatalogError(`failed_to_load_roasters:${roastersRes.error.message}`);
  if (beansRes.error) throw createCatalogError(`failed_to_load_beans:${beansRes.error.message}`);

  return {
    roastersMap: new Map((roastersRes.data ?? [] as RoasterRow[]).map((row) => [row.id, row])),
    beansMap: new Map((beansRes.data ?? [] as BeanRow[]).map((row) => [row.id, row])),
  };
}

function createEmptyRoasterAggregate(): RoasterAggregate {
  return {
    beanCount: 0,
    coverImageUrl: null,
    taobaoUrl: null,
    xiaohongshuUrl: null,
  };
}

function isTaobaoUrl(url: string): boolean {
  const normalized = url.toLowerCase();
  return normalized.includes('taobao.com') || normalized.includes('tmall.com');
}

function isXiaohongshuUrl(url: string): boolean {
  const normalized = url.toLowerCase();
  return normalized.includes('xiaohongshu.com') || normalized.includes('xhslink.com');
}

async function fetchRoasterAggregates(roasterIds: string[]): Promise<Map<string, RoasterAggregate>> {
  const supabaseServer = requireSupabaseServer();
  if (roasterIds.length === 0) return new Map();

  const { data, error } = await supabaseServer
    .from('roaster_beans')
    .select('roaster_id, image_url, product_url')
    .eq('status', 'ACTIVE')
    .order('updated_at', { ascending: false })
    .in('roaster_id', roasterIds);

  if (error) throw createCatalogError(`failed_to_load_roaster_aggregates:${error.message}`);

  const counts = new Map<string, RoasterAggregate>();
  for (const row of data ?? []) {
    if (typeof row.roaster_id !== 'string' || row.roaster_id.length === 0) continue;
    const aggregate = counts.get(row.roaster_id) ?? createEmptyRoasterAggregate();
    aggregate.beanCount += 1;

    const imageUrl = normalizeOptionalString((row as RoasterAggregateRow).image_url);
    if (imageUrl && !aggregate.coverImageUrl) {
      aggregate.coverImageUrl = imageUrl;
    }

    const productUrl = normalizeOptionalString((row as RoasterAggregateRow).product_url);
    if (productUrl && !aggregate.taobaoUrl && isTaobaoUrl(productUrl)) {
      aggregate.taobaoUrl = productUrl;
    }
    if (productUrl && !aggregate.xiaohongshuUrl && isXiaohongshuUrl(productUrl)) {
      aggregate.xiaohongshuUrl = productUrl;
    }

    counts.set(row.roaster_id, aggregate);
  }
  return counts;
}

function matchesRoasterFeature(
  row: RoasterRow,
  aggregate: RoasterAggregate,
  feature?: RoasterFeature
): boolean {
  switch (feature) {
    case 'has_image':
      return Boolean(aggregate.coverImageUrl || normalizeOptionalString(row.logo_url));
    case 'has_beans':
      return aggregate.beanCount > 0;
    case 'taobao':
      return Boolean(aggregate.taobaoUrl);
    case 'xiaohongshu':
      return Boolean(aggregate.xiaohongshuUrl);
    default:
      return true;
  }
}

async function queryRoasterRows(filters: Pick<RoastersQuery, 'q' | 'city'>): Promise<RoasterRow[]> {
  const supabaseServer = requireSupabaseServer();
  let query = supabaseServer
    .from('roasters')
    .select('id, name, city, description, logo_url, website_url, instagram_handle')
    .eq('is_public', true)
    .order('name');

  if (filters.q?.trim()) {
    const normalizedQuery = filters.q.trim();
    query = query.or(`name.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%`);
  }
  if (filters.city?.trim()) {
    query = query.ilike('city', `%${filters.city.trim()}%`);
  }

  const { data, error } = await query;
  if (error) throw createCatalogError(`failed_to_load_roaster_list:${error.message}`);
  return (data ?? []) as RoasterRow[];
}

async function resolveRoasterCollection(
  filters: Pick<RoastersQuery, 'q' | 'city' | 'feature'>
): Promise<{ rows: RoasterRow[]; aggregates: Map<string, RoasterAggregate> }> {
  const rows = await queryRoasterRows(filters);
  if (rows.length === 0) {
    return {
      rows: [],
      aggregates: new Map(),
    };
  }

  const aggregates = await fetchRoasterAggregates(rows.map((row) => row.id));
  const filteredRows = rows.filter((row) => {
    const aggregate = aggregates.get(row.id) ?? createEmptyRoasterAggregate();
    return matchesRoasterFeature(row, aggregate, filters.feature);
  });

  return {
    rows: filteredRows,
    aggregates,
  };
}

export async function getRoasterPage(
  options: RoastersQuery = {}
): Promise<{ items: Roaster[]; total: number }> {
  if (!hasSupabaseServerEnv) {
    return {
      items: [],
      total: 0,
    };
  }

  const offset = options.offset ?? 0;
  const limit = options.limit;
  const { rows, aggregates } = await resolveRoasterCollection(options);
  const pagedRows =
    typeof limit === 'number'
      ? rows.slice(offset, offset + limit)
      : rows.slice(offset);

  return {
    items: pagedRows.map((row) => mapRoaster(row, aggregates.get(row.id) ?? createEmptyRoasterAggregate())),
    total: rows.length,
  };
}

export async function getCatalogBeansPage({
  limit = 50,
  offset = 0,
  origin,
  process,
  roastLevel,
  roasterId,
}: CatalogBeansQuery = {}): Promise<CoffeeBean[]> {
  if (!hasSupabaseServerEnv) {
    return getSampleBeans()
      .filter((bean) => {
        if (roasterId && bean.roasterId !== roasterId) return false;
        if (origin && bean.originCountry !== origin) return false;
        if (process && bean.process !== process) return false;
        if (roastLevel && bean.roastLevel !== roastLevel) return false;
        return true;
      })
      .slice(offset, offset + limit);
  }

  const supabaseServer = requireSupabaseServer();
  const beanIds = await resolveBeanIdsForFilters({ origin, process, roastLevel });
  if (Array.isArray(beanIds) && beanIds.length === 0) return [];

  let query = supabaseServer
    .from('roaster_beans')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (roastLevel) query = query.ilike('roast_level', roastLevel);
  if (roasterId) query = query.eq('roaster_id', roasterId);
  if (Array.isArray(beanIds)) query = query.in('bean_id', beanIds);

  const { data, error } = await query;
  if (error) throw createCatalogError(`failed_to_load_catalog_beans:${error.message}`);
  if (!data || data.length === 0) return [];

  const rows = data as RoasterBeanRow[];
  const { roastersMap, beansMap } = await fetchBeanContext(rows);
  return rows.map((row) => mapCoffeeBean(row, roastersMap.get(row.roaster_id ?? ''), beansMap.get(row.bean_id ?? '')));
}

export async function countCatalogBeans(filters: CatalogBeanFilters = {}): Promise<number> {
  if (!hasSupabaseServerEnv) {
    return getSampleBeans().filter((bean) => {
      if (filters.roasterId && bean.roasterId !== filters.roasterId) return false;
      if (filters.origin && bean.originCountry !== filters.origin) return false;
      if (filters.process && bean.process !== filters.process) return false;
      if (filters.roastLevel && bean.roastLevel !== filters.roastLevel) return false;
      return true;
    }).length;
  }

  const supabaseServer = requireSupabaseServer();
  const beanIds = await resolveBeanIdsForFilters(filters);
  if (Array.isArray(beanIds) && beanIds.length === 0) return 0;

  let query = supabaseServer
    .from('roaster_beans')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'ACTIVE');

  if (filters.roastLevel) query = query.ilike('roast_level', filters.roastLevel);
  if (filters.roasterId) query = query.eq('roaster_id', filters.roasterId);
  if (Array.isArray(beanIds)) query = query.in('bean_id', beanIds);

  const { count, error } = await query;
  if (error) throw createCatalogError(`failed_to_count_catalog_beans:${error.message}`);
  return count ?? 0;
}

export async function getBeanById(id: string): Promise<CoffeeBean | null> {
  if (!hasSupabaseServerEnv) {
    return getSampleBeans().find((bean) => bean.id === id) ?? null;
  }

  const supabaseServer = requireSupabaseServer();
  const { data, error } = await supabaseServer
    .from('roaster_beans')
    .select('*')
    .eq('id', id)
    .eq('status', 'ACTIVE')
    .maybeSingle();

  if (error) throw createCatalogError(`failed_to_load_catalog_bean:${error.message}`);
  if (!data) return null;

  const row = data as RoasterBeanRow;
  const { roastersMap, beansMap } = await fetchBeanContext([row]);
  return mapCoffeeBean(row, roastersMap.get(row.roaster_id ?? ''), beansMap.get(row.bean_id ?? ''));
}

export async function getRoasters(limit?: number): Promise<Roaster[]>;
export async function getRoasters(options?: RoastersQuery): Promise<Roaster[]>;
export async function getRoasters(limitOrOptions?: number | RoastersQuery): Promise<Roaster[]> {
  const options = typeof limitOrOptions === 'number' ? { limit: limitOrOptions } : (limitOrOptions ?? {});
  return (await getRoasterPage(options)).items;
}

export async function countRoasters(filters: Pick<RoastersQuery, 'q' | 'city' | 'feature'> = {}): Promise<number> {
  return (await getRoasterPage(filters)).total;
}

export async function getRoasterById(id: string): Promise<Roaster | null> {
  if (!hasSupabaseServerEnv) {
    return null;
  }

  const supabaseServer = requireSupabaseServer();
  const { data, error } = await supabaseServer
    .from('roasters')
    .select('id, name, city, description, logo_url, website_url, instagram_handle')
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle();

  if (error) throw createCatalogError(`failed_to_load_roaster:${error.message}`);
  if (!data) return null;

  const row = data as RoasterRow;
  const counts = await fetchRoasterAggregates([row.id]);
  return mapRoaster(row, counts.get(row.id) ?? createEmptyRoasterAggregate());
}

export async function getRoastersByIds(ids: string[]): Promise<Roaster[]> {
  if (ids.length === 0) return [];

  if (!hasSupabaseServerEnv) {
    return [];
  }

  const supabaseServer = requireSupabaseServer();
  const { data, error } = await supabaseServer
    .from('roasters')
    .select('id, name, city, description, logo_url, website_url, instagram_handle')
    .eq('is_public', true)
    .in('id', ids);

  if (error) throw createCatalogError(`failed_to_load_roasters_by_ids:${error.message}`);
  if (!data || data.length === 0) return [];

  const rows = data as RoasterRow[];
  const counts = await fetchRoasterAggregates(rows.map((row) => row.id));
  const roasterMap = new Map(
    rows.map((row) => [row.id, mapRoaster(row, counts.get(row.id) ?? createEmptyRoasterAggregate())])
  );

  return ids.map((id) => roasterMap.get(id)).filter((roaster): roaster is Roaster => Boolean(roaster));
}

export async function getCatalogBeansByIds(ids: string[]): Promise<CoffeeBean[]> {
  if (ids.length === 0) return [];

  if (!hasSupabaseServerEnv) {
    const sampleMap = new Map(getSampleBeans().map((bean) => [bean.id, bean]));
    return ids.map((id) => sampleMap.get(id)).filter((bean): bean is CoffeeBean => Boolean(bean));
  }

  const beans = await Promise.all(ids.map((id) => getBeanById(id)));
  const beanMap = new Map(
    beans.filter((bean): bean is CoffeeBean => Boolean(bean)).map((bean) => [bean.id, bean])
  );
  return ids.map((id) => beanMap.get(id)).filter((bean): bean is CoffeeBean => Boolean(bean));
}

export async function searchCatalogBeans({
  query,
  limit = 50,
  offset = 0,
}: {
  query: string;
  limit?: number;
  offset?: number;
}): Promise<CoffeeBean[]> {
  const q = query.trim();
  if (!q) return getCatalogBeansPage({ limit, offset });

  if (!hasSupabaseServerEnv) {
    const lowered = q.toLowerCase();
    return getSampleBeans()
      .filter((bean) => {
        return [
          bean.name,
          bean.roasterName,
          bean.variety,
          bean.process,
          bean.originCountry,
        ].some((value) => value.toLowerCase().includes(lowered));
      })
      .slice(offset, offset + limit);
  }

  const supabaseServer = requireSupabaseServer();
  const { data, error } = await supabaseServer.rpc('search_catalog', {
    p_query: q,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) throw createCatalogError(`failed_to_search_catalog:${error.message}`);

  const rows = (data ?? []) as SearchCatalogRow[];
  const ids = rows
    .map((row) => row.roaster_bean_id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  return getCatalogBeansByIds(ids);
}

export async function countSearchCatalogBeans(query: string): Promise<number> {
  const q = query.trim();
  if (!q) return countCatalogBeans();

  if (!hasSupabaseServerEnv) {
    const lowered = q.toLowerCase();
    return getSampleBeans().filter((bean) => {
      return [
        bean.name,
        bean.roasterName,
        bean.variety,
        bean.process,
        bean.originCountry,
      ].some((value) => value.toLowerCase().includes(lowered));
    }).length;
  }

  const supabaseServer = requireSupabaseServer();
  const wildcardQuery = `%${q}%`;
  const { count, error } = await supabaseServer
    .from('v_catalog_active')
    .select('roaster_bean_id', { count: 'exact', head: true })
    .or(
      [
        `roaster_name.ilike.${wildcardQuery}`,
        `bean_name.ilike.${wildcardQuery}`,
        `display_name.ilike.${wildcardQuery}`,
        `process_method.ilike.${wildcardQuery}`,
        `origin_country.ilike.${wildcardQuery}`,
      ].join(',')
    );

  if (error) throw createCatalogError(`failed_to_count_catalog_search:${error.message}`);
  return count ?? 0;
}
