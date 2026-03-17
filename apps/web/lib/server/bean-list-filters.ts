export interface BeanListFilterable {
  name: string;
  roasterId: string;
  roasterName: string;
  originCountry: string;
  originRegion: string;
  process: string;
  roastLevel: string;
  variety: string;
  tastingNotes?: string[];
  isNewArrival?: boolean;
}

export interface BeanCountryMatch {
  name: string;
  continentId: string;
}

export interface BeanListFiltersInput {
  q?: string;
  roasterId?: string;
  originCountry?: string;
  process?: string;
  roastLevel?: string;
  country?: string;
  continent?: string;
  isNewArrival?: boolean;
}

export function matchesBeanListFilters(
  bean: BeanListFilterable,
  filters: BeanListFiltersInput,
  resolveCountry: (value: string) => BeanCountryMatch | null = () => null
): boolean {
  const {
    q,
    roasterId,
    originCountry,
    process,
    roastLevel,
    country,
    continent,
    isNewArrival,
  } = filters;

  if (q) {
    const lowered = q.toLowerCase();
    const searchableValues = [
      bean.name,
      bean.roasterName,
      bean.originCountry,
      bean.originRegion,
      bean.process,
      bean.variety,
      ...(bean.tastingNotes ?? []),
    ].filter((value): value is string => Boolean(value));

    if (!searchableValues.some((value) => value.toLowerCase().includes(lowered))) {
      return false;
    }
  }

  if (roasterId && bean.roasterId !== roasterId) {
    return false;
  }

  if (originCountry && !bean.originCountry.toLowerCase().includes(originCountry.toLowerCase())) {
    return false;
  }

  if (process && !bean.process.toLowerCase().includes(process.toLowerCase())) {
    return false;
  }

  if (roastLevel && !bean.roastLevel.toLowerCase().includes(roastLevel.toLowerCase())) {
    return false;
  }

  const matchedCountry = resolveCountry(bean.originCountry) ?? resolveCountry(bean.name);

  if (country) {
    const targetCountry = resolveCountry(country);
    if (!targetCountry) {
      if (!bean.originCountry.toLowerCase().includes(country.toLowerCase())) return false;
    } else if (matchedCountry?.name !== targetCountry.name) {
      return false;
    }
  }

  if (continent && matchedCountry?.continentId !== continent) {
    return false;
  }

  if (typeof isNewArrival === 'boolean' && bean.isNewArrival !== isNewArrival) {
    return false;
  }

  return true;
}
