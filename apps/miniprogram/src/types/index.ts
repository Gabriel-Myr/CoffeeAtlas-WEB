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

export type BeanSort = 'updated_desc' | 'sales_desc' | 'price_asc' | 'price_desc';
export type DiscoverContinentId = 'asia' | 'africa' | 'americas';

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

export interface BeanDiscoverOption {
  id: string;
  label: string;
  count: number;
  description?: string;
}

export interface BeanDiscoverEditorial {
  title: string;
  subtitle: string;
  mode: 'manual' | 'fallback';
}

export interface BeanDiscoverEditorialPick {
  bean: CoffeeBean;
  reason: string;
}

export interface BeanDiscoverSummary {
  total: number;
  process?: string;
  continent?: DiscoverContinentId;
  country?: string;
}

export interface BeanDiscoverPayload {
  processOptions: BeanDiscoverOption[];
  continentOptions: BeanDiscoverOption[];
  countryOptions: BeanDiscoverOption[];
  editorial: BeanDiscoverEditorial;
  editorPicks: BeanDiscoverEditorialPick[];
  resultSummary: BeanDiscoverSummary;
}

export type NewArrivalFiltersMode = 'personalized' | 'mixed' | 'fallback';

export interface NewArrivalFilterOption {
  id: string;
  label: string;
  count: number;
}

export interface LocalFavoriteBeanPreference {
  process?: string;
  originCountry?: string;
}

export interface LocalFavoriteRoasterPreference {
  id: string;
  name: string;
}

export interface NewArrivalFiltersRequest {
  beanFavorites?: LocalFavoriteBeanPreference[];
  roasterFavorites?: LocalFavoriteRoasterPreference[];
}

export interface NewArrivalFiltersPayload {
  mode: NewArrivalFiltersMode;
  roasterOptions: NewArrivalFilterOption[];
  processOptions: NewArrivalFilterOption[];
  originOptions: NewArrivalFilterOption[];
}

// 烘焙商
export type RoasterFeature = 'has_image' | 'has_beans' | 'taobao' | 'xiaohongshu';

export interface RoasterSummary {
  id: string;
  name: string;
  city: string;
  beanCount?: number;
  description?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  taobaoUrl?: string | null;
  xiaohongshuUrl?: string | null;
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

export interface CurrentUserProfile extends AuthUser {
  createdAt: string;
}

export interface ApiHealthStatus {
  service: string;
  ts: string;
  supabaseConfigured: boolean;
  wechatConfigured: boolean;
  jwtConfigured: boolean;
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
