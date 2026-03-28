import { NextRequest } from 'next/server';

import { apiError, apiSuccess, notFound } from '@/lib/server/api-helpers';
import { getRoasterDetailV1 } from '@/lib/server/public-api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();

  try {
    const { id } = await params;
    const roaster = await getRoasterDetailV1(id);
    if (!roaster) {
      notFound('Roaster not found', 'roaster_not_found');
    }

    return apiSuccess(roaster, requestId);
  } catch (error) {
    return apiError(error, requestId);
  }
}
