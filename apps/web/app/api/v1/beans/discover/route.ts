import { NextRequest } from 'next/server';

import type { BeanDiscoverContinent } from '@coffee-atlas/shared-types';

import { apiError, apiSuccess, badRequest } from '@/lib/server/api-helpers';
import { getBeanDiscoverV1 } from '@/lib/server/public-api';

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
      process: request.nextUrl.searchParams.get('process') ?? undefined,
      continent: parseContinent(request.nextUrl.searchParams.get('continent')),
      country: request.nextUrl.searchParams.get('country') ?? undefined,
    });

    return apiSuccess(result, requestId);
  } catch (error) {
    return apiError(error, requestId);
  }
}
