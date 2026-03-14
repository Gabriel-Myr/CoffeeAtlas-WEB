import type { CatalogBeanCard } from '../catalog';

// Roaster Summary (for list views)
export interface RoasterSummary {
  id: string;
  name: string;
  city: string;
  beanCount?: number;
  description?: string | null;
  logoUrl?: string | null;
}

// Roaster Detail (for detail view)
export interface RoasterDetail extends RoasterSummary {
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  instagramHandle?: string | null;
  beans?: CatalogBeanCard[];
}

// Query params for /api/v1/roasters
export interface RoastersQueryParams {
  page?: number;
  pageSize?: number;
  q?: string;
  city?: string;
  sort?: 'name_asc' | 'updated_desc';
}
