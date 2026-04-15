import { type NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/lib/server/api-helpers';
import { requireUser } from '@/lib/server/auth-user';
import { getBadgeIds } from '@/lib/server/badges-api';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const badgeIds = await getBadgeIds(user.id);

    return apiSuccess({ badgeIds });
  } catch (err) {
    return apiError(err);
  }
}
