import { type NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/lib/server/api-helpers';
import { requireUser } from '@/lib/server/auth-user';
import { syncFavorites } from '@/lib/server/favorites-api';
import { badRequest } from '@/lib/server/api-primitives';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json().catch(() => null);

    if (!Array.isArray(body?.items)) {
      badRequest('items must be an array');
    }

    const items = (body.items as unknown[]).filter(
      (item): item is { targetType: 'bean' | 'roaster'; targetId: string } =>
        typeof item === 'object' &&
        item !== null &&
        (('targetType' in item && item.targetType === 'bean') ||
          ('targetType' in item && item.targetType === 'roaster')) &&
        'targetId' in item &&
        typeof item.targetId === 'string' &&
        item.targetId.length > 0
    );

    const favorites = await syncFavorites(user.id, items);
    return apiSuccess(favorites);
  } catch (err) {
    return apiError(err);
  }
}
