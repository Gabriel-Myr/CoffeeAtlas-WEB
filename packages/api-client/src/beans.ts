import type { BeanDiscoverQueryParams, BeansQueryParams } from '@coffee-atlas/shared-types';

const BEANS_BASE_PATH = '/api/v1/beans';
const BEAN_DISCOVER_PATH = `${BEANS_BASE_PATH}/discover`;

function setQueryParam(searchParams: URLSearchParams, key: string, value: unknown): void {
  if (value === undefined || value === null) {
    return;
  }

  if (typeof value === 'string') {
    if (value.length === 0) {
      return;
    }
    searchParams.set(key, value);
    return;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return;
    }
    searchParams.set(key, String(value));
    return;
  }

  if (typeof value === 'boolean') {
    searchParams.set(key, String(value));
  }
}

function withQuery(path: string, query: URLSearchParams): string {
  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export function buildBeansPath(params?: BeansQueryParams): string {
  const query = new URLSearchParams();
  if (!params) {
    return BEANS_BASE_PATH;
  }

  setQueryParam(query, 'page', params.page);
  setQueryParam(query, 'pageSize', params.pageSize);
  setQueryParam(query, 'q', params.q);
  setQueryParam(query, 'roasterId', params.roasterId);
  setQueryParam(query, 'originCountry', params.originCountry);
  setQueryParam(query, 'process', params.process);
  setQueryParam(query, 'roastLevel', params.roastLevel);
  setQueryParam(query, 'inStock', params.inStock);
  setQueryParam(query, 'sort', params.sort);
  setQueryParam(query, 'isNewArrival', params.isNewArrival);
  setQueryParam(query, 'continent', params.continent);
  setQueryParam(query, 'country', params.country);

  return withQuery(BEANS_BASE_PATH, query);
}

export function buildBeanDetailPath(id: string): string {
  return `${BEANS_BASE_PATH}/${encodeURIComponent(id)}`;
}

export function buildBeanDiscoverPath(params?: BeanDiscoverQueryParams): string {
  const query = new URLSearchParams();
  if (!params) {
    return BEAN_DISCOVER_PATH;
  }

  setQueryParam(query, 'q', params.q);
  setQueryParam(query, 'process', params.process);
  setQueryParam(query, 'continent', params.continent);
  setQueryParam(query, 'country', params.country);

  return withQuery(BEAN_DISCOVER_PATH, query);
}
