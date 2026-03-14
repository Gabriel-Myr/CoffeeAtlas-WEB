import type {
  ApiResponse,
  ApiError,
  PaginatedResult,
  CatalogBeanCard,
  CatalogBeanDetail,
  BeansQueryParams,
  RoasterDetail,
  RoasterSummary,
  RoastersQueryParams,
} from '@coffee-atlas/shared-types';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, options);

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error.message);
    }

    const result: ApiResponse<T> = await response.json();
    return result.data;
  }

  async getBeans(params?: BeansQueryParams): Promise<PaginatedResult<CatalogBeanCard>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/beans?${query}`);
  }

  async getBeanDetail(id: string): Promise<CatalogBeanDetail> {
    return this.request(`/api/v1/beans/${id}`);
  }

  async getRoasters(params?: RoastersQueryParams): Promise<PaginatedResult<RoasterSummary>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/roasters?${query}`);
  }

  async getRoasterDetail(id: string): Promise<RoasterDetail> {
    return this.request(`/api/v1/roasters/${id}`);
  }
}

export * from './beans';
export * from './roasters';
export * from './errors';
