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
}
export interface CatalogBeanDetail extends CatalogBeanCard {
    originRegion: string;
    farm: string;
    variety: string;
    discountedPrice: number;
    tastingNotes: string[];
    isNewArrival: boolean;
}
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
//# sourceMappingURL=index.d.ts.map