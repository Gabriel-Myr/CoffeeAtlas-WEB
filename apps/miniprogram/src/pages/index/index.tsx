import { useEffect, useMemo, useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

import BeanCard from '../../components/BeanCard';
import EmptyState from '../../components/EmptyState';
import SearchBar from '../../components/SearchBar';
import { getBeans } from '../../services/api';
import type { CoffeeBean } from '../../types';
import {
  type CountryAtlasStats,
  type OriginAtlasContinent,
  buildCountryAtlasStats,
  getContinentSummary,
  getCountriesByContinent,
  makeAtlasSvgUri,
  ORIGIN_ATLAS_CONTINENT_MAP,
  ORIGIN_ATLAS_CONTINENTS,
  ORIGIN_ATLAS_COUNTRY_MAP,
} from '../../utils/origin-atlas';
import './index.scss';

type TabKey = 'discover' | 'sales' | 'new';

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

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabKey>('discover');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    void loadBeans();
  }, []);

  const loadBeans = async () => {
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

  const filteredBeans = useMemo(() => {
    let result = [...beans];

    if (activeTab === 'new') {
      result = result.filter((bean) => bean.isNewArrival);
    } else if (activeTab === 'sales') {
      result.sort((left, right) => right.salesCount - left.salesCount);
    }

    if (!searchQuery.trim()) {
      return result;
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();
    return result.filter((bean) => {
      return [bean.name, bean.originCountry, bean.originRegion, bean.roasterName, bean.process, bean.variety]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [activeTab, beans, searchQuery]);

  const activeContinent = selectedContinent ? ORIGIN_ATLAS_CONTINENT_MAP.get(selectedContinent as OriginAtlasContinent['id']) ?? null : null;
  const activeCountries = activeContinent ? getCountriesByContinent(activeContinent.id) : [];
  const activeCountry = selectedCountry ? ORIGIN_ATLAS_COUNTRY_MAP.get(selectedCountry) ?? null : null;
  const activeCountryStats = activeCountry ? atlasStatsMap.get(activeCountry.name) ?? EMPTY_STATS : EMPTY_STATS;

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSelectedContinent(null);
    setSelectedCountry(null);
  };

  const handleBack = () => {
    if (selectedCountry) {
      setSelectedCountry(null);
      return;
    }
    setSelectedContinent(null);
  };

  return (
    <View className="index-page">
      <View className="index-page__header">
        <Text className="index-page__title-en">COFFEE</Text>
        <Text className="index-page__title-atlas">Atlas</Text>
        <Text className="index-page__subtitle">Discover origin, terrain, and cup character</Text>
      </View>

      <SearchBar value={searchQuery} placeholder="按烘焙商、产地、处理法或豆种搜索..." onInput={setSearchQuery} />

      <View className="index-page__tabs">
        {(['discover', 'sales', 'new'] as TabKey[]).map((tab) => (
          <View
            key={tab}
            className={`index-page__tab ${activeTab === tab ? 'index-page__tab--active' : ''}`}
            onClick={() => handleTabChange(tab)}
          >
            <Text className="index-page__tab-text">{tab === 'discover' ? '发现' : tab === 'sales' ? '销量' : '新品'}</Text>
          </View>
        ))}
      </View>

      <View className="index-page__content">
        {activeTab === 'discover' ? (
          <View className="atlas">
            <View className="atlas__toolbar">
              {(selectedContinent || selectedCountry) ? (
                <View className="atlas__back" onClick={handleBack}>
                  <Text className="atlas__back-icon">←</Text>
                </View>
              ) : null}
              <View className="atlas__toolbar-copy">
                <Text className="atlas__toolbar-kicker">
                  {selectedCountry ? 'Country dossier' : selectedContinent ? 'Continent index' : 'Origin atlas'}
                </Text>
                <Text className="atlas__toolbar-title">{selectedCountry ?? activeContinent?.name ?? 'Origin Atlas'}</Text>
              </View>
            </View>

            {errorMessage ? (
              <View className="atlas__notice">
                <Text className="atlas__notice-label">开发提示</Text>
                <Text className="atlas__notice-text">{errorMessage}</Text>
              </View>
            ) : null}

            {!selectedContinent ? (
              <View className="atlas__continent-list">
                {ORIGIN_ATLAS_CONTINENTS.map((continent) => {
                  const summary = getContinentSummary(continent.id, atlasStatsMap);
                  return (
                    <View
                      key={continent.id}
                      className={`continent-card continent-card--${continent.id}`}
                      hoverClass="continent-card--active"
                      hoverStartTime={20}
                      hoverStayTime={70}
                      onClick={() => setSelectedContinent(continent.id)}
                    >
                      <View className="continent-card__map-shell">
                        <Image
                          src={makeAtlasSvgUri(continent.path, continent.color, true)}
                          className="continent-card__map"
                          mode="aspectFit"
                        />
                      </View>
                      <View className="continent-card__body">
                        <Text className="continent-card__kicker">{continent.editorialLabel}</Text>
                        <Text className="continent-card__name">{continent.name}</Text>
                        <Text className="continent-card__description">{continent.description}</Text>
                        <View className="continent-card__metrics">
                          <View className="metric-pill">
                            <Text className="metric-pill__label">国家</Text>
                            <Text className="metric-pill__value">{continent.countries.length}</Text>
                          </View>
                          <View className="metric-pill">
                            <Text className="metric-pill__label">豆款</Text>
                            <Text className="metric-pill__value">{summary.beanCount}</Text>
                          </View>
                          <View className="metric-pill">
                            <Text className="metric-pill__label">烘焙商</Text>
                            <Text className="metric-pill__value">{summary.roasterCount}</Text>
                          </View>
                        </View>
                      </View>
                      <Text className="continent-card__arrow">›</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {activeContinent && !activeCountry ? (
              <View className="atlas__country-index">
                <View className="continent-panel">
                  <View className="continent-panel__map-shell">
                    <Image
                      src={makeAtlasSvgUri(activeContinent.path, activeContinent.color, true)}
                      className="continent-panel__map"
                      mode="aspectFit"
                    />
                  </View>
                  <Text className="continent-panel__kicker">{activeContinent.editorialLabel}</Text>
                  <Text className="continent-panel__title">{activeContinent.name} Index</Text>
                  <Text className="continent-panel__description">{activeContinent.description}</Text>
                </View>

                <View className="country-grid">
                  {activeCountries.map((country) => {
                    const stats = atlasStatsMap.get(country.name) ?? EMPTY_STATS;
                    return (
                      <View
                        key={country.name}
                        className="country-card"
                        hoverClass="country-card--active"
                        hoverStartTime={20}
                        hoverStayTime={70}
                        onClick={() => setSelectedCountry(country.name)}
                      >
                        <View className="country-card__map-shell">
                          <Image src={makeAtlasSvgUri(country.path, country.color, true)} className="country-card__map" mode="aspectFit" />
                        </View>
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
                  })}
                </View>
              </View>
            ) : null}

            {activeCountry ? (
              <View className="atlas__country-detail">
                <View className="detail-hero">
                  <View className="detail-hero__map-shell">
                    <Image src={makeAtlasSvgUri(activeCountry.path, activeCountry.color, true)} className="detail-hero__map" mode="aspectFit" />
                  </View>
                  <View className="detail-hero__body">
                    <Text className="detail-hero__kicker">{activeContinent?.name}</Text>
                    <Text className="detail-hero__title">{activeCountry.name}</Text>
                    <Text className="detail-hero__summary">{activeCountry.editorialLabel}</Text>
                    <Text className="detail-hero__flavor">{activeCountry.flavorLabel}</Text>
                  </View>
                </View>

                <View className="detail-stats">
                  <View className="detail-stat-card">
                    <Text className="detail-stat-card__label">Beans</Text>
                    <Text className="detail-stat-card__value">{activeCountryStats.beanCount}</Text>
                  </View>
                  <View className="detail-stat-card">
                    <Text className="detail-stat-card__label">Roasters</Text>
                    <Text className="detail-stat-card__value">{activeCountryStats.roasterCount}</Text>
                  </View>
                  <View className="detail-stat-card">
                    <Text className="detail-stat-card__label">Processes</Text>
                    <Text className="detail-stat-card__value">{activeCountryStats.processes.length}</Text>
                  </View>
                  <View className="detail-stat-card">
                    <Text className="detail-stat-card__label">Avg Price</Text>
                    <Text className="detail-stat-card__value">{activeCountryStats.averagePrice ? `¥${activeCountryStats.averagePrice}` : '—'}</Text>
                  </View>
                </View>

                <View className="detail-panel">
                  <Text className="detail-panel__title">Representative Regions</Text>
                  <View className="detail-panel__tags">
                    {(activeCountryStats.regions.length > 0 ? activeCountryStats.regions : activeCountry.notableRegions).map((region) => (
                      <Text key={region} className="detail-tag">{region}</Text>
                    ))}
                  </View>
                </View>

                <View className="detail-panel">
                  <Text className="detail-panel__title">Observed Processes</Text>
                  {activeCountryStats.processes.length > 0 ? (
                    <View className="detail-panel__tags">
                      {activeCountryStats.processes.map((process) => (
                        <Text key={process} className="detail-tag">{process}</Text>
                      ))}
                    </View>
                  ) : (
                    <Text className="detail-panel__fallback">当前样本还未覆盖到处理法信息。</Text>
                  )}
                </View>

                <View className="detail-panel">
                  <Text className="detail-panel__title">Selected Beans</Text>
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
                      <Text className="atlas-empty__text">地图与产地说明已经准备好，等下一批豆单入库后会优先展示在这里。</Text>
                      <View className="atlas-empty__tags">
                        {activeCountry.notableRegions.map((region) => (
                          <Text key={region} className="detail-tag">{region}</Text>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          <View className="index-page__list">
            {errorMessage ? (
              <EmptyState message={errorMessage} />
            ) : loading && beans.length === 0 ? (
              <EmptyState message="加载中..." />
            ) : filteredBeans.length === 0 ? (
              <EmptyState message="未找到咖啡豆" />
            ) : (
              filteredBeans.map((bean, index) => <BeanCard key={bean.id} bean={bean} index={index} />)
            )}
          </View>
        )}
      </View>
    </View>
  );
}
