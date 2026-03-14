'use client';

import { useMemo } from 'react';
import { ArrowLeft, ArrowUpRight, Coffee, Leaf, MapPin, Sparkles, Store } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import type { CoffeeBean } from '@/lib/catalog';
import {
  type CountryAtlasStats,
  type OriginAtlasContinent,
  type OriginAtlasCountry,
  ORIGIN_ATLAS_CONTINENTS,
  ORIGIN_ATLAS_COUNTRIES_BY_CONTINENT,
  getAtlasContinentById,
  getAtlasCountryByName,
  matchAtlasCountry,
} from '@/lib/geo-data';
import { formatSalesCount } from '@/lib/sales';

import MapSilhouette from './MapSilhouette';

interface OriginAtlasExplorerProps {
  beans: CoffeeBean[];
  selectedContinent: string | null;
  selectedCountry: string | null;
  onSelectContinent: (continentId: string) => void;
  onSelectCountry: (countryName: string) => void;
  onBack: () => void;
}

interface CountryAtlasDerivedStats extends CountryAtlasStats {
  beans: CoffeeBean[];
  tastingNotes: string[];
  averagePrice: number | null;
  inStockCount: number;
}

const EMPTY_STATS: CountryAtlasDerivedStats = {
  beanCount: 0,
  roasterCount: 0,
  regions: [],
  processes: [],
  beans: [],
  tastingNotes: [],
  averagePrice: null,
  inStockCount: 0,
};

function buildCountryStats(beans: CoffeeBean[]) {
  const stats = new Map<string, CountryAtlasDerivedStats>();

  for (const bean of beans) {
    const country = matchAtlasCountry(bean.originCountry) ?? matchAtlasCountry(bean.name);
    if (!country) continue;

    const entry = stats.get(country.name) ?? {
      beanCount: 0,
      roasterCount: 0,
      regions: [],
      processes: [],
      beans: [],
      tastingNotes: [],
      averagePrice: null,
      inStockCount: 0,
    };

    entry.beanCount += 1;
    entry.beans.push(bean);
    if (bean.isInStock) entry.inStockCount += 1;
    if (bean.originRegion && !entry.regions.includes(bean.originRegion)) {
      entry.regions.push(bean.originRegion);
    }
    if (bean.process && !entry.processes.includes(bean.process)) {
      entry.processes.push(bean.process);
    }
    for (const note of bean.tastingNotes) {
      if (note && !entry.tastingNotes.includes(note)) {
        entry.tastingNotes.push(note);
      }
    }

    stats.set(country.name, entry);
  }

  for (const [, entry] of stats) {
    const roasterIds = new Set(entry.beans.map((bean) => bean.roasterId).filter(Boolean));
    entry.roasterCount = roasterIds.size;
    const pricedBeans = entry.beans.filter((bean) => bean.price > 0);
    entry.averagePrice =
      pricedBeans.length > 0
        ? Math.round(pricedBeans.reduce((sum, bean) => sum + bean.price, 0) / pricedBeans.length)
        : null;
    entry.beans.sort((left, right) => right.salesCount - left.salesCount);
  }

  return stats;
}

function getContinentSummary(
  continent: OriginAtlasContinent,
  countryStatsMap: Map<string, CountryAtlasDerivedStats>
) {
  return continent.countries.reduce(
    (summary, countryName) => {
      const stats = countryStatsMap.get(countryName) ?? EMPTY_STATS;
      summary.beanCount += stats.beanCount;
      summary.roasterCount += stats.roasterCount;
      return summary;
    },
    { beanCount: 0, roasterCount: 0 }
  );
}

