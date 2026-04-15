import {
  ORIGIN_ATLAS_CONTINENT_MAP,
  ORIGIN_ATLAS_CONTINENTS,
  matchAtlasCountry,
} from '../../utils/origin-atlas.ts';
import {
  getAvailableProcessStyleDefinitions,
  getProcessBaseLabel,
  normalizeProcess,
  type ProcessBaseId,
  type ProcessStyleId,
} from '@coffee-atlas/shared-types';
import type {
  BeanDiscoverPayload,
  BeanDiscoverQueryParams,
  CoffeeBean,
  DiscoverContinentId,
  NewArrivalFiltersPayload,
  NewArrivalFiltersRequest,
} from '../../types/index.ts';
import type { NewArrivalBeanSeed } from './shared-core.ts';
import {
  MAX_NEW_ARRIVAL_OPTIONS,
  normalizeOptionalString,
  normalizeString,
  splitMultiValueSegments,
} from './shared-core.ts';
import { LIGHT_QUESTION_COPY, formatLightQuestionTemplate } from '../../pages/all-beans/light-question-copy.ts';

export function matchesProcessFilters(
  bean: CoffeeBean,
  filters: {
    processBase?: ProcessBaseId;
    processStyle?: ProcessStyleId;
  }
): boolean {
  const processVariants = getBeanProcessVariants(bean);

  return processVariants.some((processVariant) => {
    if (filters.processBase && processVariant.base !== filters.processBase) {
      return false;
    }

    if (filters.processStyle && processVariant.style !== filters.processStyle) {
      return false;
    }

    return true;
  });
}

function getCountryFilterCandidates(country: string | undefined): string[] {
  if (!country) return [];
  const atlasCountry = matchAtlasCountry(country);
  if (!atlasCountry) return [country];
  return [atlasCountry.name, atlasCountry.id, ...atlasCountry.aliases];
}

function matchesCountryFilter(bean: CoffeeBean, country: string | undefined): boolean {
  if (!country) return true;

  const normalizedCandidates = new Set(
    getCountryFilterCandidates(country)
      .map((value) => normalizeString(value).toLowerCase())
      .filter((value) => value.length > 0)
  );
  if (normalizedCandidates.size === 0) return true;

  const atlasCountry = matchAtlasCountry(bean.originCountry);
  if (atlasCountry) {
    const beanCandidates = [atlasCountry.name, atlasCountry.id, ...atlasCountry.aliases]
      .map((value) => normalizeString(value).toLowerCase())
      .filter((value) => value.length > 0);
    return beanCandidates.some((value) => normalizedCandidates.has(value));
  }

  return normalizedCandidates.has(normalizeString(bean.originCountry).toLowerCase());
}

function matchesContinentFilter(bean: CoffeeBean, continent: DiscoverContinentId | undefined): boolean {
  if (!continent) return true;
  const atlasCountry = matchAtlasCountry(bean.originCountry);
  return atlasCountry?.continentId === continent;
}

function getBeanProcessVariants(
  bean: Pick<CoffeeBean, 'process' | 'processRaw' | 'processBase' | 'processStyle'>
) {
  const rawProcess = bean.processRaw ?? bean.process;
  const segments = splitMultiValueSegments(rawProcess);
  const variants = new Map<string, ReturnType<typeof normalizeProcess>>();

  if (segments.length <= 1) {
    const normalized = normalizeProcess(rawProcess, {
      base: bean.processBase,
      style: bean.processStyle,
    });
    variants.set(`${normalized.base}:${normalized.style}`, normalized);
    return [...variants.values()];
  }

  for (const segment of segments) {
    const normalized = normalizeProcess(segment);
    variants.set(`${normalized.base}:${normalized.style}`, normalized);
  }

  if (bean.processBase || bean.processStyle) {
    const normalizedFromOverrides = normalizeProcess(rawProcess, {
      base: bean.processBase,
      style: bean.processStyle,
    });
    variants.set(`${normalizedFromOverrides.base}:${normalizedFromOverrides.style}`, normalizedFromOverrides);
  }

  return [...variants.values()];
}

function containsCjk(text: string): boolean {
  return /[\u3400-\u9fff]/.test(text);
}

