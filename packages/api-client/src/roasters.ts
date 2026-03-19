import type { RoastersQueryParams } from '@coffee-atlas/shared-types';

const ROASTERS_BASE_PATH = '/api/v1/roasters';

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
  }
}

function withQuery(path: string, query: URLSearchParams): string {
  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export function buildRoastersPath(params?: RoastersQueryParams): string {
  const query = new URLSearchParams();
  if (!params) {
    return ROASTERS_BASE_PATH;
  }

  setQueryParam(query, 'page', params.page);
  setQueryParam(query, 'pageSize', params.pageSize);
  setQueryParam(query, 'q', params.q);
  setQueryParam(query, 'city', params.city);
  setQueryParam(query, 'feature', params.feature);
  setQueryParam(query, 'sort', params.sort);

  return withQuery(ROASTERS_BASE_PATH, query);
}

export function buildRoasterDetailPath(id: string): string {
  return `${ROASTERS_BASE_PATH}/${encodeURIComponent(id)}`;
}
