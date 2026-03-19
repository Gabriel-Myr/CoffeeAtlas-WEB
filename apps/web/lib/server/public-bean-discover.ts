import type { BeanDiscoverContinent, BeanDiscoverOption, BeanDiscoverPayload } from '@coffee-atlas/shared-types';
import type { CoffeeBean } from '../catalog';

import {
  ORIGIN_ATLAS_CONTINENTS,
  ORIGIN_ATLAS_CONTINENT_MAP,
  ORIGIN_ATLAS_COUNTRIES_BY_CONTINENT,
  matchAtlasCountry,
} from '../geo-data.ts';
import { hasSupabaseServerEnv, requireSupabaseServer } from '../supabase.ts';

import { normalizeString, sanitizeSearchTerm } from './api-primitives.ts';
import { BEAN_DISCOVER_EDITORIAL_CONFIGS } from './bean-discover-config.ts';
import type { BeanListFilters } from './public-beans.ts';
import {
  buildOriginConditions,
  buildSearchConditions,
  countBeanIdsFromView,
  getContinentFilterCandidates,
  loadLocalBeans,
  mapBeanCard,
  matchesBeanFilters,
  queryBeanIdsFromView,
} from './public-beans.ts';

interface CatalogViewDiscoverRow {
  roaster_bean_id: string;
  origin_country: string | null;
  process_method: string | null;
}

type BeanDiscoverFilters = {
  q?: string;
  process?: string;
  continent?: BeanDiscoverContinent;
  country?: string;
};

type BeanDiscoverServiceDeps = {
  loadPrimaryPayload: (filters: BeanDiscoverFilters) => Promise<BeanDiscoverPayload>;
  loadFallbackPayload: (filters: BeanDiscoverFilters) => Promise<BeanDiscoverPayload>;
};

type BuildDiscoverPrimaryDeps = {
  hasSupabaseEnv?: boolean;
  queryDiscoverRowsFn?: typeof queryDiscoverRows;
  countBeanIdsFn?: typeof countBeanIdsFromView;
  loadLocalBeansFn?: typeof loadLocalBeans;
  buildEditorialPicksFn?: typeof buildEditorialPicks;
};

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

function mapDiscoverRowsFromBeans(beans: CoffeeBean[]): CatalogViewDiscoverRow[] {
  return beans.map((bean) => ({
    roaster_bean_id: bean.id,
    origin_country: bean.originCountry,
    process_method: bean.process,
  }));
}

export function buildProcessOptions(rows: CatalogViewDiscoverRow[]): BeanDiscoverOption[] {
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

export function buildContinentOptions(rows: CatalogViewDiscoverRow[]): BeanDiscoverOption[] {
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

export function buildCountryOptions(rows: CatalogViewDiscoverRow[]): BeanDiscoverOption[] {
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

export function buildEditorialReason(
  bean: CoffeeBean,
  filters: Pick<BeanListFilters, 'process' | 'continent' | 'country'>
): string {
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
  const { getCatalogBeansByIds } = await import('../catalog.ts');
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
}: BeanDiscoverFilters): Promise<BeanDiscoverPayload> {
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

export async function buildDiscoverPrimaryPayload(
  { q, process, continent, country }: BeanDiscoverFilters,
  {
    hasSupabaseEnv = hasSupabaseServerEnv,
    queryDiscoverRowsFn = queryDiscoverRows,
    countBeanIdsFn = countBeanIdsFromView,
    loadLocalBeansFn = loadLocalBeans,
    buildEditorialPicksFn = buildEditorialPicks,
  }: BuildDiscoverPrimaryDeps = {}
): Promise<BeanDiscoverPayload> {
  const currentFilters: BeanListFilters = {
    q,
    process,
    continent,
    country,
  };

  let processRows: CatalogViewDiscoverRow[];
  let continentRows: CatalogViewDiscoverRow[];
  let countryRows: CatalogViewDiscoverRow[];
  let total: number;

  if (hasSupabaseEnv) {
    [processRows, continentRows, countryRows, total] = await Promise.all([
      queryDiscoverRowsFn({ q }),
      queryDiscoverRowsFn({ q, process }),
      queryDiscoverRowsFn({ q, process, continent }),
      countBeanIdsFn(currentFilters),
    ]);
  } else {
    const baseRows = mapDiscoverRowsFromBeans(await loadLocalBeansFn({ q }));
    processRows = baseRows;
    continentRows = baseRows.filter((row) => {
      if (!process) return true;
      return (normalizeString(row.process_method) ?? '').toLowerCase().includes(process.toLowerCase());
    });
    countryRows = continentRows.filter((row) => {
      if (!continent) return true;
      return matchAtlasCountry(row.origin_country)?.continentId === continent;
    });
    total = (await loadLocalBeansFn(currentFilters)).length;
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
    editorPicks: await buildEditorialPicksFn(currentFilters),
    resultSummary: {
      total,
      process,
      continent,
      country,
    },
  };
}

export function createBeanDiscoverService({
  loadPrimaryPayload,
  loadFallbackPayload,
}: BeanDiscoverServiceDeps = {
  loadPrimaryPayload: buildDiscoverPrimaryPayload,
  loadFallbackPayload: buildDiscoverFallbackPayload,
}) {
  return {
    async getBeanDiscoverPayload(filters: BeanDiscoverFilters): Promise<BeanDiscoverPayload> {
      try {
        return await loadPrimaryPayload(filters);
      } catch {
        return loadFallbackPayload(filters);
      }
    },
  };
}

const beanDiscoverService = createBeanDiscoverService();

export async function getBeanDiscoverV1({ q, process, continent, country }: BeanDiscoverFilters): Promise<BeanDiscoverPayload> {
  const currentFilters: BeanDiscoverFilters = {
    q: sanitizeSearchTerm(normalizeString(q)),
    process: normalizeString(process),
    continent,
    country: normalizeString(country),
  };

  return beanDiscoverService.getBeanDiscoverPayload(currentFilters);
}
