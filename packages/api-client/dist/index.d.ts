import type { PaginatedResult, CatalogBeanCard, CatalogBeanDetail, BeanDiscoverPayload, BeanDiscoverQueryParams, BeansQueryParams, RoasterDetail, RoasterSummary, RoastersQueryParams } from '@coffee-atlas/shared-types';
export declare class ApiClient {
    private baseUrl;
    constructor(baseUrl: string);
    private request;
    getBeans(params?: BeansQueryParams): Promise<PaginatedResult<CatalogBeanCard>>;
    getBeanDetail(id: string): Promise<CatalogBeanDetail>;
    getBeanDiscover(params?: BeanDiscoverQueryParams): Promise<BeanDiscoverPayload>;
    getRoasters(params?: RoastersQueryParams): Promise<PaginatedResult<RoasterSummary>>;
    getRoasterDetail(id: string): Promise<RoasterDetail>;
}
export * from './beans';
export * from './roasters';
export * from './errors';
//# sourceMappingURL=index.d.ts.map