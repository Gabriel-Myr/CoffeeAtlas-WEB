import { NextRequest } from 'next/server';

import type { BeanDiscoverContinent } from '@coffee-atlas/shared-types';

import { apiError, apiSuccess, badRequest } from '@/lib/server/api-helpers';
import { parseProcessBase, parseProcessStyle } from '@/lib/server/bean-query-params';
import { getBeanDiscoverV1 } from '@/lib/server/public-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseContinent(value: string | null): BeanDiscoverContinent | undefined {
  if (value === null) return undefined;
  if (value === 'asia' || value === 'africa' || value === 'americas') {
    return value;
  }

  badRequest('continent must be one of asia, africa, americas', 'invalid_continent');
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const result = await getBeanDiscoverV1({
      q: request.nextUrl.searchParams.get('q') ?? undefined,
      processBase: parseProcessBase(request.nextUrl.searchParams.get('processBase')),
      processStyle: parseProcessStyle(request.nextUrl.searchParams.get('processStyle')),
      continent: parseContinent(request.nextUrl.searchParams.get('continent')),
      country: request.nextUrl.searchParams.get('country') ?? undefined,
    });

    return apiSuccess(result, requestId);
  } catch (error) {
    return apiError(error, requestId);
  }
}
