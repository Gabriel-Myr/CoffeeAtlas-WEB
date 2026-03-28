import { type NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/lib/server/api-helpers';
import { notFound } from '@/lib/server/api-primitives';
import { requireUser } from '@/lib/server/auth-user';
import { removeFavorite } from '@/lib/server/favorites-api';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ targetType: string; targetId: string }> }
) {
  try {
    const user = await requireUser(req);
    const { targetType, targetId } = await params;

    if (targetType !== 'bean' && targetType !== 'roaster') {
      notFound('Invalid target type');
    }

    await removeFavorite(user.id, targetType, targetId);
    return apiSuccess({ deleted: true });
  } catch (err) {
    return apiError(err);
  }
}