function toTitleCase(text: string): string {
  return text.replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

function normalizeVarietyToken(token: string): string {
  const normalized = normalizeString(token).replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  const compact = normalized.replace(/\s+/g, '');
  if (/^[a-z]+\d+[a-z0-9-]*$/i.test(compact)) {
    return compact.toUpperCase();
  }

  if (!containsCjk(normalized) && /^[a-z0-9-]+$/i.test(normalized)) {
    return /[0-9]/.test(normalized) ? normalized.toUpperCase() : toTitleCase(normalized.toLowerCase());
  }

  if (!containsCjk(normalized) && /[a-z]/i.test(normalized)) {
    return toTitleCase(normalized.toLowerCase());
  }

  return normalized;
}

function getVarietyTokens(value: string | undefined): string[] {
  return Array.from(
    new Set(
      splitMultiValueSegments(value)
        .map((token) => normalizeVarietyToken(token))
        .filter((token) => token.length > 0)
    )
  );
}

export function matchesVarietyFilter(bean: CoffeeBean, variety: string | undefined): boolean {
  if (!variety) return true;
  const beanVarietyKeys = new Set(getVarietyTokens(bean.variety).map((token) => token.toLowerCase()));
  if (beanVarietyKeys.size === 0) return false;

  return getVarietyTokens(variety).some((token) => beanVarietyKeys.has(token.toLowerCase()));
}

function filterBeansForDiscover(
  beans: CoffeeBean[],
  filters: {
    processBase?: ProcessBaseId;
    processStyle?: ProcessStyleId;
    continent?: DiscoverContinentId;
    country?: string;
    variety?: string;
  }
): CoffeeBean[] {
  return beans.filter((bean) => {
    if (!matchesProcessFilters(bean, filters)) return false;
    if (!matchesContinentFilter(bean, filters.continent)) return false;
    if (!matchesCountryFilter(bean, filters.country)) return false;
    if (!matchesVarietyFilter(bean, filters.variety)) return false;
    return true;
  });
}

function buildVarietyOptions(beans: CoffeeBean[]): BeanDiscoverPayload['varietyOptions'] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const bean of beans) {
    const varietyTokens = getVarietyTokens(bean.variety);

    for (const label of varietyTokens) {
      const key = label.toLowerCase();
      const current = counts.get(key);
      if (current) {
        current.count += 1;
        continue;
      }
      counts.set(key, { label, count: 1 });
    }
  }

  return [...counts.values()]
    .sort((left, right) => sortByCountThenLabel([left.label, left.count], [right.label, right.count]))
    .map(({ label, count }) => ({
      id: label,
      label,
      count,
    }));
}

function normalizeLabel(value: string | null | undefined): string | null {
  const normalized = normalizeOptionalString(value);
  return normalized && normalized.length > 0 ? normalized : null;
}

function sortByCountThenLabel(left: [string, number], right: [string, number]) {
  return right[1] - left[1] || left[0].localeCompare(right[0], 'zh-Hans-CN');
}

const discoverEditorialCopy = LIGHT_QUESTION_COPY.miniprogram.discoverEditorial;

