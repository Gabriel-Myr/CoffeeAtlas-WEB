import { type NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/lib/server/api-helpers';
import { badRequest } from '@/lib/server/api-primitives';
import { requireUser } from '@/lib/server/auth-user';
import { addFavorite, getFavorites } from '@/lib/server/favorites-api';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const favorites = await getFavorites(user.id);
    return apiSuccess(favorites);
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json().catch(() => null);

    const targetType = body?.targetType;
    const targetId = body?.targetId;

    if (targetType !== 'bean' && targetType !== 'roaster') {
      badRequest('targetType must be "bean" or "roaster"');
    }
    if (typeof targetId !== 'string' || !targetId.trim()) {
      badRequest('targetId is required');
    }

    const favorite = await addFavorite(user.id, targetType, targetId.trim());
    return apiSuccess(favorite);
  } catch (err) {
    return apiError(err);
  }
}
