import { useMemo, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';

import { setAllBeansEntryIntent } from '../all-beans/entry-intent';
import { getOnboardingProfile, setOnboardingProfile } from '../../utils/storage';
import { createOnboardingFlow } from './onboarding-logic';
import { resolveOnboardingNavigation } from './navigation';
import { getOnboardingSelectionNote, ONBOARDING_OPTION_COPY } from './copy';
import './index.scss';

export default function Onboarding() {
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | null>(null);
  const flow = useMemo(
    () =>
      createOnboardingFlow({
        getProfile: getOnboardingProfile,
        setProfile: setOnboardingProfile,
      }),
    []
  );

  useLoad(() => {
    const redirectUrl = flow.getRedirectUrl();
    if (redirectUrl) {
      const navigation = resolveOnboardingNavigation({
        url: redirectUrl,
        entryIntent: null,
      });
      Taro.switchTab({ url: navigation.url });
    }
  });

  const handleConfirm = () => {
    if (!selectedLevel) return;

    const result = flow.complete(selectedLevel);
    const navigation = resolveOnboardingNavigation(result);
    if (navigation.entryIntent) {
      setAllBeansEntryIntent(navigation.entryIntent);
    }
    Taro.switchTab({ url: navigation.url });
  };

  const handleSkip = () => {
    const result = flow.skip();
    const navigation = resolveOnboardingNavigation(result);
    Taro.switchTab({ url: navigation.url });
  };

  const selectionNote = getOnboardingSelectionNote(selectedLevel);

  return (
    <View className="onboarding">
      <View className="onboarding__frame">
        <View className="onboarding__hero">
          <View className="onboarding__brand">
            <Text className="onboarding__brand-en">COFFEE</Text>
            <Text className="onboarding__brand-atlas">Atlas</Text>
          </View>
          <View className="onboarding__hero-copy">
            <Text className="onboarding__title">进入咖啡地图</Text>
            <Text className="onboarding__subtitle">
              从零开始或自由探索
            </Text>
          </View>
        </View>

        <View className="onboarding__actions">
          <View
            className={`onboarding__action ${
              selectedLevel === 'beginner'
                ? 'onboarding__action--selected'
                : 'onboarding__action--idle'
            }`}
            hoverClass="onboarding__action--active"
            hoverStartTime={20}
            hoverStayTime={70}
            onClick={() => setSelectedLevel('beginner')}
          >
            <Text className="onboarding__action-label">{ONBOARDING_OPTION_COPY.beginner.label}</Text>
            <Text className="onboarding__action-meta">{ONBOARDING_OPTION_COPY.beginner.meta}</Text>
          </View>

          <View
            className={`onboarding__action ${
              selectedLevel === 'intermediate'
                ? 'onboarding__action--selected'
                : 'onboarding__action--idle'
            }`}
            hoverClass="onboarding__action--active"
            hoverStartTime={20}
            hoverStayTime={70}
            onClick={() => setSelectedLevel('intermediate')}
          >
            <Text className="onboarding__action-label">{ONBOARDING_OPTION_COPY.intermediate.label}</Text>
            <Text className="onboarding__action-meta">{ONBOARDING_OPTION_COPY.intermediate.meta}</Text>
          </View>
        </View>

        <View className="onboarding__selection-note">
          <Text className="onboarding__selection-note-label">
            {selectedLevel ? '已选择的开始方式' : '开始前说明'}
          </Text>
          <Text className="onboarding__selection-note-text">{selectionNote}</Text>
        </View>

        <View
          className={`onboarding__confirm ${
            selectedLevel ? 'onboarding__confirm--enabled' : 'onboarding__confirm--disabled'
          }`}
          hoverClass={selectedLevel ? 'onboarding__confirm--enabled-active' : ''}
          hoverStartTime={20}
          hoverStayTime={70}
          onClick={handleConfirm}
        >
          <Text className="onboarding__confirm-text">开始进入</Text>
        </View>

        <View className="onboarding__skip" onClick={handleSkip}>
          <Text className="onboarding__skip-text">先跳过</Text>
        </View>
      </View>
    </View>
  );
}
