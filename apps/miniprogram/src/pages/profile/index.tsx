import { useMemo, useState } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';

import Icon from '../../components/Icon';
import RoasterCard from '../../components/RoasterCard';
import { getFavorites as getCloudFavorites, removeFavorite as removeCloudFavorite } from '../../services/api';
import type {
  AuthUser,
  BeanFavorite,
  CoffeeBean,
  RoasterFavorite,
  RoasterSummary,
  UserFavorite,
} from '../../types';
import { isLoggedIn, login, logout } from '../../utils/auth';
import { getApiBaseUrlState } from '../../utils/api-config';
import {
  getBeanFavorites,
  getHistory,
  getRoasterFavorites,
  getStoredUser,
  toggleBeanFavorite,
  toggleRoasterFavorite,
} from '../../utils/storage';
import type { BeanSnapshot, HistoryItem, RoasterSnapshot } from '../../utils/storage';
import './index.scss';

type TabKey = 'beans' | 'roasters' | 'history';

interface BeanRowProps {
  bean: BeanSnapshot;
  note?: string;
  onFavoriteToggle?: () => void;
}

interface BeanFavoriteEntry {
  bean: BeanSnapshot;
  favorite?: BeanFavorite;
}

interface RoasterFavoriteEntry {
  roaster: RoasterSnapshot;
  favorite?: RoasterFavorite;
}

function toBeanSnapshot(bean: CoffeeBean): BeanSnapshot {
  return {
    id: bean.id,
    name: bean.name,
    roasterName: bean.roasterName,
    imageUrl: bean.imageUrl,
    originCountry: bean.originCountry,
    process: bean.process,
    price: bean.price,
  };
}

function toRoasterSnapshot(roaster: RoasterSummary): RoasterSnapshot {
  return {
    id: roaster.id,
    name: roaster.name,
    city: roaster.city,
    description: roaster.description,
    logoUrl: roaster.logoUrl,
    beanCount: roaster.beanCount,
  };
}

function formatHistoryTime(viewedAt: number): string {
  const diffMs = Date.now() - viewedAt;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes} 分钟前`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} 小时前`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '昨天浏览';
  if (diffDays < 7) return `${diffDays} 天前`;

  const date = new Date(viewedAt);
  return `${date.getMonth() + 1}/${date.getDate()} 浏览`;
}

function BeanRow({ bean, note, onFavoriteToggle }: BeanRowProps) {
  const handleTap = () => {
    Taro.navigateTo({ url: `/pages/bean-detail/index?id=${bean.id}` });
  };

  return (
    <View className="profile-bean-row" onClick={handleTap}>
      <View className="profile-bean-row__image">
        {bean.imageUrl ? (
          <Image src={bean.imageUrl} mode="aspectFill" className="profile-bean-row__img" lazyLoad />
        ) : (
          <View className="profile-bean-row__placeholder">
            <Icon name="coffee" size={28} color="rgba(139,90,43,0.2)" />
          </View>
        )}
      </View>

      <View className="profile-bean-row__info">
        <Text className="profile-bean-row__name">{bean.name}</Text>
        <Text className="profile-bean-row__meta">
          {[bean.roasterName, bean.originCountry, bean.process].filter(Boolean).join(' · ')}
        </Text>
      </View>

      <View className="profile-bean-row__side">
        <Text className="profile-bean-row__price">¥{bean.price}</Text>
        {onFavoriteToggle ? (
          <View
            className="profile-bean-row__action"
            onClick={(event) => {
              event.stopPropagation();
              onFavoriteToggle();
            }}
          >
            <Icon name="heart-filled" size={15} color="#c85c3d" />
          </View>
        ) : note ? (
          <Text className="profile-bean-row__note">{note}</Text>
        ) : null}
      </View>
    </View>
  );
}

