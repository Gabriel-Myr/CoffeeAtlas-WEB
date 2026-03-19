import { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/lib/server/api-helpers';
import { parseBeansQueryParams } from '@/lib/server/bean-query-params';
import { listBeansV1 } from '@/lib/server/public-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const params = parseBeansQueryParams(request.nextUrl.searchParams, {
      legacyLimitParam: 'limit',
    });
    const result = await listBeansV1(params);

    return apiSuccess(result, requestId);
  } catch (error) {
    return apiError(error, requestId);
  }
}
