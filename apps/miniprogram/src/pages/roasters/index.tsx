import { useEffect, useRef, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useReachBottom } from '@tarojs/taro';

import EmptyState from '../../components/EmptyState';
import RoasterCard from '../../components/RoasterCard';
import SearchBar from '../../components/SearchBar';
import { getRoasters } from '../../services/api';
import type { RoasterSummary } from '../../types';
import './index.scss';

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 260;

function mergeCities(current: string[], incoming: RoasterSummary[]): string[] {
  const next = new Set(current);
  incoming.forEach((roaster) => {
    if (roaster.city) next.add(roaster.city);
  });
  return Array.from(next).slice(0, 8);
}

export default function RoastersPage() {
  const [roasters, setRoasters] = useState<RoasterSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const loadingRef = useRef(false);
  const requestVersionRef = useRef(0);
  const mountedRef = useRef(false);
  const normalizedQuery = searchQuery.trim();

  const setLoadingState = (value: boolean) => {
    loadingRef.current = value;
    setLoading(value);
  };

  const loadPage = async (
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
      const res = await getRoasters({
        page: currentPage,
        pageSize: PAGE_SIZE,
        q: normalizedQuery || undefined,
        city: selectedCity || undefined,
      });

      if (requestVersion !== requestVersionRef.current) return;

      const nextItems = res.items ?? [];
      setRoasters((prev) => (
        currentPage === 1 || options?.reset ? nextItems : [...prev, ...nextItems]
      ));
      setTotal(res.pageInfo.total);
      setHasMore(res.pageInfo.hasNextPage);
      setPage(currentPage + 1);

      if (!normalizedQuery) {
        setCityOptions((prev) => mergeCities(prev, nextItems));
      }
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) return;

      const message = error instanceof Error ? error.message : '加载失败';
      setErrorMessage(message);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setLoadingState(false);
      }
    }
  };

  const reload = () => {
    requestVersionRef.current += 1;
    setRoasters([]);
    setPage(1);
    setHasMore(true);
    setTotal(null);
    void loadPage(1, { reset: true, ignoreLoading: true });
  };

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      void loadPage(1, { reset: true, ignoreLoading: true });
      return;
    }

    const timer = setTimeout(() => {
      reload();
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [normalizedQuery, selectedCity]);

  useReachBottom(() => {
    if (!loadingRef.current && hasMore) {
      void loadPage(page);
    }
  });

  const countLabel = total !== null
    ? `共收录 ${total} 家烘焙商`
    : loading
      ? '正在整理品牌目录...'
      : roasters.length > 0
        ? `已呈现 ${roasters.length} 家烘焙商`
        : '';

  const hasFilters = Boolean(normalizedQuery || selectedCity);

  return (
    <View className="roasters-page">
      <View className="roasters-page__hero">
        <Text className="roasters-page__title-en">ROASTER</Text>
        <Text className="roasters-page__title-atlas">Index</Text>
        <Text className="roasters-page__subtitle">翻阅当季烘焙品牌册</Text>
        {countLabel ? (
          <Text className="roasters-page__count">{countLabel}</Text>
        ) : null}
      </View>

      <SearchBar
        value={searchQuery}
        placeholder="按品牌名或城市搜索..."
        onInput={setSearchQuery}
      />

      {cityOptions.length > 0 ? (
        <View className="roasters-page__city-bar">
          <Text
            className={`roasters-page__city-chip ${selectedCity ? '' : 'roasters-page__city-chip--active'}`}
            onClick={() => setSelectedCity('')}
          >
            全部城市
          </Text>
          {cityOptions.map((city) => (
            <Text
              key={city}
              className={`roasters-page__city-chip ${selectedCity === city ? 'roasters-page__city-chip--active' : ''}`}
              onClick={() => setSelectedCity(city)}
            >
              {city}
            </Text>
          ))}
        </View>
      ) : null}

      {hasFilters ? (
        <View className="roasters-page__query-bar">
          <Text className="roasters-page__query-text">
            {normalizedQuery ? `搜索 “${normalizedQuery}”` : '按城市查看品牌'}
            {selectedCity ? ` · ${selectedCity}` : ''}
          </Text>
          <Text
            className="roasters-page__query-clear"
            onClick={() => {
              setSearchQuery('');
              setSelectedCity('');
            }}
          >
            清除
          </Text>
        </View>
      ) : null}

      <View className="roasters-page__list">
        {errorMessage ? (
          <EmptyState message={errorMessage} />
        ) : loading && roasters.length === 0 ? (
          <EmptyState message="正在展开品牌目录..." />
        ) : roasters.length === 0 ? (
          <EmptyState message="暂时还没有匹配的烘焙商" />
        ) : (
          roasters.map((roaster, index) => (
            <RoasterCard key={roaster.id} roaster={roaster} index={index} />
          ))
        )}

        {loading && roasters.length > 0 ? (
          <View className="roasters-page__loading">
            <Text className="roasters-page__loading-text">继续翻阅中...</Text>
          </View>
        ) : null}

        {!hasMore && roasters.length > 0 ? (
          <View className="roasters-page__end">
            <Text className="roasters-page__end-text">— 品牌目录已到底 —</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
