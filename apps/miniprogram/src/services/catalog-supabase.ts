import type { MiniProgramSupabaseClient } from '../utils/supabase.ts';
import {
  getAvailableProcessStyleDefinitions,
  getProcessBaseLabel,
  isProcessBaseId,
  isProcessStyleId,
  normalizeProcess,
  type ProcessBaseId,
  type ProcessStyleId,
} from '@coffee-atlas/shared-types';

import type {
  BeanDetail,
  BeanDiscoverPayload,
  CoffeeBean,
  DiscoverContinentId,
  NewArrivalFiltersPayload,
  NewArrivalFiltersRequest,
  PaginatedResult,
  RoasterDetail,
  RoasterFeature,
  RoasterSummary,
} from '../types/index.ts';
import {
  ORIGIN_ATLAS_CONTINENT_MAP,
  ORIGIN_ATLAS_CONTINENTS,
  ORIGIN_ATLAS_COUNTRIES_BY_CONTINENT,
  matchAtlasCountry,
} from '../utils/origin-atlas.ts';

type CatalogClient = MiniProgramSupabaseClient;

type ActiveCatalogRow = {
  roaster_bean_id: string;
  roaster_id: string | null;
  roaster_name: string | null;
  city: string | null;
  display_name: string | null;
  origin_country: string | null;
  origin_region: string | null;
  farm: string | null;
  variety: string | null;
  process_method: string | null;
  process_base?: string | null;
  process_style?: string | null;
  roast_level: string | null;
  price_amount: number | string | null;
  price_currency: string | null;
  sales_count: unknown;
  image_url: string | null;
  is_in_stock: boolean | null;
  updated_at?: string | null;
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

type RoasterBeanAggregateRow = {
  roaster_id: string | null;
  image_url: string | null;
  product_url: string | null;
};

type RoasterAggregate = {
  beanCount: number;
  coverImageUrl: string | null;
  taobaoUrl: string | null;
  xiaohongshuUrl: string | null;
};

type NewArrivalBeanSeed = {
  roasterId: string;
  roasterName: string;
  process: string;
  processBase?: ProcessBaseId;
  processStyle?: ProcessStyleId;
  originCountry: string;
};

type LatestNewArrivalIdRow = {
  roaster_bean_id: string | null;
};

const DEFAULT_BEAN_PAGE_SIZE = 20;
const DEFAULT_ROASTER_PAGE_SIZE = 12;
const NEW_ARRIVAL_WINDOW_DAYS = 30;
const MAX_NEW_ARRIVAL_OPTIONS = 3;
const CATALOG_VIEW_SELECT =
  'roaster_bean_id, roaster_id, roaster_name, city, display_name, origin_country, origin_region, farm, variety, process_method, process_base, process_style, roast_level, price_amount, price_currency, sales_count, image_url, is_in_stock, updated_at';
const CATALOG_VIEW_LEGACY_SELECT =
  'roaster_bean_id, roaster_id, roaster_name, city, display_name, origin_country, origin_region, farm, variety, process_method, roast_level, price_amount, price_currency, sales_count, image_url, is_in_stock, updated_at';
const NEW_ARRIVAL_SELECT =
  'roaster_id, roaster_name, process_method, process_base, process_style, origin_country, updated_at';
const NEW_ARRIVAL_LEGACY_SELECT = 'roaster_id, roaster_name, process_method, origin_country, updated_at';

function normalizeString(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  const normalized = normalizeString(value);
  return normalized.length > 0 ? normalized : null;
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function normalizeSalesCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }

  if (typeof value === 'string') {
    const raw = value.trim().replace(/,/g, '').replace(/\+/g, '');
    if (!raw) return 0;
    const wanMatch = raw.match(/^(\d+(?:\.\d+)?)\s*万$/);
    if (wanMatch) {
      return Math.max(0, Math.round(Number(wanMatch[1]) * 10000));
    }
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.round(parsed));
    }
  }

  return 0;
}

