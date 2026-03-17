import type {
  NewArrivalFilterOption,
  NewArrivalFiltersMode,
  NewArrivalFiltersPayload,
} from '@coffee-atlas/shared-types';

export interface FavoriteBeanPreference {
  process?: string;
  originCountry?: string;
}

export interface FavoriteRoasterPreference {
  id: string;
  name: string;
}

export interface NewArrivalBeanSeed {
  roasterId: string;
  roasterName: string;
  process: string;
  originCountry: string;
}

const MAX_OPTIONS = 3;

function normalizeLabel(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function sortByCountThenLabel(left: [string, number], right: [string, number]) {
  return right[1] - left[1] || left[0].localeCompare(right[0], 'zh-Hans-CN');
}

function buildCountOptions(values: Array<string | null | undefined>): NewArrivalFilterOption[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    const normalized = normalizeLabel(value);
    if (!normalized) continue;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(sortByCountThenLabel)
    .slice(0, MAX_OPTIONS)
    .map(([label, count]) => ({
      id: label,
      label,
      count,
    }));
}

function buildRoasterFavoriteOptions(roasters: FavoriteRoasterPreference[]): NewArrivalFilterOption[] {
  const seen = new Set<string>();
  const options: NewArrivalFilterOption[] = [];

  for (const roaster of roasters) {
    const id = normalizeLabel(roaster.id);
    const name = normalizeLabel(roaster.name);
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);
    options.push({
      id,
      label: name,
      count: 1,
    });
    if (options.length >= MAX_OPTIONS) break;
  }

  return options;
}

function buildRoasterFallbackOptions(beans: NewArrivalBeanSeed[]): NewArrivalFilterOption[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const bean of beans) {
    const id = normalizeLabel(bean.roasterId);
    const label = normalizeLabel(bean.roasterName);
    if (!id || !label) continue;

    const current = counts.get(id);
    if (current) {
      current.count += 1;
      continue;
    }

    counts.set(id, { label, count: 1 });
  }

  return [...counts.entries()]
    .sort((left, right) => {
      const countDiff = right[1].count - left[1].count;
      if (countDiff !== 0) return countDiff;
      return left[1].label.localeCompare(right[1].label, 'zh-Hans-CN');
    })
    .slice(0, MAX_OPTIONS)
    .map(([id, value]) => ({
      id,
      label: value.label,
      count: value.count,
    }));
}

function resolveMode(groupModes: Array<'personalized' | 'fallback'>): NewArrivalFiltersMode {
  const personalizedCount = groupModes.filter((mode) => mode === 'personalized').length;

  if (personalizedCount === groupModes.length) return 'personalized';
  if (personalizedCount === 0) return 'fallback';
  return 'mixed';
}

export function buildNewArrivalFiltersPayload({
  favoriteBeans,
  favoriteRoasters,
  fallbackBeans,
}: {
  favoriteBeans: FavoriteBeanPreference[];
  favoriteRoasters: FavoriteRoasterPreference[];
  fallbackBeans: NewArrivalBeanSeed[];
}): NewArrivalFiltersPayload {
  const roasterOptions = buildRoasterFavoriteOptions(favoriteRoasters);
  const fallbackRoasterOptions = buildRoasterFallbackOptions(fallbackBeans);

  const processOptions = buildCountOptions(favoriteBeans.map((item) => item.process));
  const fallbackProcessOptions = buildCountOptions(fallbackBeans.map((item) => item.process));

  const originOptions = buildCountOptions(favoriteBeans.map((item) => item.originCountry));
  const fallbackOriginOptions = buildCountOptions(fallbackBeans.map((item) => item.originCountry));

  const resolvedRoasterOptions = roasterOptions.length > 0 ? roasterOptions : fallbackRoasterOptions;
  const resolvedProcessOptions = processOptions.length > 0 ? processOptions : fallbackProcessOptions;
  const resolvedOriginOptions = originOptions.length > 0 ? originOptions : fallbackOriginOptions;

  return {
    mode: resolveMode([
      roasterOptions.length > 0 ? 'personalized' : 'fallback',
      processOptions.length > 0 ? 'personalized' : 'fallback',
      originOptions.length > 0 ? 'personalized' : 'fallback',
    ]),
    roasterOptions: resolvedRoasterOptions,
    processOptions: resolvedProcessOptions,
    originOptions: resolvedOriginOptions,
  };
}
