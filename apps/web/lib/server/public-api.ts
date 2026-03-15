import type {
  BeanDiscoverContinent,
  BeanDiscoverOption,
  BeanDiscoverPayload,
  BeanSort,
  CatalogBeanCard,
  CatalogBeanDetail,
  PaginatedResult,
  RoasterFeature,
  RoasterDetail,
  RoasterSummary,
} from '@coffee-atlas/shared-types';
import type { CoffeeBean, Roaster } from '@/lib/catalog';

import {
  getBeanById,
  getCatalogBeansByIds,
  getCatalogBeansPage,
  getRoasterPage,
  getRoasterById,
} from '@/lib/catalog';
import {
  ORIGIN_ATLAS_CONTINENTS,
  ORIGIN_ATLAS_CONTINENT_MAP,
  ORIGIN_ATLAS_COUNTRIES_BY_CONTINENT,
  matchAtlasCountry,
} from '@/lib/geo-data';
import { hasSupabaseServerEnv, requireSupabaseServer } from '@/lib/supabase';

import { BEAN_DISCOVER_EDITORIAL_CONFIGS } from './bean-discover-config';
import { normalizeString, sanitizeSearchTerm } from './api-helpers';

const LOCAL_FALLBACK_LIMIT = 500;
const DEFAULT_BEAN_SORT: BeanSort = 'updated_desc';

interface BeanListFilters {
  q?: string;
  originCountry?: string;
  process?: string;
  roastLevel?: string;
  sort?: BeanSort;
  isNewArrival?: boolean;
  continent?: BeanDiscoverContinent;
  country?: string;
}

interface CatalogViewIdRow {
  roaster_bean_id: string;
}

interface CatalogViewDiscoverRow {
  roaster_bean_id: string;
  origin_country: string | null;
  process_method: string | null;
}

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
    coverImageUrl: roaster.coverImageUrl,
    taobaoUrl: roaster.taobaoUrl,
    xiaohongshuUrl: roaster.xiaohongshuUrl,
  };
}

function mapRoasterDetail(roaster: Roaster): Omit<RoasterDetail, 'beans'> {
  return {
    ...mapRoasterSummary(roaster),
    description: roaster.description,
    logoUrl: roaster.logoUrl,
    websiteUrl: roaster.websiteUrl,
    instagramHandle: roaster.instagramHandle,
    coverImageUrl: roaster.coverImageUrl,
    taobaoUrl: roaster.taobaoUrl,
    xiaohongshuUrl: roaster.xiaohongshuUrl,
  };
}

function normalizeBeanSort(value: BeanSort | undefined): BeanSort {
  return value ?? DEFAULT_BEAN_SORT;
}

