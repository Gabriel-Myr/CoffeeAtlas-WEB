import { NextRequest } from 'next/server';

import type { LocalFavoriteBeanPreference, LocalFavoriteRoasterPreference } from '@coffee-atlas/shared-types';

import { apiError, apiSuccess, normalizeString } from '@/lib/server/api-helpers';
import { getCurrentUser } from '@/lib/server/auth-user';
import { getNewArrivalFiltersV1 } from '@/lib/server/new-arrival-filters-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseLocalBeanFavorites(value: unknown): LocalFavoriteBeanPreference[] {
  if (!Array.isArray(value)) return [];

  const favorites: LocalFavoriteBeanPreference[] = [];

  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;

    const process = normalizeString('process' in item && typeof item.process === 'string' ? item.process : undefined);
    const originCountry = normalizeString(
      'originCountry' in item && typeof item.originCountry === 'string' ? item.originCountry : undefined
    );

    if (!process && !originCountry) continue;

    favorites.push({
      process: process ?? undefined,
      originCountry: originCountry ?? undefined,
    });
  }

  return favorites;
}

function parseLocalRoasterFavorites(value: unknown): LocalFavoriteRoasterPreference[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item !== 'object' || item === null) return null;

      const id = normalizeString('id' in item && typeof item.id === 'string' ? item.id : undefined);
      const name = normalizeString('name' in item && typeof item.name === 'string' ? item.name : undefined);
      if (!id || !name) return null;

      return { id, name };
    })
    .filter((item): item is LocalFavoriteRoasterPreference => item !== null);
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json().catch(() => null);
    const user = await getCurrentUser(request);
    const result = await getNewArrivalFiltersV1({
      userId: user?.id,
      localBeanFavorites: parseLocalBeanFavorites(body?.beanFavorites),
      localRoasterFavorites: parseLocalRoasterFavorites(body?.roasterFavorites),
    });

    return apiSuccess(result, requestId);
  } catch (error) {
    return apiError(error, requestId);
  }
}