function getNewArrivalCutoffIso() {
  return new Date(Date.now() - NEW_ARRIVAL_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

function isRecentUpdatedAt(value: string | null | undefined): boolean {
  const time = value ? Date.parse(value) : Number.NaN;
  if (!Number.isFinite(time)) return false;
  return time >= Date.now() - NEW_ARRIVAL_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

async function getLatestNewArrivalBeanIds(client: CatalogClient): Promise<string[] | null> {
  try {
    const { data, error } = await client.rpc('latest_synced_new_arrival_ids');
    if (error) return null;

    return Array.from(
      new Set(
        ((data ?? []) as LatestNewArrivalIdRow[])
          .map((row) => row.roaster_bean_id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0)
      )
    );
  } catch {
    return null;
  }
}

function sanitizeFilterToken(value: string): string {
  return value.replace(/[,%'()]/g, ' ').trim();
}

function buildSearchConditions(query: string): string {
  const wildcard = `%${sanitizeFilterToken(query)}%`;
  return [
    `roaster_name.ilike.${wildcard}`,
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

function isMissingNormalizedProcessColumnError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const candidate = error as {
    message?: string | null;
    details?: string | null;
    hint?: string | null;
    code?: string | null;
  };
  const haystack = [candidate.message, candidate.details, candidate.hint, candidate.code]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ')
    .toLowerCase();

  if (!haystack) return false;

  const mentionsProcessColumn = haystack.includes('process_base') || haystack.includes('process_style');
  const looksLikeMissingColumn =
    haystack.includes('column') ||
    haystack.includes('schema cache') ||
    haystack.includes('select') ||
    haystack.includes('order');

  return mentionsProcessColumn && looksLikeMissingColumn;
}

function getCountryFilterCandidates(country: string | undefined): string[] {
  if (!country) return [];
  const atlasCountry = matchAtlasCountry(country);
  if (!atlasCountry) return [country];
  return [atlasCountry.name, atlasCountry.id, ...atlasCountry.aliases];
}

function getContinentFilterCandidates(continent: DiscoverContinentId | undefined): string[] {
  if (!continent) return [];
  const countries = ORIGIN_ATLAS_COUNTRIES_BY_CONTINENT.get(continent) ?? [];
  return countries.flatMap((country) => [country.name, country.id, ...country.aliases]);
}

function applyBeanFilters(
  query: any,
  params: {
    q?: string;
    roasterId?: string;
    originCountry?: string;
    variety?: string;
    process?: string;
    processBase?: ProcessBaseId;
    processStyle?: ProcessStyleId;
    roastLevel?: string;
    isNewArrival?: boolean;
    continent?: DiscoverContinentId;
    country?: string;
  },
  options?: {
    supportsNormalizedProcessColumns?: boolean;
  }
): any {
  let next = query;
  const supportsNormalizedProcessColumns = options?.supportsNormalizedProcessColumns !== false;

  if (params.q) next = next.or(buildSearchConditions(params.q));
  if (params.roasterId) next = next.eq('roaster_id', params.roasterId);
  if (params.originCountry) next = next.ilike('origin_country', `%${params.originCountry}%`);
  if (params.process) next = next.ilike('process_method', `%${params.process}%`);
  if (supportsNormalizedProcessColumns && params.processBase) next = next.eq('process_base', params.processBase);
  if (supportsNormalizedProcessColumns && params.processStyle) next = next.eq('process_style', params.processStyle);
  if (params.roastLevel) next = next.ilike('roast_level', `%${params.roastLevel}%`);

  const countryConditions = buildOriginConditions(getCountryFilterCandidates(params.country));
  if (countryConditions) next = next.or(countryConditions);

  const continentConditions = buildOriginConditions(getContinentFilterCandidates(params.continent));
  if (continentConditions) next = next.or(continentConditions);

  if (typeof params.isNewArrival === 'boolean') {
    const cutoff = getNewArrivalCutoffIso();
    next = params.isNewArrival ? next.gte('updated_at', cutoff) : next.lt('updated_at', cutoff);
  }

  return next;
}

function resolveNewArrivalIdSet(rows: ActiveCatalogRow[], latestNewArrivalBeanIds?: string[] | null): Set<string> {
  if (Array.isArray(latestNewArrivalBeanIds)) {
    return new Set(latestNewArrivalBeanIds);
  }

  return new Set(rows.filter((row) => isRecentUpdatedAt(row.updated_at)).map((row) => row.roaster_bean_id));
}

function matchesProcessFilters(
  bean: CoffeeBean,
  filters: {
    processBase?: ProcessBaseId;
    processStyle?: ProcessStyleId;
  }
): boolean {
  const normalizedProcess = normalizeProcess(bean.processRaw ?? bean.process, {
    base: bean.processBase,
    style: bean.processStyle,
  });

  if (filters.processBase && normalizedProcess.base !== filters.processBase) {
    return false;
  }

  if (filters.processStyle && normalizedProcess.style !== filters.processStyle) {
    return false;
  }

  return true;
}

function matchesCountryFilter(bean: CoffeeBean, country: string | undefined): boolean {
  if (!country) return true;

  const normalizedCandidates = new Set(
    getCountryFilterCandidates(country)
      .map((value) => normalizeString(value).toLowerCase())
      .filter((value) => value.length > 0)
  );
  if (normalizedCandidates.size === 0) return true;

  const atlasCountry = matchAtlasCountry(bean.originCountry);
  if (atlasCountry) {
    const beanCandidates = [atlasCountry.name, atlasCountry.id, ...atlasCountry.aliases]
      .map((value) => normalizeString(value).toLowerCase())
      .filter((value) => value.length > 0);
    return beanCandidates.some((value) => normalizedCandidates.has(value));
  }

  return normalizedCandidates.has(normalizeString(bean.originCountry).toLowerCase());
}

function matchesContinentFilter(bean: CoffeeBean, continent: DiscoverContinentId | undefined): boolean {
  if (!continent) return true;
  const atlasCountry = matchAtlasCountry(bean.originCountry);
  return atlasCountry?.continentId === continent;
}

function containsCjk(text: string): boolean {
  return /[\u3400-\u9fff]/.test(text);
}

function toTitleCase(text: string): string {
  return text.replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

function normalizeVarietyToken(token: string): string {
  const normalized = normalizeString(token).replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  const compact = normalized.replace(/\s+/g, '');
  if (/^[a-z]+\d+[a-z0-9-]*$/i.test(compact)) {
    return compact.toUpperCase();
  }

  if (!containsCjk(normalized) && /^[a-z0-9-]+$/i.test(normalized)) {
    return /[0-9]/.test(normalized) ? normalized.toUpperCase() : toTitleCase(normalized.toLowerCase());
  }

  if (!containsCjk(normalized) && /[a-z]/i.test(normalized)) {
    return toTitleCase(normalized.toLowerCase());
  }

  return normalized;
}

function normalizeVarietyLabel(value: string | undefined): string {
  const normalized = normalizeString(value)
    .replace(/[／、，；|+&]+/g, '/')
    .replace(/\s*\/\s*/g, '/')
    .trim();
  if (!normalized) return '';

  const tokens = normalized
    .split('/')
    .map((token) => normalizeVarietyToken(token))
    .filter((token) => token.length > 0);

  return tokens.join(' / ');
}

function getVarietyFilterKey(value: string | undefined): string {
  return normalizeVarietyLabel(value).toLowerCase();
}

function matchesVarietyFilter(bean: CoffeeBean, variety: string | undefined): boolean {
  if (!variety) return true;
  const beanVarietyKey = getVarietyFilterKey(bean.variety);
  if (!beanVarietyKey) return false;
  return beanVarietyKey === getVarietyFilterKey(variety);
}

function filterBeansForDiscover(
  beans: CoffeeBean[],
  filters: {
    processBase?: ProcessBaseId;
    processStyle?: ProcessStyleId;
    continent?: DiscoverContinentId;
    country?: string;
    variety?: string;
  }
): CoffeeBean[] {
  return beans.filter((bean) => {
    if (!matchesProcessFilters(bean, filters)) return false;
    if (!matchesContinentFilter(bean, filters.continent)) return false;
    if (!matchesCountryFilter(bean, filters.country)) return false;
    if (!matchesVarietyFilter(bean, filters.variety)) return false;
    return true;
  });
}

function buildVarietyOptions(beans: CoffeeBean[]): BeanDiscoverPayload['varietyOptions'] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const bean of beans) {
    const label = normalizeVarietyLabel(bean.variety);
    if (!label) continue;
    const key = label.toLowerCase();
    const current = counts.get(key);
    if (current) {
      current.count += 1;
      continue;
    }
    counts.set(key, { label, count: 1 });
  }

  return [...counts.values()]
    .sort((left, right) => sortByCountThenLabel([left.label, left.count], [right.label, right.count]))
    .map(({ label, count }) => ({
      id: label,
      label,
      count,
    }));
}

function applyBeanSort(
  query: any,
  sort: 'updated_desc' | 'sales_desc' | 'price_asc' | 'price_desc' | undefined
): any {
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

function isTaobaoUrl(url: string): boolean {
  const normalized = url.toLowerCase();
  return normalized.includes('taobao.com') || normalized.includes('tmall.com');
}

function isXiaohongshuUrl(url: string): boolean {
  const normalized = url.toLowerCase();
  return normalized.includes('xiaohongshu.com') || normalized.includes('xhslink.com');
}

function createEmptyRoasterAggregate(): RoasterAggregate {
  return {
    beanCount: 0,
    coverImageUrl: null,
    taobaoUrl: null,
    xiaohongshuUrl: null,
  };
}

function matchesRoasterFeature(
  roaster: RoasterSummary,
  feature?: RoasterFeature
): boolean {
  switch (feature) {
    case 'has_image':
      return Boolean(roaster.coverImageUrl || roaster.logoUrl);
    case 'has_beans':
      return (roaster.beanCount ?? 0) > 0;
    case 'taobao':
      return Boolean(roaster.taobaoUrl);
    case 'xiaohongshu':
      return Boolean(roaster.xiaohongshuUrl);
    default:
      return true;
  }
}

function normalizeLabel(value: string | null | undefined): string | null {
  const normalized = normalizeOptionalString(value);
  return normalized && normalized.length > 0 ? normalized : null;
}

function sortByCountThenLabel(left: [string, number], right: [string, number]) {
  return right[1] - left[1] || left[0].localeCompare(right[0], 'zh-Hans-CN');
}

function buildCountOptions(values: Array<string | null | undefined>) {
  const counts = new Map<string, number>();

  for (const value of values) {
    const normalized = normalizeLabel(value);
    if (!normalized) continue;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(sortByCountThenLabel)
    .slice(0, MAX_NEW_ARRIVAL_OPTIONS)
    .map(([label, count]) => ({
      id: label,
      label,
      count,
    }));
}

function buildRoasterOptions(beans: NewArrivalBeanSeed[]) {
  const counts = new Map<string, { label: string; count: number }>();

  for (const bean of beans) {
    const id = normalizeLabel(bean.roasterId);
    const label = normalizeLabel(bean.roasterName);
    if (!id || !label) continue;

    const current = counts.get(id);
    if (current) {
      current.count += 1;
      continue;
    }

    counts.set(id, { label, count: 1 });
  }

  return [...counts.entries()]
    .sort((left, right) => {
      const countDiff = right[1].count - left[1].count;
      if (countDiff !== 0) return countDiff;
      return left[1].label.localeCompare(right[1].label, 'zh-Hans-CN');
    })
    .slice(0, MAX_NEW_ARRIVAL_OPTIONS)
    .map(([id, value]) => ({
      id,
      label: value.label,
      count: value.count,
    }));
}

function buildProcessBaseOptions(beans: CoffeeBean[]): BeanDiscoverPayload['processBaseOptions'] {
  const counts = new Map<ProcessBaseId, number>();

  for (const bean of beans) {
    const normalizedProcess = normalizeProcess(bean.processRaw ?? bean.process, {
      base: bean.processBase,
      style: bean.processStyle,
    });
    counts.set(normalizedProcess.base, (counts.get(normalizedProcess.base) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(sortByCountThenLabel)
    .map(([id, count]) => ({
      id,
      label: getProcessBaseLabel(id),
      count,
    }));
}

function buildProcessStyleOptions(
  beans: CoffeeBean[],
  selectedProcessBase?: ProcessBaseId
): BeanDiscoverPayload['processStyleOptions'] {
  const allowedStyles = new Set(getAvailableProcessStyleDefinitions(selectedProcessBase).map((item) => item.id));
  const counts = new Map<ProcessStyleId, number>();

  for (const bean of beans) {
    const normalizedProcess = normalizeProcess(bean.processRaw ?? bean.process, {
      base: bean.processBase,
      style: bean.processStyle,
    });
    if (!allowedStyles.has(normalizedProcess.style)) continue;
    counts.set(normalizedProcess.style, (counts.get(normalizedProcess.style) ?? 0) + 1);
  }

  return getAvailableProcessStyleDefinitions(selectedProcessBase)
    .map((definition) => ({
      id: definition.id,
      label: definition.label,
      count: counts.get(definition.id) ?? 0,
    }))
    .filter((option) => option.count > 0);
}

function buildDiscoverOptions(
  beans: CoffeeBean[],
  filters: {
    processBase?: ProcessBaseId;
    processStyle?: ProcessStyleId;
    continent?: DiscoverContinentId;
    country?: string;
    variety?: string;
  }
): Pick<BeanDiscoverPayload, 'processBaseOptions' | 'processStyleOptions' | 'continentOptions' | 'countryOptions' | 'varietyOptions'> {
  const processBaseScopedBeans = filterBeansForDiscover(beans, {
    continent: filters.continent,
    country: filters.country,
  });
  const processBaseOptions = buildProcessBaseOptions(processBaseScopedBeans);

  const processStyleScopedBeans = filterBeansForDiscover(beans, {
    processBase: filters.processBase,
    continent: filters.continent,
    country: filters.country,
  });
  const processStyleOptions = buildProcessStyleOptions(processStyleScopedBeans, filters.processBase);

  const continentScopedBeans = filterBeansForDiscover(beans, {
    processBase: filters.processBase,
    processStyle: filters.processStyle,
  });

  const continentCounts = new Map<DiscoverContinentId, number>();
  const countryCounts = new Map<string, number>();

  for (const bean of continentScopedBeans) {
    const country = matchAtlasCountry(bean.originCountry);
    if (!country) continue;
    continentCounts.set(country.continentId, (continentCounts.get(country.continentId) ?? 0) + 1);
  }

  const continentOptions = ORIGIN_ATLAS_CONTINENTS
    .map((continent) => ({
      id: continent.id,
      label: continent.name,
      count: continentCounts.get(continent.id) ?? 0,
      description: continent.editorialLabel,
    }))
    .filter((option) => option.count > 0);

  const countryScopedBeans = filterBeansForDiscover(beans, {
    processBase: filters.processBase,
    processStyle: filters.processStyle,
    continent: filters.continent,
  });

  for (const bean of countryScopedBeans) {
    const country = matchAtlasCountry(bean.originCountry);
    if (!country) continue;
    countryCounts.set(country.name, (countryCounts.get(country.name) ?? 0) + 1);
  }

  const countryOptions = [...countryCounts.entries()]
    .sort(sortByCountThenLabel)
    .map(([label, count]) => ({
      id: label,
      label,
      count,
    }));

  const varietyScopedBeans = filterBeansForDiscover(beans, {
    processBase: filters.processBase,
    processStyle: filters.processStyle,
    continent: filters.continent,
    country: filters.country,
  });
  const varietyOptions = buildVarietyOptions(varietyScopedBeans);

  return {
    processBaseOptions,
    processStyleOptions,
    continentOptions,
    countryOptions,
    varietyOptions,
  };
}

function buildDiscoverEditorial(filters: {
  processBase?: ProcessBaseId;
  processStyle?: ProcessStyleId;
  continent?: DiscoverContinentId;
  country?: string;
  variety?: string;
}): BeanDiscoverPayload['editorial'] {
  if (filters.variety) {
    return {
      title: `${filters.variety} 豆种路径`,
      subtitle: '先看这一豆种下的代表豆款，再决定要不要放宽回更大的结果范围。',
      mode: 'fallback',
    };
  }

  if (filters.country) {
    return {
      title: `${filters.country} 代表样本`,
      subtitle: '先从这一国家的代表豆款进入，再决定是否继续扩大范围。',
      mode: 'fallback',
    };
  }

  if (filters.continent) {
    const continent = ORIGIN_ATLAS_CONTINENT_MAP.get(filters.continent);
    return {
      title: continent ? `${continent.name} 探索路径` : '探索路径',
      subtitle: continent?.editorialLabel ?? '先看这条路径里更典型的代表豆款。',
      mode: 'fallback',
    };
  }

  if (filters.processBase) {
    return {
      title: `${getProcessBaseLabel(filters.processBase)} 风味路径`,
      subtitle: '按处理法先看一轮代表样本，更容易建立风味差异的第一印象。',
      mode: 'fallback',
    };
  }

  return {
    title: '智能推荐起点',
    subtitle: '先看几支更容易建立风味印象的豆款，再继续向下筛选。',
    mode: 'fallback',
  };
}

function buildDiscoverReason(bean: CoffeeBean, filters: {
  processBase?: ProcessBaseId;
  processStyle?: ProcessStyleId;
  continent?: DiscoverContinentId;
  country?: string;
  variety?: string;
}) {
  const country = matchAtlasCountry(bean.originCountry);
  const normalizedProcess = normalizeProcess(bean.processRaw ?? bean.process, {
    base: bean.processBase,
    style: bean.processStyle,
  });
  if (matchesVarietyFilter(bean, filters.variety)) {
    return `${filters.variety} 这条豆种路径下的代表样本，更适合继续往下比较。`;
  }
  if (filters.country && country?.name === filters.country) {
    return `更能代表 ${filters.country} 当前路径的典型风味轮廓。`;
  }
  if (filters.processBase && normalizedProcess.base === filters.processBase) {
    return `${normalizedProcess.label || getProcessBaseLabel(filters.processBase)} 轮廓更清晰，适合作为当前路径的起点。`;
  }
  if (filters.continent && country?.continentId === filters.continent) {
    const continent = ORIGIN_ATLAS_CONTINENT_MAP.get(filters.continent);
    return `更能体现 ${continent?.name ?? '当前大洲'} 这条路径的风土差异。`;
  }
  if (bean.isNewArrival) {
    return '最近更新，适合拿来快速感受当前目录的新风味方向。';
  }
  return '销量和信息完整度都更稳定，适合作为第一支参考样本。';
}

function scoreDiscoverPick(bean: CoffeeBean, filters: {
  processBase?: ProcessBaseId;
  processStyle?: ProcessStyleId;
  continent?: DiscoverContinentId;
  country?: string;
  variety?: string;
}) {
  const country = matchAtlasCountry(bean.originCountry);
  const normalizedProcess = normalizeProcess(bean.processRaw ?? bean.process, {
    base: bean.processBase,
    style: bean.processStyle,
  });
  let score = bean.salesCount;
  if (bean.isInStock) score += 1000;
  if (bean.isNewArrival) score += 600;
  if (filters.processBase && normalizedProcess.base === filters.processBase) score += 300;
  if (filters.processStyle && normalizedProcess.style === filters.processStyle) score += 220;
  if (filters.country && country?.name === filters.country) score += 500;
  if (filters.continent && country?.continentId === filters.continent) score += 240;
  if (matchesVarietyFilter(bean, filters.variety)) score += 180;
  return score;
}

export function mapCatalogBeanRow(row: ActiveCatalogRow, latestNewArrivalIds?: Set<string>): CoffeeBean {
  const rowId = normalizeString(row.roaster_bean_id);
  const normalizedProcess = normalizeProcess(row.process_method, {
    base: isProcessBaseId(row.process_base) ? row.process_base : undefined,
    style: isProcessStyleId(row.process_style) ? row.process_style : undefined,
  });

  return {
    id: rowId,
    name: normalizeString(row.display_name),
    roasterId: normalizeString(row.roaster_id),
    roasterName: normalizeString(row.roaster_name),
    city: normalizeString(row.city),
    originCountry: normalizeString(row.origin_country),
    originRegion: normalizeString(row.origin_region),
    farm: normalizeString(row.farm),
    variety: normalizeString(row.variety),
    process: normalizedProcess.label,
    processBase: normalizedProcess.base,
    processStyle: normalizedProcess.style,
    processRaw: normalizedProcess.raw,
    roastLevel: normalizeString(row.roast_level),
    price: toNumber(row.price_amount),
    discountedPrice: toNumber(row.price_amount),
    currency: normalizeString(row.price_currency) || 'CNY',
    salesCount: normalizeSalesCount(row.sales_count),
    tastingNotes: [],
    imageUrl: normalizeOptionalString(row.image_url),
    isInStock: row.is_in_stock ?? true,
    isNewArrival: latestNewArrivalIds?.has(rowId) ?? isRecentUpdatedAt(row.updated_at),
  };
}

export function mapRoasterSummary(row: RoasterRow, aggregate: RoasterAggregate): RoasterSummary {
  const logoUrl = normalizeOptionalString(row.logo_url);

  return {
    id: row.id,
    name: normalizeString(row.name),
    city: normalizeString(row.city),
    beanCount: aggregate.beanCount,
    description: normalizeOptionalString(row.description),
    logoUrl,
    coverImageUrl: aggregate.coverImageUrl ?? logoUrl,
    taobaoUrl: aggregate.taobaoUrl,
    xiaohongshuUrl: aggregate.xiaohongshuUrl,
  };
}

export function mapRoasterDetail(
  row: RoasterRow,
  aggregate: RoasterAggregate,
  beans: CoffeeBean[]
): RoasterDetail {
  const summary = mapRoasterSummary(row, aggregate);

  return {
    ...summary,
    websiteUrl: normalizeOptionalString(row.website_url),
    instagramHandle: normalizeOptionalString(row.instagram_handle),
    beans,
  };
}

export function buildBeanDiscoverPayload({
  beans,
  filters,
}: {
  beans: CoffeeBean[];
  filters: {
    processBase?: ProcessBaseId;
    processStyle?: ProcessStyleId;
    continent?: DiscoverContinentId;
    country?: string;
    variety?: string;
  };
}): BeanDiscoverPayload {
  const resultBeans = filterBeansForDiscover(beans, filters);
  const options = buildDiscoverOptions(beans, filters);
  const editorial = buildDiscoverEditorial(filters);
  const editorPicks = [...resultBeans]
    .sort((left, right) => scoreDiscoverPick(right, filters) - scoreDiscoverPick(left, filters))
    .slice(0, filters.country ? 3 : 4)
    .map((bean) => ({
      bean,
      reason: buildDiscoverReason(bean, filters),
    }));

  return {
    ...options,
    editorial,
    editorPicks,
    resultSummary: {
      total: resultBeans.length,
      processBase: filters.processBase,
      processStyle: filters.processStyle,
      continent: filters.continent,
      country: filters.country,
      variety: filters.variety,
    },
  };
}

export function buildNewArrivalFiltersPayload({
  beanFavorites,
  roasterFavorites,
  fallbackBeans,
}: {
  beanFavorites: NewArrivalFiltersRequest['beanFavorites'];
  roasterFavorites: NewArrivalFiltersRequest['roasterFavorites'];
  fallbackBeans: NewArrivalBeanSeed[];
}): NewArrivalFiltersPayload {
  const personalizedRoasterOptions = (roasterFavorites ?? [])
    .map((favorite) => {
      const id = normalizeLabel(favorite.id);
      const label = normalizeLabel(favorite.name);
      if (!id || !label) return null;
      return { id, label, count: 1 };
    })
    .filter((item): item is { id: string; label: string; count: number } => Boolean(item))
    .slice(0, MAX_NEW_ARRIVAL_OPTIONS);
  const fallbackRoasterOptions = buildRoasterOptions(fallbackBeans);

  const personalizedProcessOptions = buildCountOptions((beanFavorites ?? []).map((item) => item.process));
  const fallbackProcessOptions = buildCountOptions(fallbackBeans.map((item) => item.process));

  const personalizedOriginOptions = buildCountOptions((beanFavorites ?? []).map((item) => item.originCountry));
  const fallbackOriginOptions = buildCountOptions(fallbackBeans.map((item) => item.originCountry));

  const personalizedCount = [
    personalizedRoasterOptions.length > 0,
    personalizedProcessOptions.length > 0,
    personalizedOriginOptions.length > 0,
  ].filter(Boolean).length;

  return {
    mode: personalizedCount === 3 ? 'personalized' : personalizedCount === 0 ? 'fallback' : 'mixed',
    roasterOptions: personalizedRoasterOptions.length > 0 ? personalizedRoasterOptions : fallbackRoasterOptions,
    processOptions: personalizedProcessOptions.length > 0 ? personalizedProcessOptions : fallbackProcessOptions,
    originOptions: personalizedOriginOptions.length > 0 ? personalizedOriginOptions : fallbackOriginOptions,
  };
}

async function fetchRoasterAggregates(client: CatalogClient, roasterIds: string[]) {
  if (roasterIds.length === 0) return new Map<string, RoasterAggregate>();

  const { data, error } = await client
    .from('roaster_beans')
    .select('roaster_id, image_url, product_url')
    .eq('status', 'ACTIVE')
    .in('roaster_id', roasterIds)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`加载烘焙商聚合数据失败：${error.message}`);
  }

  const aggregates = new Map<string, RoasterAggregate>();

  for (const item of (data ?? []) as RoasterBeanAggregateRow[]) {
    const roasterId = normalizeOptionalString(item.roaster_id);
    if (!roasterId) continue;

    const aggregate = aggregates.get(roasterId) ?? createEmptyRoasterAggregate();
    aggregate.beanCount += 1;

    const imageUrl = normalizeOptionalString(item.image_url);
    if (imageUrl && !aggregate.coverImageUrl) {
      aggregate.coverImageUrl = imageUrl;
    }

    const productUrl = normalizeOptionalString(item.product_url);
    if (productUrl && !aggregate.taobaoUrl && isTaobaoUrl(productUrl)) {
      aggregate.taobaoUrl = productUrl;
    }
    if (productUrl && !aggregate.xiaohongshuUrl && isXiaohongshuUrl(productUrl)) {
      aggregate.xiaohongshuUrl = productUrl;
    }

    aggregates.set(roasterId, aggregate);
  }

  return aggregates;
}

async function fetchCatalogRows(
  client: CatalogClient,
  params: {
    q?: string;
    roasterId?: string;
    originCountry?: string;
    process?: string;
    processBase?: ProcessBaseId;
    processStyle?: ProcessStyleId;
    roastLevel?: string;
    isNewArrival?: boolean;
    continent?: DiscoverContinentId;
    country?: string;
    variety?: string;
    sort?: 'updated_desc' | 'sales_desc' | 'price_asc' | 'price_desc';
    page?: number;
    pageSize?: number;
  }
) {
  const latestNewArrivalBeanIds =
    params.isNewArrival === true ? await getLatestNewArrivalBeanIds(client) : undefined;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_BEAN_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const requiresLocalVarietyFilter = Boolean(params.variety);

  const runQuery = async (options: {
    legacyProcessColumns: boolean;
    fetchAllRows: boolean;
  }) => {
    let query = client
      .from('v_catalog_active')
      .select(options.legacyProcessColumns ? CATALOG_VIEW_LEGACY_SELECT : CATALOG_VIEW_SELECT, { count: 'exact' });

    if (!options.fetchAllRows) {
      query = query.range(from, to);
    }

    return applyBeanSort(
      applyBeanFilters(query, params, {
        supportsNormalizedProcessColumns: !options.legacyProcessColumns,
      }),
      params.sort
    );
  };

  let result = await runQuery({
    legacyProcessColumns: false,
    fetchAllRows: requiresLocalVarietyFilter,
  });
  let usedLegacyProcessColumns = false;

  if (result.error && isMissingNormalizedProcessColumnError(result.error)) {
    usedLegacyProcessColumns = true;
    result = await runQuery({
      legacyProcessColumns: true,
      fetchAllRows: Boolean(params.processBase || params.processStyle || params.variety),
    });
  }

  if (result.error) {
    throw new Error(`加载咖啡豆目录失败：${result.error.message}`);
  }

  if (params.isNewArrival === true && Array.isArray(latestNewArrivalBeanIds)) {
    if (latestNewArrivalBeanIds.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        pageSize,
      };
    }

    const fallbackQuery = client
      .from('v_catalog_active')
      .select(usedLegacyProcessColumns ? CATALOG_VIEW_LEGACY_SELECT : CATALOG_VIEW_SELECT, { count: 'exact' });

    const scopedQuery = applyBeanSort(
      applyBeanFilters(fallbackQuery, { ...params, isNewArrival: undefined }, {
        supportsNormalizedProcessColumns: !usedLegacyProcessColumns,
      }).in('roaster_bean_id', latestNewArrivalBeanIds),
      params.sort
    );
    const finalScopedResult = await (requiresLocalVarietyFilter ? scopedQuery : scopedQuery.range(from, to));

    if (finalScopedResult.error) {
      throw new Error(`加载咖啡豆目录失败：${finalScopedResult.error.message}`);
    }

    const scopedRows = (finalScopedResult.data ?? []) as ActiveCatalogRow[];
    const mappedScopedItems = scopedRows.map((row) =>
      mapCatalogBeanRow(row, new Set(latestNewArrivalBeanIds))
    );
    const processFilteredScopedItems =
      usedLegacyProcessColumns && (params.processBase || params.processStyle)
        ? mappedScopedItems.filter((bean) =>
            matchesProcessFilters(bean, {
              processBase: params.processBase,
              processStyle: params.processStyle,
            })
          )
        : mappedScopedItems;
    const filteredScopedItems = requiresLocalVarietyFilter
      ? processFilteredScopedItems.filter((bean) => matchesVarietyFilter(bean, params.variety))
      : processFilteredScopedItems;

    return {
      items: requiresLocalVarietyFilter ? filteredScopedItems.slice(from, to + 1) : filteredScopedItems,
      total: filteredScopedItems.length,
      page,
      pageSize,
    };
  }

  const rows = (result.data ?? []) as ActiveCatalogRow[];
  const newArrivalIds = resolveNewArrivalIdSet(rows, latestNewArrivalBeanIds);
  const mappedItems = rows.map((row) => mapCatalogBeanRow(row, newArrivalIds));
  const processFilteredItems =
    usedLegacyProcessColumns && (params.processBase || params.processStyle)
      ? mappedItems.filter((bean) =>
          matchesProcessFilters(bean, {
            processBase: params.processBase,
            processStyle: params.processStyle,
          })
        )
      : mappedItems;
  const filteredItems = requiresLocalVarietyFilter
    ? processFilteredItems.filter((bean) => matchesVarietyFilter(bean, params.variety))
    : processFilteredItems;
  const paginatedItems =
    usedLegacyProcessColumns && (params.processBase || params.processStyle)
      ? filteredItems.slice(from, to + 1)
      : requiresLocalVarietyFilter
        ? filteredItems.slice(from, to + 1)
      : filteredItems;

  return {
    items: paginatedItems,
    total:
      (usedLegacyProcessColumns && (params.processBase || params.processStyle)) || requiresLocalVarietyFilter
        ? filteredItems.length
        : result.count ?? 0,
    page,
    pageSize,
  };
}

export async function listBeansWithSupabase(
  client: CatalogClient,
  params?: {
    pageSize?: number;
    page?: number;
    q?: string;
    roasterId?: string;
    originCountry?: string;
    process?: string;
    processBase?: ProcessBaseId;
    processStyle?: ProcessStyleId;
    roastLevel?: string;
    sort?: 'updated_desc' | 'sales_desc' | 'price_asc' | 'price_desc';
    isNewArrival?: boolean;
    continent?: DiscoverContinentId;
    country?: string;
    variety?: string;
  }
): Promise<PaginatedResult<CoffeeBean>> {
  const result = await fetchCatalogRows(client, params ?? {});

  return {
    items: result.items,
    pageInfo: {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      hasNextPage: result.page * result.pageSize < result.total,
    },
  };
}

export async function getBeanDetailWithSupabase(client: CatalogClient, id: string): Promise<BeanDetail> {
  const runQuery = async (legacyProcessColumns: boolean) =>
    client
      .from('v_catalog_active')
      .select(legacyProcessColumns ? CATALOG_VIEW_LEGACY_SELECT : CATALOG_VIEW_SELECT)
      .eq('roaster_bean_id', id)
      .maybeSingle();

  let result = await runQuery(false);
  if (result.error && isMissingNormalizedProcessColumnError(result.error)) {
    result = await runQuery(true);
  }

  if (result.error) {
    throw new Error(`加载咖啡豆详情失败：${result.error.message}`);
  }

  if (!result.data) {
    throw new Error('未找到该咖啡豆');
  }

  return mapCatalogBeanRow(result.data as unknown as ActiveCatalogRow) as BeanDetail;
}

export async function getBeanDiscoverWithSupabase(
  client: CatalogClient,
  params?: {
    q?: string;
    processBase?: ProcessBaseId;
    processStyle?: ProcessStyleId;
    continent?: DiscoverContinentId;
    country?: string;
    variety?: string;
  }
): Promise<BeanDiscoverPayload> {
  const filters = params ?? {};
  const queryFilters = filters.q ? { q: filters.q } : {};
  const runQuery = async (legacyProcessColumns: boolean) =>
    applyBeanFilters(
      client
        .from('v_catalog_active')
        .select(legacyProcessColumns ? CATALOG_VIEW_LEGACY_SELECT : CATALOG_VIEW_SELECT)
        .order('updated_at', { ascending: false }),
      queryFilters,
      {
        supportsNormalizedProcessColumns: !legacyProcessColumns,
      }
    );

  let result = await runQuery(false);

  if (result.error && isMissingNormalizedProcessColumnError(result.error)) {
    result = await runQuery(true);
  }

  if (result.error) {
    throw new Error(`加载发现路径失败：${result.error.message}`);
  }

  const rows = (result.data ?? []) as ActiveCatalogRow[];
  const newArrivalIds = new Set(
    rows.filter((row) => isRecentUpdatedAt(row.updated_at)).map((row) => row.roaster_bean_id)
  );
  const beans = rows.map((row) => mapCatalogBeanRow(row, newArrivalIds));

  return buildBeanDiscoverPayload({
    beans,
    filters,
  });
}

export async function getNewArrivalFiltersWithSupabase(
  client: CatalogClient,
  payload: NewArrivalFiltersRequest
): Promise<NewArrivalFiltersPayload> {
  const latestNewArrivalBeanIds = await getLatestNewArrivalBeanIds(client);
  if (Array.isArray(latestNewArrivalBeanIds) && latestNewArrivalBeanIds.length === 0) {
    return buildNewArrivalFiltersPayload({
      beanFavorites: payload.beanFavorites,
      roasterFavorites: payload.roasterFavorites,
      fallbackBeans: [],
    });
  }

  const buildFilterSeedQuery = (legacyProcessColumns: boolean): any => {
    let query = client
      .from('v_catalog_active')
      .select(legacyProcessColumns ? NEW_ARRIVAL_LEGACY_SELECT : NEW_ARRIVAL_SELECT);

    if (Array.isArray(latestNewArrivalBeanIds)) {
      query = query.in('roaster_bean_id', latestNewArrivalBeanIds);
    } else {
      query = query.gte('updated_at', getNewArrivalCutoffIso());
    }

    return query.order('updated_at', { ascending: false }).limit(120);
  };

  let result: any = await buildFilterSeedQuery(false);

  if (result.error && isMissingNormalizedProcessColumnError(result.error)) {
    result = await buildFilterSeedQuery(true);
  }

  if (result.error) {
    throw new Error(`加载新品筛选失败：${result.error.message}`);
  }

  const fallbackBeans = ((result.data ?? []) as unknown as Array<{
    roaster_id: string | null;
    roaster_name: string | null;
    process_method: string | null;
    process_base?: string | null;
    process_style?: string | null;
    origin_country: string | null;
  }>).map((row) => {
    const normalizedProcess = normalizeProcess(row.process_method, {
      base: isProcessBaseId(row.process_base) ? row.process_base : undefined,
      style: isProcessStyleId(row.process_style) ? row.process_style : undefined,
    });

    return {
      roasterId: normalizeString(row.roaster_id),
      roasterName: normalizeString(row.roaster_name),
      process: normalizedProcess.label,
      processBase: normalizedProcess.base,
      processStyle: normalizedProcess.style,
      originCountry: normalizeString(row.origin_country),
    };
  });

  return buildNewArrivalFiltersPayload({
    beanFavorites: payload.beanFavorites ?? [],
    roasterFavorites: payload.roasterFavorites ?? [],
    fallbackBeans,
  });
}

export async function listRoastersWithSupabase(
  client: CatalogClient,
  params?: {
    pageSize?: number;
    page?: number;
    q?: string;
    city?: string;
    feature?: RoasterFeature;
  }
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
