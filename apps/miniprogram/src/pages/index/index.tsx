import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

import BeanCard from '../../components/BeanCard';
import SearchBar from '../../components/SearchBar';
import { getBeans } from '../../services/api';
import type { CoffeeBean } from '../../types';
import {
  type CountryAtlasStats,
  type OriginAtlasCountry,
  type OriginAtlasContinent,
  buildCountryAtlasStats,
  getCountriesByContinent,
  makeAtlasSvgUri,
  ORIGIN_ATLAS_CONTINENT_MAP,
  ORIGIN_ATLAS_CONTINENTS,
  ORIGIN_ATLAS_COUNTRY_MAP,
} from '../../utils/origin-atlas';
import './index.scss';

const EMPTY_STATS: CountryAtlasStats = {
  beanCount: 0,
  roasterCount: 0,
  regions: [],
  processes: [],
  tastingNotes: [],
  averagePrice: null,
  inStockCount: 0,
  beans: [],
};

function buildAtlasStyle(accent: string, outline: string): string {
  return `--atlas-card-accent:${accent};--atlas-card-outline:${outline};`;
}

function getEntryDelayStyle(index: number): string {
  return `--entry-delay:${index * 0.08}s;`;
}

interface AtlasSilhouetteProps {
  path: string;
  viewBox: string;
  color: string;
  frame: OriginAtlasContinent['silhouetteFrame'];
  shellClassName: string;
  imageClassName: string;
  detail?: boolean;
}

function AtlasSilhouette({
  path,
  viewBox,
  color,
  frame,
  shellClassName,
  imageClassName,
  detail = false,
}: AtlasSilhouetteProps): ReactElement {
  return (
    <View className={`${shellClassName} atlas-silhouette atlas-silhouette--${frame}`}>
      <Image
        src={makeAtlasSvgUri(path, viewBox, color, detail)}
        className={`${imageClassName} atlas-silhouette__image`}
        mode="aspectFit"
        lazyLoad
      />
    </View>
  );
}

function matchesAtlasQuery(country: OriginAtlasCountry, stats: CountryAtlasStats, query: string): boolean {
  if (!query) return true;

  const beanValues: Array<string | undefined> = [];
  for (const bean of stats.beans) {
    beanValues.push(bean.name, bean.roasterName, bean.originRegion, bean.process, bean.variety);
  }

  const searchableValues = [
    country.name,
    country.flavorLabel,
    country.editorialLabel,
    ...country.aliases,
    ...country.notableRegions,
    ...stats.regions,
    ...stats.processes,
    ...stats.tastingNotes,
    ...beanValues,
  ].filter((value): value is string => typeof value === 'string' && value.length > 0);

  return searchableValues.some((value) => value.toLowerCase().includes(query));
}

