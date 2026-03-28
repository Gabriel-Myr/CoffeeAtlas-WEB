import { NextRequest, NextResponse } from 'next/server';

import { toLegacyError } from '@/lib/server/api-helpers';
import { parseBeansQueryParams } from '@/lib/server/bean-query-params';
import { listBeansV1 } from '@/lib/server/public-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const params = parseBeansQueryParams(request.nextUrl.searchParams, {
      defaultPageSize: 50,
      maxPageSize: 100,
      legacyLimitParam: 'limit',
      includeRoasterId: false,
    });
    const result = await listBeansV1(params);

    return NextResponse.json({
      data: result.items,
      total: result.pageInfo.total,
      page: result.pageInfo.page,
      limit: result.pageInfo.pageSize,
    });
  } catch (error) {
    return toLegacyError(error);
  }
}
