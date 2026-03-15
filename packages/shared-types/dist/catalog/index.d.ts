export type BeanSort = 'updated_desc' | 'sales_desc' | 'price_asc' | 'price_desc';
export type BeanDiscoverContinent = 'asia' | 'africa' | 'americas';
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
export interface BeanDiscoverQueryParams {
    q?: string;
    process?: string;
    continent?: BeanDiscoverContinent;
    country?: string;
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
    sort?: BeanSort;
    isNewArrival?: boolean;
    continent?: BeanDiscoverContinent;
    country?: string;
}
//# sourceMappingURL=index.d.ts.map