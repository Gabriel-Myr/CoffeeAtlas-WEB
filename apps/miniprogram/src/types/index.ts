// v1 API 响应信封
export interface V1Response<T> {
  ok: true;
  data: T;
  meta: { requestId: string };
}

export interface V1Error {
  ok: false;
  error: { code: string; message: string };
  meta: { requestId: string };
}

export interface PageInfo {
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pageInfo: PageInfo;
}

// 咖啡豆
export interface CoffeeBean {
  id: string;
  name: string;
  roasterId: string;
  roasterName: string;
  city: string;
  originCountry: string;
  originRegion?: string;
  farm?: string;
  variety?: string;
  process: string;
  roastLevel: string;
  price: number;
  discountedPrice?: number;
  currency: string;
  salesCount: number;
  tastingNotes?: string[];
  imageUrl: string | null;
  isNewArrival?: boolean;
  isInStock: boolean;
}

// 烘焙商
export interface RoasterSummary {
  id: string;
  name: string;
  city: string;
  beanCount?: number;
  description?: string | null;
  logoUrl?: string | null;
}

export interface RoasterDetail extends RoasterSummary {
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  instagramHandle?: string | null;
  beans?: CoffeeBean[];
}

// 用户 & 认证
export interface AuthUser {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// 收藏
interface FavoriteRecordBase {
  id: string;
  user_id: string;
  target_id: string;
  created_at: string;
}

export interface BeanFavorite extends FavoriteRecordBase {
  target_type: 'bean';
  bean: CoffeeBean | null;
}

export interface RoasterFavorite extends FavoriteRecordBase {
  target_type: 'roaster';
  roaster: RoasterSummary | null;
}

export type UserFavorite = BeanFavorite | RoasterFavorite;

// 兼容旧代码的 ApiResponse（已废弃，迁移后移除）
export interface ApiResponse<T> {
  data: T;
  total?: number;
}