function ContinentAtlasCard({
  continent,
  countryStatsMap,
  onSelect,
}: {
  continent: OriginAtlasContinent;
  countryStatsMap: Map<string, CountryAtlasDerivedStats>;
  onSelect: (continentId: string) => void;
}) {
  const summary = getContinentSummary(continent, countryStatsMap);
  const previewCountries = continent.countries.slice(0, continent.id === 'americas' ? 5 : 3);

  if (continent.cardVariant === 'panorama') {
    return (
      <button
        onClick={() => onSelect(continent.id)}
        className="group relative overflow-hidden rounded-[2rem] border border-[var(--atlas-line)] bg-[var(--atlas-panel)] text-left shadow-[var(--shadow-card)] transition-transform duration-300 hover:-translate-y-1 lg:col-span-12"
      >
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,_var(--atlas-highlight)_0%,_transparent_70%)] opacity-60" />
        <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div className="relative flex flex-col justify-between gap-6">
            <div>
              <div className="mb-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[var(--atlas-ink-soft)]">
                <span>{continent.icon}</span>
                <span>{continent.editorialLabel}</span>
              </div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-serif text-4xl font-bold text-[var(--color-coffee-dark)] lg:text-5xl">{continent.name}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--atlas-ink-soft)]">{continent.description}</p>
                </div>
                <ArrowUpRight className="hidden h-6 w-6 text-[var(--atlas-accent)] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 lg:block" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {previewCountries.map((countryName) => (
                <span
                  key={countryName}
                  className="rounded-full border border-[var(--atlas-line)] bg-[var(--atlas-chip)] px-3 py-1 text-xs font-medium text-[var(--color-coffee-dark)]"
                >
                  {countryName}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
            <div className="rounded-[1.6rem] border border-[var(--atlas-line)] bg-[var(--atlas-veil)] p-5">
              <div className="h-44 w-full">
                <MapSilhouette path={continent.path} color={continent.color} detail interactive />
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-[1.4rem] border border-[var(--atlas-line)] bg-white/85 p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-ink-soft)]">Countries</div>
                <div className="mt-2 font-serif text-3xl text-[var(--color-coffee-dark)]">{continent.countries.length}</div>
              </div>
              <div className="rounded-[1.4rem] border border-[var(--atlas-line)] bg-white/85 p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-ink-soft)]">Beans</div>
                <div className="mt-2 font-serif text-3xl text-[var(--color-coffee-dark)]">{summary.beanCount}</div>
              </div>
              <div className="rounded-[1.4rem] border border-[var(--atlas-line)] bg-white/85 p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-ink-soft)]">Roasters</div>
                <div className="mt-2 font-serif text-3xl text-[var(--color-coffee-dark)]">{summary.roasterCount}</div>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect(continent.id)}
      className={[
        'group relative overflow-hidden rounded-[2rem] border border-[var(--atlas-line)] bg-[var(--atlas-panel)] text-left shadow-[var(--shadow-card)] transition-transform duration-300 hover:-translate-y-1',
        continent.cardVariant === 'split' ? 'lg:col-span-7' : 'lg:col-span-5',
      ].join(' ')}
    >
      <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,_var(--atlas-highlight)_0%,_transparent_75%)] opacity-60" />
      <div className={continent.cardVariant === 'split' ? 'grid gap-6 p-6 lg:grid-cols-[220px_1fr] lg:p-7' : 'grid gap-5 p-6 lg:p-7'}>
        <div className="rounded-[1.6rem] border border-[var(--atlas-line)] bg-[var(--atlas-veil)] p-4">
          <div className={continent.cardVariant === 'split' ? 'h-44' : 'mx-auto h-40 max-w-[220px]'}>
            <MapSilhouette path={continent.path} color={continent.color} detail interactive />
          </div>
        </div>
        <div className="flex flex-col justify-between gap-5">
          <div>
            <div className="mb-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[var(--atlas-ink-soft)]">
              <span>{continent.icon}</span>
              <span>{continent.editorialLabel}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-3xl font-bold text-[var(--color-coffee-dark)]">{continent.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--atlas-ink-soft)]">{continent.description}</p>
              </div>
              <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-[var(--atlas-accent)] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <AtlasMetric label="Countries" value={String(continent.countries.length)} />
            <AtlasMetric label="Beans" value={String(summary.beanCount)} />
            <AtlasMetric label="Roasters" value={String(summary.roasterCount)} />
          </div>

          <div className="flex flex-wrap gap-2">
            {previewCountries.map((countryName) => (
              <span
                key={countryName}
                className="rounded-full border border-[var(--atlas-line)] bg-[var(--atlas-chip)] px-3 py-1 text-xs font-medium text-[var(--color-coffee-dark)]"
              >
                {countryName}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

function CountryIndexCard({
  country,
  stats,
  onSelect,
}: {
  country: OriginAtlasCountry;
  stats: CountryAtlasDerivedStats;
  onSelect: (countryName: string) => void;
}) {
  const variantClasses: Record<OriginAtlasCountry['layoutVariant'], string> = {
    ridge: 'before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-[var(--atlas-accent)]',
    archipelago: 'before:absolute before:right-4 before:top-4 before:h-12 before:w-12 before:rounded-full before:bg-[var(--atlas-highlight)]',
    ledger: 'before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1 before:bg-[var(--atlas-accent)]',
    plateau: 'before:absolute before:inset-y-0 before:right-0 before:w-24 before:bg-[linear-gradient(180deg,_var(--atlas-highlight)_0%,_transparent_100%)]',
    coast: 'before:absolute before:inset-x-0 before:bottom-0 before:h-10 before:bg-[linear-gradient(180deg,_transparent_0%,_var(--atlas-highlight)_100%)]',
  };

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(country.name)}
      className={[
        'group relative overflow-hidden rounded-[1.6rem] border border-[var(--atlas-line)] bg-[var(--atlas-panel)] p-4 text-left shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]',
        variantClasses[country.layoutVariant],
      ].join(' ')}
    >
      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-ink-soft)]">{country.editorialLabel}</div>
            <h4 className="mt-2 font-serif text-2xl font-bold text-[var(--color-coffee-dark)]">{country.name}</h4>
          </div>
          <div className="h-16 w-16 shrink-0 rounded-[1.2rem] border border-[var(--atlas-line)] bg-[var(--atlas-veil)] p-2">
            <MapSilhouette path={country.path} color={country.color} interactive />
          </div>
        </div>

        <p className="text-sm text-[var(--atlas-ink-soft)]">{country.flavorLabel}</p>

        <div className="mt-auto flex flex-wrap gap-2">
          <AtlasMetric label="Beans" value={String(stats.beanCount)} compact />
          <AtlasMetric label="Roasters" value={String(stats.roasterCount)} compact />
          <AtlasMetric label="Regions" value={String(stats.regions.length || country.notableRegions.length)} compact />
        </div>
      </div>
    </motion.button>
  );
}

