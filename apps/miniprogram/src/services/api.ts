import Taro from '@tarojs/taro';
import type {
  ApiHealthStatus,
  BeanDiscoverPayload,
  BeanSort,
  CoffeeBean,
  CurrentUserProfile,
  DiscoverContinentId,
  LoginResponse,
  PaginatedResult,
  RoasterFeature,
  RoasterDetail,
  RoasterSummary,
  UserFavorite,
  V1Response,
} from '../types';
import { getToken } from '../utils/storage';
import { getApiBaseUrlState } from '../utils/api-config';

const PLACEHOLDER_PATTERN = /YOUR_LAN_IP|your-domain\.com/i;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return '请求失败，请稍后重试';
}

export { getApiBaseUrlState } from '../utils/api-config';

async function request<T>(
  endpoint: string,
  options?: Partial<Taro.request.Option>
): Promise<T> {
  const apiState = getApiBaseUrlState();
  const baseUrl = apiState.baseUrl;

  if (!baseUrl) {
    throw new Error('未配置 API 地址。可在“我的 > API 联调”里填写云端 HTTPS 域名。');
  }

  if (PLACEHOLDER_PATTERN.test(baseUrl)) {
    throw new Error('当前 TARO_APP_API_URL 还是占位值，请改成真实地址。');
  }


  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await Taro.request<V1Response<T> | { error?: string }>({
      url: `${baseUrl}${endpoint}`,
      header: headers,
      ...options,
    });

    if (res.statusCode >= 200 && res.statusCode < 300) {
      const body = res.data as V1Response<T>;
      if (body.ok) return body.data;
      throw new Error((body as unknown as { error?: { message?: string } }).error?.message || '请求失败');
    }

    const data = res.data as { error?: string } | undefined;
    throw new Error(data?.error || `请求失败: ${res.statusCode}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// 咖啡豆
export async function getBeans(params?: {
  pageSize?: number;
  page?: number;
  q?: string;
  originCountry?: string;
  process?: string;
  roastLevel?: string;
  sort?: BeanSort;
  isNewArrival?: boolean;
  continent?: DiscoverContinentId;
  country?: string;
}): Promise<PaginatedResult<CoffeeBean>> {
  const query = new URLSearchParams();
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));
  if (params?.page) query.set('page', String(params.page));
  if (params?.q) query.set('q', params.q);
  if (params?.originCountry) query.set('originCountry', params.originCountry);
  if (params?.process) query.set('process', params.process);
  if (params?.roastLevel) query.set('roastLevel', params.roastLevel);
  if (params?.sort) query.set('sort', params.sort);
  if (typeof params?.isNewArrival === 'boolean') query.set('isNewArrival', String(params.isNewArrival));
  if (params?.continent) query.set('continent', params.continent);
  if (params?.country) query.set('country', params.country);
  const qs = query.toString();
  return request<PaginatedResult<CoffeeBean>>(`/api/v1/beans${qs ? `?${qs}` : ''}`);
}

export async function getBeanDiscover(params?: {
  q?: string;
  process?: string;
  continent?: DiscoverContinentId;
  country?: string;
}): Promise<BeanDiscoverPayload> {
  const query = new URLSearchParams();
  if (params?.q) query.set('q', params.q);
  if (params?.process) query.set('process', params.process);
  if (params?.continent) query.set('continent', params.continent);
  if (params?.country) query.set('country', params.country);
  const qs = query.toString();
  return request<BeanDiscoverPayload>(`/api/v1/beans/discover${qs ? `?${qs}` : ''}`);
}

export async function getBeanById(id: string): Promise<CoffeeBean> {
  return request<CoffeeBean>(`/api/v1/beans/${id}`);
}

// 烘焙商
export async function getRoasters(params?: {
  pageSize?: number;
  page?: number;
  q?: string;
  city?: string;
  feature?: RoasterFeature;
}): Promise<PaginatedResult<RoasterSummary>> {
  const query = new URLSearchParams();
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));
  if (params?.page) query.set('page', String(params.page));
  if (params?.q) query.set('q', params.q);
  if (params?.city) query.set('city', params.city);
  if (params?.feature) query.set('feature', params.feature);
  const qs = query.toString();
  return request<PaginatedResult<RoasterSummary>>(`/api/v1/roasters${qs ? `?${qs}` : ''}`);
}

export async function getRoasterById(id: string): Promise<RoasterDetail> {
  return request<RoasterDetail>(`/api/v1/roasters/${id}`);
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
