import { NextRequest } from 'next/server';

import { apiError, apiSuccess, parsePaginationParams } from '@/lib/server/api-helpers';
import { listRoastersV1 } from '@/lib/server/public-api';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const { page, pageSize } = parsePaginationParams(request.nextUrl.searchParams, {
      legacyLimitParam: 'limit',
    });
    const result = await listRoastersV1({
      page,
      pageSize,
      q: request.nextUrl.searchParams.get('q') ?? undefined,
      city: request.nextUrl.searchParams.get('city') ?? undefined,
    });

    return apiSuccess(result, requestId);
  } catch (error) {
    return apiError(error, requestId);
  }
}
