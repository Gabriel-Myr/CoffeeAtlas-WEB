import { NextRequest, NextResponse } from 'next/server';

import { badRequest, parsePaginationParams, toLegacyError } from '@/lib/server/api-helpers';
import { listRoastersV1 } from '@/lib/server/public-api';

function parseFeature(value: string | null) {
  if (value === null) return undefined;
  if (value === 'has_image' || value === 'has_beans' || value === 'taobao' || value === 'xiaohongshu') {
    return value;
  }

  badRequest('feature must be one of has_image, has_beans, taobao, xiaohongshu', 'invalid_feature');
}

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
      feature: parseFeature(request.nextUrl.searchParams.get('feature')),
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
