import { buildNewArrivalBeanRequestParams } from '../all-beans/new-arrival-filters.ts';

export const HOME_NEW_ARRIVAL_PAGE_SIZE = 20;
export const HOME_NEW_ARRIVAL_SEARCH_DEBOUNCE_MS = 250;

interface HomeNewArrivalFilterState {
  searchQuery: string;
  selectedRoasterId: string;
  selectedProcess: string;
  selectedOriginCountry: string;
}

export function buildHomeNewArrivalBeanParams(input: HomeNewArrivalFilterState & {
  page: number;
  pageSize: number;
}) {
  return buildNewArrivalBeanRequestParams(input);
}

export function hasActiveHomeNewArrivalFilters(input: HomeNewArrivalFilterState): boolean {
  return Boolean(
    input.searchQuery.trim() ||
      input.selectedRoasterId ||
      input.selectedProcess ||
      input.selectedOriginCountry
  );
}

export function getHomeNewArrivalEmptyStateMessage(hasActiveFilters: boolean): string {
  if (hasActiveFilters) {
    return '没有匹配到符合条件的新品，试试换个搜索词或筛选条件';
  }

  return '当前还没有可展示的新品';
}
