export type BeanSort = 'updated_desc' | 'sales_desc' | 'price_asc' | 'price_desc';
export type BeanDiscoverContinent = 'asia' | 'africa' | 'americas';

// Catalog Bean Card (for list views)
export interface CatalogBeanCard {
  id: string;
  name: string;
  roasterId: string;
  roasterName: string;
  city: string;
  originCountry: string;
  process: string;
  roastLevel: string;
  price: number;
  currency: string;
  salesCount: number;
  imageUrl: string | null;
  isInStock: boolean;
  originRegion?: string;
  farm?: string;
  variety?: string;
  discountedPrice?: number;
  tastingNotes?: string[];
  isNewArrival?: boolean;
}

// Catalog Bean Detail (for detail view)
export interface CatalogBeanDetail extends CatalogBeanCard {
  originRegion: string;
  farm: string;
  variety: string;
  discountedPrice: number;
  tastingNotes: string[];
  isNewArrival: boolean;
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
  bean: CatalogBeanCard;
  reason: string;
}

export interface BeanDiscoverSummary {
  total: number;
  process?: string;
  continent?: BeanDiscoverContinent;
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
  originCountry?: string;
  process?: string;
}

export interface LocalFavoriteRoasterPreference {
  id: string;
  name: string;
}

export interface NewArrivalFiltersRequest {
  localBeans?: LocalFavoriteBeanPreference[];
  localRoasters?: LocalFavoriteRoasterPreference[];
}

export interface NewArrivalFiltersPayload {
  mode: NewArrivalFiltersMode;
  roasterOptions: NewArrivalFilterOption[];
  processOptions: NewArrivalFilterOption[];
  originOptions: NewArrivalFilterOption[];
}

export interface BeanDiscoverQueryParams {
  q?: string;
  process?: string;
  continent?: BeanDiscoverContinent;
  country?: string;
}

// Query params for /api/v1/beans
export interface BeansQueryParams {
  page?: number;
  pageSize?: number;
  q?: string;
  roasterId?: string;
  originCountry?: string;
  process?: string;
  roastLevel?: string;
  inStock?: boolean;
  sort?: BeanSort;
  isNewArrival?: boolean;
  continent?: BeanDiscoverContinent;
  country?: string;
}
