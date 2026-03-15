import type { CatalogBeanCard } from '../catalog';
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
    beans?: CatalogBeanCard[];
}
export interface RoastersQueryParams {
    page?: number;
    pageSize?: number;
    q?: string;
    city?: string;
    feature?: RoasterFeature;
    sort?: 'name_asc' | 'updated_desc';
}
//# sourceMappingURL=index.d.ts.map