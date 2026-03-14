const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_MAX_PAGE_SIZE = 100;

export class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

export function badRequest(message: string, code = 'bad_request'): never {
  throw new HttpError(400, code, message);
}

export function notFound(message: string, code = 'not_found'): never {
  throw new HttpError(404, code, message);
}

export function conflict(message: string, code = 'conflict'): never {
  throw new HttpError(409, code, message);
}

export function normalizeString(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function normalizeCountryCode(value: string | null | undefined): string | undefined {
  const normalized = normalizeString(value);
  if (!normalized) return undefined;
  if (!/^[A-Za-z]{2}$/.test(normalized)) {
    badRequest('countryCode must be a 2-letter code', 'invalid_country_code');
  }
  return normalized.toUpperCase();
}

export function parsePositiveInteger(
  value: string | null,
  {
    field,
    fallback,
    minimum = 1,
    maximum,
  }: {
    field: string;
    fallback: number;
    minimum?: number;
    maximum?: number;
  }
): number {
  if (value === null) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum) {
    badRequest(`${field} must be an integer greater than or equal to ${minimum}`, 'invalid_pagination');
  }
  if (typeof maximum === 'number' && parsed > maximum) {
    return maximum;
  }
  return parsed;
}

export function parsePaginationParams(
  searchParams: URLSearchParams,
  {
    defaultPage = DEFAULT_PAGE,
    defaultPageSize = DEFAULT_PAGE_SIZE,
    maxPageSize = DEFAULT_MAX_PAGE_SIZE,
    legacyLimitParam,
  }: {
    defaultPage?: number;
    defaultPageSize?: number;
    maxPageSize?: number;
    legacyLimitParam?: string;
  } = {}
) {
  const page = parsePositiveInteger(searchParams.get('page'), {
    field: 'page',
    fallback: defaultPage,
  });
  const pageSizeValue = searchParams.get('pageSize') ?? (legacyLimitParam ? searchParams.get(legacyLimitParam) : null);
  const pageSize = parsePositiveInteger(pageSizeValue, {
    field: 'pageSize',
    fallback: defaultPageSize,
    maximum: maxPageSize,
  });

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}

export function parseLimitParam(
  searchParams: URLSearchParams,
  {
    defaultLimit = 20,
    maxLimit = 100,
  }: {
    defaultLimit?: number;
    maxLimit?: number;
  } = {}
) {
  return parsePositiveInteger(searchParams.get('limit'), {
    field: 'limit',
    fallback: defaultLimit,
    maximum: maxLimit,
  });
}

export function parseJsonNumber(value: unknown, field: string): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  badRequest(`${field} must be a valid number`, 'invalid_payload');
}

export function parseStringArray(value: unknown, field: string): string[] | undefined {
  if (value === null || value === undefined) return undefined;
  if (!Array.isArray(value)) badRequest(`${field} must be an array`, 'invalid_payload');

  const normalized = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);

  return normalized.length > 0 ? normalized : undefined;
}

export function sanitizeSearchTerm(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/[,%']/g, ' ').trim() || undefined;
}
