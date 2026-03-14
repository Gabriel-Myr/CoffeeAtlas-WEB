import type {
  CatalogBeanCard,
  CatalogBeanDetail,
  PaginatedResult,
  RoasterDetail,
  RoasterSummary,
} from '@coffee-atlas/shared-types';
import type { CoffeeBean, Roaster } from '@/lib/catalog';

import {
  countCatalogBeans,
  countRoasters,
  countSearchCatalogBeans,
  getBeanById,
  getCatalogBeansByIds,
  getCatalogBeansPage,
  getRoasterById,
  getRoasters,
  searchCatalogBeans,
} from '@/lib/catalog';
import { hasSupabaseServerEnv, requireSupabaseServer } from '@/lib/supabase';

import { normalizeString, sanitizeSearchTerm } from './api-helpers';

function mapBeanCard(bean: CoffeeBean): CatalogBeanCard {
  return {
    id: bean.id,
    name: bean.name,
    roasterId: bean.roasterId,
    roasterName: bean.roasterName,
    city: bean.city,
    originCountry: bean.originCountry,
    process: bean.process,
    roastLevel: bean.roastLevel,
    price: bean.price,
    currency: bean.currency,
    salesCount: bean.salesCount,
    imageUrl: bean.imageUrl,
    isInStock: bean.isInStock,
    originRegion: bean.originRegion,
    farm: bean.farm,
    variety: bean.variety,
    discountedPrice: bean.discountedPrice,
    tastingNotes: bean.tastingNotes,
    isNewArrival: bean.isNewArrival,
  };
}

function mapBeanDetail(bean: CoffeeBean): CatalogBeanDetail {
  return {
    ...mapBeanCard(bean),
    originRegion: bean.originRegion,
    farm: bean.farm,
    variety: bean.variety,
    discountedPrice: bean.discountedPrice,
    tastingNotes: bean.tastingNotes,
    isNewArrival: bean.isNewArrival,
  };
}

function mapRoasterSummary(roaster: Roaster): RoasterSummary {
  return {
    id: roaster.id,
    name: roaster.name,
    city: roaster.city,
    beanCount: roaster.beanCount,
    description: roaster.description,
    logoUrl: roaster.logoUrl,
  };
}

function mapRoasterDetail(roaster: Roaster): Omit<RoasterDetail, 'beans'> {
  return {
    ...mapRoasterSummary(roaster),
    description: roaster.description,
    logoUrl: roaster.logoUrl,
    websiteUrl: roaster.websiteUrl,
    instagramHandle: roaster.instagramHandle,
  };
}

async function queryBeanIdsFromView({
  q,
  originCountry,
  process,
  roastLevel,
  limit,
  offset,
}: {
  q?: string;
  originCountry?: string;
  process?: string;
  roastLevel?: string;
  limit: number;
  offset: number;
}) {
  const supabaseServer = requireSupabaseServer();
  let query = supabaseServer
    .from('v_catalog_active')
    .select('roaster_bean_id')
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (q) {
    const wildcard = `%${q}%`;
    query = query.or(
      [
        `roaster_name.ilike.${wildcard}`,
        `bean_name.ilike.${wildcard}`,
        `display_name.ilike.${wildcard}`,
      ].join(',')
    );
  }
  if (originCountry) query = query.ilike('origin_country', `%${originCountry}%`);
  if (process) query = query.ilike('process_method', `%${process}%`);
  if (roastLevel) query = query.ilike('roast_level', `%${roastLevel}%`);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? [])
    .map((row) => row.roaster_bean_id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
}

