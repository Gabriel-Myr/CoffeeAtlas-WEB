import type {
  NewArrivalFilterOption,
  NewArrivalFiltersPayload,
  NewArrivalFiltersRequest,
} from '../../types';
import type { BeanSnapshot, RoasterSnapshot } from '../../utils/storage';
import type { CoffeeBean } from '../../types';

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

function buildRoasterOptions(beans: CoffeeBean[]): NewArrivalFilterOption[] {
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

export function buildNewArrivalFiltersRequest(
  beanFavorites: BeanSnapshot[],
  roasterFavorites: RoasterSnapshot[]
): NewArrivalFiltersRequest {
  return {
    beanFavorites: beanFavorites.map((favorite) => ({
      process: normalizeLabel(favorite.process) ?? undefined,
      originCountry: normalizeLabel(favorite.originCountry) ?? undefined,
    })),
    roasterFavorites: roasterFavorites
      .map((favorite) => {
        const id = normalizeLabel(favorite.id);
        const name = normalizeLabel(favorite.name);
        if (!id || !name) return null;
        return { id, name };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
  };
}

export function buildNewArrivalBeanRequestParams({
  searchQuery,
  selectedRoasterId,
  selectedProcess,
  selectedOriginCountry,
  page,
  pageSize,
}: {
  searchQuery: string;
  selectedRoasterId: string;
  selectedProcess: string;
  selectedOriginCountry: string;
  page: number;
  pageSize: number;
}) {
  return {
    page,
    pageSize,
    q: normalizeLabel(searchQuery) ?? undefined,
    sort: 'updated_desc' as const,
    isNewArrival: true as const,
    roasterId: normalizeLabel(selectedRoasterId) ?? undefined,
    process: normalizeLabel(selectedProcess) ?? undefined,
    originCountry: normalizeLabel(selectedOriginCountry) ?? undefined,
  };
}

export function buildLocalNewArrivalFiltersFallback(beans: CoffeeBean[]): NewArrivalFiltersPayload {
  const newArrivalBeans = beans.filter((bean) => bean.isNewArrival);

  return {
    mode: 'fallback',
    roasterOptions: buildRoasterOptions(newArrivalBeans),
    processOptions: buildCountOptions(newArrivalBeans.map((bean) => bean.process)),
    originOptions: buildCountOptions(newArrivalBeans.map((bean) => bean.originCountry)),
  };
}
