import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useReachBottom } from '@tarojs/taro';

import BeanCard from '../../components/BeanCard';
import EmptyState from '../../components/EmptyState';
import SearchBar from '../../components/SearchBar';
import { getBeanDiscover, getBeans } from '../../services/api';
import type { BeanDiscoverPayload, CoffeeBean, DiscoverContinentId } from '../../types';
import {
  ORIGIN_ATLAS_CONTINENT_MAP,
  ORIGIN_ATLAS_COUNTRY_MAP,
  makeAtlasSvgUri,
} from '../../utils/origin-atlas';
import './index.scss';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 250;
const ALL_DISCOVER_VALUE = 'all';

type TabKey = 'discover' | 'sales' | 'new';
type DiscoverContinentKey = DiscoverContinentId | 'all';

const TAB_LABELS: Record<TabKey, string> = {
  discover: '发现',
  sales: '销量',
  new: '新品',
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '加载失败';
}

export default function AllBeans() {
  const [activeTab, setActiveTab] = useState<TabKey>('discover');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedProcess, setSelectedProcess] = useState<string>(ALL_DISCOVER_VALUE);
  const [selectedContinent, setSelectedContinent] = useState<DiscoverContinentKey>(ALL_DISCOVER_VALUE);
  const [selectedCountry, setSelectedCountry] = useState<string>(ALL_DISCOVER_VALUE);

  const [discoverPayload, setDiscoverPayload] = useState<BeanDiscoverPayload | null>(null);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverError, setDiscoverError] = useState('');

  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadingRef = useRef(false);
  const requestVersionRef = useRef(0);
  const discoverRequestVersionRef = useRef(0);
  const normalizedQuery = searchQuery.trim();

  const activeContinentMeta =
    selectedContinent !== ALL_DISCOVER_VALUE ? ORIGIN_ATLAS_CONTINENT_MAP.get(selectedContinent) ?? null : null;
  const activeCountryMeta =
    selectedCountry !== ALL_DISCOVER_VALUE ? ORIGIN_ATLAS_COUNTRY_MAP.get(selectedCountry) ?? null : null;

  const hasDiscoverPath =
    selectedProcess !== ALL_DISCOVER_VALUE ||
    selectedContinent !== ALL_DISCOVER_VALUE ||
    selectedCountry !== ALL_DISCOVER_VALUE;
  const shouldShowDiscoverResults = hasDiscoverPath || Boolean(normalizedQuery);

  const discoverPathItems = useMemo(() => {
    const items: Array<{ key: 'process' | 'continent' | 'country'; label: string; value: string }> = [];

    if (selectedProcess !== ALL_DISCOVER_VALUE) {
      items.push({ key: 'process', label: '处理法', value: selectedProcess });
    }
    if (selectedContinent !== ALL_DISCOVER_VALUE && activeContinentMeta) {
      items.push({ key: 'continent', label: '大洲', value: activeContinentMeta.name });
    }
    if (selectedCountry !== ALL_DISCOVER_VALUE) {
      items.push({ key: 'country', label: '国家', value: selectedCountry });
    }

    return items;
  }, [activeContinentMeta, selectedContinent, selectedCountry, selectedProcess]);

  const discoverQueryText = useMemo(() => {
    if (!normalizedQuery) return '';
    if (discoverPathItems.length === 0) {
      return `搜索 “${normalizedQuery}”`;
    }

    return `在 ${discoverPathItems.map((item) => item.value).join(' / ')} 中搜索 “${normalizedQuery}”`;
  }, [discoverPathItems, normalizedQuery]);

  const countLabel = useMemo(() => {
    if (activeTab === 'discover') {
      if (discoverLoading && !discoverPayload) return '正在整理探索路径...';
      if (!discoverPayload) return '';
      if (selectedCountry !== ALL_DISCOVER_VALUE) {
        return `共 ${discoverPayload.resultSummary.total} 款 ${selectedCountry} 结果`;
      }
      return `当前路径覆盖 ${discoverPayload.resultSummary.total} 款咖啡豆`;
    }

    if (total !== null) {
      return activeTab === 'new' ? `共 ${total} 款本次上新` : `共 ${total} 款咖啡豆`;
    }
    if (loading) return '正在同步目录...';
    if (beans.length > 0) return `已加载 ${beans.length} 款咖啡豆`;
    return '';
  }, [activeTab, beans.length, discoverLoading, discoverPayload, loading, selectedCountry, total]);

  const resetResultState = () => {
    setBeans([]);
    setPage(1);
    setHasMore(true);
    setTotal(null);
  };

  const setLoadingState = (value: boolean) => {
    loadingRef.current = value;
    setLoading(value);
  };

  const loadBeanPage = async (
    mode: TabKey,
    currentPage: number,
    options?: {
      reset?: boolean;
      ignoreLoading?: boolean;
    }
  ) => {
    if (loadingRef.current && !options?.ignoreLoading) return;

    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;
    setLoadingState(true);
    setErrorMessage('');

    try {
      const response = await getBeans({
        pageSize: PAGE_SIZE,
        page: currentPage,
        q: normalizedQuery || undefined,
        sort: mode === 'sales' ? 'sales_desc' : 'updated_desc',
        isNewArrival: mode === 'new' ? true : undefined,
        process: mode === 'discover' && selectedProcess !== ALL_DISCOVER_VALUE ? selectedProcess : undefined,
        continent: mode === 'discover' && selectedContinent !== ALL_DISCOVER_VALUE ? selectedContinent : undefined,
        country: mode === 'discover' && selectedCountry !== ALL_DISCOVER_VALUE ? selectedCountry : undefined,
      });

      if (requestVersion !== requestVersionRef.current) return;

      const nextBeans = response.items ?? [];
      setBeans((prev) => (currentPage === 1 || options?.reset ? nextBeans : [...prev, ...nextBeans]));
      setTotal(response.pageInfo.total);
      setPage(currentPage + 1);
      setHasMore(response.pageInfo.hasNextPage);
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) return;
      const message = getErrorMessage(error);
      setErrorMessage(message);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setLoadingState(false);
      }
    }
  };

  const reloadBeanResults = (mode: TabKey) => {
    requestVersionRef.current += 1;
    resetResultState();
    void loadBeanPage(mode, 1, { reset: true, ignoreLoading: true });
  };

  const loadDiscoverPayload = async () => {
    const requestVersion = discoverRequestVersionRef.current + 1;
    discoverRequestVersionRef.current = requestVersion;
    setDiscoverLoading(true);
    setDiscoverError('');

    try {
      const response = await getBeanDiscover({
        q: normalizedQuery || undefined,
        process: selectedProcess !== ALL_DISCOVER_VALUE ? selectedProcess : undefined,
        continent: selectedContinent !== ALL_DISCOVER_VALUE ? selectedContinent : undefined,
        country: selectedCountry !== ALL_DISCOVER_VALUE ? selectedCountry : undefined,
      });

      if (requestVersion !== discoverRequestVersionRef.current) return;
      setDiscoverPayload(response);
    } catch (error) {
      if (requestVersion !== discoverRequestVersionRef.current) return;
      const message = getErrorMessage(error);
      setDiscoverError(message);
      Taro.showToast({ title: '探索加载失败', icon: 'none' });
    } finally {
      if (requestVersion === discoverRequestVersionRef.current) {
        setDiscoverLoading(false);
      }
    }
  };

  useEffect(() => {
    if (activeTab !== 'discover') return undefined;

    const timer = setTimeout(() => {
      void loadDiscoverPayload();
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [activeTab, normalizedQuery, selectedContinent, selectedCountry, selectedProcess]);

  useEffect(() => {
    if (activeTab === 'discover') return undefined;

    const timer = setTimeout(() => {
      reloadBeanResults(activeTab);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [activeTab, normalizedQuery]);

  useEffect(() => {
    if (activeTab !== 'discover') return undefined;

    if (!shouldShowDiscoverResults) {
      requestVersionRef.current += 1;
      resetResultState();
      setErrorMessage('');
      setLoadingState(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      reloadBeanResults('discover');
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [activeTab, normalizedQuery, selectedContinent, selectedCountry, selectedProcess, shouldShowDiscoverResults]);

  useEffect(() => {
    if (!discoverPayload) return;

    if (
      selectedProcess !== ALL_DISCOVER_VALUE &&
      !discoverPayload.processOptions.some((option) => option.id === selectedProcess)
    ) {
      setSelectedProcess(ALL_DISCOVER_VALUE);
      setSelectedContinent(ALL_DISCOVER_VALUE);
      setSelectedCountry(ALL_DISCOVER_VALUE);
      return;
    }

    if (
      selectedContinent !== ALL_DISCOVER_VALUE &&
      !discoverPayload.continentOptions.some((option) => option.id === selectedContinent)
    ) {
      setSelectedContinent(ALL_DISCOVER_VALUE);
      setSelectedCountry(ALL_DISCOVER_VALUE);
      return;
    }

    if (
      selectedCountry !== ALL_DISCOVER_VALUE &&
      !discoverPayload.countryOptions.some((option) => option.label === selectedCountry)
    ) {
      setSelectedCountry(ALL_DISCOVER_VALUE);
    }
  }, [discoverPayload, selectedContinent, selectedCountry, selectedProcess]);

  useReachBottom(() => {
    if (loadingRef.current || !hasMore) return;
    if (activeTab === 'discover') {
      if (!shouldShowDiscoverResults) return;
      void loadBeanPage('discover', page);
      return;
    }

    void loadBeanPage(activeTab, page);
  });

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const handleProcessSelect = (value: string) => {
    const nextValue = value === selectedProcess ? ALL_DISCOVER_VALUE : value;
    setSelectedProcess(nextValue);
    setSelectedContinent(ALL_DISCOVER_VALUE);
    setSelectedCountry(ALL_DISCOVER_VALUE);
  };

  const handleContinentSelect = (value: DiscoverContinentId) => {
    const nextValue = value === selectedContinent ? ALL_DISCOVER_VALUE : value;
    setSelectedContinent(nextValue);
    setSelectedCountry(ALL_DISCOVER_VALUE);
  };

  const handleCountrySelect = (value: string) => {
    const atlasCountry = ORIGIN_ATLAS_COUNTRY_MAP.get(value) ?? null;
    if (atlasCountry) {
      setSelectedContinent(atlasCountry.continentId);
    }
    setSelectedCountry(value === selectedCountry ? ALL_DISCOVER_VALUE : value);
  };

  const clearDiscoverPath = (key?: 'process' | 'continent' | 'country') => {
    if (!key) {
      setSelectedProcess(ALL_DISCOVER_VALUE);
      setSelectedContinent(ALL_DISCOVER_VALUE);
      setSelectedCountry(ALL_DISCOVER_VALUE);
      return;
    }

    if (key === 'process') {
      setSelectedProcess(ALL_DISCOVER_VALUE);
      setSelectedContinent(ALL_DISCOVER_VALUE);
      setSelectedCountry(ALL_DISCOVER_VALUE);
      return;
    }

    if (key === 'continent') {
      setSelectedContinent(ALL_DISCOVER_VALUE);
      setSelectedCountry(ALL_DISCOVER_VALUE);
      return;
    }

    setSelectedCountry(ALL_DISCOVER_VALUE);
  };

  return (
    <View className="all-beans">
      <View className="all-beans__hero">
        <Text className="all-beans__title-en">COFFEE</Text>
        <Text className="all-beans__title-atlas">Atlas</Text>
        <Text className="all-beans__subtitle">全部咖啡豆</Text>
        {countLabel ? <Text className="all-beans__count">{countLabel}</Text> : null}
      </View>

      <SearchBar value={searchQuery} placeholder="按烘焙商、产地、处理法或豆种搜索..." onInput={setSearchQuery} />

      <View className="all-beans__tabs">
        {(Object.keys(TAB_LABELS) as TabKey[]).map((tab) => (
          <View
            key={tab}
            className={`all-beans__tab ${activeTab === tab ? 'all-beans__tab--active' : ''}`}
            onClick={() => handleTabChange(tab)}
          >
            <Text className="all-beans__tab-text">{TAB_LABELS[tab]}</Text>
          </View>
        ))}
      </View>

      {activeTab === 'discover' ? (
        <View className="discover-summary">
          <View className="discover-summary__meta">
            <Text className="discover-summary__label">当前探索路径</Text>
            {hasDiscoverPath ? (
              <View className="discover-summary__tokens">
                {discoverPathItems.map((item) => (
                  <View key={item.key} className="discover-token" onClick={() => clearDiscoverPath(item.key)}>
                    <Text className="discover-token__text">{`${item.label} · ${item.value}`}</Text>
                    <Text className="discover-token__close">×</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="discover-summary__hint">从处理法开始，再逐层缩小到大洲和国家。</Text>
            )}
          </View>
          {hasDiscoverPath ? (
            <Text className="discover-summary__reset" onClick={() => clearDiscoverPath()}>
              重新开始
            </Text>
          ) : null}
        </View>
      ) : null}

      {normalizedQuery ? (
        <View className="all-beans__query-bar">
          <Text className="all-beans__query-text">{activeTab === 'discover' ? discoverQueryText : `搜索 “${normalizedQuery}”`}</Text>
          <Text className="all-beans__query-clear" onClick={() => setSearchQuery('')}>
            清除
          </Text>
        </View>
      ) : null}

      <View className="all-beans__list">
        {activeTab === 'discover' ? (
          discoverError ? (
            <EmptyState message={discoverError} />
          ) : discoverLoading && !discoverPayload ? (
            <EmptyState message="正在加载探索路径..." />
          ) : discoverPayload ? (
            <View className="discover-panel">
              <View className="discover-panel__section discover-panel__section--guide">
                <Text className="discover-panel__eyebrow">使用方式</Text>
                <Text className="discover-panel__title">
                  {selectedCountry !== ALL_DISCOVER_VALUE
                    ? '国家已锁定，下面直接查看这个国家的豆单结果。'
                    : '先选处理法，再选大洲和国家；选到大洲后结果会开始收缩，选中国家后会更精准。'}
                </Text>
                <Text className="discover-panel__description">
                  搜索会始终生效。在发现里输入关键词时，会基于当前探索路径继续缩小范围。
                </Text>
              </View>

              <View className="discover-panel__section">
                <Text className="discover-panel__eyebrow">第一步 · 处理法</Text>
                <Text className="discover-panel__title">先决定你想从哪种杯型切入</Text>
                <View className="discover-panel__chips">
                  <View
                    className={`discover-chip ${selectedProcess === ALL_DISCOVER_VALUE ? 'discover-chip--active' : ''}`}
                    onClick={() => handleProcessSelect(ALL_DISCOVER_VALUE)}
                  >
                    <Text className="discover-chip__text">全部处理法</Text>
                  </View>
                  {discoverPayload.processOptions.map((option) => (
                    <View
                      key={option.id}
                      className={`discover-chip ${selectedProcess === option.id ? 'discover-chip--active' : ''}`}
                      onClick={() => handleProcessSelect(option.id)}
                    >
                      <Text className="discover-chip__text">{option.label}</Text>
                      <Text className="discover-chip__count">{option.count}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className="discover-panel__section">
                <Text className="discover-panel__eyebrow">第二步 · 大洲</Text>
                <Text className="discover-panel__title">选风土区域，国家选项会跟着收缩</Text>
                <View className="continent-strip">
                  {discoverPayload.continentOptions.map((option) => {
                    const continentMeta = ORIGIN_ATLAS_CONTINENT_MAP.get(option.id as DiscoverContinentId) ?? null;
                    if (!continentMeta) return null;

                    return (
                      <View
                        key={option.id}
                        className={`continent-card ${selectedContinent === option.id ? 'continent-card--active' : ''}`}
                        onClick={() => handleContinentSelect(option.id as DiscoverContinentId)}
                      >
                        <Image
                          className="continent-card__map"
                          src={makeAtlasSvgUri(continentMeta.path, continentMeta.viewBox, continentMeta.color, true)}
                          mode="aspectFit"
                          lazyLoad
                        />
                        <View className="continent-card__body">
                          <Text className="continent-card__name">{continentMeta.name}</Text>
                          <Text className="continent-card__description">{continentMeta.editorialLabel}</Text>
                        </View>
                        <Text className="continent-card__count">{option.count}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View className="discover-panel__section">
                <Text className="discover-panel__eyebrow">第三步 · 国家</Text>
                <Text className="discover-panel__title">
                  {selectedContinent === ALL_DISCOVER_VALUE ? '先选大洲，再进入国家级别。' : '国家选中后会继续缩小当前结果范围。'}
                </Text>
                {selectedContinent === ALL_DISCOVER_VALUE ? (
                  <Text className="discover-panel__description">当前还没有锁定大洲，所以暂不展示国家列表。</Text>
                ) : discoverPayload.countryOptions.length === 0 ? (
                  <Text className="discover-panel__description">这个路径下暂时没有国家结果，但你仍可以先浏览当前大洲级别的结果。</Text>
                ) : (
                  <View className="discover-panel__chips">
                    {discoverPayload.countryOptions.map((option) => (
                      <View
                        key={option.id}
                        className={`discover-chip ${selectedCountry === option.label ? 'discover-chip--active' : ''}`}
                        onClick={() => handleCountrySelect(option.label)}
                      >
                        <Text className="discover-chip__text">{option.label}</Text>
                        <Text className="discover-chip__count">{option.count}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View className="discover-panel__section discover-panel__section--editorial">
                <Text className="discover-panel__eyebrow">{discoverPayload.editorial.mode === 'manual' ? '编辑推荐' : '智能推荐'}</Text>
                <Text className="discover-panel__title">{discoverPayload.editorial.title}</Text>
                <Text className="discover-panel__description">{discoverPayload.editorial.subtitle}</Text>
                {discoverPayload.editorPicks.length > 0 ? (
                  <View className="editorial-list">
                    {discoverPayload.editorPicks.map((pick) => (
                      <View
                        key={pick.bean.id}
                        className="editorial-card"
                        onClick={() => Taro.navigateTo({ url: `/pages/bean-detail/index?id=${pick.bean.id}` })}
                      >
                        <View className="editorial-card__meta">
                          <Text className="editorial-card__kicker">Editor Pick</Text>
                          <Text className="editorial-card__title">{pick.bean.name}</Text>
                          <Text className="editorial-card__line">
                            {[pick.bean.roasterName, pick.bean.originCountry].filter(Boolean).join(' · ')}
                          </Text>
                          <Text className="editorial-card__note">{pick.reason}</Text>
                        </View>
                        <View className="editorial-card__tags">
                          <Text className="editorial-card__tag">{pick.bean.process || '处理法待补充'}</Text>
                          {pick.bean.isNewArrival ? (
                            <Text className="editorial-card__tag editorial-card__tag--accent">新品</Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="discover-panel__description">当前路径下暂时没有推荐豆子，换个国家或处理法试试。</Text>
                )}
              </View>

              {shouldShowDiscoverResults ? (
                <View className="discover-panel__section">
                  {selectedCountry !== ALL_DISCOVER_VALUE ? (
                    <View className="country-focus">
                      {activeCountryMeta ? (
                        <View className="country-focus__map-shell">
                          <Image
                            className="country-focus__map"
                            src={makeAtlasSvgUri(
                              activeCountryMeta.path,
                              activeCountryMeta.viewBox,
                              activeCountryMeta.color,
                              true
                            )}
                            mode="aspectFit"
                            lazyLoad
                          />
                        </View>
                      ) : null}
                      <View className="country-focus__body">
                        <Text className="country-focus__kicker">{activeContinentMeta?.name ?? '国家结果'}</Text>
                        <Text className="country-focus__title">{selectedCountry}</Text>
                        <Text className="country-focus__summary">
                          {activeCountryMeta?.editorialLabel ?? '国家级别结果已就绪，可以直接往下浏览完整豆单。'}
                        </Text>
                        {activeCountryMeta?.flavorLabel ? (
                          <Text className="country-focus__flavor">{activeCountryMeta.flavorLabel}</Text>
                        ) : null}
                      </View>
                    </View>
                  ) : (
                    <View className="country-focus country-focus--path">
                      {activeContinentMeta ? (
                        <View className="country-focus__map-shell">
                          <Image
                            className="country-focus__map"
                            src={makeAtlasSvgUri(
                              activeContinentMeta.path,
                              activeContinentMeta.viewBox,
                              activeContinentMeta.color,
                              true
                            )}
                            mode="aspectFit"
                            lazyLoad
                          />
                        </View>
                      ) : null}
                      <View className="country-focus__body">
                        <Text className="country-focus__kicker">
                          {activeContinentMeta?.name ?? (selectedProcess !== ALL_DISCOVER_VALUE ? '处理法结果' : '探索结果')}
                        </Text>
                        <Text className="country-focus__title">
                          {activeContinentMeta?.name ?? (selectedProcess !== ALL_DISCOVER_VALUE ? `${selectedProcess} 路径` : '当前探索结果')}
                        </Text>
                        <Text className="country-focus__summary">
                          {activeContinentMeta
                            ? `已切到 ${activeContinentMeta.name} 级别结果，继续选择国家会让结果更聚焦。`
                            : selectedProcess !== ALL_DISCOVER_VALUE
                              ? `正在浏览 ${selectedProcess} 处理法下的发现结果，可以继续缩小到大洲和国家。`
                              : normalizedQuery
                                ? '正在展示当前搜索词下的发现结果，可以继续叠加处理法、大洲和国家。'
                                : '当前发现结果已就绪，可以继续叠加更多筛选条件。'}
                        </Text>
                      </View>
                    </View>
                  )}

                  <View className="discover-results">
                    <View className="discover-results__heading">
                      <Text className="discover-panel__eyebrow">第四步 · 结果</Text>
                      <Text className="discover-panel__title">
                        {selectedCountry !== ALL_DISCOVER_VALUE
                          ? `共 ${discoverPayload.resultSummary.total} 款，继续向下浏览完整豆单`
                          : `当前路径共 ${discoverPayload.resultSummary.total} 款，先看结果再决定是否缩到国家`}
                      </Text>
                    </View>
                    {errorMessage ? (
                      <EmptyState message={errorMessage} />
                    ) : loading && beans.length === 0 ? (
                      <EmptyState message="加载中..." />
                    ) : beans.length === 0 ? (
                      <View className="discover-results__empty">
                        <Text className="discover-results__empty-title">
                          {selectedCountry !== ALL_DISCOVER_VALUE
                            ? `${selectedCountry} 暂时没有匹配豆子`
                            : activeContinentMeta
                              ? `${activeContinentMeta.name} 暂时没有匹配豆子`
                              : '当前探索路径下暂无豆子'}
                        </Text>
                        <Text className="discover-results__empty-text">
                          {selectedCountry !== ALL_DISCOVER_VALUE
                            ? '可以退回当前大洲的全部国家，或者换一个处理法继续探索。'
                            : activeContinentMeta
                              ? '可以先切回全部大洲，或者保留搜索词继续换一个处理法。'
                              : '试试换一个处理法、大洲或国家，让发现页重新给出结果。'}
                        </Text>
                        <View className="discover-results__empty-actions">
                          {selectedCountry !== ALL_DISCOVER_VALUE ? (
                            <View className="discover-results__empty-action" onClick={() => setSelectedCountry(ALL_DISCOVER_VALUE)}>
                              <Text className="discover-results__empty-action-text">回到全部国家</Text>
                            </View>
                          ) : null}
                          {selectedContinent !== ALL_DISCOVER_VALUE ? (
                            <View
                              className="discover-results__empty-action"
                              onClick={() => {
                                setSelectedContinent(ALL_DISCOVER_VALUE);
                                setSelectedCountry(ALL_DISCOVER_VALUE);
                              }}
                            >
                              <Text className="discover-results__empty-action-text">查看全部大洲</Text>
                            </View>
                          ) : null}
                          {selectedProcess !== ALL_DISCOVER_VALUE ? (
                            <View className="discover-results__empty-action discover-results__empty-action--ghost" onClick={() => handleProcessSelect(ALL_DISCOVER_VALUE)}>
                              <Text className="discover-results__empty-action-text discover-results__empty-action-text--ghost">清除处理法</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    ) : (
                      beans.map((bean, index) => <BeanCard key={bean.id} bean={bean} index={index} />)
                    )}
                    {loading && beans.length > 0 ? (
                      <View className="all-beans__loading">
                        <Text className="all-beans__loading-text">加载中...</Text>
                      </View>
                    ) : null}
                    {!hasMore && beans.length > 0 ? (
                      <View className="all-beans__end">
                        <Text className="all-beans__end-text">— 已加载全部 —</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <EmptyState message="暂无探索内容" />
          )
        ) : errorMessage ? (
          <EmptyState message={errorMessage} />
        ) : loading && beans.length === 0 ? (
          <EmptyState message="加载中..." />
        ) : beans.length === 0 ? (
          <EmptyState message={activeTab === 'new' ? '最近一次导入暂无新品' : '未找到咖啡豆'} />
        ) : (
          <View>
            {beans.map((bean, index) => <BeanCard key={bean.id} bean={bean} index={index} />)}
            {loading && beans.length > 0 ? (
              <View className="all-beans__loading">
                <Text className="all-beans__loading-text">加载中...</Text>
              </View>
            ) : null}
            {!hasMore && beans.length > 0 ? (
              <View className={`all-beans__end ${activeTab === 'new' ? 'all-beans__end--new' : ''}`}>
                <Text className={`all-beans__end-text ${activeTab === 'new' ? 'all-beans__end-text--new' : ''}`}>
                  {activeTab === 'new' ? '当前无更多新品，去别处看看吧～' : '— 已加载全部 —'}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}
