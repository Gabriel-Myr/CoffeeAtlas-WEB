import Taro from '@tarojs/taro';
import type {
  CoffeeBean,
  LoginResponse,
  PaginatedResult,
  RoasterDetail,
  RoasterSummary,
  UserFavorite,
  V1Response,
} from '../types';
import { getToken } from '../utils/storage';

const BASE_URL = process.env.TARO_APP_API_URL || '';
const PLACEHOLDER_PATTERN = /YOUR_LAN_IP|your-domain\.com/i;

function normalizeBaseUrl(url: string): string {
  return url
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api$/, '');
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return '请求失败，请稍后重试';
}

async function request<T>(
  endpoint: string,
  options?: Partial<Taro.request.Option>
): Promise<T> {
  const baseUrl = normalizeBaseUrl(BASE_URL);

  if (!baseUrl) {
    throw new Error('未配置 TARO_APP_API_URL。开发联调请改成 http://你的局域网IP:3000；正式环境请改成 HTTPS 域名。');
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
}): Promise<PaginatedResult<CoffeeBean>> {
  const query = new URLSearchParams();
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));
  if (params?.page) query.set('page', String(params.page));
  if (params?.q) query.set('q', params.q);
  if (params?.originCountry) query.set('originCountry', params.originCountry);
  if (params?.process) query.set('process', params.process);
  if (params?.roastLevel) query.set('roastLevel', params.roastLevel);
  const qs = query.toString();
  return request<PaginatedResult<CoffeeBean>>(`/api/v1/beans${qs ? `?${qs}` : ''}`);
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
}): Promise<PaginatedResult<RoasterSummary>> {
  const query = new URLSearchParams();
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));
  if (params?.page) query.set('page', String(params.page));
  if (params?.q) query.set('q', params.q);
  if (params?.city) query.set('city', params.city);
  const qs = query.toString();
  return request<PaginatedResult<RoasterSummary>>(`/api/v1/roasters${qs ? `?${qs}` : ''}`);
}

export async function getRoasterById(id: string): Promise<RoasterDetail> {
  return request<RoasterDetail>(`/api/v1/roasters/${id}`);
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
