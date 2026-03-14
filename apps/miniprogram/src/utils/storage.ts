import Taro from '@tarojs/taro';

import type { AuthUser } from '../types';

const FAVORITES_KEY = 'coffee_favorites';
const ROASTER_FAVORITES_KEY = 'roaster_favorites';
const HISTORY_KEY = 'coffee_history';
const TOKEN_KEY = 'app_token';
const USER_KEY = 'auth_user';
const PENDING_FAVORITES_KEY = 'pending_favorites';
const MAX_HISTORY = 20;
type FavoriteTargetType = 'bean' | 'roaster';

export interface BeanSnapshot {
  id: string;
  name: string;
  roasterName: string;
  imageUrl: string | null;
  originCountry: string;
  process: string;
  price: number;
}

export interface RoasterSnapshot {
  id: string;
  name: string;
  city: string;
  description?: string | null;
  logoUrl?: string | null;
  beanCount?: number;
}

// Token
export function getToken(): string | null {
  return Taro.getStorageSync(TOKEN_KEY) || null;
}

export function setToken(token: string): void {
  Taro.setStorageSync(TOKEN_KEY, token);
}

export function clearToken(): void {
  Taro.removeStorageSync(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  return Taro.getStorageSync(USER_KEY) || null;
}

export function setStoredUser(user: AuthUser): void {
  Taro.setStorageSync(USER_KEY, user);
}

export function clearStoredUser(): void {
  Taro.removeStorageSync(USER_KEY);
}

function getStoredList<T>(key: string): T[] {
  return Taro.getStorageSync(key) || [];
}

function setStoredList<T>(key: string, value: T[]): void {
  Taro.setStorageSync(key, value);
}

function addPendingFavorite(targetType: FavoriteTargetType, targetId: string): void {
  const pending = getPendingFavorites();
  if (!pending.some((item) => item.targetType === targetType && item.targetId === targetId)) {
    pending.push({ targetType, targetId });
    Taro.setStorageSync(PENDING_FAVORITES_KEY, pending);
  }
}

function removePendingFavorite(targetType: FavoriteTargetType, targetId: string): void {
  const pending = getPendingFavorites().filter(
    (item) => !(item.targetType === targetType && item.targetId === targetId)
  );
  Taro.setStorageSync(PENDING_FAVORITES_KEY, pending);
}

// 本地豆款收藏（未登录时使用）
export function getBeanFavorites(): BeanSnapshot[] {
  return Taro.getStorageSync(FAVORITES_KEY) || [];
}

export function isBeanFavorite(id: string): boolean {
  return getBeanFavorites().some((favorite) => favorite.id === id);
}

export function toggleBeanFavorite(bean: BeanSnapshot): boolean {
  const favorites = getBeanFavorites();
  const index = favorites.findIndex((favorite) => favorite.id === bean.id);

  if (index >= 0) {
    favorites.splice(index, 1);
    setStoredList(FAVORITES_KEY, favorites);
    removePendingFavorite('bean', bean.id);
    return false;
  }

  favorites.unshift(bean);
  setStoredList(FAVORITES_KEY, favorites);
  addPendingFavorite('bean', bean.id);
  return true;
}

export function getRoasterFavorites(): RoasterSnapshot[] {
  return getStoredList<RoasterSnapshot>(ROASTER_FAVORITES_KEY);
}

export function isRoasterFavorite(id: string): boolean {
  return getRoasterFavorites().some((favorite) => favorite.id === id);
}

export function toggleRoasterFavorite(roaster: RoasterSnapshot): boolean {
  const favorites = getRoasterFavorites();
  const index = favorites.findIndex((favorite) => favorite.id === roaster.id);

  if (index >= 0) {
    favorites.splice(index, 1);
    setStoredList(ROASTER_FAVORITES_KEY, favorites);
    removePendingFavorite('roaster', roaster.id);
    return false;
  }

  favorites.unshift(roaster);
  setStoredList(ROASTER_FAVORITES_KEY, favorites);
  addPendingFavorite('roaster', roaster.id);
  return true;
}

export function getFavorites(): BeanSnapshot[] {
  return getBeanFavorites();
}

export function isFavorite(id: string): boolean {
  return isBeanFavorite(id);
}

export function toggleFavorite(bean: BeanSnapshot): boolean {
  return toggleBeanFavorite(bean);
}

// 待同步收藏队列（登录后合并到云端）
export interface PendingFavorite {
  targetType: FavoriteTargetType;
  targetId: string;
}

export function getPendingFavorites(): PendingFavorite[] {
  return Taro.getStorageSync(PENDING_FAVORITES_KEY) || [];
}

export function clearPendingFavorites(): void {
  Taro.removeStorageSync(PENDING_FAVORITES_KEY);
}

// 浏览历史
export interface HistoryItem extends BeanSnapshot {
  viewedAt: number;
}

export function getHistory(): HistoryItem[] {
  return Taro.getStorageSync(HISTORY_KEY) || [];
}

export function addToHistory(bean: BeanSnapshot): void {
  const history = getHistory().filter((h) => h.id !== bean.id);
  history.unshift({ ...bean, viewedAt: Date.now() });
  Taro.setStorageSync(HISTORY_KEY, history.slice(0, MAX_HISTORY));
}
