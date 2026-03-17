import type { CatalogBeanCard } from '@coffee-atlas/shared-types';

export interface FavoriteBeanPreference {
  originCountry?: string;
  process?: string;
}

export interface FavoriteRoasterPreference {
  id: string;
  name: string;
}

export interface NewArrivalFilterOption {
  id: string;
  label: string;
  count: number;
}

export type NewArrivalFilterSource = 'personalized' | 'fallback';
export type NewArrivalFilterMode = 'personalized' | 'mixed' | 'fallback';

export interface NewArrivalFiltersPayloadInternal {
  mode: NewArrivalFilterMode;
  roasterOptions: NewArrivalFilterOption[];
  processOptions: NewArrivalFilterOption[];
  originOptions: NewArrivalFilterOption[];
  sources: {
    roaster: NewArrivalFilterSource;
    process: NewArrivalFilterSource;
    origin: NewArrivalFilterSource;
  };
}

function normalizeToken(value: string | undefined): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function compareByCountThenLabel(
  left: { count: number; label: string },
  right: { count: number; label: string }
): number {
  return right.count - left.count || left.label.localeCompare(right.label, 'zh-Hans-CN');
}

function countNewArrivalValues(
  beans: CatalogBeanCard[],
  resolveKey: (bean: CatalogBeanCard) => string | null,
  resolveLabel: (bean: CatalogBeanCard) => string | null = resolveKey
) {
  const counts = new Map<string, { label: string; count: number }>();

  for (const bean of beans) {
    const key = resolveKey(bean);
    const label = resolveLabel(bean);
    if (!key || !label) continue;

    const current = counts.get(key) ?? { label, count: 0 };
    current.count += 1;
    counts.set(key, current);
  }

  return counts;
}

function buildHotOptions(
  beans: CatalogBeanCard[],
  resolveKey: (bean: CatalogBeanCard) => string | null,
  resolveLabel?: (bean: CatalogBeanCard) => string | null,
  limit = 3
): NewArrivalFilterOption[] {
  return [...countNewArrivalValues(beans, resolveKey, resolveLabel).entries()]
    .map(([id, entry]) => ({ id, label: entry.label, count: entry.count }))
    .sort(compareByCountThenLabel)
    .slice(0, limit);
}

function buildPersonalRoasterOptions(args: {
  favoriteRoasters: FavoriteRoasterPreference[];
  newArrivalBeans: CatalogBeanCard[];
  limit: number;
}): NewArrivalFilterOption[] {
  const availability = countNewArrivalValues(
    args.newArrivalBeans,
    (bean) => normalizeToken(bean.roasterId),
    (bean) => normalizeToken(bean.roasterName)
  );

  const options: NewArrivalFilterOption[] = [];
  for (const favorite of args.favoriteRoasters) {
    const id = normalizeToken(favorite.id);
    if (!id) continue;

    const available = availability.get(id);
    if (!available) continue;

    options.push({
      id,
      label: normalizeToken(favorite.name) ?? available.label,
      count: available.count,
    });

    if (options.length >= args.limit) break;
  }

  return options;
}

function buildPersonalValueOptions(args: {
  favoriteBeans: FavoriteBeanPreference[];
  newArrivalBeans: CatalogBeanCard[];
  limit: number;
  readValue: (bean: FavoriteBeanPreference) => string | undefined;
  readNewArrivalValue: (bean: CatalogBeanCard) => string | undefined;
}): NewArrivalFilterOption[] {
  const favoriteCounts = new Map<string, number>();
  for (const favorite of args.favoriteBeans) {
    const value = normalizeToken(args.readValue(favorite));
    if (!value) continue;
    favoriteCounts.set(value, (favoriteCounts.get(value) ?? 0) + 1);
  }

  const availability = countNewArrivalValues(
    args.newArrivalBeans,
    (bean) => normalizeToken(args.readNewArrivalValue(bean))
  );

  return [...favoriteCounts.entries()]
    .map(([value, favoriteCount]) => ({
      id: value,
      label: value,
      count: availability.get(value)?.count ?? 0,
      favoriteCount,
    }))
    .filter((entry) => entry.count > 0)
    .sort((left, right) => {
      return (
        right.favoriteCount - left.favoriteCount ||
        right.count - left.count ||
        left.label.localeCompare(right.label, 'zh-Hans-CN')
      );
    })
    .slice(0, args.limit)
    .map(({ id, label, count }) => ({ id, label, count }));
}

export function buildNewArrivalFiltersPayload(args: {
  favoriteBeans: FavoriteBeanPreference[];
  favoriteRoasters: FavoriteRoasterPreference[];
  newArrivalBeans: CatalogBeanCard[];
  limit?: number;
}): NewArrivalFiltersPayloadInternal {
  const limit = args.limit ?? 3;

  const personalizedRoasterOptions = buildPersonalRoasterOptions({
    favoriteRoasters: args.favoriteRoasters,
    newArrivalBeans: args.newArrivalBeans,
    limit,
  });
  const personalizedProcessOptions = buildPersonalValueOptions({
    favoriteBeans: args.favoriteBeans,
    newArrivalBeans: args.newArrivalBeans,
    limit,
    readValue: (bean) => bean.process,
    readNewArrivalValue: (bean) => bean.process,
  });
  const personalizedOriginOptions = buildPersonalValueOptions({
    favoriteBeans: args.favoriteBeans,
    newArrivalBeans: args.newArrivalBeans,
    limit,
    readValue: (bean) => bean.originCountry,
    readNewArrivalValue: (bean) => bean.originCountry,
  });

  const roasterOptions =
    personalizedRoasterOptions.length > 0
      ? personalizedRoasterOptions
      : buildHotOptions(
          args.newArrivalBeans,
          (bean) => normalizeToken(bean.roasterId),
          (bean) => normalizeToken(bean.roasterName),
          limit
        );
  const processOptions =
    personalizedProcessOptions.length > 0
      ? personalizedProcessOptions
      : buildHotOptions(args.newArrivalBeans, (bean) => normalizeToken(bean.process), undefined, limit);
  const originOptions =
    personalizedOriginOptions.length > 0
      ? personalizedOriginOptions
      : buildHotOptions(args.newArrivalBeans, (bean) => normalizeToken(bean.originCountry), undefined, limit);

  const sources = {
    roaster: personalizedRoasterOptions.length > 0 ? 'personalized' : 'fallback',
    process: personalizedProcessOptions.length > 0 ? 'personalized' : 'fallback',
    origin: personalizedOriginOptions.length > 0 ? 'personalized' : 'fallback',
  } satisfies NewArrivalFiltersPayloadInternal['sources'];

  const sourceValues = Object.values(sources);
  const mode: NewArrivalFilterMode =
    sourceValues.every((source) => source === 'personalized')
      ? 'personalized'
      : sourceValues.every((source) => source === 'fallback')
        ? 'fallback'
        : 'mixed';

  return {
    mode,
    roasterOptions,
    processOptions,
    originOptions,
    sources,
  };
}
