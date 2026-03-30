import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow, useReachBottom, useRouter } from '@tarojs/taro';
import { getProcessBaseLabel, getProcessStyleLabel } from '@coffee-atlas/shared-types';

import BeanCard from '../../components/BeanCard';
import AtlasPageHero from '../../components/AtlasPageHero';
import EmptyState from '../../components/EmptyState';
import SearchBar from '../../components/SearchBar';
import { getBeanDiscover, getBeans } from '../../services/api';
import type {
  BeanDiscoverPayload,
  CoffeeBean,
  DiscoverContinentId,
  ProcessBaseId,
  ProcessStyleId,
} from '../../types';
import { consumeAllBeansEntryIntent } from './entry-intent';
import { resolveAllBeansRouteParams, type AllBeansLandingMode } from './route-params';
import { resolveAllBeansDidShowTransition } from './entry-transition';
import {
  ORIGIN_ATLAS_CONTINENT_MAP,
  ORIGIN_ATLAS_COUNTRY_MAP,
  makeAtlasSvgUri,
} from '../../utils/origin-atlas';
import {
  buildGuidedDiscoverStep,
  resolveGuidedContinentSelection,
  resolveGuidedProcessSelection,
  resolveGuidedProcessStyleSelection,
  shouldExpandGuidedDiscoverCard,
  type GuidedContinentChoiceId,
  type GuidedProcessChoiceId,
  type GuidedProcessStyleChoiceId,
} from './guided-discover';
import './index.scss';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 250;
const ALL_DISCOVER_VALUE = 'all';

type DiscoverContinentKey = DiscoverContinentId | 'all';

const GUIDED_PROCESS_CHOICES: Array<{
  id: GuidedProcessChoiceId;
  title: string;
  description: string;
}> = [
  { id: 'clean', title: '清爽干净', description: '水洗处理：干净明亮，酸质清稀。' },
  { id: 'fruity', title: '果香馥郁', description: '日晒处理：具有果汁感和发酵甜感。' },
  { id: 'sweet', title: '酸甜圆润', description: '蜜处理：甜感和酸质共存。' },
];

const GUIDED_PROCESS_STYLE_CHOICES: Array<{
  id: GuidedProcessStyleChoiceId;
  title: string;
  description: string;
}> = [
  { id: 'classic', title: '传统一点', description: '先看传统风格，更容易建立稳定印象。' },
  { id: 'anaerobic', title: '想试厌氧', description: '直接把结果缩到厌氧路线，风味会更跳一点。' },
  { id: 'experimental', title: '更特别一点', description: '把酵母、热冲击等特殊处理一起纳入选择。' },
];

const GUIDED_CONTINENT_CHOICES: Array<{
  id: GuidedContinentChoiceId;
  title: string;
  description: string;
}> = [
  { id: 'floral', title: '偏花香细腻', description: '先从非洲方向继续收窄。' },
  { id: 'balanced', title: '偏平衡甜感', description: '先从美洲方向继续收窄。' },
  { id: 'bold', title: '偏醇厚香料感', description: '先从亚洲方向继续收窄。' },
];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '加载失败';
}

function getCollapsedGuidanceCopy(landingMode: AllBeansLandingMode): {
  title: string;
  description: string;
} {
  if (landingMode === 'guided') {
    return {
      title: '已经为你打开轻问答，可以继续按问题缩小范围',
      description: '你也可以先收起引导，直接用下方筛选自己找豆子。',
    };
  }

  if (landingMode === 'direct') {
    return {
      title: '需要我帮你缩小范围吗？',
      description: '展开后会先问处理法，再逐步缩到大洲和国家；不展开也可以直接筛选。',
    };
  }

  return {
    title: '没有头绪时，帮你按喜好逐步选豆',
    description: '处理法-风味-产地，轻松筛选；\n已经有目标了？直接使用下方筛选吧。',
  };
}

