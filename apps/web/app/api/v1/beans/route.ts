import { NextRequest } from 'next/server';

import { apiError, apiSuccess, parsePaginationParams } from '@/lib/server/api-helpers';
import { listBeansV1 } from '@/lib/server/public-api';

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
    });

    return apiSuccess(result, requestId);
  } catch (error) {
    return apiError(error, requestId);
  }
}
