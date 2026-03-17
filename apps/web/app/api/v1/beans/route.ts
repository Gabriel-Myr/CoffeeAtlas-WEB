import { NextRequest } from 'next/server';

import type { BeanDiscoverContinent, BeanSort } from '@coffee-atlas/shared-types';

import { apiError, apiSuccess, badRequest, parsePaginationParams } from '@/lib/server/api-helpers';
import { listBeansV1 } from '@/lib/server/public-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseSort(value: string | null): BeanSort | undefined {
  if (value === null) return undefined;
  if (value === 'updated_desc' || value === 'sales_desc' || value === 'price_asc' || value === 'price_desc') {
    return value;
  }

  badRequest('sort must be one of updated_desc, sales_desc, price_asc, price_desc', 'invalid_sort');
}

function parseContinent(value: string | null): BeanDiscoverContinent | undefined {
  if (value === null) return undefined;
  if (value === 'asia' || value === 'africa' || value === 'americas') {
    return value;
  }

  badRequest('continent must be one of asia, africa, americas', 'invalid_continent');
}

function parseBooleanFlag(value: string | null, field: string): boolean | undefined {
  if (value === null) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;

  badRequest(`${field} must be true or false`, `invalid_${field}`);
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const { page, pageSize } = parsePaginationParams(request.nextUrl.searchParams, {
      legacyLimitParam: 'limit',
    });
    const result = await listBeansV1({
      page,
      pageSize,
      q: request.nextUrl.searchParams.get('q') ?? undefined,
      originCountry:
        request.nextUrl.searchParams.get('originCountry') ??
        request.nextUrl.searchParams.get('origin') ??
        undefined,
      process: request.nextUrl.searchParams.get('process') ?? undefined,
      roastLevel: request.nextUrl.searchParams.get('roastLevel') ?? undefined,
      sort: parseSort(request.nextUrl.searchParams.get('sort')),
      isNewArrival: parseBooleanFlag(request.nextUrl.searchParams.get('isNewArrival'), 'isNewArrival'),
      continent: parseContinent(request.nextUrl.searchParams.get('continent')),
      country: request.nextUrl.searchParams.get('country') ?? undefined,
    });

    return apiSuccess(result, requestId);
  } catch (error) {
    return apiError(error, requestId);
  }
}
