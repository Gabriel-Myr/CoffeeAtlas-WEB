import type { ReactNode } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

import type { RoasterSummary } from '../../types';
import './index.scss';

interface RoasterCardProps {
  roaster: RoasterSummary;
  index?: number;
  trailing?: ReactNode;
  hideArrow?: boolean;
}

export default function RoasterCard({
  roaster,
  index = 0,
  trailing,
  hideArrow = false,
}: RoasterCardProps) {
  const handleTap = () => {
    Taro.navigateTo({ url: `/pages/roaster-detail/index?id=${roaster.id}` });
  };

  const delayStyle = index < 8 ? { animationDelay: `${index * 0.05}s` } : {};
  const description = roaster.description?.trim();

  return (
    <View
      className="roaster-card"
      style={delayStyle}
      hoverClass="roaster-card--active"
      hoverStartTime={20}
      hoverStayTime={70}
      onClick={handleTap}
    >
      <View className="roaster-card__media">
        {roaster.logoUrl ? (
          <Image
            src={roaster.logoUrl}
            mode="aspectFit"
            lazyLoad
            className="roaster-card__logo"
          />
        ) : (
          <View className="roaster-card__seal">
            <Text className="roaster-card__initial">{roaster.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>

      <View className="roaster-card__body">
        <Text className="roaster-card__eyebrow">Brand Directory</Text>
        <Text className="roaster-card__name">{roaster.name}</Text>
        <View className="roaster-card__meta">
          <Text className="roaster-card__city">{roaster.city || '城市待补充'}</Text>
          {roaster.beanCount != null ? (
            <View className="roaster-card__count">
              <Text className="roaster-card__count-num">{roaster.beanCount}</Text>
              <Text className="roaster-card__count-label">款豆单</Text>
            </View>
          ) : null}
        </View>
        <Text className={`roaster-card__desc ${description ? '' : 'roaster-card__desc--muted'}`}>
          {description || '收录当季代表豆单与品牌信息。'}
        </Text>
      </View>

      {trailing ? <View className="roaster-card__trailing">{trailing}</View> : null}
      {!hideArrow ? <Text className="roaster-card__arrow">↗</Text> : null}
    </View>
  );
}
