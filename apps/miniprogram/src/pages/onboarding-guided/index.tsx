import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { getBeanDiscover } from '../../services/api';
import type { BeanDiscoverPayload, DiscoverContinentId, ProcessBaseId, ProcessStyleId } from '../../types';
import { ORIGIN_ATLAS_COUNTRY_MAP } from '../../utils/origin-atlas';
import { setAllBeansEntryIntent } from '../all-beans/entry-intent';
import {
  buildGuidedDiscoverStep,
  GUIDED_CONTINENT_CHOICES,
  GUIDED_PROCESS_CHOICES,
  GUIDED_PROCESS_STYLE_CHOICES,
  resolveGuidedContinentSelection,
  resolveGuidedProcessSelection,
  resolveGuidedProcessStyleSelection,
} from '../all-beans/guided-discover';
import { setAllBeansGuidedSeed } from '../all-beans/guided-seed';
import { ONBOARDING_ALL_BEANS_URL } from '../onboarding/onboarding-logic';
import './index.scss';

const ALL_DISCOVER_VALUE = 'all';
const SEARCH_DEBOUNCE_MS = 250;

type DiscoverContinentKey = DiscoverContinentId | 'all';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '加载失败';
}

export default function OnboardingGuided() {
  const [selectedProcessBase, setSelectedProcessBase] = useState<string>(ALL_DISCOVER_VALUE);
  const [selectedProcessStyle, setSelectedProcessStyle] = useState<string>(ALL_DISCOVER_VALUE);
  const [selectedContinent, setSelectedContinent] = useState<DiscoverContinentKey>(ALL_DISCOVER_VALUE);
  const [selectedCountry, setSelectedCountry] = useState<string>(ALL_DISCOVER_VALUE);
  const [selectedVariety, setSelectedVariety] = useState<string>(ALL_DISCOVER_VALUE);

  const [discoverPayload, setDiscoverPayload] = useState<BeanDiscoverPayload | null>(null);
  const [, setDiscoverLoading] = useState(false);
  const [discoverError, setDiscoverError] = useState('');
  const requestVersionRef = useRef(0);

  const guidedDiscoverStep = useMemo(
    () =>
      buildGuidedDiscoverStep({
        selectedProcessBase,
        selectedProcessStyle,
        selectedContinent,
        selectedCountry,
        selectedVariety,
      }),
    [selectedContinent, selectedCountry, selectedProcessBase, selectedProcessStyle, selectedVariety]
  );

  const visibleGuidedProcessStyleChoices = useMemo(() => {
    if (!discoverPayload || discoverPayload.processStyleOptions.length === 0) return [];

    return GUIDED_PROCESS_STYLE_CHOICES.filter((choice) =>
      Boolean(resolveGuidedProcessStyleSelection(choice.id, discoverPayload.processStyleOptions))
    );
  }, [discoverPayload]);

  const canFinish = guidedDiscoverStep.step === 'done' || guidedDiscoverStep.step === 'variety';

  const loadDiscoverPayload = async () => {
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;
    setDiscoverLoading(true);
    setDiscoverError('');

    try {
      const response = await getBeanDiscover({
        processBase:
          selectedProcessBase !== ALL_DISCOVER_VALUE ? (selectedProcessBase as ProcessBaseId) : undefined,
        processStyle:
          selectedProcessStyle !== ALL_DISCOVER_VALUE ? (selectedProcessStyle as ProcessStyleId) : undefined,
        continent: selectedContinent !== ALL_DISCOVER_VALUE ? selectedContinent : undefined,
        country: selectedCountry !== ALL_DISCOVER_VALUE ? selectedCountry : undefined,
        variety: selectedVariety !== ALL_DISCOVER_VALUE ? selectedVariety : undefined,
      });

      if (requestVersion !== requestVersionRef.current) return;
      setDiscoverPayload(response);
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) return;
      setDiscoverError(getErrorMessage(error));
      Taro.showToast({ title: '探索加载失败', icon: 'none' });
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setDiscoverLoading(false);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDiscoverPayload();
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [selectedContinent, selectedCountry, selectedProcessBase, selectedProcessStyle, selectedVariety]);

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

  const handleGuidedProcessAnswer = (choice: (typeof GUIDED_PROCESS_CHOICES)[number]['id']) => {
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

  const handleGuidedProcessStyleAnswer = (choice: (typeof GUIDED_PROCESS_STYLE_CHOICES)[number]['id']) => {
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

  const handleGuidedContinentAnswer = (choice: (typeof GUIDED_CONTINENT_CHOICES)[number]['id']) => {
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

  const handleCountrySelect = (value: string) => {
    const atlasCountry = ORIGIN_ATLAS_COUNTRY_MAP.get(value) ?? null;
    if (atlasCountry) {
      setSelectedContinent(atlasCountry.continentId);
    }
    setSelectedCountry(value);
    setSelectedVariety(ALL_DISCOVER_VALUE);
  };

  const handleVarietySelect = (value: string) => {
    setSelectedVariety(value);
  };

  const handleRestart = () => {
    setSelectedProcessBase(ALL_DISCOVER_VALUE);
    setSelectedProcessStyle(ALL_DISCOVER_VALUE);
    setSelectedContinent(ALL_DISCOVER_VALUE);
    setSelectedCountry(ALL_DISCOVER_VALUE);
    setSelectedVariety(ALL_DISCOVER_VALUE);
  };

  const handleConfirm = () => {
    if (!canFinish) return;

    setAllBeansGuidedSeed({
      processBase: selectedProcessBase !== ALL_DISCOVER_VALUE ? selectedProcessBase : null,
      processStyle: selectedProcessStyle !== ALL_DISCOVER_VALUE ? selectedProcessStyle : null,
      continent: selectedContinent !== ALL_DISCOVER_VALUE ? selectedContinent : null,
      country: selectedCountry !== ALL_DISCOVER_VALUE ? selectedCountry : null,
      variety: selectedVariety !== ALL_DISCOVER_VALUE ? selectedVariety : null,
    });
    setAllBeansEntryIntent('guided');
    Taro.reLaunch({ url: ONBOARDING_ALL_BEANS_URL });
  };

  return (
    <View className="onboarding-guided">
      <View className="onboarding-guided__frame">
        <View className="onboarding-guided__header">
          <Text className="onboarding-guided__title">{guidedDiscoverStep.title}</Text>
          <Text className="onboarding-guided__description">{guidedDiscoverStep.description}</Text>
        </View>

        <View className="onboarding-guided__body">
          {discoverError ? <Text className="onboarding-guided__hint">{discoverError}</Text> : null}

          {guidedDiscoverStep.step === 'process_base' ? (
            discoverPayload && discoverPayload.processBaseOptions.length > 0 ? (
              <View className="onboarding-guided__choices">
                {GUIDED_PROCESS_CHOICES.map((choice) => (
                  <View
                    key={choice.id}
                    className="onboarding-guided__choice"
                    hoverClass="onboarding-guided__choice--active"
                    hoverStartTime={20}
                    hoverStayTime={70}
                    onClick={() => handleGuidedProcessAnswer(choice.id)}
                  >
                    <Text className="onboarding-guided__choice-title">{choice.title}</Text>
                    <Text className="onboarding-guided__choice-description">{choice.description}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="onboarding-guided__hint">正在准备基础处理法选项...</Text>
            )
          ) : null}

          {guidedDiscoverStep.step === 'process_style' ? (
            discoverPayload && visibleGuidedProcessStyleChoices.length > 0 ? (
              <View className="onboarding-guided__choices">
                {visibleGuidedProcessStyleChoices.map((choice) => (
                  <View
                    key={choice.id}
                    className="onboarding-guided__choice"
                    hoverClass="onboarding-guided__choice--active"
                    hoverStartTime={20}
                    hoverStayTime={70}
                    onClick={() => handleGuidedProcessStyleAnswer(choice.id)}
                  >
                    <Text className="onboarding-guided__choice-title">{choice.title}</Text>
                    <Text className="onboarding-guided__choice-description">{choice.description}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="onboarding-guided__hint">正在准备处理风格选项...</Text>
            )
          ) : null}

          {guidedDiscoverStep.step === 'continent' ? (
            discoverPayload && discoverPayload.continentOptions.length > 0 ? (
              <View className="onboarding-guided__choices">
                {GUIDED_CONTINENT_CHOICES.map((choice) => (
                  <View
                    key={choice.id}
                    className="onboarding-guided__choice"
                    hoverClass="onboarding-guided__choice--active"
                    hoverStartTime={20}
                    hoverStayTime={70}
                    onClick={() => handleGuidedContinentAnswer(choice.id)}
                  >
                    <Text className="onboarding-guided__choice-title">{choice.title}</Text>
                    <Text className="onboarding-guided__choice-description">{choice.description}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="onboarding-guided__hint">正在准备大洲选项...</Text>
            )
          ) : null}

          {guidedDiscoverStep.step === 'country' ? (
            discoverPayload ? (
              discoverPayload.countryOptions.length > 0 ? (
                <View className="onboarding-guided__choices">
                  {discoverPayload.countryOptions.map((option) => (
                    <View
                      key={option.id}
                      className="onboarding-guided__choice"
                      hoverClass="onboarding-guided__choice--active"
                      hoverStartTime={20}
                      hoverStayTime={70}
                      onClick={() => handleCountrySelect(option.label)}
                    >
                      <Text className="onboarding-guided__choice-title">{option.label}</Text>
                      <Text className="onboarding-guided__choice-description">{`${option.count} 款可选豆子`}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="onboarding-guided__hint">这个大洲下暂时没有可继续缩小的国家结果，可以直接往下浏览当前结果。</Text>
              )
            ) : (
              <Text className="onboarding-guided__hint">正在准备国家选项...</Text>
            )
          ) : null}

          {guidedDiscoverStep.step === 'variety' ? (
            discoverPayload ? (
              discoverPayload.varietyOptions.length > 0 ? (
                <>
                  <View className="onboarding-guided__choices">
                    {discoverPayload.varietyOptions.slice(0, 6).map((option) => (
                      <View
                        key={option.id}
                        className="onboarding-guided__choice"
                        hoverClass="onboarding-guided__choice--active"
                        hoverStartTime={20}
                        hoverStayTime={70}
                        onClick={() => handleVarietySelect(option.label)}
                      >
                        <Text className="onboarding-guided__choice-title">{option.label}</Text>
                        <Text className="onboarding-guided__choice-description">{`${option.count} 款可选豆子`}</Text>
                      </View>
                    ))}
                  </View>
                  <Text className="onboarding-guided__secondary" onClick={handleConfirm}>
                    跳过
                  </Text>
                </>
              ) : (
                <Text className="onboarding-guided__hint">当前路径下暂时没有可继续细分的豆种，可以直接查看结果。</Text>
              )
            ) : (
              <Text className="onboarding-guided__hint">正在准备豆种选项...</Text>
            )
          ) : null}

          {guidedDiscoverStep.step === 'done' ? (
            <Text className="onboarding-guided__secondary" onClick={handleRestart}>
              重新回答
            </Text>
          ) : null}
        </View>

        <View
          className={`onboarding-guided__confirm ${
            canFinish ? 'onboarding-guided__confirm--enabled' : 'onboarding-guided__confirm--disabled'
          }`}
          hoverClass={canFinish ? 'onboarding-guided__confirm--enabled-active' : ''}
          hoverStartTime={20}
          hoverStayTime={70}
          onClick={handleConfirm}
        >
          <Text className="onboarding-guided__confirm-text">开始进入</Text>
        </View>
      </View>
    </View>
  );
}