function buildCountOptions(values: Array<string | null | undefined>) {
  const counts = new Map<string, number>();

  for (const value of values) {
    const normalized = normalizeLabel(value);
    if (!normalized) continue;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(sortByCountThenLabel)
    .slice(0, MAX_NEW_ARRIVAL_OPTIONS)
    .map(([label, count]) => ({
      id: label,
      label,
      count,
    }));
}

function buildRoasterOptions(beans: NewArrivalBeanSeed[]) {
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
    .slice(0, MAX_NEW_ARRIVAL_OPTIONS)
    .map(([id, value]) => ({
      id,
      label: value.label,
      count: value.count,
    }));
}

function buildProcessBaseOptions(beans: CoffeeBean[]): BeanDiscoverPayload['processBaseOptions'] {
  const counts = new Map<ProcessBaseId, number>();

  for (const bean of beans) {
    const processBases = new Set(getBeanProcessVariants(bean).map((processVariant) => processVariant.base));

    for (const processBase of processBases) {
      counts.set(processBase, (counts.get(processBase) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort(sortByCountThenLabel)
    .map(([id, count]) => ({
      id,
      label: getProcessBaseLabel(id),
      count,
    }));
}

function buildProcessStyleOptions(
  beans: CoffeeBean[],
  selectedProcessBase?: ProcessBaseId
): BeanDiscoverPayload['processStyleOptions'] {
  const allowedStyles = new Set(getAvailableProcessStyleDefinitions(selectedProcessBase).map((item) => item.id));
  const counts = new Map<ProcessStyleId, number>();

  for (const bean of beans) {
    const processStyles = new Set(
      getBeanProcessVariants(bean)
        .filter((processVariant) => !selectedProcessBase || processVariant.base === selectedProcessBase)
        .map((processVariant) => processVariant.style)
        .filter((processStyle) => allowedStyles.has(processStyle))
    );

    for (const processStyle of processStyles) {
      counts.set(processStyle, (counts.get(processStyle) ?? 0) + 1);
    }
  }

  return getAvailableProcessStyleDefinitions(selectedProcessBase)
    .map((definition) => ({
      id: definition.id,
      label: definition.label,
      count: counts.get(definition.id) ?? 0,
    }))
    .filter((option) => option.count > 0);
}

function buildDiscoverOptions(
  beans: CoffeeBean[],
  filters: Omit<BeanDiscoverQueryParams, 'q'>
): Pick<BeanDiscoverPayload, 'processBaseOptions' | 'processStyleOptions' | 'continentOptions' | 'countryOptions' | 'varietyOptions'> {
  const processBaseScopedBeans = filterBeansForDiscover(beans, {
    continent: filters.continent,
    country: filters.country,
  });
  const processBaseOptions = buildProcessBaseOptions(processBaseScopedBeans);

  const processStyleScopedBeans = filterBeansForDiscover(beans, {
    processBase: filters.processBase,
    continent: filters.continent,
    country: filters.country,
  });
  const processStyleOptions = buildProcessStyleOptions(processStyleScopedBeans, filters.processBase);

  const continentScopedBeans = filterBeansForDiscover(beans, {
    processBase: filters.processBase,
    processStyle: filters.processStyle,
  });

  const continentCounts = new Map<DiscoverContinentId, number>();
  const countryCounts = new Map<string, number>();

  for (const bean of continentScopedBeans) {
    const country = matchAtlasCountry(bean.originCountry);
    if (!country) continue;
    continentCounts.set(country.continentId, (continentCounts.get(country.continentId) ?? 0) + 1);
  }

  const continentOptions = ORIGIN_ATLAS_CONTINENTS
    .map((continent) => ({
      id: continent.id,
      label: continent.name,
      count: continentCounts.get(continent.id) ?? 0,
      description: continent.editorialLabel,
    }))
    .filter((option) => option.count > 0);

  const countryScopedBeans = filterBeansForDiscover(beans, {
    processBase: filters.processBase,
    processStyle: filters.processStyle,
    continent: filters.continent,
  });

  for (const bean of countryScopedBeans) {
    const country = matchAtlasCountry(bean.originCountry);
    if (!country) continue;
    countryCounts.set(country.name, (countryCounts.get(country.name) ?? 0) + 1);
  }

  const countryOptions = [...countryCounts.entries()]
    .sort(sortByCountThenLabel)
    .map(([label, count]) => ({
      id: label,
      label,
      count,
    }));

  const varietyScopedBeans = filterBeansForDiscover(beans, {
    processBase: filters.processBase,
    processStyle: filters.processStyle,
    continent: filters.continent,
    country: filters.country,
  });
  const varietyOptions = buildVarietyOptions(varietyScopedBeans);

  return {
    processBaseOptions,
    processStyleOptions,
    continentOptions,
    countryOptions,
    varietyOptions,
  };
}

function buildDiscoverEditorial(filters: Omit<BeanDiscoverQueryParams, 'q'>): BeanDiscoverPayload['editorial'] {
  if (filters.variety) {
    const template = discoverEditorialCopy.templates.variety;
    return {
      title: formatLightQuestionTemplate(template.titleTemplate, { variety: filters.variety }),
      subtitle: template.subtitle,
      mode: 'fallback',
    };
  }

  if (filters.country) {
    const template = discoverEditorialCopy.templates.country;
    return {
      title: formatLightQuestionTemplate(template.titleTemplate, { country: filters.country }),
      subtitle: template.subtitle,
      mode: 'fallback',
    };
  }

  if (filters.continent) {
    const continent = ORIGIN_ATLAS_CONTINENT_MAP.get(filters.continent);
    const template = discoverEditorialCopy.templates.continent;
    return {
      title:
        formatLightQuestionTemplate(template.titleTemplate, {
          continent: continent?.name ?? '',
        }).trim() || discoverEditorialCopy.templates.default.title,
      subtitle:
        formatLightQuestionTemplate(template.subtitleTemplate, {
          continentEditorialLabel: continent?.editorialLabel ?? '',
        }).trim() || discoverEditorialCopy.templates.default.subtitle,
      mode: 'fallback',
    };
  }

  if (filters.processBase) {
    const template = discoverEditorialCopy.templates.processBase;
    return {
      title: formatLightQuestionTemplate(template.titleTemplate, {
        processBase: getProcessBaseLabel(filters.processBase),
      }),
      subtitle: template.subtitle,
      mode: 'fallback',
    };
  }

  return {
    title: discoverEditorialCopy.templates.default.title,
    subtitle: discoverEditorialCopy.templates.default.subtitle,
    mode: 'fallback',
  };
}

function buildDiscoverReason(bean: CoffeeBean, filters: Omit<BeanDiscoverQueryParams, 'q'>) {
  const country = matchAtlasCountry(bean.originCountry);
  const normalizedProcess = normalizeProcess(bean.processRaw ?? bean.process, {
    base: bean.processBase,
    style: bean.processStyle,
  });
  if (matchesVarietyFilter(bean, filters.variety)) {
    return formatLightQuestionTemplate(discoverEditorialCopy.reasons.variety, {
      variety: filters.variety,
    });
  }
  if (filters.country && country?.name === filters.country) {
    return formatLightQuestionTemplate(discoverEditorialCopy.reasons.country, {
      country: filters.country,
    });
  }
  if (filters.processBase && normalizedProcess.base === filters.processBase) {
    return formatLightQuestionTemplate(discoverEditorialCopy.reasons.processBase, {
      processLabel: normalizedProcess.label || getProcessBaseLabel(filters.processBase),
    });
  }
  if (filters.continent && country?.continentId === filters.continent) {
    const continent = ORIGIN_ATLAS_CONTINENT_MAP.get(filters.continent);
    return formatLightQuestionTemplate(discoverEditorialCopy.reasons.continent, {
      continent: continent?.name ?? '当前大洲',
    });
  }
  if (bean.isNewArrival) {
    return discoverEditorialCopy.reasons.newArrival;
  }
  return discoverEditorialCopy.reasons.default;
}

function scoreDiscoverPick(bean: CoffeeBean, filters: Omit<BeanDiscoverQueryParams, 'q'>) {
  const country = matchAtlasCountry(bean.originCountry);
  const normalizedProcess = normalizeProcess(bean.processRaw ?? bean.process, {
    base: bean.processBase,
    style: bean.processStyle,
  });
  let score = bean.salesCount;
  if (bean.isInStock) score += 1000;
  if (bean.isNewArrival) score += 600;
  if (filters.processBase && normalizedProcess.base === filters.processBase) score += 300;
  if (filters.processStyle && normalizedProcess.style === filters.processStyle) score += 220;
  if (filters.country && country?.name === filters.country) score += 500;
  if (filters.continent && country?.continentId === filters.continent) score += 240;
  if (matchesVarietyFilter(bean, filters.variety)) score += 180;
  return score;
}

export function buildBeanDiscoverPayload({
  beans,
  filters,
}: {
  beans: CoffeeBean[];
  filters: Omit<BeanDiscoverQueryParams, 'q'>;
}): BeanDiscoverPayload {
  const resultBeans = filterBeansForDiscover(beans, filters);
  const options = buildDiscoverOptions(beans, filters);
  const editorial = buildDiscoverEditorial(filters);
  const editorPicks = [...resultBeans]
    .sort((left, right) => scoreDiscoverPick(right, filters) - scoreDiscoverPick(left, filters))
    .slice(0, filters.country ? 3 : 4)
    .map((bean) => ({
      bean,
      reason: buildDiscoverReason(bean, filters),
    }));

  return {
    ...options,
    editorial,
    editorPicks,
    resultSummary: {
      total: resultBeans.length,
      processBase: filters.processBase,
      processStyle: filters.processStyle,
      continent: filters.continent,
      country: filters.country,
      variety: filters.variety,
    },
  };
}

export function buildNewArrivalFiltersPayload({
  beanFavorites,
  roasterFavorites,
  fallbackBeans,
}: {
  beanFavorites: NewArrivalFiltersRequest['beanFavorites'];
  roasterFavorites: NewArrivalFiltersRequest['roasterFavorites'];
  fallbackBeans: NewArrivalBeanSeed[];
}): NewArrivalFiltersPayload {
  const personalizedRoasterOptions = (roasterFavorites ?? [])
    .map((favorite) => {
      const id = normalizeLabel(favorite.id);
      const label = normalizeLabel(favorite.name);
      if (!id || !label) return null;
      return { id, label, count: 1 };
    })
    .filter((item): item is { id: string; label: string; count: number } => Boolean(item))
    .slice(0, MAX_NEW_ARRIVAL_OPTIONS);
  const fallbackRoasterOptions = buildRoasterOptions(fallbackBeans);

  const personalizedProcessOptions = buildCountOptions((beanFavorites ?? []).map((item) => item.process));
  const fallbackProcessOptions = buildCountOptions(fallbackBeans.map((item) => item.process));

  const personalizedOriginOptions = buildCountOptions((beanFavorites ?? []).map((item) => item.originCountry));
  const fallbackOriginOptions = buildCountOptions(fallbackBeans.map((item) => item.originCountry));

  const personalizedCount = [
    personalizedRoasterOptions.length > 0,
    personalizedProcessOptions.length > 0,
    personalizedOriginOptions.length > 0,
  ].filter(Boolean).length;

  return {
    mode: personalizedCount === 3 ? 'personalized' : personalizedCount === 0 ? 'fallback' : 'mixed',
    roasterOptions: personalizedRoasterOptions.length > 0 ? personalizedRoasterOptions : fallbackRoasterOptions,
    processOptions: personalizedProcessOptions.length > 0 ? personalizedProcessOptions : fallbackProcessOptions,
    originOptions: personalizedOriginOptions.length > 0 ? personalizedOriginOptions : fallbackOriginOptions,
  };
}
