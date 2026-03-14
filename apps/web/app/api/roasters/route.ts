import { NextRequest, NextResponse } from 'next/server';

import { parsePaginationParams, toLegacyError } from '@/lib/server/api-helpers';
import { listRoastersV1 } from '@/lib/server/public-api';

export async function GET(request: NextRequest) {
  try {
    const { page, pageSize } = parsePaginationParams(request.nextUrl.searchParams, {
      defaultPageSize: 50,
      maxPageSize: 100,
      legacyLimitParam: 'limit',
    });
    const result = await listRoastersV1({
      page,
      pageSize,
      q: request.nextUrl.searchParams.get('q') ?? undefined,
      city: request.nextUrl.searchParams.get('city') ?? undefined,
    });

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
