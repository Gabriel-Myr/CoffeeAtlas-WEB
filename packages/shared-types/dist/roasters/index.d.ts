export interface RoasterSummary {
    id: string;
    name: string;
    city: string;
    beanCount?: number;
}
export interface RoasterDetail extends RoasterSummary {
    description?: string | null;
    logoUrl?: string | null;
    websiteUrl?: string | null;
    instagramHandle?: string | null;
    beans?: CatalogBeanCard[];
}
export interface RoastersQueryParams {
    page?: number;
    pageSize?: number;
    q?: string;
    city?: string;
    sort?: 'name_asc' | 'updated_desc';
}
import type { CatalogBeanCard } from '../catalog';
//# sourceMappingURL=index.d.ts.map