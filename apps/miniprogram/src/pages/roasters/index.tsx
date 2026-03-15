import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from '@tarojs/components';
import Taro, { useReachBottom } from '@tarojs/taro';

import EmptyState from '../../components/EmptyState';
import RoasterCard from '../../components/RoasterCard';
import SearchBar from '../../components/SearchBar';
import { getRoasters } from '../../services/api';
import type { RoasterFeature, RoasterSummary } from '../../types';
import './index.scss';

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 260;
const FEATURE_OPTIONS: Array<{ key: 'all' | RoasterFeature; label: string }> = [
  { key: 'all', label: '全部品牌' },
  { key: 'has_image', label: '精选画册' },
  { key: 'has_beans', label: '有豆单' },
  { key: 'taobao', label: '淘宝在售' },
  { key: 'xiaohongshu', label: '小红书' },
];

export default function RoastersPage() {
  const [roasters, setRoasters] = useState<RoasterSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFeature, setActiveFeature] = useState<'all' | RoasterFeature>('all');
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
        feature: activeFeature === 'all' ? undefined : activeFeature,
      });

      if (requestVersion !== requestVersionRef.current) return;

      const nextItems = res.items ?? [];
      setRoasters((prev) => (
        currentPage === 1 || options?.reset ? nextItems : [...prev, ...nextItems]
      ));
      setTotal(res.pageInfo.total);
      setHasMore(res.pageInfo.hasNextPage);
      setPage(currentPage + 1);
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
  }, [normalizedQuery, activeFeature]);

  useReachBottom(() => {
    if (!loadingRef.current && hasMore) {
      void loadPage(page);
    }
  });

  const activeFeatureLabel = useMemo(
    () => FEATURE_OPTIONS.find((item) => item.key === activeFeature)?.label ?? '全部',
    [activeFeature]
  );

  const countLabel = total !== null
    ? activeFeature === 'all'
      ? `共收录 ${total} 家烘焙商`
      : `${activeFeatureLabel} · ${total} 家烘焙商`
    : loading
      ? '正在整理品牌目录...'
      : roasters.length > 0
        ? `已呈现 ${roasters.length} 家烘焙商`
        : '';

  const hasFilters = Boolean(normalizedQuery || activeFeature !== 'all');
  const emptyMessage = hasFilters ? '当前筛选下暂时没有匹配的烘焙商' : '暂时还没有烘焙商资料';

  return (
    <View className="roasters-page">
      <View className="roasters-page__header">
        <Text className="roasters-page__title-en">ROASTER</Text>
        <Text className="roasters-page__title-atlas">Gallery</Text>
        <Text className="roasters-page__subtitle">Discover artisan roasters and their craft</Text>
      </View>

      <SearchBar
        value={searchQuery}
        placeholder="按品牌名、产地或介绍搜索..."
        onInput={setSearchQuery}
      />

      <View className="roasters-page__content">
        <View className="roaster-atlas">
          <View className="roaster-atlas__toolbar">
            <View className="roaster-atlas__toolbar-copy">
              <Text className="roaster-atlas__toolbar-kicker">Roaster index</Text>
              <Text className="roaster-atlas__toolbar-title">Gallery Index</Text>
              <Text className="roaster-atlas__toolbar-subtitle">
                Browse our curated gallery of artisan coffee roasters, their stories, and current bean offerings.
              </Text>
            </View>

            <View className="roaster-atlas__filter-shell">
              <ScrollView scrollX className="roaster-atlas__feature-scroll" showScrollbar={false}>
                <View className="roaster-atlas__feature-row">
                  {FEATURE_OPTIONS.map((option) => (
                    <View
                      key={option.key}
                      className={`roaster-atlas__feature-chip ${activeFeature === option.key ? 'roaster-atlas__feature-chip--active' : ''}`}
                      onClick={() => {
                        if (activeFeature !== option.key) {
                          setActiveFeature(option.key);
                        }
                      }}
                    >
                      <Text className="roaster-atlas__feature-text">{option.label}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {hasFilters || countLabel ? (
              <View className="roaster-atlas__query-bar">
                <Text className="roaster-atlas__query-text">
                  {countLabel || (normalizedQuery ? `搜索 “${normalizedQuery}”` : activeFeatureLabel)}
                </Text>
                {hasFilters ? (
                  <Text
                    className="roaster-atlas__query-clear"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFeature('all');
                    }}
                  >
                    Clear
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>

          <View className="roaster-atlas__list">
            {errorMessage ? (
              <EmptyState message={errorMessage} />
            ) : loading && roasters.length === 0 ? (
              <EmptyState message="正在展开品牌画册..." />
            ) : roasters.length === 0 ? (
              <EmptyState message={emptyMessage} />
            ) : (
              roasters.map((roaster, index) => (
                <RoasterCard key={roaster.id} roaster={roaster} index={index} variant="gallery" />
              ))
            )}

            {loading && roasters.length > 0 ? (
              <View className="roaster-atlas__loading">
                <Text className="roaster-atlas__loading-text">Loading more brands...</Text>
              </View>
            ) : null}

            {!hasMore && roasters.length > 0 ? (
              <View className="roaster-atlas__end">
                <Text className="roaster-atlas__end-text">— End of the gallery —</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
