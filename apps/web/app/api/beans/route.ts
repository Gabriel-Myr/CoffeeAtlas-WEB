import { NextRequest, NextResponse } from 'next/server';

import { toLegacyError, parsePaginationParams } from '@/lib/server/api-helpers';
import { listBeansV1 } from '@/lib/server/public-api';

export async function GET(request: NextRequest) {
  try {
    const { page, pageSize } = parsePaginationParams(request.nextUrl.searchParams, {
      defaultPageSize: 50,
      maxPageSize: 100,
      legacyLimitParam: 'limit',
    });
    const result = await listBeansV1({
      page,
      pageSize,
      q: request.nextUrl.searchParams.get('q') ?? undefined,
      originCountry:
        request.nextUrl.searchParams.get('origin') ??
        request.nextUrl.searchParams.get('originCountry') ??
        undefined,
      process: request.nextUrl.searchParams.get('process') ?? undefined,
      roastLevel: request.nextUrl.searchParams.get('roastLevel') ?? undefined,
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