async function countBeanIdsFromView({
  q,
  originCountry,
  process,
  roastLevel,
}: {
  q?: string;
  originCountry?: string;
  process?: string;
  roastLevel?: string;
}) {
  const supabaseServer = requireSupabaseServer();
  let query = supabaseServer.from('v_catalog_active').select('roaster_bean_id', { count: 'exact', head: true });

  if (q) {
    const wildcard = `%${q}%`;
    query = query.or(
      [
        `roaster_name.ilike.${wildcard}`,
        `bean_name.ilike.${wildcard}`,
        `display_name.ilike.${wildcard}`,
      ].join(',')
    );
  }
  if (originCountry) query = query.ilike('origin_country', `%${originCountry}%`);
  if (process) query = query.ilike('process_method', `%${process}%`);
  if (roastLevel) query = query.ilike('roast_level', `%${roastLevel}%`);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function listBeansV1({
  page,
  pageSize,
  q,
  originCountry,
  process,
  roastLevel,
}: {
  page: number;
  pageSize: number;
  q?: string;
  originCountry?: string;
  process?: string;
  roastLevel?: string;
}): Promise<PaginatedResult<CatalogBeanCard>> {
  const offset = (page - 1) * pageSize;
  const normalizedQuery = sanitizeSearchTerm(normalizeString(q));
  const normalizedOrigin = normalizeString(originCountry);
  const normalizedProcess = normalizeString(process);
  const normalizedRoastLevel = normalizeString(roastLevel);

  let beans;
  let total;

  if (normalizedQuery && !hasSupabaseServerEnv) {
    const allMatches = await searchCatalogBeans({
      query: normalizedQuery,
      limit: pageSize * page,
      offset: 0,
    });
    const filtered = allMatches.filter((bean) => {
      if (normalizedOrigin && !bean.originCountry.toLowerCase().includes(normalizedOrigin.toLowerCase())) return false;
      if (normalizedProcess && !bean.process.toLowerCase().includes(normalizedProcess.toLowerCase())) return false;
      if (normalizedRoastLevel && !bean.roastLevel.toLowerCase().includes(normalizedRoastLevel.toLowerCase())) return false;
      return true;
    });
    beans = filtered.slice(offset, offset + pageSize);
    total = filtered.length;
  } else if (normalizedQuery && !normalizedOrigin && !normalizedProcess && !normalizedRoastLevel) {
    [beans, total] = await Promise.all([
      searchCatalogBeans({ query: normalizedQuery, limit: pageSize, offset }),
      countSearchCatalogBeans(normalizedQuery),
    ]);
  } else if (normalizedQuery && hasSupabaseServerEnv) {
    const [ids, count] = await Promise.all([
      queryBeanIdsFromView({
        q: normalizedQuery,
        originCountry: normalizedOrigin,
        process: normalizedProcess,
        roastLevel: normalizedRoastLevel,
        limit: pageSize,
        offset,
      }),
      countBeanIdsFromView({
        q: normalizedQuery,
        originCountry: normalizedOrigin,
        process: normalizedProcess,
        roastLevel: normalizedRoastLevel,
      }),
    ]);
    beans = await getCatalogBeansByIds(ids);
    total = count;
  } else {
    [beans, total] = await Promise.all([
      getCatalogBeansPage({
        limit: pageSize,
        offset,
        origin: normalizedOrigin,
        process: normalizedProcess,
        roastLevel: normalizedRoastLevel,
      }),
      countCatalogBeans({
        origin: normalizedOrigin,
        process: normalizedProcess,
        roastLevel: normalizedRoastLevel,
      }),
    ]);
  }

  return {
    items: beans.map(mapBeanCard),
    pageInfo: {
      page,
      pageSize,
      total,
      hasNextPage: offset + beans.length < total,
    },
  };
}

export async function getBeanDetailV1(id: string): Promise<CatalogBeanDetail | null> {
  const bean = await getBeanById(id);
  return bean ? mapBeanDetail(bean) : null;
}

export async function listRoastersV1({
  page,
  pageSize,
  q,
  city,
}: {
  page: number;
  pageSize: number;
  q?: string;
  city?: string;
}): Promise<PaginatedResult<RoasterSummary>> {
  const normalizedQ = sanitizeSearchTerm(normalizeString(q));
  const normalizedCity = normalizeString(city);
  const offset = (page - 1) * pageSize;

  const [roasters, total] = await Promise.all([
    getRoasters({
      limit: pageSize,
      offset,
      q: normalizedQ,
      city: normalizedCity,
    }),
    countRoasters({
      q: normalizedQ,
      city: normalizedCity,
    }),
  ]);

  return {
    items: roasters.map(mapRoasterSummary),
    pageInfo: {
      page,
      pageSize,
      total,
      hasNextPage: offset + roasters.length < total,
    },
  };
}

export async function getRoasterDetailV1(id: string): Promise<RoasterDetail | null> {
  const roaster = await getRoasterById(id);
  if (!roaster) return null;

  const beanCount = roaster.beanCount > 0 ? roaster.beanCount : 1;
  const beans = await getCatalogBeansPage({
    limit: Math.max(beanCount, 1),
    offset: 0,
    roasterId: id,
  });

  return {
    ...mapRoasterDetail(roaster),
    beans: beans.map(mapBeanCard),
  };
}
