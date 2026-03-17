import type { DiscoverContinentId } from '../../types';

export const ALL_DISCOVER_VALUE = 'all';

export type AllBeansTabKey = 'discover' | 'sales' | 'new';
export type AllBeansContinentKey = DiscoverContinentId | typeof ALL_DISCOVER_VALUE;

export interface AllBeansRouteParams {
  tab?: string;
  continent?: string;
  country?: string;
  process?: string;
  q?: string;
}

interface BuildAllBeansRouteParams {
  tab?: AllBeansTabKey;
  continent?: DiscoverContinentId;
  country?: string;
  process?: string;
  q?: string;
}

export interface InitialAllBeansRouteState {
  activeTab: AllBeansTabKey;
  searchQuery: string;
  selectedProcess: string;
  selectedContinent: AllBeansContinentKey;
  selectedCountry: string;
}

function decodeRouteValue(value: string | undefined): string {
  if (!value) return '';

  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

function isTabKey(value: string): value is AllBeansTabKey {
  return value === 'discover' || value === 'sales' || value === 'new';
}

function isContinentId(value: string): value is DiscoverContinentId {
  return value === 'asia' || value === 'africa' || value === 'americas';
}

function hasAtlasRouteParams(params: AllBeansRouteParams): boolean {
  return Boolean(params.country || params.continent || params.process);
}

export function getInitialAllBeansRouteStateFromResolver(
  params: AllBeansRouteParams | undefined,
  resolveCountryContinent: (country: string) => DiscoverContinentId | null
): InitialAllBeansRouteState {
  const decodedTab = decodeRouteValue(params?.tab);
  const decodedContinent = decodeRouteValue(params?.continent);
  const decodedCountry = decodeRouteValue(params?.country);
  const decodedProcess = decodeRouteValue(params?.process);
  const decodedQuery = decodeRouteValue(params?.q);

  let selectedContinent: AllBeansContinentKey = ALL_DISCOVER_VALUE;

  if (decodedCountry) {
    const resolvedContinent = resolveCountryContinent(decodedCountry);
    if (resolvedContinent) {
      selectedContinent = resolvedContinent;
    } else if (isContinentId(decodedContinent)) {
      selectedContinent = decodedContinent;
    }
  } else if (isContinentId(decodedContinent)) {
    selectedContinent = decodedContinent;
  }

  return {
    activeTab: hasAtlasRouteParams(params ?? {})
      ? 'discover'
      : isTabKey(decodedTab)
        ? decodedTab
        : 'discover',
    searchQuery: decodedQuery,
    selectedProcess: decodedProcess || ALL_DISCOVER_VALUE,
    selectedContinent,
    selectedCountry: decodedCountry || ALL_DISCOVER_VALUE,
  };
}

export function buildAllBeansRouteUrl(params: BuildAllBeansRouteParams): string {
  const query = new URLSearchParams();

  if (params.tab) query.set('tab', params.tab);
  if (params.continent) query.set('continent', params.continent);
  if (params.country) query.set('country', params.country);
  if (params.process) query.set('process', params.process);
  if (params.q) query.set('q', params.q);

  const search = query.toString();
  return `/pages/all-beans/index${search ? `?${search}` : ''}`;
}