export default function AllBeans() {
  const router = useRouter();
  const initialRouteState = resolveAllBeansRouteParams(router.params);
  const [landingMode, setLandingMode] = useState<AllBeansLandingMode>(initialRouteState.landingMode);
  const [isGuidedCardExpanded, setIsGuidedCardExpanded] = useState(() =>
    shouldExpandGuidedDiscoverCard(initialRouteState.landingMode)
  );
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedProcessBase, setSelectedProcessBase] = useState<string>(ALL_DISCOVER_VALUE);
  const [selectedProcessStyle, setSelectedProcessStyle] = useState<string>(ALL_DISCOVER_VALUE);
  const [selectedContinent, setSelectedContinent] = useState<DiscoverContinentKey>(ALL_DISCOVER_VALUE);
  const [selectedCountry, setSelectedCountry] = useState<string>(ALL_DISCOVER_VALUE);
  const [selectedVariety, setSelectedVariety] = useState<string>(ALL_DISCOVER_VALUE);

  const [discoverPayload, setDiscoverPayload] = useState<BeanDiscoverPayload | null>(null);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverError, setDiscoverError] = useState('');

  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadingRef = useRef(false);
  const requestVersionRef = useRef(0);
  const discoverRequestVersionRef = useRef(0);
  const normalizedQuery = searchQuery.trim();

  const activeContinentMeta =
    selectedContinent !== ALL_DISCOVER_VALUE ? ORIGIN_ATLAS_CONTINENT_MAP.get(selectedContinent) ?? null : null;
  const hasDiscoverPath =
    selectedProcessBase !== ALL_DISCOVER_VALUE ||
    selectedProcessStyle !== ALL_DISCOVER_VALUE ||
    selectedContinent !== ALL_DISCOVER_VALUE ||
    selectedCountry !== ALL_DISCOVER_VALUE ||
    selectedVariety !== ALL_DISCOVER_VALUE;
  const shouldShowDiscoverResults = hasDiscoverPath || Boolean(normalizedQuery);

  const discoverPathItems = useMemo(() => {
    const items: Array<{ key: 'processBase' | 'processStyle' | 'continent' | 'country' | 'variety'; label: string; value: string }> = [];

    if (selectedProcessBase !== ALL_DISCOVER_VALUE) {
      items.push({
        key: 'processBase',
        label: '基础处理法',
        value: getProcessBaseLabel(selectedProcessBase as ProcessBaseId),
      });
    }
    if (selectedProcessStyle !== ALL_DISCOVER_VALUE) {
      items.push({
        key: 'processStyle',
        label: '处理风格',
        value: getProcessStyleLabel(selectedProcessStyle as ProcessStyleId),
      });
    }
    if (selectedContinent !== ALL_DISCOVER_VALUE && activeContinentMeta) {
      items.push({ key: 'continent', label: '大洲', value: activeContinentMeta.name });
    }
    if (selectedCountry !== ALL_DISCOVER_VALUE) {
      items.push({ key: 'country', label: '国家', value: selectedCountry });
    }
    if (selectedVariety !== ALL_DISCOVER_VALUE) {
      items.push({ key: 'variety', label: '豆种', value: selectedVariety });
    }

    return items;
  }, [activeContinentMeta, selectedContinent, selectedCountry, selectedProcessBase, selectedProcessStyle, selectedVariety]);

  const discoverQueryText = useMemo(() => {
    if (!normalizedQuery) return '';
    if (discoverPathItems.length === 0) {
      return `搜索 “${normalizedQuery}”`;
    }

    return `在 ${discoverPathItems.map((item) => item.value).join(' / ')} 中搜索 “${normalizedQuery}”`;
  }, [discoverPathItems, normalizedQuery]);

  const guidedDiscoverStep = useMemo(() => {
    return buildGuidedDiscoverStep({
      selectedProcessBase,
      selectedProcessStyle,
      selectedContinent,
      selectedCountry,
      selectedVariety,
    });
  }, [selectedContinent, selectedCountry, selectedProcessBase, selectedProcessStyle, selectedVariety]);

  const visibleGuidedProcessStyleChoices = useMemo(() => {
    if (!discoverPayload || discoverPayload.processStyleOptions.length === 0) return [];

    return GUIDED_PROCESS_STYLE_CHOICES.filter((choice) =>
      Boolean(resolveGuidedProcessStyleSelection(choice.id, discoverPayload.processStyleOptions))
    );
  }, [discoverPayload]);

  const collapsedGuidanceCopy = useMemo(() => getCollapsedGuidanceCopy(landingMode), [landingMode]);

  const resetResultState = () => {
    setBeans([]);
    setPage(1);
    setHasMore(true);
  };

  const setLoadingState = (value: boolean) => {
    loadingRef.current = value;
    setLoading(value);
  };

  const resetEntryPageState = () => {
    requestVersionRef.current += 1;
    discoverRequestVersionRef.current += 1;
    setSearchQuery('');
    setSelectedProcessBase(ALL_DISCOVER_VALUE);
    setSelectedProcessStyle(ALL_DISCOVER_VALUE);
    setSelectedContinent(ALL_DISCOVER_VALUE);
    setSelectedCountry(ALL_DISCOVER_VALUE);
    setSelectedVariety(ALL_DISCOVER_VALUE);
    setDiscoverPayload(null);
    setDiscoverError('');
    setErrorMessage('');
    resetResultState();
    setLoadingState(false);
    setDiscoverLoading(false);
  };

  const loadBeanPage = async (
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
        sort: 'updated_desc',
        processBase: selectedProcessBase !== ALL_DISCOVER_VALUE ? (selectedProcessBase as ProcessBaseId) : undefined,
        processStyle: selectedProcessStyle !== ALL_DISCOVER_VALUE ? (selectedProcessStyle as ProcessStyleId) : undefined,
        continent: selectedContinent !== ALL_DISCOVER_VALUE ? selectedContinent : undefined,
        country: selectedCountry !== ALL_DISCOVER_VALUE ? selectedCountry : undefined,
        variety: selectedVariety !== ALL_DISCOVER_VALUE ? selectedVariety : undefined,
      });

      if (requestVersion !== requestVersionRef.current) return;

      const nextBeans = response.items ?? [];
      setBeans((prev) => (currentPage === 1 || options?.reset ? nextBeans : [...prev, ...nextBeans]));
      setPage(currentPage + 1);
      setHasMore(response.pageInfo.hasNextPage);
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) return;
      setErrorMessage(getErrorMessage(error));
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setLoadingState(false);
      }
    }
  };

  const reloadBeanResults = () => {
    requestVersionRef.current += 1;
    resetResultState();
    void loadBeanPage(1, { reset: true, ignoreLoading: true });
  };

  const loadDiscoverPayload = async () => {
    const requestVersion = discoverRequestVersionRef.current + 1;
    discoverRequestVersionRef.current = requestVersion;
    setDiscoverLoading(true);
    setDiscoverError('');

    try {
      const response = await getBeanDiscover({
        q: normalizedQuery || undefined,
        processBase:
          selectedProcessBase !== ALL_DISCOVER_VALUE ? (selectedProcessBase as ProcessBaseId) : undefined,
        processStyle:
          selectedProcessStyle !== ALL_DISCOVER_VALUE ? (selectedProcessStyle as ProcessStyleId) : undefined,
        continent: selectedContinent !== ALL_DISCOVER_VALUE ? selectedContinent : undefined,
        country: selectedCountry !== ALL_DISCOVER_VALUE ? selectedCountry : undefined,
        variety: selectedVariety !== ALL_DISCOVER_VALUE ? selectedVariety : undefined,
      });

      if (requestVersion !== discoverRequestVersionRef.current) return;
      setDiscoverPayload(response);
    } catch (error) {
      if (requestVersion !== discoverRequestVersionRef.current) return;
      setDiscoverError(getErrorMessage(error));
      Taro.showToast({ title: '探索加载失败', icon: 'none' });
    } finally {
      if (requestVersion === discoverRequestVersionRef.current) {
        setDiscoverLoading(false);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDiscoverPayload();
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [normalizedQuery, selectedContinent, selectedCountry, selectedProcessBase, selectedProcessStyle, selectedVariety]);

  useEffect(() => {
    if (!shouldShowDiscoverResults) {
      requestVersionRef.current += 1;
      resetResultState();
      setErrorMessage('');
      setLoadingState(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      reloadBeanResults();
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [normalizedQuery, selectedContinent, selectedCountry, selectedProcessBase, selectedProcessStyle, selectedVariety, shouldShowDiscoverResults]);

  useEffect(() => {
    if (!discoverPayload) return;

    if (
      selectedProcessBase !== ALL_DISCOVER_VALUE &&
      !discoverPayload.processBaseOptions.some((option) => option.id === selectedProcessBase)
    ) {
      setSelectedProcessBase(ALL_DISCOVER_VALUE);
      setSelectedProcessStyle(ALL_DISCOVER_VALUE);
      setSelectedContinent(ALL_DISCOVER_VALUE);
      setSelectedCountry(ALL_DISCOVER_VALUE);
      setSelectedVariety(ALL_DISCOVER_VALUE);
      return;
    }

    if (
      selectedProcessStyle !== ALL_DISCOVER_VALUE &&
      !discoverPayload.processStyleOptions.some((option) => option.id === selectedProcessStyle)
    ) {
      setSelectedProcessStyle(ALL_DISCOVER_VALUE);
      setSelectedContinent(ALL_DISCOVER_VALUE);
      setSelectedCountry(ALL_DISCOVER_VALUE);
      setSelectedVariety(ALL_DISCOVER_VALUE);
      return;
    }

    if (
      selectedContinent !== ALL_DISCOVER_VALUE &&
      !discoverPayload.continentOptions.some((option) => option.id === selectedContinent)
    ) {
      setSelectedContinent(ALL_DISCOVER_VALUE);
      setSelectedCountry(ALL_DISCOVER_VALUE);
      setSelectedVariety(ALL_DISCOVER_VALUE);
      return;
    }

    if (
      selectedCountry !== ALL_DISCOVER_VALUE &&
      !discoverPayload.countryOptions.some((option) => option.label === selectedCountry)
    ) {
      setSelectedCountry(ALL_DISCOVER_VALUE);
      setSelectedVariety(ALL_DISCOVER_VALUE);
      return;
    }

    if (
      selectedVariety !== ALL_DISCOVER_VALUE &&
      !discoverPayload.varietyOptions.some((option) => option.label === selectedVariety)
    ) {
      setSelectedVariety(ALL_DISCOVER_VALUE);
    }
  }, [discoverPayload, selectedContinent, selectedCountry, selectedProcessBase, selectedProcessStyle, selectedVariety]);

  useReachBottom(() => {
    if (loadingRef.current || !hasMore || !shouldShowDiscoverResults) return;
    void loadBeanPage(page);
  });

  useDidShow(() => {
    const entryIntent = consumeAllBeansEntryIntent();
    const transition = resolveAllBeansDidShowTransition({
      params: router.params,
      entryIntent,
      landingMode,
    });

    if (!transition.shouldApply) return;

    if (transition.shouldResetPageState) {
      resetEntryPageState();
    }

    setLandingMode(transition.nextLandingMode);
    setIsGuidedCardExpanded(shouldExpandGuidedDiscoverCard(transition.nextLandingMode));
  });

  const handleProcessBaseSelect = (value: string) => {
    const nextValue = value === selectedProcessBase ? ALL_DISCOVER_VALUE : value;
    setSelectedProcessBase(nextValue);
    setSelectedProcessStyle(ALL_DISCOVER_VALUE);
    setSelectedContinent(ALL_DISCOVER_VALUE);
    setSelectedCountry(ALL_DISCOVER_VALUE);
  };

  const handleProcessStyleSelect = (value: string) => {
    const nextValue = value === selectedProcessStyle ? ALL_DISCOVER_VALUE : value;
    setSelectedProcessStyle(nextValue);
    setSelectedContinent(ALL_DISCOVER_VALUE);
    setSelectedCountry(ALL_DISCOVER_VALUE);
    setSelectedVariety(ALL_DISCOVER_VALUE);
  };

  const handleContinentSelect = (value: DiscoverContinentId) => {
    const nextValue = value === selectedContinent ? ALL_DISCOVER_VALUE : value;
    setSelectedContinent(nextValue);
    setSelectedCountry(ALL_DISCOVER_VALUE);
    setSelectedVariety(ALL_DISCOVER_VALUE);
  };

  const handleCountrySelect = (value: string) => {
    const atlasCountry = ORIGIN_ATLAS_COUNTRY_MAP.get(value) ?? null;
    if (atlasCountry) {
      setSelectedContinent(atlasCountry.continentId);
    }
    setSelectedCountry(value === selectedCountry ? ALL_DISCOVER_VALUE : value);
    setSelectedVariety(ALL_DISCOVER_VALUE);
  };

  const handleVarietySelect = (value: string) => {
    setSelectedVariety(value === selectedVariety ? ALL_DISCOVER_VALUE : value);
  };

  const clearDiscoverPath = (key?: 'processBase' | 'processStyle' | 'continent' | 'country' | 'variety') => {
    if (!key || key === 'processBase') {
      setSelectedProcessBase(ALL_DISCOVER_VALUE);
      setSelectedProcessStyle(ALL_DISCOVER_VALUE);
      setSelectedContinent(ALL_DISCOVER_VALUE);
      setSelectedCountry(ALL_DISCOVER_VALUE);
      setSelectedVariety(ALL_DISCOVER_VALUE);
      return;
    }

    if (key === 'processStyle') {
      setSelectedProcessStyle(ALL_DISCOVER_VALUE);
      setSelectedContinent(ALL_DISCOVER_VALUE);
      setSelectedCountry(ALL_DISCOVER_VALUE);
      setSelectedVariety(ALL_DISCOVER_VALUE);
      return;
    }

    if (key === 'continent') {
      setSelectedContinent(ALL_DISCOVER_VALUE);
      setSelectedCountry(ALL_DISCOVER_VALUE);
      setSelectedVariety(ALL_DISCOVER_VALUE);
      return;
    }

    if (key === 'country') {
      setSelectedCountry(ALL_DISCOVER_VALUE);
      setSelectedVariety(ALL_DISCOVER_VALUE);
      return;
    }

    if (key === 'variety') {
      setSelectedVariety(ALL_DISCOVER_VALUE);
      return;
    }

    setSelectedCountry(ALL_DISCOVER_VALUE);
  };

  const handleGuidedProcessAnswer = (choice: GuidedProcessChoiceId) => {
    if (!discoverPayload || discoverPayload.processBaseOptions.length === 0) return;
    const selection = resolveGuidedProcessSelection(choice, discoverPayload.processBaseOptions);
    if (!selection) {
      Taro.showToast({ title: '当前没有匹配的基础处理法方向', icon: 'none' });
      return;
    }
    setSelectedProcessBase(selection.id);
    setSelectedProcessStyle(ALL_DISCOVER_VALUE);
    setSelectedContinent(ALL_DISCOVER_VALUE);
    setSelectedCountry(ALL_DISCOVER_VALUE);
    setSelectedVariety(ALL_DISCOVER_VALUE);
  };

  const handleGuidedProcessStyleAnswer = (choice: GuidedProcessStyleChoiceId) => {
    if (!discoverPayload || discoverPayload.processStyleOptions.length === 0) return;
    const selection = resolveGuidedProcessStyleSelection(choice, discoverPayload.processStyleOptions);
    if (!selection) {
      Taro.showToast({ title: '当前没有匹配的处理风格方向', icon: 'none' });
      return;
    }
    setSelectedProcessStyle(selection.id);
    setSelectedContinent(ALL_DISCOVER_VALUE);
    setSelectedCountry(ALL_DISCOVER_VALUE);
    setSelectedVariety(ALL_DISCOVER_VALUE);
  };

  const handleGuidedContinentAnswer = (choice: GuidedContinentChoiceId) => {
    if (!discoverPayload || discoverPayload.continentOptions.length === 0) return;
    const selection = resolveGuidedContinentSelection(choice, discoverPayload.continentOptions);
    if (!selection) {
      Taro.showToast({ title: '当前没有匹配的大洲方向', icon: 'none' });
      return;
    }
    setSelectedContinent(selection.id as DiscoverContinentId);
    setSelectedCountry(ALL_DISCOVER_VALUE);
    setSelectedVariety(ALL_DISCOVER_VALUE);
  };

  return (
    <View className="all-beans">
      <AtlasPageHero subtitle="全部咖啡豆">
        {shouldShowDiscoverResults && discoverPayload ? (
          <Text className="all-beans__hero-count">{`当前路径共 ${discoverPayload.resultSummary.total} 款咖啡豆`}</Text>
        ) : null}
      </AtlasPageHero>

      <SearchBar value={searchQuery} placeholder="按烘焙商、产地、处理法或豆种搜索..." onInput={setSearchQuery} />

      <View className="discover-top">
        <View className="guided-discover-card">
          <View className="guided-discover-card__header" onClick={() => setIsGuidedCardExpanded((current) => !current)}>
            <View className="guided-discover-card__header-main">
              <Text className="guided-discover-card__label">轻问答</Text>
              <Text className="guided-discover-card__title">
                {isGuidedCardExpanded ? guidedDiscoverStep.title : collapsedGuidanceCopy.title}
              </Text>
              <Text className="guided-discover-card__description">
                {isGuidedCardExpanded ? guidedDiscoverStep.description : collapsedGuidanceCopy.description}
              </Text>
            </View>
            <Text className="guided-discover-card__toggle">{isGuidedCardExpanded ? '收起' : '展开'}</Text>
          </View>

          {isGuidedCardExpanded ? (
            <>
              {guidedDiscoverStep.step === 'process_base' ? (
                discoverPayload && discoverPayload.processBaseOptions.length > 0 ? (
                  <View className="guided-discover-card__choices">
                    {GUIDED_PROCESS_CHOICES.map((choice) => (
                      <View
                        key={choice.id}
                        className="guided-discover-card__choice"
                        onClick={() => handleGuidedProcessAnswer(choice.id)}
                      >
                        <Text className="guided-discover-card__choice-title">{choice.title}</Text>
                        <Text className="guided-discover-card__choice-description">{choice.description}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="guided-discover-card__hint">正在准备基础处理法选项...</Text>
                )
              ) : null}

              {guidedDiscoverStep.step === 'process_style' ? (
                discoverPayload && visibleGuidedProcessStyleChoices.length > 0 ? (
                  <View className="guided-discover-card__choices">
                    {visibleGuidedProcessStyleChoices.map((choice) => (
                      <View
                        key={choice.id}
                        className="guided-discover-card__choice"
                        onClick={() => handleGuidedProcessStyleAnswer(choice.id)}
                      >
                        <Text className="guided-discover-card__choice-title">{choice.title}</Text>
                        <Text className="guided-discover-card__choice-description">{choice.description}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="guided-discover-card__hint">正在准备处理风格选项...</Text>
                )
              ) : null}

              {guidedDiscoverStep.step === 'continent' ? (
                discoverPayload && discoverPayload.continentOptions.length > 0 ? (
                  <View className="guided-discover-card__choices">
                    {GUIDED_CONTINENT_CHOICES.map((choice) => (
                      <View
                        key={choice.id}
                        className="guided-discover-card__choice"
                        onClick={() => handleGuidedContinentAnswer(choice.id)}
                      >
                        <Text className="guided-discover-card__choice-title">{choice.title}</Text>
                        <Text className="guided-discover-card__choice-description">{choice.description}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="guided-discover-card__hint">正在准备大洲选项...</Text>
                )
              ) : null}

              {guidedDiscoverStep.step === 'country' ? (
                discoverPayload ? (
                  discoverPayload.countryOptions.length > 0 ? (
                    <View className="guided-discover-card__choices">
                      {discoverPayload.countryOptions.map((option) => (
                        <View
                          key={option.id}
                          className="guided-discover-card__choice"
                          onClick={() => handleCountrySelect(option.label)}
                        >
                          <Text className="guided-discover-card__choice-title">{option.label}</Text>
                          <Text className="guided-discover-card__choice-description">{`${option.count} 款可选豆子`}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text className="guided-discover-card__hint">这个大洲下暂时没有可继续缩小的国家结果，可以直接往下浏览当前结果。</Text>
                  )
                ) : (
                  <Text className="guided-discover-card__hint">正在准备国家选项...</Text>
                )
              ) : null}

              {guidedDiscoverStep.step === 'variety' ? (
                discoverPayload ? (
                  discoverPayload.varietyOptions.length > 0 ? (
                    <>
                      <View className="guided-discover-card__choices">
                        {discoverPayload.varietyOptions.slice(0, 6).map((option) => (
                          <View
                            key={option.id}
                            className="guided-discover-card__choice"
                            onClick={() => handleVarietySelect(option.label)}
                          >
                            <Text className="guided-discover-card__choice-title">{option.label}</Text>
                            <Text className="guided-discover-card__choice-description">{`${option.count} 款可选豆子`}</Text>
                          </View>
                        ))}
                      </View>
                      <Text className="guided-discover-card__restart" onClick={() => setSelectedVariety(ALL_DISCOVER_VALUE)}>
                        跳过
                      </Text>
                    </>
                  ) : (
                    <Text className="guided-discover-card__hint">当前路径下暂时没有可继续细分的豆种，可以直接查看结果。</Text>
                  )
                ) : (
                  <Text className="guided-discover-card__hint">正在准备豆种选项...</Text>
                )
              ) : null}

              {guidedDiscoverStep.step === 'done' ? (
                <Text className="guided-discover-card__restart" onClick={() => clearDiscoverPath()}>
                  重新回答
                </Text>
              ) : null}
            </>
          ) : (
            <Text className="guided-discover-card__hint">展开后会按处理法、风格和产地帮你逐步缩小范围。</Text>
          )}
        </View>

      </View>

      {normalizedQuery ? (
        <View className="all-beans__query-bar">
          <Text className="all-beans__query-text">{discoverQueryText}</Text>
          <Text className="all-beans__query-clear" onClick={() => setSearchQuery('')}>
            清除
          </Text>
        </View>
      ) : null}

      <View className="all-beans__list">
        {discoverError ? (
          <EmptyState message={discoverError} />
        ) : discoverLoading && !discoverPayload ? (
          <EmptyState message="正在加载探索路径..." />
        ) : discoverPayload ? (
          <View className="discover-panel">
            <View className="discover-panel__section">
              <Text className="discover-panel__eyebrow">第一步 · 基础处理法</Text>
              <Text className="discover-panel__title">先决定你想从哪种基础处理法切入</Text>
              <View className="discover-panel__chips">
                <View
                  className={`discover-chip ${selectedProcessBase === ALL_DISCOVER_VALUE ? 'discover-chip--active' : ''}`}
                  onClick={() => handleProcessBaseSelect(ALL_DISCOVER_VALUE)}
                >
                  <Text className="discover-chip__text">全部基础处理法</Text>
                </View>
                {discoverPayload.processBaseOptions.map((option) => (
                  <View
                    key={option.id}
                    className={`discover-chip ${selectedProcessBase === option.id ? 'discover-chip--active' : ''}`}
                    onClick={() => handleProcessBaseSelect(option.id)}
                  >
                    <Text className="discover-chip__text">{option.label}</Text>
                    <Text className="discover-chip__count">{option.count}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="discover-panel__section">
              <Text className="discover-panel__eyebrow">第二步 · 处理风格</Text>
              <Text className="discover-panel__title">
                {selectedProcessBase === ALL_DISCOVER_VALUE
                  ? '先选基础处理法，处理风格会更有针对性'
                  : selectedProcessBase === 'other'
                    ? '其他路径下不展示传统，只保留特殊风格'
                    : '再决定你更想看传统，还是特殊发酵风格'}
              </Text>
              <View className="discover-panel__chips">
                <View
                  className={`discover-chip ${selectedProcessStyle === ALL_DISCOVER_VALUE ? 'discover-chip--active' : ''}`}
                  onClick={() => handleProcessStyleSelect(ALL_DISCOVER_VALUE)}
                >
                  <Text className="discover-chip__text">全部处理风格</Text>
                </View>
                {discoverPayload.processStyleOptions.map((option) => (
                  <View
                    key={option.id}
                    className={`discover-chip ${selectedProcessStyle === option.id ? 'discover-chip--active' : ''}`}
                    onClick={() => handleProcessStyleSelect(option.id)}
                  >
                    <Text className="discover-chip__text">{option.label}</Text>
                    <Text className="discover-chip__count">{option.count}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="discover-panel__section">
              <Text className="discover-panel__eyebrow">第三步 · 大洲</Text>
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
              <Text className="discover-panel__eyebrow">第四步 · 国家</Text>
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

            <View className="discover-panel__section">
              <Text className="discover-panel__eyebrow">豆种（可选）</Text>
              <Text className="discover-panel__title">
                {selectedCountry === ALL_DISCOVER_VALUE
                  ? '这一步可以跳过；如果你已经有目标豆种，也可以在这里继续缩小。'
                  : '国家已经定好了，如果还想更聚焦，可以再按豆种细分。'}
              </Text>
              {discoverPayload.varietyOptions.length === 0 ? (
                <Text className="discover-panel__description">当前路径下暂时没有可用的豆种选项，直接看结果即可。</Text>
              ) : (
                <View className="discover-panel__chips">
                  <View
                    className={`discover-chip ${selectedVariety === ALL_DISCOVER_VALUE ? 'discover-chip--active' : ''}`}
                    onClick={() => handleVarietySelect(ALL_DISCOVER_VALUE)}
                  >
                    <Text className="discover-chip__text">全部豆种</Text>
                  </View>
                  {discoverPayload.varietyOptions.map((option) => (
                    <View
                      key={option.id}
                      className={`discover-chip ${selectedVariety === option.label ? 'discover-chip--active' : ''}`}
                      onClick={() => handleVarietySelect(option.label)}
                    >
                      <Text className="discover-chip__text">{option.label}</Text>
                      <Text className="discover-chip__count">{option.count}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {shouldShowDiscoverResults ? (
              <View className="discover-panel__section">
                <View className="discover-results">
                  <View className="discover-results__heading">
                    <Text className="discover-panel__eyebrow">第五步 · 结果</Text>
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
                        {selectedVariety !== ALL_DISCOVER_VALUE ? (
                          <View className="discover-results__empty-action" onClick={() => setSelectedVariety(ALL_DISCOVER_VALUE)}>
                            <Text className="discover-results__empty-action-text">回到全部豆种</Text>
                          </View>
                        ) : null}
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
                        {selectedProcessBase !== ALL_DISCOVER_VALUE || selectedProcessStyle !== ALL_DISCOVER_VALUE ? (
                          <View
                            className="discover-results__empty-action discover-results__empty-action--ghost"
                            onClick={() => handleProcessBaseSelect(ALL_DISCOVER_VALUE)}
                          >
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
        )}
      </View>
    </View>
  );
}
