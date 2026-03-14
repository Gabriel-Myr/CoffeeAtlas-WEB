// API Response Envelope
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

// Pagination
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

// Re-export all types
export * from './catalog';
export * from './roasters';
export * from './favorites';
export * from './common';
