import type { DiscoverContinentId } from '../../types';
import { matchAtlasCountry } from '../../utils/origin-atlas';
import { getInitialAllBeansRouteStateFromResolver, type AllBeansRouteParams } from './route-state-core';

export {
  ALL_DISCOVER_VALUE,
  buildAllBeansRouteUrl,
  type AllBeansContinentKey,
  type AllBeansRouteParams,
  type AllBeansTabKey,
  type InitialAllBeansRouteState,
} from './route-state-core';

function resolveCountryContinent(country: string): DiscoverContinentId | null {
  return matchAtlasCountry(country)?.continentId ?? null;
}

export function getInitialAllBeansRouteState(params: AllBeansRouteParams | undefined) {
  return getInitialAllBeansRouteStateFromResolver(params, resolveCountryContinent);
}
