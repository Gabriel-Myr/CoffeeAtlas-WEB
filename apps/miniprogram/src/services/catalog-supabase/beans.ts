import { isProcessBaseId, isProcessStyleId, normalizeProcess } from '@coffee-atlas/shared-types';
import type {
  BeanDetail,
  BeanDiscoverPayload,
  BeanDiscoverQueryParams,
  BeansQueryParams,
  NewArrivalFiltersPayload,
  NewArrivalFiltersRequest,
  PaginatedResult,
  CoffeeBean,
} from '../../types/index.ts';
import type { ActiveCatalogRow, CatalogClient } from './shared-core.ts';
import {
  CATALOG_VIEW_LEGACY_SELECT,
  CATALOG_VIEW_SELECT,
  DEFAULT_BEAN_PAGE_SIZE,
  NEW_ARRIVAL_LEGACY_SELECT,
  NEW_ARRIVAL_SELECT,
  applyBeanFilters,
  applyBeanSort,
  getLatestNewArrivalBeanIds,
  getNewArrivalCutoffIso,
  isMissingNormalizedProcessColumnError,
  isRecentUpdatedAt,
  normalizeString,
  resolveNewArrivalIdSet,
} from './shared-core.ts';
import {
  buildBeanDiscoverPayload,
  buildNewArrivalFiltersPayload,
  matchesProcessFilters,
  matchesVarietyFilter,
} from './shared-discover.ts';
import { mapCatalogBeanRow } from './shared-mappers.ts';

export async function fetchCatalogRows(
  client: CatalogClient,
  params: BeansQueryParams = {}
) {
  const latestNewArrivalBeanIds =
    params.isNewArrival === true ? await getLatestNewArrivalBeanIds(client) : undefined;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_BEAN_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const requiresLocalProcessFilter = Boolean(params.processBase || params.processStyle);
  const requiresLocalVarietyFilter = Boolean(params.variety);
  const requiresLocalPostQueryFiltering = requiresLocalProcessFilter || requiresLocalVarietyFilter;

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
        applyNormalizedProcessFilters: !requiresLocalProcessFilter,
      }),
      params.sort
    );
  };

  let result = await runQuery({
    legacyProcessColumns: false,
    fetchAllRows: requiresLocalPostQueryFiltering,
  });
  let usedLegacyProcessColumns = false;

  if (result.error && isMissingNormalizedProcessColumnError(result.error)) {
    usedLegacyProcessColumns = true;
    result = await runQuery({
      legacyProcessColumns: true,
      fetchAllRows: requiresLocalPostQueryFiltering,
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
      applyBeanFilters(
        fallbackQuery,
        { ...params, isNewArrival: undefined },
        {
          supportsNormalizedProcessColumns: !usedLegacyProcessColumns,
          applyNormalizedProcessFilters: !requiresLocalProcessFilter,
        }
      ).in('roaster_bean_id', latestNewArrivalBeanIds),
      params.sort
    );
    const finalScopedResult = await (requiresLocalPostQueryFiltering ? scopedQuery : scopedQuery.range(from, to));

    if (finalScopedResult.error) {
      throw new Error(`加载咖啡豆目录失败：${finalScopedResult.error.message}`);
    }

    const scopedRows = (finalScopedResult.data ?? []) as ActiveCatalogRow[];
    const mappedScopedItems = scopedRows.map((row) => mapCatalogBeanRow(row, new Set(latestNewArrivalBeanIds)));
    const processFilteredScopedItems = requiresLocalProcessFilter
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
      items: requiresLocalPostQueryFiltering ? filteredScopedItems.slice(from, to + 1) : filteredScopedItems,
      total: filteredScopedItems.length,
      page,
      pageSize,
    };
  }

  const rows = (result.data ?? []) as ActiveCatalogRow[];
  const newArrivalIds = resolveNewArrivalIdSet(rows, latestNewArrivalBeanIds);
  const mappedItems = rows.map((row) => mapCatalogBeanRow(row, newArrivalIds));
  const processFilteredItems = requiresLocalProcessFilter
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
  const paginatedItems = requiresLocalPostQueryFiltering ? filteredItems.slice(from, to + 1) : filteredItems;

  return {
    items: paginatedItems,
    total: requiresLocalPostQueryFiltering ? filteredItems.length : result.count ?? 0,
    page,
    pageSize,
  };
}

export async function listBeansWithSupabase(
  client: CatalogClient,
  params?: BeansQueryParams
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
  params?: BeanDiscoverQueryParams
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

  const fallbackBeans = ((result.data ?? []) as Array<{
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
