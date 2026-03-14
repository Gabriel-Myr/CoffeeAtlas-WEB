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
  sort?: 'updated_desc' | 'sales_desc' | 'price_asc' | 'price_desc';
}
