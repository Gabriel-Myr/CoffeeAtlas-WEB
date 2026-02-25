export type PublishStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type CatalogStatusFilter = PublishStatus | 'ALL';

export interface Roaster {
  id: string;
  name: string;
  countryCode: string | null;
  city: string | null;
  websiteUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bean {
  id: string;
  canonicalName: string;
  originCountry: string | null;
  originRegion: string | null;
  processMethod: string | null;
  variety: string | null;
  altitudeMinM: number | null;
  altitudeMaxM: number | null;
  flavorTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoasterBean {
  id: string;
  roasterId: string;
  beanId: string;
  displayName: string;
  roastLevel: string | null;
  priceAmount: number | null;
  priceCurrency: string;
  salesCount: number | null;
  productUrl: string | null;
  isInStock: boolean;
  status: PublishStatus;
  releaseAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogRow {
  roasterBeanId: string;
  roasterName: string;
  city: string | null;
  beanName: string;
  displayName: string;
  processMethod: string | null;
  roastLevel: string | null;
  priceAmount: number | null;
  priceCurrency: string;
  salesCount: number | null;
  isInStock: boolean;
  status: PublishStatus;
}

export interface CatalogListResponse {
  ok: boolean;
  data: CatalogRow[];
  total: number;
  limit: number;
  offset: number;
  q: string;
  status: CatalogStatusFilter;
  error?: string;
}

export interface ImportInputRow {
  roasterName: string;
  city?: string | null;
  countryCode?: string | null;
  beanName: string;
  originCountry?: string | null;
  originRegion?: string | null;
  processMethod?: string | null;
  variety?: string | null;
  displayName: string;
  roastLevel?: string | null;
  priceAmount?: number | null;
  priceCurrency?: string | null;
  isInStock?: boolean;
  status?: PublishStatus;
  productUrl?: string | null;
  flavorTags?: string[] | null;
  sourceUrl?: string | null;
}

export interface ImportApiResponse {
  ok: boolean;
  jobId?: string;
  summary?: {
    insertedRoasters: number;
    insertedBeans: number;
    insertedRoasterBeans: number;
    updatedRoasterBeans: number;
    processedRows: number;
    errorRows: number;
  };
  error?: string;
}
