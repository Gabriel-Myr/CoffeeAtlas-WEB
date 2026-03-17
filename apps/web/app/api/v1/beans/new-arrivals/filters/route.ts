import { type NextRequest } from 'next/server';

import type {
  LocalFavoriteBeanPreference,
  LocalFavoriteRoasterPreference,
  NewArrivalFiltersRequest,
} from '@coffee-atlas/shared-types';

import { apiError, apiSuccess, badRequest } from '@/lib/server/api-helpers';
import { getCurrentUser } from '@/lib/server/auth-user';
import { getNewArrivalFiltersV1 } from '@/lib/server/new-arrival-filters-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseLocalBeans(value: unknown): LocalFavoriteBeanPreference[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) badRequest('localBeans must be an array', 'invalid_payload');

  const parsed = value
    .map((item): LocalFavoriteBeanPreference | null => {
      if (!item || typeof item !== 'object') return null;
      const originCountry = typeof item.originCountry === 'string' ? item.originCountry.trim() : '';
      const process = typeof item.process === 'string' ? item.process.trim() : '';
      if (!originCountry && !process) return null;
      return {
        originCountry: originCountry || undefined,
        process: process || undefined,
      };
    });

  return parsed.filter((item): item is LocalFavoriteBeanPreference => item !== null);
}

function parseLocalRoasters(value: unknown): LocalFavoriteRoasterPreference[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) badRequest('localRoasters must be an array', 'invalid_payload');

  const parsed = value
    .map((item): LocalFavoriteRoasterPreference | null => {
      if (!item || typeof item !== 'object') return null;
      const id = typeof item.id === 'string' ? item.id.trim() : '';
      const name = typeof item.name === 'string' ? item.name.trim() : '';
      if (!id || !name) return null;
      return { id, name };
    });

  return parsed.filter((item): item is LocalFavoriteRoasterPreference => item !== null);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = (await req.json().catch(() => ({}))) as NewArrivalFiltersRequest | null;

    const payload = await getNewArrivalFiltersV1({
      userId: user?.id,
      localBeans: parseLocalBeans(body?.localBeans),
      localRoasters: parseLocalRoasters(body?.localRoasters),
    });

    return apiSuccess(payload);
  } catch (err) {
    return apiError(err);
  }
}
