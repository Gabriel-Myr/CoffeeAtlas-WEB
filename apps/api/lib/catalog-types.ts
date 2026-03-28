import type { CatalogBeanDetail, RoasterFeature } from '@coffee-atlas/shared-types';

export type CoffeeBean = CatalogBeanDetail;

export interface Roaster {
  id: string;
  name: string;
  city: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  websiteUrl: string | null;
  instagramHandle: string | null;
  taobaoUrl: string | null;
  xiaohongshuUrl: string | null;
  beanCount: number;
}

export interface CatalogBeanFilters {
  origin?: string;
  process?: string;
  processBase?: string;
  processStyle?: string;
  roastLevel?: string;
  roasterId?: string;
}

export interface CatalogBeansQuery extends CatalogBeanFilters {
  limit?: number;
  offset?: number;
}

export interface RoastersQuery {
  limit?: number;
  offset?: number;
  q?: string;
  city?: string;
  feature?: RoasterFeature;
}