function sanitizeFilterToken(value: string): string {
  return value.replace(/[,%']/g, ' ').trim();
}

function buildSearchConditions(query: string): string {
  const wildcard = `%${sanitizeFilterToken(query)}%`;
  return [
    `roaster_name.ilike.${wildcard}`,
    `bean_name.ilike.${wildcard}`,
    `display_name.ilike.${wildcard}`,
    `origin_country.ilike.${wildcard}`,
    `origin_region.ilike.${wildcard}`,
    `process_method.ilike.${wildcard}`,
    `variety.ilike.${wildcard}`,
  ].join(',');
}

function buildOriginConditions(values: string[]): string | null {
  const uniqueValues = Array.from(new Set(values.map(sanitizeFilterToken).filter((value) => value.length > 0)));
  if (uniqueValues.length === 0) return null;
  return uniqueValues.map((value) => `origin_country.ilike.%${value}%`).join(',');
}

function getCountryFilterCandidates(country: string | undefined): string[] {
  if (!country) return [];
  const atlasCountry = matchAtlasCountry(country);
  if (!atlasCountry) return [country];
  return [atlasCountry.name, atlasCountry.id, ...atlasCountry.aliases];
}

function getContinentFilterCandidates(continent: BeanDiscoverContinent | undefined): string[] {
  if (!continent) return [];
  const countries = ORIGIN_ATLAS_COUNTRIES_BY_CONTINENT.get(continent) ?? [];
  return countries.flatMap((country) => [country.name, country.id, ...country.aliases]);
}

function getNewArrivalCutoff(): string {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return cutoff.toISOString();
}

function applySortPlan<T extends { order: (column: string, options: { ascending: boolean; nullsFirst?: boolean }) => T }>(
  query: T,
  sort: BeanSort
): T {
  switch (sort) {
    case 'sales_desc':
      return query
        .order('sales_count', { ascending: false, nullsFirst: false })
        .order('updated_at', { ascending: false });
    case 'price_asc':
      return query
        .order('price_amount', { ascending: true, nullsFirst: false })
        .order('updated_at', { ascending: false });
    case 'price_desc':
      return query
        .order('price_amount', { ascending: false, nullsFirst: false })
        .order('updated_at', { ascending: false });
    case 'updated_desc':
    default:
      return query.order('updated_at', { ascending: false });
  }
}

async function queryBeanIdsFromView({
  q,
  originCountry,
  process,
  roastLevel,
  sort,
  isNewArrival,
  continent,
  country,
  limit,
  offset,
}: BeanListFilters & {
  limit: number;
  offset: number;
}) {
  const supabaseServer = requireSupabaseServer();
  let query = supabaseServer
    .from('v_catalog_active')
    .select('roaster_bean_id')
    .range(offset, offset + limit - 1);

  query = applySortPlan(query, normalizeBeanSort(sort));

  if (q) query = query.or(buildSearchConditions(q));
  if (originCountry) query = query.ilike('origin_country', `%${originCountry}%`);
  if (process) query = query.ilike('process_method', `%${process}%`);
  if (roastLevel) query = query.ilike('roast_level', `%${roastLevel}%`);

  const countryConditions = buildOriginConditions(getCountryFilterCandidates(country));
  if (countryConditions) query = query.or(countryConditions);

  const continentConditions = buildOriginConditions(getContinentFilterCandidates(continent));
  if (continentConditions) query = query.or(continentConditions);

  if (typeof isNewArrival === 'boolean') {
    const cutoff = getNewArrivalCutoff();
    query = isNewArrival ? query.gte('updated_at', cutoff) : query.lt('updated_at', cutoff);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? [])
    .map((row) => (row as CatalogViewIdRow).roaster_bean_id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
}

async function countBeanIdsFromView({
  q,
  originCountry,
  process,
  roastLevel,
  isNewArrival,
  continent,
  country,
}: BeanListFilters) {
  const supabaseServer = requireSupabaseServer();
  let query = supabaseServer.from('v_catalog_active').select('roaster_bean_id', { count: 'exact', head: true });

  if (q) query = query.or(buildSearchConditions(q));
  if (originCountry) query = query.ilike('origin_country', `%${originCountry}%`);
  if (process) query = query.ilike('process_method', `%${process}%`);
  if (roastLevel) query = query.ilike('roast_level', `%${roastLevel}%`);

  const countryConditions = buildOriginConditions(getCountryFilterCandidates(country));
  if (countryConditions) query = query.or(countryConditions);

  const continentConditions = buildOriginConditions(getContinentFilterCandidates(continent));
  if (continentConditions) query = query.or(continentConditions);

  if (typeof isNewArrival === 'boolean') {
    const cutoff = getNewArrivalCutoff();
    query = isNewArrival ? query.gte('updated_at', cutoff) : query.lt('updated_at', cutoff);
  }

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

async function queryDiscoverRows({
  q,
  process,
  continent,
}: {
  q?: string;
  process?: string;
  continent?: BeanDiscoverContinent;
}) {
  const supabaseServer = requireSupabaseServer();
  let query = supabaseServer
    .from('v_catalog_active')
    .select('roaster_bean_id, origin_country, process_method')
    .order('updated_at', { ascending: false });

  if (q) query = query.or(buildSearchConditions(q));
  if (process) query = query.ilike('process_method', `%${process}%`);

  const continentConditions = buildOriginConditions(getContinentFilterCandidates(continent));
  if (continentConditions) query = query.or(continentConditions);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CatalogViewDiscoverRow[];
}

function matchesBeanFilters(
  bean: CoffeeBean,
  {
    q,
    originCountry,
    process,
    roastLevel,
    country,
    continent,
    isNewArrival,
  }: BeanListFilters
): boolean {
  if (q) {
    const lowered = q.toLowerCase();
    const searchableValues = [
      bean.name,
      bean.roasterName,
      bean.originCountry,
      bean.originRegion,
      bean.process,
      bean.variety,
      ...(bean.tastingNotes ?? []),
    ].filter((value): value is string => Boolean(value));

    if (!searchableValues.some((value) => value.toLowerCase().includes(lowered))) {
      return false;
    }
  }

  if (originCountry && !bean.originCountry.toLowerCase().includes(originCountry.toLowerCase())) {
    return false;
  }

  if (process && !bean.process.toLowerCase().includes(process.toLowerCase())) {
    return false;
  }

  if (roastLevel && !bean.roastLevel.toLowerCase().includes(roastLevel.toLowerCase())) {
    return false;
  }

  const matchedCountry = matchAtlasCountry(bean.originCountry) ?? matchAtlasCountry(bean.name);

  if (country) {
    const targetCountry = matchAtlasCountry(country);
    if (!targetCountry) {
      if (!bean.originCountry.toLowerCase().includes(country.toLowerCase())) return false;
    } else if (matchedCountry?.name !== targetCountry.name) {
      return false;
    }
  }

  if (continent && matchedCountry?.continentId !== continent) {
    return false;
  }

  if (typeof isNewArrival === 'boolean') {
    if (bean.isNewArrival !== isNewArrival) {
      return false;
    }
  }

  return true;
}

function sortBeans(beans: CoffeeBean[], sort: BeanSort): CoffeeBean[] {
  const result = [...beans];
  switch (sort) {
    case 'sales_desc':
      return result.sort((left, right) => right.salesCount - left.salesCount);
    case 'price_asc':
      return result.sort((left, right) => left.price - right.price);
    case 'price_desc':
      return result.sort((left, right) => right.price - left.price);
    case 'updated_desc':
    default:
      return result;
  }
}

async function loadLocalBeans(filters: BeanListFilters): Promise<CoffeeBean[]> {
  const seed = await getCatalogBeansPage({
    limit: LOCAL_FALLBACK_LIMIT,
    offset: 0,
    origin: filters.originCountry,
    process: filters.process,
    roastLevel: filters.roastLevel,
  });

  return sortBeans(
    seed.filter((bean) => matchesBeanFilters(bean, filters)),
    normalizeBeanSort(filters.sort)
  );
}

function mapDiscoverRowsFromBeans(beans: CoffeeBean[]): CatalogViewDiscoverRow[] {
  return beans.map((bean) => ({
    roaster_bean_id: bean.id,
    origin_country: bean.originCountry,
    process_method: bean.process,
  }));
}

function buildProcessOptions(rows: CatalogViewDiscoverRow[]): BeanDiscoverOption[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const label = normalizeString(row.process_method);
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'zh-Hans-CN'))
    .map(([label, count]) => ({
      id: label,
      label,
      count,
    }));
}

function buildContinentOptions(rows: CatalogViewDiscoverRow[]): BeanDiscoverOption[] {
  const counts = new Map<BeanDiscoverContinent, number>();
  for (const row of rows) {
    const country = matchAtlasCountry(row.origin_country);
    if (!country) continue;
    counts.set(country.continentId, (counts.get(country.continentId) ?? 0) + 1);
  }

  return ORIGIN_ATLAS_CONTINENTS.map((continent) => ({
    id: continent.id,
    label: continent.name,
    count: counts.get(continent.id) ?? 0,
    description: continent.editorialLabel,
  })).filter((option) => option.count > 0);
}

function buildCountryOptions(rows: CatalogViewDiscoverRow[]): BeanDiscoverOption[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const country = matchAtlasCountry(row.origin_country);
    if (!country) continue;
    counts.set(country.name, (counts.get(country.name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'zh-Hans-CN'))
    .map(([label, count]) => ({
      id: label,
      label,
      count,
    }));
}

function getEditorialConfig(filters: Pick<BeanListFilters, 'process' | 'continent' | 'country'>) {
  const normalizedProcess = normalizeString(filters.process);
  const matchedConfigs = BEAN_DISCOVER_EDITORIAL_CONFIGS.filter((config) => {
    if (config.match.process && normalizeString(config.match.process) !== normalizedProcess) return false;
    if (config.match.continent && config.match.continent !== filters.continent) return false;
    if (config.match.country && config.match.country !== filters.country) return false;
    return true;
  });

  return matchedConfigs.sort((left, right) => {
    const leftSpecificity = Object.values(left.match).filter(Boolean).length;
    const rightSpecificity = Object.values(right.match).filter(Boolean).length;
    return rightSpecificity - leftSpecificity;
  })[0] ?? BEAN_DISCOVER_EDITORIAL_CONFIGS[0];
}

function scoreEditorialPick(bean: CoffeeBean, filters: Pick<BeanListFilters, 'process' | 'continent' | 'country'>): number {
  const matchedCountry = matchAtlasCountry(bean.originCountry) ?? matchAtlasCountry(bean.name);
  let score = bean.salesCount;
  if (bean.isInStock) score += 1200;
  if (bean.isNewArrival) score += 900;
  if (filters.process && bean.process.toLowerCase().includes(filters.process.toLowerCase())) score += 300;
  if (filters.country && matchedCountry?.name === filters.country) score += 600;
  if (filters.continent && matchedCountry?.continentId === filters.continent) score += 240;
  return score;
}

function buildEditorialReason(bean: CoffeeBean, filters: Pick<BeanListFilters, 'process' | 'continent' | 'country'>): string {
  const matchedCountry = matchAtlasCountry(bean.originCountry) ?? matchAtlasCountry(bean.name);
  if (filters.country && matchedCountry?.name === filters.country) {
    return `代表 ${filters.country} 当前路径的典型杯型，适合先建立国家风味印象。`;
  }
  if (filters.process && bean.process.toLowerCase().includes(filters.process.toLowerCase())) {
    return `${bean.process || filters.process} 轮廓更清晰，适合拿来比较处理法差异。`;
  }
  if (filters.continent) {
    const continent = ORIGIN_ATLAS_CONTINENT_MAP.get(filters.continent);
    if (continent) {
      return `更能体现 ${continent.name} 这条路径的风土和风味方向。`;
    }
  }
  if (bean.isNewArrival) {
    return '最近更新，适合第一时间尝鲜，看看目录里最新的风味走向。';
  }
  if (bean.salesCount > 0) {
    return '销量更稳定，是这条路径里更容易形成共识的一支代表样本。';
  }
  return '风味辨识度和稳定性都不错，适合作为当前探索路径的起点。';
}

async function buildEditorialPicks(filters: BeanListFilters): Promise<BeanDiscoverPayload['editorPicks']> {
  const config = getEditorialConfig(filters);
  const limit = filters.country ? 3 : 4;
  const selectedBeans: CoffeeBean[] = [];

  if (config.beanIds && config.beanIds.length > 0) {
    const manualBeans = await getCatalogBeansByIds(config.beanIds);
    for (const bean of manualBeans) {
      if (!matchesBeanFilters(bean, filters)) continue;
      if (selectedBeans.some((candidate) => candidate.id === bean.id)) continue;
      selectedBeans.push(bean);
      if (selectedBeans.length >= limit) break;
    }
  }

  if (selectedBeans.length < limit) {
    const generatedCandidates = hasSupabaseServerEnv
      ? await getCatalogBeansByIds(
          await queryBeanIdsFromView({
            ...filters,
            sort: 'sales_desc',
            limit: 24,
            offset: 0,
          })
        )
      : await loadLocalBeans({
          ...filters,
          sort: 'sales_desc',
        });

    const rankedCandidates = generatedCandidates
      .filter((bean) => matchesBeanFilters(bean, filters))
      .sort((left, right) => scoreEditorialPick(right, filters) - scoreEditorialPick(left, filters));

    for (const bean of rankedCandidates) {
      if (selectedBeans.some((candidate) => candidate.id === bean.id)) continue;
      selectedBeans.push(bean);
      if (selectedBeans.length >= limit) break;
    }
  }

  return selectedBeans.slice(0, limit).map((bean) => ({
    bean: mapBeanCard(bean),
    reason: buildEditorialReason(bean, filters),
  }));
}

async function buildEditorialPicksFallback(filters: BeanListFilters): Promise<BeanDiscoverPayload['editorPicks']> {
  const limit = filters.country ? 3 : 4;
  const fallbackCandidates = await loadLocalBeans({
    ...filters,
    sort: 'sales_desc',
  });

  return fallbackCandidates
    .filter((bean) => matchesBeanFilters(bean, filters))
    .sort((left, right) => scoreEditorialPick(right, filters) - scoreEditorialPick(left, filters))
    .slice(0, limit)
    .map((bean) => ({
      bean: mapBeanCard(bean),
      reason: buildEditorialReason(bean, filters),
    }));
}

async function buildDiscoverFallbackPayload({
  q,
  process,
  continent,
  country,
}: {
  q?: string;
  process?: string;
  continent?: BeanDiscoverContinent;
  country?: string;
}): Promise<BeanDiscoverPayload> {
  const currentFilters: BeanListFilters = {
    q,
    process,
    continent,
    country,
  };

  const [processBeans, continentBeans, countryBeans, totalBeans, editorPicks] = await Promise.all([
    loadLocalBeans({ q }),
    loadLocalBeans({ q, process }),
    loadLocalBeans({ q, process, continent }),
    loadLocalBeans(currentFilters),
    buildEditorialPicksFallback(currentFilters),
  ]);

  const editorialConfig = getEditorialConfig(currentFilters);

  return {
    processOptions: buildProcessOptions(mapDiscoverRowsFromBeans(processBeans)),
    continentOptions: buildContinentOptions(mapDiscoverRowsFromBeans(continentBeans)),
    countryOptions: buildCountryOptions(mapDiscoverRowsFromBeans(countryBeans)),
    editorial: {
      title: editorialConfig.title,
      subtitle: editorialConfig.subtitle,
      mode: editorialConfig.id === 'default' ? 'fallback' : 'manual',
    },
    editorPicks,
    resultSummary: {
      total: totalBeans.length,
      process,
      continent,
      country,
    },
  };
}

export async function listBeansV1({
  page,
  pageSize,
  q,
  originCountry,
  process,
  roastLevel,
  sort,
  isNewArrival,
  continent,
  country,
}: {
  page: number;
  pageSize: number;
  q?: string;
  originCountry?: string;
  process?: string;
  roastLevel?: string;
  sort?: BeanSort;
  isNewArrival?: boolean;
  continent?: BeanDiscoverContinent;
  country?: string;
}): Promise<PaginatedResult<CatalogBeanCard>> {
  const offset = (page - 1) * pageSize;
  const filters: BeanListFilters = {
    q: sanitizeSearchTerm(normalizeString(q)),
    originCountry: normalizeString(originCountry),
    process: normalizeString(process),
    roastLevel: normalizeString(roastLevel),
    sort: normalizeBeanSort(sort),
    isNewArrival,
    continent,
    country: normalizeString(country),
  };

  let beans: CoffeeBean[];
  let total: number;

  if (hasSupabaseServerEnv) {
    const [ids, count] = await Promise.all([
      queryBeanIdsFromView({
        ...filters,
        limit: pageSize,
        offset,
      }),
      countBeanIdsFromView(filters),
    ]);
    beans = await getCatalogBeansByIds(ids);
    total = count;
  } else {
    const localBeans = await loadLocalBeans(filters);
    beans = localBeans.slice(offset, offset + pageSize);
    total = localBeans.length;
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

export async function getBeanDiscoverV1({
  q,
  process,
  continent,
  country,
}: {
  q?: string;
  process?: string;
  continent?: BeanDiscoverContinent;
  country?: string;
}): Promise<BeanDiscoverPayload> {
  const normalizedQuery = sanitizeSearchTerm(normalizeString(q));
  const normalizedProcess = normalizeString(process);
  const normalizedCountry = normalizeString(country);
  const currentFilters: BeanListFilters = {
    q: normalizedQuery,
    process: normalizedProcess,
    continent,
    country: normalizedCountry,
  };

  try {
    let processRows: CatalogViewDiscoverRow[];
    let continentRows: CatalogViewDiscoverRow[];
    let countryRows: CatalogViewDiscoverRow[];
    let total: number;

    if (hasSupabaseServerEnv) {
      [processRows, continentRows, countryRows, total] = await Promise.all([
        queryDiscoverRows({ q: normalizedQuery }),
        queryDiscoverRows({ q: normalizedQuery, process: normalizedProcess }),
        queryDiscoverRows({ q: normalizedQuery, process: normalizedProcess, continent }),
        countBeanIdsFromView(currentFilters),
      ]);
    } else {
      const baseRows = mapDiscoverRowsFromBeans(await loadLocalBeans({ q: normalizedQuery }));
      processRows = baseRows;
      continentRows = baseRows.filter((row) => {
        if (!normalizedProcess) return true;
        return (normalizeString(row.process_method) ?? '').toLowerCase().includes(normalizedProcess.toLowerCase());
      });
      countryRows = continentRows.filter((row) => {
        if (!continent) return true;
        return matchAtlasCountry(row.origin_country)?.continentId === continent;
      });
      total = (await loadLocalBeans(currentFilters)).length;
    }

    const editorialConfig = getEditorialConfig(currentFilters);

    return {
      processOptions: buildProcessOptions(processRows),
      continentOptions: buildContinentOptions(continentRows),
      countryOptions: buildCountryOptions(countryRows),
      editorial: {
        title: editorialConfig.title,
        subtitle: editorialConfig.subtitle,
        mode: editorialConfig.id === 'default' ? 'fallback' : 'manual',
      },
      editorPicks: await buildEditorialPicks(currentFilters),
      resultSummary: {
        total,
        process: normalizedProcess,
        continent,
        country: normalizedCountry,
      },
    };
  } catch {
    return buildDiscoverFallbackPayload({
      q: normalizedQuery,
      process: normalizedProcess,
      continent,
      country: normalizedCountry,
    });
  }
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
  feature,
}: {
  page: number;
  pageSize: number;
  q?: string;
  city?: string;
  feature?: RoasterFeature;
}): Promise<PaginatedResult<RoasterSummary>> {
  const normalizedQ = sanitizeSearchTerm(normalizeString(q));
  const normalizedCity = normalizeString(city);
  const offset = (page - 1) * pageSize;

  const { items: roasters, total } = await getRoasterPage({
    limit: pageSize,
    offset,
    q: normalizedQ,
    city: normalizedCity,
    feature,
  });

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
