import type { BeanDiscoverContinent, BeanSort, ProcessBaseId, ProcessStyleId } from '@coffee-atlas/shared-types';

import { badRequest, parsePaginationParams } from './api-primitives.ts';

export interface ParseBeansQueryParamsOptions {
  defaultPageSize?: number;
  maxPageSize?: number;
  legacyLimitParam?: string;
  includeRoasterId?: boolean;
}

export interface ParsedBeansQueryParams {
  page: number;
  pageSize: number;
  q?: string;
  roasterId?: string;
  originCountry?: string;
  process?: string;
  processBase?: ProcessBaseId;
  processStyle?: ProcessStyleId;
  roastLevel?: string;
  sort?: BeanSort;
  isNewArrival?: boolean;
  continent?: BeanDiscoverContinent;
  country?: string;
}

export function parseBeanSort(value: string | null): BeanSort | undefined {
  if (value === null) return undefined;
  if (value === 'updated_desc' || value === 'sales_desc' || value === 'price_asc' || value === 'price_desc') {
    return value;
  }

  badRequest('sort must be one of updated_desc, sales_desc, price_asc, price_desc', 'invalid_sort');
}

export function parseBeanContinent(value: string | null): BeanDiscoverContinent | undefined {
  if (value === null) return undefined;
  if (value === 'asia' || value === 'africa' || value === 'americas') {
    return value;
  }

  badRequest('continent must be one of asia, africa, americas', 'invalid_continent');
}

export function parseProcessBase(value: string | null): ProcessBaseId | undefined {
  if (value === null) return undefined;
  if (value === 'washed' || value === 'natural' || value === 'honey' || value === 'other') {
    return value;
  }

  badRequest('processBase must be one of washed, natural, honey, other', 'invalid_process_base');
}

export function parseProcessStyle(value: string | null): ProcessStyleId | undefined {
  if (value === null) return undefined;
  if (
    value === 'traditional' ||
    value === 'anaerobic' ||
    value === 'yeast' ||
    value === 'carbonic_maceration' ||
    value === 'thermal_shock' ||
    value === 'other'
  ) {
    return value;
  }

  badRequest(
    'processStyle must be one of traditional, anaerobic, yeast, carbonic_maceration, thermal_shock, other',
    'invalid_process_style'
  );
}

export function parseBooleanQueryFlag(value: string | null, field: string): boolean | undefined {
  if (value === null) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;

  badRequest(`${field} must be true or false`, `invalid_${field}`);
}

function readOptionalParam(searchParams: URLSearchParams, key: string): string | undefined {
  return searchParams.get(key) ?? undefined;
}

export function parseBeansQueryParams(
  searchParams: URLSearchParams,
  {
    defaultPageSize,
    maxPageSize,
    legacyLimitParam,
    includeRoasterId = true,
  }: ParseBeansQueryParamsOptions = {}
): ParsedBeansQueryParams {
  const { page, pageSize } = parsePaginationParams(searchParams, {
    defaultPageSize,
    maxPageSize,
    legacyLimitParam,
  });

  return {
    page,
    pageSize,
    q: readOptionalParam(searchParams, 'q'),
    roasterId: includeRoasterId ? readOptionalParam(searchParams, 'roasterId') : undefined,
    originCountry: readOptionalParam(searchParams, 'originCountry') ?? readOptionalParam(searchParams, 'origin'),
    process: readOptionalParam(searchParams, 'process'),
    processBase: parseProcessBase(searchParams.get('processBase')),
    processStyle: parseProcessStyle(searchParams.get('processStyle')),
    roastLevel: readOptionalParam(searchParams, 'roastLevel'),
    sort: parseBeanSort(searchParams.get('sort')),
    isNewArrival: parseBooleanQueryFlag(searchParams.get('isNewArrival'), 'isNewArrival'),
    continent: parseBeanContinent(searchParams.get('continent')),
    country: readOptionalParam(searchParams, 'country'),
  };
}