function AtlasMetric({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div
      className={[
        'rounded-full border border-[var(--atlas-line)] bg-white/85 text-[var(--color-coffee-dark)]',
        compact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-xs',
      ].join(' ')}
    >
      <span className="mr-2 uppercase tracking-[0.18em] text-[var(--atlas-ink-soft)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function AtlasBeanCard({ bean, index }: { bean: CoffeeBean; index: number }) {
  const salesLabel = formatSalesCount(bean.salesCount);
  const subtitles = [bean.originRegion, bean.farm, bean.variety].filter(Boolean).slice(0, 2);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="overflow-hidden rounded-[1.5rem] border border-[var(--atlas-line)] bg-[var(--atlas-panel)] shadow-[var(--shadow-card)]"
    >
      <div className="grid min-h-full gap-4 p-4 sm:grid-cols-[96px_1fr]">
        <div className="relative h-24 overflow-hidden rounded-[1.1rem] border border-[var(--atlas-line)] bg-[var(--atlas-veil)]">
          {bean.imageUrl ? (
            <img
              src={bean.imageUrl}
              alt={bean.name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--atlas-ink-soft)]">
              <Coffee className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-ink-soft)]">{bean.roasterName || 'Unknown Roaster'}</p>
              <h5 className="mt-1 font-serif text-lg font-semibold text-[var(--color-coffee-dark)]">{bean.name}</h5>
              {subtitles.length > 0 ? (
                <p className="mt-1 text-sm text-[var(--atlas-ink-soft)]">{subtitles.join(' · ')}</p>
              ) : null}
            </div>
            {salesLabel ? (
              <span className="rounded-full border border-[var(--atlas-line)] bg-[var(--atlas-chip)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-coffee-dark)]">
                {salesLabel}
              </span>
            ) : null}
          </div>
          <div className="mt-auto flex items-end justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--atlas-ink-soft)]">Process</div>
              <div className="text-sm font-medium text-[var(--color-coffee-dark)]">{bean.process || '待补充'}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--atlas-ink-soft)]">Price</div>
              <div className="font-serif text-xl font-semibold text-[var(--color-coffee-dark)]">¥{bean.price || bean.discountedPrice || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function OriginAtlasExplorer({
  beans,
  selectedContinent,
  selectedCountry,
  onSelectContinent,
  onSelectCountry,
  onBack,
}: OriginAtlasExplorerProps) {
  const countryStatsMap = useMemo(() => buildCountryStats(beans), [beans]);
  const activeContinent = selectedContinent ? getAtlasContinentById(selectedContinent) : null;
  const activeCountry = selectedCountry ? getAtlasCountryByName(selectedCountry) : null;

  const activeCountryStats = activeCountry ? countryStatsMap.get(activeCountry.name) ?? EMPTY_STATS : EMPTY_STATS;
  const activeCountries = activeContinent
    ? ORIGIN_ATLAS_COUNTRIES_BY_CONTINENT.get(activeContinent.id) ?? []
    : [];

  return (
    <section className="mb-14 rounded-[2.4rem] border border-[var(--atlas-line)] bg-[var(--atlas-paper)] p-4 shadow-[var(--shadow-card)] md:p-6">
      <div className="mb-6 flex items-center justify-between gap-3 rounded-[1.6rem] border border-[var(--atlas-line)] bg-[var(--atlas-panel)] px-4 py-4">
        <div className="flex items-center gap-3">
          {(selectedContinent || selectedCountry) ? (
            <button
              onClick={onBack}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--atlas-line)] bg-white/80 text-[var(--color-coffee-dark)] transition-transform hover:-translate-x-0.5"
              aria-label="返回上一级"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : null}
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--atlas-ink-soft)]">
              {selectedCountry ? 'Country dossier' : selectedContinent ? 'Continent index' : 'Origin atlas'}
            </div>
            <h2 className="mt-1 font-serif text-2xl font-bold text-[var(--color-coffee-dark)]">
              {activeCountry?.name ?? activeContinent?.name ?? 'Origin Atlas'}
            </h2>
          </div>
        </div>
        <div className="hidden rounded-full border border-[var(--atlas-line)] bg-[var(--atlas-chip)] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-ink-soft)] md:block">
          Tap the map to descend by origin
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedContinent ? (
          <motion.div
            key="atlas-continents"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="grid gap-5 lg:grid-cols-12"
          >
            {ORIGIN_ATLAS_CONTINENTS.map((continent) => (
              <ContinentAtlasCard
                key={continent.id}
                continent={continent}
                countryStatsMap={countryStatsMap}
                onSelect={onSelectContinent}
              />
            ))}
          </motion.div>
        ) : null}

        {activeContinent && !activeCountry ? (
          <motion.div
            key={`atlas-${activeContinent.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr]"
          >
            <aside className="rounded-[1.8rem] border border-[var(--atlas-line)] bg-[var(--atlas-panel)] p-5 lg:sticky lg:top-6 lg:h-fit">
              <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-ink-soft)]">{activeContinent.editorialLabel}</div>
              <div className="h-44 rounded-[1.4rem] border border-[var(--atlas-line)] bg-[var(--atlas-veil)] p-4">
                <MapSilhouette path={activeContinent.path} color={activeContinent.color} detail />
              </div>
              <p className="mt-5 text-sm leading-6 text-[var(--atlas-ink-soft)]">{activeContinent.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <AtlasMetric label="Countries" value={String(activeContinent.countries.length)} compact />
                <AtlasMetric
                  label="Beans"
                  value={String(getContinentSummary(activeContinent, countryStatsMap).beanCount)}
                  compact
                />
              </div>
            </aside>

            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-ink-soft)]">Select a producing country</div>
                  <h3 className="mt-1 font-serif text-3xl font-bold text-[var(--color-coffee-dark)]">{activeContinent.name} Index</h3>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {activeCountries.map((country) => (
                  <CountryIndexCard
                    key={country.name}
                    country={country}
                    stats={countryStatsMap.get(country.name) ?? EMPTY_STATS}
                    onSelect={onSelectCountry}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}

        {activeCountry && activeContinent ? (
          <motion.div
            key={`atlas-country-${activeCountry.name}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(300px,0.94fr)_1.06fr]">
              <div className="overflow-hidden rounded-[2rem] border border-[var(--atlas-line)] bg-[var(--atlas-panel)] p-5">
                <div className="rounded-[1.6rem] border border-[var(--atlas-line)] bg-[var(--atlas-veil)] p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-ink-soft)]">{activeContinent.name}</div>
                      <h3 className="mt-1 font-serif text-4xl font-bold text-[var(--color-coffee-dark)]">{activeCountry.name}</h3>
                    </div>
                    <span className="rounded-full border border-[var(--atlas-line)] bg-[var(--atlas-chip)] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--atlas-ink-soft)]">
                      Atlas dossier
                    </span>
                  </div>
                  <div className="h-72 w-full">
                    <MapSilhouette path={activeCountry.path} color={activeCountry.color} detail />
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-ink-soft)]">Atlas note</div>
                    <p className="mt-2 text-sm leading-6 text-[var(--atlas-ink-soft)]">{activeCountry.editorialLabel}</p>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-ink-soft)]">Flavor profile</div>
                    <p className="mt-2 text-base font-medium text-[var(--color-coffee-dark)]">{activeCountry.flavorLabel}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <DetailStatCard icon={<Coffee className="h-4 w-4" />} label="Beans" value={String(activeCountryStats.beanCount)} />
                  <DetailStatCard icon={<Store className="h-4 w-4" />} label="Roasters" value={String(activeCountryStats.roasterCount)} />
                  <DetailStatCard icon={<Leaf className="h-4 w-4" />} label="Processes" value={String(activeCountryStats.processes.length || 0)} />
                  <DetailStatCard
                    icon={<Sparkles className="h-4 w-4" />}
                    label="Avg price"
                    value={activeCountryStats.averagePrice ? `¥${activeCountryStats.averagePrice}` : '—'}
                  />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                  <DetailPanel
                    title="Representative regions"
                    icon={<MapPin className="h-4 w-4" />}
                    items={activeCountryStats.regions.length > 0 ? activeCountryStats.regions : activeCountry.notableRegions}
                  />
                  <DetailPanel
                    title="Observed processes"
                    icon={<Leaf className="h-4 w-4" />}
                    items={activeCountryStats.processes}
                    fallback="当前样本还未覆盖到处理法信息。"
                  />
                </div>

                <DetailPanel
                  title="Tasting notes in catalog"
                  icon={<Sparkles className="h-4 w-4" />}
                  items={activeCountryStats.tastingNotes.slice(0, 8)}
                  fallback="当前收录豆款还未整理风味标签。"
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--atlas-line)] bg-[var(--atlas-panel)] p-5">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-ink-soft)]">Selected beans</div>
                  <h4 className="mt-1 font-serif text-3xl font-bold text-[var(--color-coffee-dark)]">{activeCountry.name} in the catalog</h4>
                </div>
                <div className="rounded-full border border-[var(--atlas-line)] bg-[var(--atlas-chip)] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-ink-soft)]">
                  In stock {activeCountryStats.inStockCount}/{activeCountryStats.beanCount}
                </div>
              </div>

              {activeCountryStats.beans.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {activeCountryStats.beans.slice(0, 6).map((bean, index) => (
                    <AtlasBeanCard key={bean.id} bean={bean} index={index} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.6rem] border border-dashed border-[var(--atlas-line)] bg-[var(--atlas-veil)] p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--atlas-line)] bg-white/80 text-[var(--atlas-ink-soft)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h5 className="mt-4 font-serif text-2xl font-semibold text-[var(--color-coffee-dark)]">该产地尚未形成豆单</h5>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--atlas-ink-soft)]">
                    地图与产地信息已准备好，等下一批豆单入库后，这里会优先展示代表产区和精选烘焙商。
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {activeCountry.notableRegions.map((region) => (
                      <span
                        key={region}
                        className="rounded-full border border-[var(--atlas-line)] bg-white/85 px-3 py-1 text-xs font-medium text-[var(--color-coffee-dark)]"
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function DetailStatCard({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-[var(--atlas-line)] bg-[var(--atlas-panel)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-[var(--atlas-ink-soft)]">{icon}</div>
      <div className="mt-3 text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-ink-soft)]">{label}</div>
      <div className="mt-1 font-serif text-3xl font-semibold text-[var(--color-coffee-dark)]">{value}</div>
    </div>
  );
}

function DetailPanel({
  title,
  icon,
  items,
  fallback = '暂无可展示信息。',
}: {
  title: string;
  icon: any;
  items: string[];
  fallback?: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-[var(--atlas-line)] bg-[var(--atlas-panel)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-[var(--atlas-ink-soft)]">{icon}</div>
      <div className="mt-3 text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-ink-soft)]">{title}</div>
      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[var(--atlas-line)] bg-white/85 px-3 py-1.5 text-sm font-medium text-[var(--color-coffee-dark)]"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-[var(--atlas-ink-soft)]">{fallback}</p>
      )}
    </div>
  );
}
