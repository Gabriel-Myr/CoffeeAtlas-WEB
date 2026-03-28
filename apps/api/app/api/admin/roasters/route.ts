import { NextRequest, NextResponse } from 'next/server';

import { searchAdminRoasters } from '@/lib/server/admin-catalog';
import { requireAdmin } from '@/lib/server/admin-auth';
import { parseLimitParam, toLegacyError } from '@/lib/server/api-helpers';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const limit = parseLimitParam(request.nextUrl.searchParams, {
      defaultLimit: 20,
      maxLimit: 50,
    });
    const data = await searchAdminRoasters({
      q: request.nextUrl.searchParams.get('q') ?? undefined,
      limit,
    });

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    return toLegacyError(error);
  }
}