function EmptyPane({ icon, message }: { icon: 'heart' | 'coffee'; message: string }) {
  return (
    <View className="profile__empty">
      <Icon name={icon} size={48} color="rgba(139,90,43,0.2)" />
      <Text className="profile__empty-text">{message}</Text>
    </View>
  );
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabKey>('beans');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [apiState, setApiState] = useState(getApiBaseUrlState());
  const [localBeanFavorites, setLocalBeanFavorites] = useState<BeanSnapshot[]>([]);
  const [localRoasterFavorites, setLocalRoasterFavorites] = useState<RoasterSnapshot[]>([]);
  const [cloudFavorites, setCloudFavorites] = useState<UserFavorite[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loginLoading, setLoginLoading] = useState(false);

  useDidShow(() => {
    const authed = isLoggedIn();
    setLoggedIn(authed);
    setUser(authed ? getStoredUser() : null);
    setApiState(getApiBaseUrlState());
    setLocalBeanFavorites(getBeanFavorites());
    setLocalRoasterFavorites(getRoasterFavorites());
    setHistory(getHistory());

    if (authed) {
      void loadCloudFavorites();
    } else {
      setCloudFavorites([]);
    }
  });

  const loadCloudFavorites = async () => {
    try {
      const favorites = await getCloudFavorites();
      setCloudFavorites(favorites);
    } catch {
      // 静默失败，保留页面可读性
    }
  };

  const beanFavorites = useMemo<BeanFavoriteEntry[]>(() => {
    if (!loggedIn) {
      return localBeanFavorites.map((bean) => ({ bean }));
    }

    return cloudFavorites.flatMap((favorite) => {
      if (favorite.target_type !== 'bean' || !favorite.bean) return [];
      return [{ favorite: favorite as BeanFavorite, bean: toBeanSnapshot(favorite.bean) }];
    });
  }, [cloudFavorites, localBeanFavorites, loggedIn]);

  const roasterFavorites = useMemo<RoasterFavoriteEntry[]>(() => {
    if (!loggedIn) {
      return localRoasterFavorites.map((roaster) => ({ roaster }));
    }

    return cloudFavorites.flatMap((favorite) => {
      if (favorite.target_type !== 'roaster' || !favorite.roaster) return [];
      return [{ favorite: favorite as RoasterFavorite, roaster: toRoasterSnapshot(favorite.roaster) }];
    });
  }, [cloudFavorites, localRoasterFavorites, loggedIn]);

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      const authUser = await login();
      setUser(authUser);
      setLoggedIn(true);
      await loadCloudFavorites();
      Taro.showToast({ title: '登录成功', icon: 'success' });
    } catch (error) {
      Taro.showToast({ title: error instanceof Error ? error.message : '登录失败', icon: 'none' });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setUser(null);
    setCloudFavorites([]);
    setLocalBeanFavorites(getBeanFavorites());
    setLocalRoasterFavorites(getRoasterFavorites());
  };

  const handleUnfavoriteLocalBean = (bean: BeanSnapshot) => {
    toggleBeanFavorite(bean);
    setLocalBeanFavorites(getBeanFavorites());
  };

  const handleUnfavoriteLocalRoaster = (roaster: RoasterSnapshot) => {
    toggleRoasterFavorite(roaster);
    setLocalRoasterFavorites(getRoasterFavorites());
  };

  const handleUnfavoriteCloud = async (favorite: UserFavorite) => {
    try {
      await removeCloudFavorite(favorite.target_type, favorite.target_id);
      setCloudFavorites((prev) => prev.filter((item) => item.id !== favorite.id));
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const totalSaved = beanFavorites.length + roasterFavorites.length;
  const summaryLabel = loggedIn ? '已同步至云端' : '本地收藏，登录后自动同步';
  const heroName = user?.nickname || (loggedIn ? '咖啡爱好者' : '你的咖啡私藏');
  const heroInitial = heroName.charAt(0).toUpperCase();
  const apiModeLabel = apiState.mode === 'cloud' ? '云端' : apiState.mode === 'local' ? '本地' : '未配置';

  return (
    <View className="profile">
      <View className="profile__hero">
        <View className="profile__hero-top">
          <View className="profile__identity">
            <Text className="profile__eyebrow">Private Shelf</Text>
            <Text className="profile__name">{heroName}</Text>
            <Text className="profile__status">{summaryLabel}</Text>
          </View>

          <View className="profile__seal">
            <Text className="profile__seal-text">{heroInitial}</Text>
          </View>
        </View>

        <View className="profile__hero-actions">
          <View className="profile__summary-pill">
            <Text className="profile__summary-pill-text">{`已收藏 ${totalSaved} 项`}</Text>
          </View>

          {loggedIn ? (
            <Text className="profile__logout" onClick={handleLogout}>退出登录</Text>
          ) : (
            <Button className="profile__login-btn" loading={loginLoading} onClick={handleLogin}>
              微信一键登录
            </Button>
          )}
        </View>

        <View className="profile__stats">
          <View className="profile__stat">
            <Text className="profile__stat-num">{beanFavorites.length}</Text>
            <Text className="profile__stat-label">豆款收藏</Text>
          </View>
          <View className="profile__stat">
            <Text className="profile__stat-num">{roasterFavorites.length}</Text>
            <Text className="profile__stat-label">烘焙商</Text>
          </View>
          <View className="profile__stat">
            <Text className="profile__stat-num">{history.length}</Text>
            <Text className="profile__stat-label">最近浏览</Text>
          </View>
        </View>
      </View>

      <View
        className="profile__debug-card"
        onClick={() => Taro.navigateTo({ url: '/pages/debug/index' })}
      >
        <View className="profile__debug-copy">
          <Text className="profile__debug-title">API 联调</Text>
          <Text className="profile__debug-desc">
            {apiState.baseUrl || '点击配置云端联调地址'}
          </Text>
        </View>
        <View className={`profile__debug-pill profile__debug-pill--${apiState.mode}`}>
          <Text className="profile__debug-pill-text">{apiModeLabel}</Text>
        </View>
      </View>

      <View className="profile__tabs">
        {([
          { key: 'beans', label: '豆款收藏' },
          { key: 'roasters', label: '烘焙商收藏' },
          { key: 'history', label: '最近浏览' },
        ] as Array<{ key: TabKey; label: string }>).map((tab) => (
          <View
            key={tab.key}
            className={`profile__tab ${activeTab === tab.key ? 'profile__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className="profile__tab-text">{tab.label}</Text>
          </View>
        ))}
      </View>

      <View className="profile__list">
        {activeTab === 'beans' ? (
          beanFavorites.length === 0 ? (
            <EmptyPane icon="heart" message="先挑几款喜欢的豆子，私藏夹会慢慢成形。" />
          ) : (
            beanFavorites.map((item) => (
              <BeanRow
                key={item.bean.id}
                bean={item.bean}
                onFavoriteToggle={() => {
                  if (loggedIn && item.favorite) {
                    void handleUnfavoriteCloud(item.favorite);
                  } else {
                    handleUnfavoriteLocalBean(item.bean);
                  }
                }}
              />
            ))
          )
        ) : null}

        {activeTab === 'roasters' ? (
          roasterFavorites.length === 0 ? (
            <EmptyPane icon="heart" message="把喜欢的烘焙品牌留下来，日后会更好回看。" />
          ) : (
            roasterFavorites.map((item, index) => (
              <RoasterCard
                key={item.roaster.id}
                roaster={item.roaster}
                index={index}
                hideArrow
                trailing={(
                  <View
                    className="profile__fav-action"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (loggedIn && item.favorite) {
                        void handleUnfavoriteCloud(item.favorite);
                      } else {
                        handleUnfavoriteLocalRoaster(item.roaster);
                      }
                    }}
                  >
                    <Icon name="heart-filled" size={15} color="#c85c3d" />
                  </View>
                )}
              />
            ))
          )
        ) : null}

        {activeTab === 'history' ? (
          history.length === 0 ? (
            <EmptyPane icon="coffee" message="最近还没有浏览记录，去翻翻新的豆单吧。" />
          ) : (
            history.map((item) => (
              <BeanRow
                key={item.id}
                bean={item}
                note={formatHistoryTime(item.viewedAt)}
              />
            ))
          )
        ) : null}
      </View>
    </View>
  );
}
