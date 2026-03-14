export interface ApiResponse<T> {
    ok: true;
    data: T;
    meta: {
        requestId: string;
        cached?: boolean;
    };
}
export interface ApiError {
    ok: false;
    error: {
        code: string;
        message: string;
    };
    meta: {
        requestId: string;
    };
}
export interface PageInfo {
    page: number;
    pageSize: number;
    total: number;
    hasNextPage: boolean;
}
export interface PaginatedResult<T> {
    items: T[];
    pageInfo: PageInfo;
}
export * from './catalog';
export * from './roasters';
export * from './common';
//# sourceMappingURL=index.d.ts.map