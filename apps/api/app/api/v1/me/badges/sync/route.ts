import { type NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/lib/server/api-helpers';
import { badRequest } from '@/lib/server/api-primitives';
import { requireUser } from '@/lib/server/auth-user';
import { normalizeBadgeIds, syncBadgeIds } from '@/lib/server/badges-api';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json().catch(() => null);

    if (body === null || typeof body !== 'object') {
      badRequest('request body must be an object');
    }

    const badgeIds = normalizeBadgeIds((body as { badgeIds?: unknown }).badgeIds);
    const synced = await syncBadgeIds(user.id, badgeIds);

    return apiSuccess({ synced });
  } catch (err) {
    return apiError(err);
  }
}
