import { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { toBeanFavoriteSnapshot } from '@coffee-atlas/domain';
import { getBeanById, addFavorite, removeFavorite, getFavorites } from '../../services/api';
import type { BeanDetail } from '../../types';
import { formatSalesCount } from '../../utils/formatters';
import { isBeanFavorite, toggleBeanFavorite, addToHistory } from '../../utils/storage';
import { isLoggedIn } from '../../utils/auth';
import Icon from '../../components/Icon';
import './index.scss';

export default function BeanDetail() {
  const router = useRouter();
  const { id } = router.params;
  const [bean, setBean] = useState<BeanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (!id) return;
    getBeanById(id)
      .then(async (data) => {
        setBean(data);
        if (isLoggedIn()) {
          const favs = await getFavorites().catch(() => []);
          setFavorited(favs.some((favorite) => favorite.target_type === 'bean' && favorite.target_id === data.id));
        } else {
          setFavorited(isBeanFavorite(data.id));
        }
        addToHistory(toBeanFavoriteSnapshot(data));
      })
      .catch(() => Taro.showToast({ title: '加载失败', icon: 'none' }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFavorite = async () => {
    if (!bean) return;
    if (isLoggedIn()) {
      try {
        if (favorited) {
          await removeFavorite('bean', bean.id);
          setFavorited(false);
          Taro.showToast({ title: '已取消收藏', icon: 'none', duration: 1500 });
        } else {
          await addFavorite('bean', bean.id);
          setFavorited(true);
          Taro.showToast({ title: '已收藏', icon: 'none', duration: 1500 });
        }
      } catch {
        Taro.showToast({ title: '操作失败', icon: 'none' });
      }
    } else {
      const added = toggleBeanFavorite(toBeanFavoriteSnapshot(bean));
      setFavorited(added);
      Taro.showToast({ title: added ? '已收藏' : '已取消收藏', icon: 'none', duration: 1500 });
    }
  };

  if (loading) {
    return (
      <View className="bean-detail bean-detail--loading">
        <Text className="bean-detail__loading-text">加载中...</Text>
      </View>
    );
  }

  if (!bean) {
    return (
      <View className="bean-detail bean-detail--loading">
        <Text className="bean-detail__loading-text">未找到该咖啡豆</Text>
      </View>
    );
  }

  const salesLabel = formatSalesCount(bean.salesCount);

  return (
    <View className="bean-detail">
      <View className="bean-detail__image-wrap">
        {bean.imageUrl ? (
          <Image src={bean.imageUrl} mode="aspectFill" className="bean-detail__image" />
        ) : (
          <View className="bean-detail__image-placeholder">
            <Icon name="coffee" size={80} color="rgba(139,90,43,0.25)" />
          </View>
        )}
        {bean.isNewArrival && <View className="bean-detail__badge">新品</View>}
        <View className="bean-detail__actions">
          <View className="bean-detail__action-btn" onClick={handleFavorite}>
            <Icon
              name={favorited ? 'heart-filled' : 'heart'}
              size={20}
              color={favorited ? '#c85c3d' : '#8b5a2b'}
            />
          </View>
        </View>
      </View>

      <View className="bean-detail__body">
        <View className="bean-detail__roaster">
          <Text className="bean-detail__roaster-name">{bean.roasterName}</Text>
          {bean.city && <Text className="bean-detail__city">{bean.city}</Text>}
        </View>

        <Text className="bean-detail__name">{bean.name}</Text>

        <View className="bean-detail__price-row">
          <Text className="bean-detail__price">¥{bean.price}</Text>
          {salesLabel && <Text className="bean-detail__sales">{salesLabel} 已售</Text>}
        </View>

        <View className="bean-detail__divider" />

        <View className="bean-detail__info-grid">
          {[
            { label: '产地', value: [bean.originCountry, bean.originRegion].filter(Boolean).join(' · ') },
            { label: '处理法', value: bean.process },
            { label: '烘焙度', value: bean.roastLevel },
            { label: '品种', value: bean.variety },
            { label: '庄园', value: bean.farm },
          ]
            .filter((item) => item.value)
            .map((item) => (
              <View key={item.label} className="bean-detail__info-item">
                <Text className="bean-detail__info-label">{item.label}</Text>
                <Text className="bean-detail__info-value">{item.value}</Text>
              </View>
            ))}
        </View>

        {(bean.tastingNotes?.length ?? 0) > 0 && (
          <View className="bean-detail__notes">
            <Text className="bean-detail__notes-title">风味描述</Text>
            <View className="bean-detail__notes-tags">
              {bean.tastingNotes?.map((note) => (
                <Text key={note} className="bean-detail__note-tag">{note}</Text>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
