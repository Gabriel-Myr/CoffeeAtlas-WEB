import type {
  BeanSnapshot,
  RoasterSnapshot,
} from '../../utils/storage';
import type { BeanSort, DiscoverContinentId } from '../../types';
const ALL_DISCOVER_VALUE = 'all';

export type AllBeansTabKey = 'discover' | 'sales' | 'new';

const PAGE_SIZE = 20;

interface BuildBeansPageParamsInput {
  tab: AllBeansTabKey;
  page: number;
  searchQuery: string;
  discoverProcess: string;
  discoverContinent: DiscoverContinentId | typeof ALL_DISCOVER_VALUE;
  discoverCountry: string;
  newRoasterId: string;
  newProcess: string;
  newOriginCountry: string;
  listProcess: string;
  listRoastLevel: string;
}

interface BeansPageParams {
  page: number;
  pageSize: number;
  q?: string;
  sort: BeanSort;
  roasterId?: string;
  originCountry?: string;
  process?: string;
  roastLevel?: string;
  isNewArrival?: boolean;
  continent?: DiscoverContinentId;
  country?: string;
}

export function buildBeansPageParams(input: BuildBeansPageParamsInput): BeansPageParams {
  const normalizedQuery = input.searchQuery.trim();
  const params: BeansPageParams = {
    page: input.page,
    pageSize: PAGE_SIZE,
    sort: input.tab === 'sales' ? 'sales_desc' : 'updated_desc',
  };

  if (normalizedQuery) {
    params.q = normalizedQuery;
  }

  if (input.tab === 'discover') {
    if (input.discoverProcess !== ALL_DISCOVER_VALUE) {
      params.process = input.discoverProcess;
    }
    if (input.discoverContinent !== ALL_DISCOVER_VALUE) {
      params.continent = input.discoverContinent;
    }
    if (input.discoverCountry !== ALL_DISCOVER_VALUE) {
      params.country = input.discoverCountry;
    }
    return params;
  }

  if (input.tab === 'new') {
    params.isNewArrival = true;
    if (input.newRoasterId) {
      params.roasterId = input.newRoasterId;
    }
    if (input.newProcess) {
      params.process = input.newProcess;
    }
    if (input.newOriginCountry) {
      params.originCountry = input.newOriginCountry;
    }
    return params;
  }

  if (input.listProcess) {
    params.process = input.listProcess;
  }
  if (input.listRoastLevel) {
    params.roastLevel = input.listRoastLevel;
  }

  return params;
}

export function buildNewArrivalFiltersRequestBody(input: {
  beanFavorites: BeanSnapshot[];
  roasterFavorites: RoasterSnapshot[];
}) {
  return {
    localBeans: input.beanFavorites
      .map((bean) => ({
        originCountry: bean.originCountry.trim(),
        process: bean.process.trim(),
      }))
      .filter((bean) => bean.originCountry.length > 0 || bean.process.length > 0),
    localRoasters: input.roasterFavorites
      .map((roaster) => ({
        id: roaster.id.trim(),
        name: roaster.name.trim(),
      }))
      .filter((roaster) => roaster.id.length > 0 && roaster.name.length > 0),
  };
}
