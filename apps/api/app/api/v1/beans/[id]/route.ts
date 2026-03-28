import { NextRequest } from 'next/server';

import { apiError, apiSuccess, notFound } from '@/lib/server/api-helpers';
import { getBeanDetailV1 } from '@/lib/server/public-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();

  try {
    const { id } = await params;
    const bean = await getBeanDetailV1(id);
    if (!bean) {
      notFound('Bean not found', 'bean_not_found');
    }

    return apiSuccess(bean, requestId);
  } catch (error) {
    return apiError(error, requestId);
  }
}
