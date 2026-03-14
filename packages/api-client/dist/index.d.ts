import type { PaginatedResult, CatalogBeanCard, CatalogBeanDetail, BeansQueryParams } from '@coffee-atlas/shared-types';
export declare class ApiClient {
    private baseUrl;
    constructor(baseUrl: string);
    private request;
    getBeans(params?: BeansQueryParams): Promise<PaginatedResult<CatalogBeanCard>>;
    getBeanDetail(id: string): Promise<CatalogBeanDetail>;
}
export * from './beans';
export * from './roasters';
export * from './errors';
//# sourceMappingURL=index.d.ts.map