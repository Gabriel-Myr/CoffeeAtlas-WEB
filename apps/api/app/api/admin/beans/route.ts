import { NextRequest, NextResponse } from 'next/server';

import { createAdminBean } from '@/lib/server/admin-catalog';
import { requireAdmin } from '@/lib/server/admin-auth';
import { badRequest, toLegacyError } from '@/lib/server/api-helpers';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      badRequest('Request body must be a JSON object', 'invalid_payload');
    }

    const data = await createAdminBean(body);
    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    return toLegacyError(error);
  }
}
