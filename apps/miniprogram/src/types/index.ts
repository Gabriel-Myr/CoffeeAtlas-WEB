import type {
  ApiError as SharedApiError,
  ApiHealthStatus,
  ApiResponse as SharedApiResponse,
  BeanDiscoverContinent,
  BeanDiscoverEditorial,
  BeanDiscoverEditorialPick,
  BeanDiscoverOption,
  BeanDiscoverPayload,
  BeanDiscoverQueryParams,
  BeanDiscoverSummary,
  BeanFavoriteRecord,
  BeanSort,
  BeansQueryParams,
  CatalogBeanCard,
  CatalogBeanDetail,
  LocalFavoriteBeanPreference,
  LocalFavoriteRoasterPreference,
  NewArrivalFilterOption,
  NewArrivalFiltersMode,
  NewArrivalFiltersPayload,
  NewArrivalFiltersRequest,
  PageInfo,
  PaginatedResult,
  ProcessBaseId,
  ProcessStyleId,
  RoasterDetail,
  RoasterFeature,
  RoasterFavoriteRecord,
  RoasterSummary,
  RoastersQueryParams,
  UserFavorite,
} from '@coffee-atlas/shared-types';

export type V1Response<T> = SharedApiResponse<T>;
export type V1Error = SharedApiError;
export type DiscoverContinentId = BeanDiscoverContinent;
export type BeanFavorite = BeanFavoriteRecord;
export type RoasterFavorite = RoasterFavoriteRecord;
export type CoffeeBean = CatalogBeanCard;
export type BeanDetail = CatalogBeanDetail;

export type {
  ApiHealthStatus,
  BeanDiscoverEditorial,
  BeanDiscoverEditorialPick,
  BeanDiscoverOption,
  BeanDiscoverPayload,
  BeanDiscoverQueryParams,
  BeanDiscoverSummary,
  BeanSort,
  BeansQueryParams,
  LocalFavoriteBeanPreference,
  LocalFavoriteRoasterPreference,
  NewArrivalFilterOption,
  NewArrivalFiltersMode,
  NewArrivalFiltersPayload,
  NewArrivalFiltersRequest,
  PageInfo,
  PaginatedResult,
  ProcessBaseId,
  ProcessStyleId,
  RoasterDetail,
  RoasterFeature,
  RoasterSummary,
  RoastersQueryParams,
  UserFavorite,
};

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