export default function Index(): ReactElement {
  const [selectedContinent, setSelectedContinent] = useState<OriginAtlasContinent['id'] | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<OriginAtlasCountry['name'] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    void loadBeans();
  }, []);

  const loadBeans = async (): Promise<void> => {
    if (loading) return;

    setLoading(true);
    setErrorMessage('');
    try {
      const response = await getBeans({ pageSize: 50 });
      setBeans(response.items ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : '加载失败';
      setErrorMessage(message);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const atlasStatsMap = useMemo(() => buildCountryAtlasStats(beans), [beans]);
  const atlasQuery = searchQuery.trim().toLowerCase();

  const activeContinent = selectedContinent ? ORIGIN_ATLAS_CONTINENT_MAP.get(selectedContinent) ?? null : null;
  const activeCountry = selectedCountry ? ORIGIN_ATLAS_COUNTRY_MAP.get(selectedCountry) ?? null : null;
  const activeCountryStats = activeCountry ? atlasStatsMap.get(activeCountry.name) ?? EMPTY_STATS : EMPTY_STATS;
  const showAtlasToolbar = Boolean(selectedContinent || selectedCountry);

  const visibleContinents = useMemo(() => {
    if (!atlasQuery) return ORIGIN_ATLAS_CONTINENTS;

    return ORIGIN_ATLAS_CONTINENTS.filter((continent) => {
      const countries = getCountriesByContinent(continent.id);
      return countries.some((country) => matchesAtlasQuery(country, atlasStatsMap.get(country.name) ?? EMPTY_STATS, atlasQuery));
    });
  }, [atlasQuery, atlasStatsMap]);

  const visibleCountries = useMemo(() => {
    if (!activeContinent) return [];

    return getCountriesByContinent(activeContinent.id).filter((country) => {
      return matchesAtlasQuery(country, atlasStatsMap.get(country.name) ?? EMPTY_STATS, atlasQuery);
    });
  }, [activeContinent, atlasQuery, atlasStatsMap]);

  const handleBack = (): void => {
    if (selectedCountry) {
      setSelectedCountry(null);
      return;
    }

    setSelectedContinent(null);
  };

  return (
    <View className="index-page">
      <View className="index-page__atlas">
        <View className="index-page__header index-page__header--atlas">
          <Text className="index-page__title-en">COFFEE</Text>
          <Text className="index-page__title-atlas">Atlas</Text>
          <Text className="index-page__subtitle">Discover origin, terrain, and cup character</Text>
        </View>

        <SearchBar value={searchQuery} placeholder="按烘焙商、产地、处理法或豆种搜索..." onInput={setSearchQuery} />

        <View className="index-page__content">
          <View className="atlas">
            {showAtlasToolbar ? (
              <View className="atlas__toolbar">
                {selectedContinent || selectedCountry ? (
                  <View className="atlas__back" onClick={handleBack}>
                    <Text className="atlas__back-icon">←</Text>
                  </View>
                ) : null}
                <View className="atlas__toolbar-copy">
                  <Text className="atlas__toolbar-kicker">
                    {selectedCountry ? '国家档案' : '洲内索引'}
                  </Text>
                  <Text className="atlas__toolbar-title">
                    {selectedCountry ?? (activeContinent ? `${activeContinent.name} 索引` : '洲内索引')}
                  </Text>
                  <Text className="atlas__toolbar-subtitle">
                    {selectedCountry
                      ? '在一张产地卡中查看地貌、风味与当前豆款覆盖。'
                      : '先浏览这一洲的国家索引，再进入具体产地查看豆款与烘焙商。'}
                  </Text>
                </View>
              </View>
            ) : null}

          {errorMessage ? (
            <View className="atlas__notice">
              <Text className="atlas__notice-label">开发提示</Text>
              <Text className="atlas__notice-text">{errorMessage}</Text>
            </View>
          ) : null}

          {!selectedContinent ? (
            <View className="atlas__home-default">
              {visibleContinents.length > 0 ? (
                <>
                  <View className="atlas__continent-grid">
                    {visibleContinents.map((continent, index) => (
                      <View
                        key={continent.id}
                        className={`continent-tile continent-tile--${continent.cardVariant}`}
                        style={`${buildAtlasStyle(continent.color, continent.color)}${getEntryDelayStyle(index)}`}
                        hoverClass="continent-tile--active"
                        hoverStartTime={20}
                        hoverStayTime={70}
                        onClick={() => setSelectedContinent(continent.id)}
                      >
                        <View className="continent-tile__orb">
                          <AtlasSilhouette
                            path={continent.path}
                            viewBox={continent.viewBox}
                            color={continent.color}
                            frame={continent.silhouetteFrame}
                            shellClassName="continent-tile__map-shell"
                            imageClassName="continent-tile__map"
                            detail
                          />
                        </View>
                        <View className="continent-tile__body">
                          <Text className="continent-tile__kicker">{continent.editorialLabel}</Text>
                          <Text className="continent-tile__name">{continent.name}</Text>
                          <Text className="continent-tile__desc">{continent.description}</Text>
                          <View className="continent-tile__meta">
                            <Text className="continent-tile__count">{continent.countries.length} 个产地国</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                  <View className="atlas__intro">
                    <Text className="atlas__intro-text">选择一个大洲，浏览国家索引与豆款。</Text>
                  </View>
                </>
              ) : (
                <View className="atlas-empty atlas-empty--wide">
                  <Text className="atlas-empty__mark">✦</Text>
                  <Text className="atlas-empty__title">未匹配到对应产地</Text>
                  <Text className="atlas-empty__text">可以尝试搜索国家名、产区、处理法、烘焙商或风味关键词。</Text>
                </View>
              )}
            </View>
          ) : null}

          {activeContinent && !activeCountry ? (
            <View className="atlas__country-index">
              <View className="continent-panel" style={buildAtlasStyle(activeContinent.color, activeContinent.color)}>
                <AtlasSilhouette
                  path={activeContinent.path}
                  viewBox={activeContinent.viewBox}
                  color={activeContinent.color}
                  frame={activeContinent.silhouetteFrame}
                  shellClassName="continent-panel__map-shell"
                  imageClassName="continent-panel__map"
                  detail
                />
                <Text className="continent-panel__kicker">{activeContinent.editorialLabel}</Text>
                <Text className="continent-panel__title">{activeContinent.name} 国家索引</Text>
                <Text className="continent-panel__description">{activeContinent.description}</Text>
              </View>

              <View className="country-grid">
                {visibleCountries.length > 0 ? (
                  visibleCountries.map((country) => {
                    const stats = atlasStatsMap.get(country.name) ?? EMPTY_STATS;
                    return (
                      <View
                        key={country.name}
                        className={`country-card country-card--${country.layoutVariant}`}
                        style={buildAtlasStyle(country.accent, country.color)}
                        hoverClass="country-card--active"
                        hoverStartTime={20}
                        hoverStayTime={70}
                        onClick={() => setSelectedCountry(country.name)}
                      >
                        <AtlasSilhouette
                          path={country.path}
                          viewBox={country.viewBox}
                          color={country.color}
                          frame={country.silhouetteFrame}
                          shellClassName="country-card__map-shell"
                          imageClassName="country-card__map"
                          detail
                        />
                        <View className="country-card__body">
                          <Text className="country-card__kicker">{country.editorialLabel}</Text>
                          <Text className="country-card__name">{country.name}</Text>
                          <Text className="country-card__flavor">{country.flavorLabel}</Text>
                          <View className="country-card__metrics">
                            <Text className="country-card__metric">{stats.beanCount} 豆款</Text>
                            <Text className="country-card__metric">{stats.roasterCount} 烘焙商</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View className="atlas-empty atlas-empty--wide">
                    <Text className="atlas-empty__mark">⌕</Text>
                    <Text className="atlas-empty__title">这一洲暂无匹配结果</Text>
                    <Text className="atlas-empty__text">搜索词已经缩小到洲内国家索引，可以换一个国家、产区或处理法试试。</Text>
                  </View>
                )}
              </View>
            </View>
          ) : null}

          {activeCountry ? (
            <View className="atlas__country-detail" style={buildAtlasStyle(activeCountry.accent, activeCountry.color)}>
              <View className="detail-hero">
                <AtlasSilhouette
                  path={activeCountry.path}
                  viewBox={activeCountry.viewBox}
                  color={activeCountry.color}
                  frame={activeCountry.silhouetteFrame}
                  shellClassName="detail-hero__map-shell"
                  imageClassName="detail-hero__map"
                  detail
                />
                <View className="detail-hero__body">
                  <Text className="detail-hero__kicker">{activeContinent?.name}</Text>
                  <Text className="detail-hero__title">{activeCountry.name}</Text>
                  <Text className="detail-hero__summary">{activeCountry.editorialLabel}</Text>
                  <Text className="detail-hero__flavor">{activeCountry.flavorLabel}</Text>
                </View>
              </View>

                <View className="detail-stats">
                  <View className="detail-stat-card">
                    <Text className="detail-stat-card__label">豆款</Text>
                    <Text className="detail-stat-card__value">{activeCountryStats.beanCount}</Text>
                  </View>
                  <View className="detail-stat-card">
                    <Text className="detail-stat-card__label">烘焙商</Text>
                    <Text className="detail-stat-card__value">{activeCountryStats.roasterCount}</Text>
                  </View>
                  <View className="detail-stat-card">
                    <Text className="detail-stat-card__label">处理法</Text>
                    <Text className="detail-stat-card__value">{activeCountryStats.processes.length}</Text>
                  </View>
                  <View className="detail-stat-card">
                    <Text className="detail-stat-card__label">在售</Text>
                    <Text className="detail-stat-card__value">{activeCountryStats.inStockCount}</Text>
                  </View>
                  <View className="detail-stat-card detail-stat-card--wide">
                    <Text className="detail-stat-card__label">均价</Text>
                    <Text className="detail-stat-card__value">
                      {activeCountryStats.averagePrice ? `¥${activeCountryStats.averagePrice}` : '—'}
                    </Text>
                  </View>
                </View>

                <View className="detail-panel">
                  <Text className="detail-panel__title">代表产区</Text>
                  <View className="detail-panel__tags">
                    {(activeCountryStats.regions.length > 0 ? activeCountryStats.regions : activeCountry.notableRegions).map((region) => (
                      <Text key={region} className="detail-tag">
                        {region}
                      </Text>
                    ))}
                  </View>
                </View>

                <View className="detail-panel">
                  <Text className="detail-panel__title">已收录处理法</Text>
                  {activeCountryStats.processes.length > 0 ? (
                    <View className="detail-panel__tags">
                      {activeCountryStats.processes.map((process) => (
                        <Text key={process} className="detail-tag">
                          {process}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Text className="detail-panel__fallback">当前样本还未覆盖到处理法信息。</Text>
                  )}
                </View>

                <View className="detail-panel">
                  <Text className="detail-panel__title">风味标签</Text>
                  {activeCountryStats.tastingNotes.length > 0 ? (
                    <View className="detail-panel__tags">
                      {activeCountryStats.tastingNotes.map((note) => (
                        <Text key={note} className="detail-tag">
                          {note}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Text className="detail-panel__fallback">当前样本还未积累出稳定的风味标签。</Text>
                  )}
                </View>

                <View className="detail-panel">
                  <Text className="detail-panel__title">精选豆款</Text>
                  {activeCountryStats.beans.length > 0 ? (
                    <View className="detail-panel__beans">
                      {activeCountryStats.beans.slice(0, 6).map((bean, index) => (
                        <BeanCard key={bean.id} bean={bean} index={index} />
                      ))}
                    </View>
                  ) : (
                    <View className="atlas-empty">
                      <Text className="atlas-empty__mark">✦</Text>
                      <Text className="atlas-empty__title">该产地尚未形成豆单</Text>
                      <Text className="atlas-empty__text">地图和产地说明已经准备好，等下一批豆单入库后会优先展示在这里。</Text>
                      <View className="atlas-empty__tags">
                        {activeCountry.notableRegions.map((region) => (
                          <Text key={region} className="detail-tag">
                            {region}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
            </View>
          ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
