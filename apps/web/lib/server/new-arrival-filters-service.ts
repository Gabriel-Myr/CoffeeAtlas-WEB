import type {
  LocalFavoriteBeanPreference,
  LocalFavoriteRoasterPreference,
  NewArrivalFiltersPayload,
} from '@coffee-atlas/shared-types';

import { getCatalogBeansByIds } from '@/lib/catalog';
import { getLatestSyncedNewArrivalBeanIds } from '@/lib/new-arrivals';
import { hasSupabaseServerEnv } from '@/lib/supabase';

import { getFavorites } from './favorites-api';
import { buildNewArrivalFiltersPayload } from './new-arrival-filters';

async function getCurrentNewArrivalBeans() {
  if (!hasSupabaseServerEnv) return [];
  const ids = await getLatestSyncedNewArrivalBeanIds();
  if (ids.length === 0) return [];
  return getCatalogBeansByIds(ids);
}

export async function getNewArrivalFiltersV1(args: {
  userId?: string;
  localBeans?: LocalFavoriteBeanPreference[];
  localRoasters?: LocalFavoriteRoasterPreference[];
}): Promise<NewArrivalFiltersPayload> {
  const [favorites, newArrivalBeans] = await Promise.all([
    args.userId ? getFavorites(args.userId) : Promise.resolve(null),
    getCurrentNewArrivalBeans(),
  ]);

  const favoriteBeans: LocalFavoriteBeanPreference[] = favorites
    ? favorites.flatMap((favorite) => {
        if (favorite.target_type !== 'bean' || !favorite.bean) return [];
        return [
          {
            originCountry: favorite.bean.originCountry,
            process: favorite.bean.process,
          },
        ];
      })
    : (args.localBeans ?? []);

  const favoriteRoasters: LocalFavoriteRoasterPreference[] = favorites
    ? favorites.flatMap((favorite) => {
        if (favorite.target_type !== 'roaster' || !favorite.roaster) return [];
        return [
          {
            id: favorite.roaster.id,
            name: favorite.roaster.name,
          },
        ];
      })
    : (args.localRoasters ?? []);

  const payload = buildNewArrivalFiltersPayload({
    favoriteBeans,
    favoriteRoasters,
    newArrivalBeans,
  });

  return {
    mode: payload.mode,
    roasterOptions: payload.roasterOptions,
    processOptions: payload.processOptions,
    originOptions: payload.originOptions,
  };
}
