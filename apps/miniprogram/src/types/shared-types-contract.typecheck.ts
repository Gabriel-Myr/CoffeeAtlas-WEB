import type {
  ApiError,
  ApiHealthStatus,
  ApiResponse,
  BeanDiscoverContinent,
  CatalogBeanCard,
  CatalogBeanDetail,
  PaginatedResult as SharedPaginatedResult,
} from '@coffee-atlas/shared-types';

import type {
  BeanDetail,
  CoffeeBean,
  DiscoverContinentId,
  PaginatedResult,
  V1Error,
  V1Response,
} from './index.ts';

type AssertTrue<T extends true> = T;
type IsMutuallyAssignable<Left, Right> =
  [Left] extends [Right] ? ([Right] extends [Left] ? true : false) : false;
type AsyncReturn<T extends (...args: any[]) => Promise<unknown>> = Awaited<ReturnType<T>>;

export type _V1ResponseUsesSharedEnvelope = AssertTrue<
  IsMutuallyAssignable<V1Response<{ id: string }>, ApiResponse<{ id: string }>>
>;

export type _V1ErrorUsesSharedEnvelope = AssertTrue<IsMutuallyAssignable<V1Error, ApiError>>;

export type _DiscoverContinentIsShared = AssertTrue<
  IsMutuallyAssignable<DiscoverContinentId, BeanDiscoverContinent>
>;

export type _CoffeeBeanMatchesCatalogBeanCard = AssertTrue<
  IsMutuallyAssignable<CoffeeBean, CatalogBeanCard>
>;

export type _BeanDetailMatchesSharedDetail = AssertTrue<
  IsMutuallyAssignable<BeanDetail, CatalogBeanDetail>
>;

export type _PaginatedResultIsSharedCompatible = AssertTrue<
  IsMutuallyAssignable<PaginatedResult<CoffeeBean>, SharedPaginatedResult<CoffeeBean>>
>;

type ApiModule = typeof import('../services/api');

export type _GetApiHealthReturnMatchesShared = AssertTrue<
  IsMutuallyAssignable<AsyncReturn<ApiModule['getApiHealth']>, ApiHealthStatus>
>;

export type _GetBeansReturnMatchesShared = AssertTrue<
  IsMutuallyAssignable<AsyncReturn<ApiModule['getBeans']>, SharedPaginatedResult<CoffeeBean>>
>;

export type _GetBeanByIdReturnMatchesDetail = AssertTrue<
  IsMutuallyAssignable<AsyncReturn<ApiModule['getBeanById']>, CatalogBeanDetail>
>;
