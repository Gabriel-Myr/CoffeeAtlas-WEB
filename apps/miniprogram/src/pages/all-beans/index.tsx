import { useEffect, useRef, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useReachBottom } from '@tarojs/taro';
import SearchBar from '../../components/SearchBar';
import BeanCard from '../../components/BeanCard';
import EmptyState from '../../components/EmptyState';
import { getBeans } from '../../services/api';
import type { CoffeeBean } from '../../types';
import './index.scss';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 250;

export default function AllBeans() {
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const loadingRef = useRef(false);
  const requestVersionRef = useRef(0);
  const normalizedQuery = searchQuery.trim();

  useEffect(() => {
    const timer = setTimeout(() => {
      reload();
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [normalizedQuery]);

  const setLoadingState = (value: boolean) => {
    loadingRef.current = value;
    setLoading(value);
  };

  const reload = () => {
    requestVersionRef.current += 1;
    setBeans([]);
    setPage(1);
    setHasMore(true);
    setTotal(null);
    void loadPage(1, { reset: true, ignoreLoading: true });
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
      const res = await getBeans({
        pageSize: PAGE_SIZE,
        page: currentPage,
        q: normalizedQuery || undefined,
      });

      if (requestVersion !== requestVersionRef.current) return;

      const newBeans = res.items ?? [];
      setBeans((prev) => (
        currentPage === 1 || options?.reset ? newBeans : [...prev, ...newBeans]
      ));
      setTotal(res.pageInfo.total);
      setPage(currentPage + 1);
      setHasMore(res.pageInfo.hasNextPage);
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

  useReachBottom(() => {
    if (!loadingRef.current && hasMore) {
      void loadPage(page);
    }
  });

  const countLabel = total !== null
    ? `共 ${total} 款咖啡豆`
    : loading
      ? '正在同步目录...'
      : beans.length > 0
        ? `已加载 ${beans.length} 款咖啡豆`
        : '';

  return (
    <View className="all-beans">
      <View className="all-beans__hero">
        <Text className="all-beans__title-en">COFFEE</Text>
        <Text className="all-beans__title-atlas">Atlas</Text>
        <Text className="all-beans__subtitle">全部咖啡豆</Text>
        {countLabel ? (
          <Text className="all-beans__count">{countLabel}</Text>
        ) : null}
      </View>

      <SearchBar value={searchQuery} placeholder="按烘焙商、产地或豆种搜索..." onInput={setSearchQuery} />

      {normalizedQuery ? (
        <View className="all-beans__query-bar">
          <Text className="all-beans__query-text">
            {`搜索 “${normalizedQuery}”`}
          </Text>
          <Text
            className="all-beans__query-clear"
            onClick={() => setSearchQuery('')}
          >
            清除
          </Text>
        </View>
      ) : null}

      <View className="all-beans__list">
        {errorMessage ? (
          <EmptyState message={errorMessage} />
        ) : loading && beans.length === 0 ? (
          <EmptyState message="加载中..." />
        ) : beans.length === 0 ? (
          <EmptyState message="未找到咖啡豆" />
        ) : (
          beans.map((bean, index) => <BeanCard key={bean.id} bean={bean} index={index} />)
        )}
        {loading && beans.length > 0 && (
          <View className="all-beans__loading">
            <Text className="all-beans__loading-text">加载中...</Text>
          </View>
        )}
        {!hasMore && beans.length > 0 && (
          <View className="all-beans__end">
            <Text className="all-beans__end-text">— 已加载全部 —</Text>
          </View>
        )}
      </View>
    </View>
  );
}
