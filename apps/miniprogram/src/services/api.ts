import Taro from '@tarojs/taro';
import {
  extractApiErrorMessage,
  unwrapApiResponse,
} from '@coffee-atlas/api-client';
import type {
  ApiHealthStatus,
  BeanDetail,
  BeanDiscoverPayload,
  BeanSort,
  CoffeeBean,
  CurrentUserProfile,
  DiscoverContinentId,
  LoginResponse,
  NewArrivalFiltersPayload,
  NewArrivalFiltersRequest,
  PaginatedResult,
  ProcessBaseId,
  ProcessStyleId,
  RoasterFeature,
  RoasterDetail,
  RoasterSummary,
  UserFavorite,
  V1Response,
} from '../types/index.ts';
import { getToken } from '../utils/storage.ts';
import { getApiBaseUrlState } from '../utils/api-config.ts';
import { getApiBaseUrlValidationError } from '../utils/api-base-url.ts';
import { buildApiRequestOptions } from '../utils/api-request.ts';
import { formatApiRequestErrorMessage } from '../utils/api-error.ts';
import { hasSupabaseEnv, requireSupabaseClient } from '../utils/supabase.ts';
import { requireSupabaseCatalogRead } from './catalog-read-mode.ts';
import {
  getBeanDetailWithSupabase,
  getBeanDiscoverWithSupabase,
  getNewArrivalFiltersWithSupabase,
  getRoasterDetailWithSupabase,
  listBeansWithSupabase,
  listRoastersWithSupabase,
} from './catalog-supabase.ts';

function getErrorMessage(error: unknown): string {
  return formatApiRequestErrorMessage(error, {
    baseUrl: getApiBaseUrlState().baseUrl,
  });
}

export { getApiBaseUrlState } from '../utils/api-config.ts';

async function request<T>(
  endpoint: string,
  options?: Partial<Taro.request.Option>
): Promise<T> {
  const apiState = getApiBaseUrlState();
  const baseUrl = apiState.baseUrl;

  if (!baseUrl) {
    throw new Error('未配置 API 地址。可在“我的 > API 联调”里填写云端 HTTPS 域名。');
  }

  const validationError = getApiBaseUrlValidationError(baseUrl);
  if (validationError) {
    throw new Error(validationError);
  }

  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const requestOptions = buildApiRequestOptions({
      url: `${baseUrl}${endpoint}`,
      header: headers,
      options,
    });

    const res = await Taro.request<V1Response<T> | { error?: string | { message?: string } }>({
      ...requestOptions,
    });

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return unwrapApiResponse<T>(res.data);
    }

    const message = extractApiErrorMessage(res.data);
    throw new Error(message || `请求失败: ${res.statusCode}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// 咖啡豆
export async function getBeans(params?: {
  pageSize?: number;
  page?: number;
  q?: string;
  roasterId?: string;
  originCountry?: string;
  variety?: string;
  process?: string;
  processBase?: ProcessBaseId;
  processStyle?: ProcessStyleId;
  roastLevel?: string;
  sort?: BeanSort;
  isNewArrival?: boolean;
  continent?: DiscoverContinentId;
  country?: string;
}): Promise<PaginatedResult<CoffeeBean>> {
  return listBeansWithSupabase(requireSupabaseCatalogRead(hasSupabaseEnv, requireSupabaseClient), params);
}

export async function getBeanDiscover(params?: {
  q?: string;
  processBase?: ProcessBaseId;
  processStyle?: ProcessStyleId;
  continent?: DiscoverContinentId;
  country?: string;
  variety?: string;
}): Promise<BeanDiscoverPayload> {
  return getBeanDiscoverWithSupabase(requireSupabaseCatalogRead(hasSupabaseEnv, requireSupabaseClient), params);
}

export async function getNewArrivalFilters(payload: NewArrivalFiltersRequest): Promise<NewArrivalFiltersPayload> {
  return getNewArrivalFiltersWithSupabase(requireSupabaseCatalogRead(hasSupabaseEnv, requireSupabaseClient), payload);
}

export async function getBeanById(id: string): Promise<BeanDetail> {
  return getBeanDetailWithSupabase(requireSupabaseCatalogRead(hasSupabaseEnv, requireSupabaseClient), id);
}

// 烘焙商
export async function getRoasters(params?: {
  pageSize?: number;
  page?: number;
  q?: string;
  city?: string;
  feature?: RoasterFeature;
}): Promise<PaginatedResult<RoasterSummary>> {
  return listRoastersWithSupabase(requireSupabaseCatalogRead(hasSupabaseEnv, requireSupabaseClient), params);
}

export async function getRoasterById(id: string): Promise<RoasterDetail> {
  return getRoasterDetailWithSupabase(requireSupabaseCatalogRead(hasSupabaseEnv, requireSupabaseClient), id);
}

export async function getApiHealth(): Promise<ApiHealthStatus> {
  return request<ApiHealthStatus>('/api/v1/health');
}

export async function getMe(): Promise<CurrentUserProfile> {
  return request<CurrentUserProfile>('/api/v1/me');
}

// 认证
export async function wechatLogin(code: string, userInfo?: { nickname?: string; avatarUrl?: string }): Promise<LoginResponse> {
  return request<LoginResponse>('/api/v1/auth/wechat/login', {
    method: 'POST',
    data: { code, ...userInfo },
  });
}

// 收藏
export async function getFavorites(): Promise<UserFavorite[]> {
  return request<UserFavorite[]>('/api/v1/me/favorites');
}

export async function addFavorite(targetType: 'bean' | 'roaster', targetId: string): Promise<UserFavorite> {
  return request<UserFavorite>('/api/v1/me/favorites', {
    method: 'POST',
    data: { targetType, targetId },
  });
}

export async function removeFavorite(targetType: 'bean' | 'roaster', targetId: string): Promise<void> {
  await request<{ deleted: boolean }>(`/api/v1/me/favorites/${targetType}/${targetId}`, {
    method: 'DELETE',
  });
}

export async function syncFavorites(
  items: Array<{ targetType: 'bean' | 'roaster'; targetId: string }>
): Promise<UserFavorite[]> {
  return request<UserFavorite[]>('/api/v1/me/favorites/sync', {
    method: 'POST',
    data: { items },
  });
}
