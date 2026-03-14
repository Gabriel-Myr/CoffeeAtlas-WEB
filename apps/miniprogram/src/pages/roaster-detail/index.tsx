import { useEffect, useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';

import BeanCard from '../../components/BeanCard';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import {
  addFavorite,
  getFavorites as getCloudFavorites,
  getRoasterById,
  removeFavorite,
} from '../../services/api';
import type { RoasterDetail } from '../../types';
import { isLoggedIn } from '../../utils/auth';
import { isRoasterFavorite, toggleRoasterFavorite } from '../../utils/storage';
import './index.scss';

function toRoasterSnapshot(roaster: RoasterDetail) {
  return {
    id: roaster.id,
    name: roaster.name,
    city: roaster.city,
    description: roaster.description,
    logoUrl: roaster.logoUrl,
    beanCount: roaster.beanCount,
  };
}

function formatLinkLabel(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export default function RoasterDetailPage() {
  const router = useRouter();
  const id = router.params.id ?? '';
  const [roaster, setRoaster] = useState<RoasterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (!id) return;

    getRoasterById(id)
      .then(async (data) => {
        setRoaster(data);
        Taro.setNavigationBarTitle({ title: data.name });

        if (isLoggedIn()) {
          const favorites = await getCloudFavorites().catch(() => []);
          setFavorited(
            favorites.some((favorite) => favorite.target_type === 'roaster' && favorite.target_id === data.id)
          );
        } else {
          setFavorited(isRoasterFavorite(data.id));
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : '加载失败');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleFavorite = async () => {
    if (!roaster) return;

    if (isLoggedIn()) {
      try {
        if (favorited) {
          await removeFavorite('roaster', roaster.id);
          setFavorited(false);
          Taro.showToast({ title: '已取消收藏', icon: 'none', duration: 1500 });
        } else {
          await addFavorite('roaster', roaster.id);
          setFavorited(true);
          Taro.showToast({ title: '已收藏烘焙商', icon: 'none', duration: 1500 });
        }
      } catch {
        Taro.showToast({ title: '操作失败', icon: 'none' });
      }
      return;
    }

    const added = toggleRoasterFavorite(toRoasterSnapshot(roaster));
    setFavorited(added);
    Taro.showToast({ title: added ? '已收藏烘焙商' : '已取消收藏', icon: 'none', duration: 1500 });
  };

  const handleCopy = (label: string, value: string) => {
    Taro.setClipboardData({
      data: value,
      success: () => {
        Taro.showToast({ title: `${label}已复制`, icon: 'none' });
      },
    });
  };

  if (loading) {
    return (
      <View className="roaster-detail">
        <EmptyState message="正在展开品牌页..." />
      </View>
    );
  }

  if (error || !roaster) {
    return (
      <View className="roaster-detail">
        <EmptyState message={error || '烘焙商不存在'} />
      </View>
    );
  }

  return (
    <View className="roaster-detail">
      <View className="roaster-detail__hero">
        <Text className="roaster-detail__eyebrow">Brand Portrait</Text>
        <View className="roaster-detail__hero-main">
          {roaster.logoUrl ? (
            <Image src={roaster.logoUrl} mode="aspectFit" className="roaster-detail__logo" />
          ) : (
            <View className="roaster-detail__seal">
              <Text className="roaster-detail__initial">{roaster.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}

          <View className="roaster-detail__title-wrap">
            <Text className="roaster-detail__name">{roaster.name}</Text>
            <View className="roaster-detail__meta">
              {roaster.city ? <Text className="roaster-detail__city">{roaster.city}</Text> : null}
              {roaster.beanCount != null ? (
                <Text className="roaster-detail__meta-pill">{roaster.beanCount} 款在售豆单</Text>
              ) : null}
            </View>
          </View>

          <View className="roaster-detail__favorite" onClick={handleFavorite}>
            <Icon
              name={favorited ? 'heart-filled' : 'heart'}
              size={20}
              color={favorited ? '#c85c3d' : '#8b5a2b'}
            />
          </View>
        </View>

        <Text className="roaster-detail__intro">
          {roaster.description?.trim() || '一份简洁的品牌索引，呈现这家烘焙商当前收录的风味线索。'}
        </Text>

        {(roaster.websiteUrl || roaster.instagramHandle) ? (
          <View className="roaster-detail__links">
            {roaster.websiteUrl ? (
              <View
                className="roaster-detail__link-chip"
                onClick={() => handleCopy('官网链接', roaster.websiteUrl!)}
              >
                <Icon name="globe" size={15} color="#8B7355" />
                <Text className="roaster-detail__link-text">{formatLinkLabel(roaster.websiteUrl)}</Text>
              </View>
            ) : null}

            {roaster.instagramHandle ? (
              <View
                className="roaster-detail__link-chip"
                onClick={() => handleCopy('Instagram 账号', `@${roaster.instagramHandle}`)}
              >
                <Text className="roaster-detail__link-prefix">@</Text>
                <Text className="roaster-detail__link-text">{roaster.instagramHandle}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <View className="roaster-detail__section-head">
        <Text className="roaster-detail__section-title">在售目录</Text>
        <Text className="roaster-detail__section-sub">Seasonal Selection</Text>
      </View>

      <View className="roaster-detail__beans">
        {roaster.beans && roaster.beans.length > 0 ? (
          roaster.beans.map((bean, index) => (
            <BeanCard key={bean.id} bean={bean} index={index} />
          ))
        ) : (
          <EmptyState message="这家烘焙商暂未上架豆款" />
        )}
      </View>
    </View>
  );
}
