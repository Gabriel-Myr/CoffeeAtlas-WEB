import type {
  PaginatedResult,
  CatalogBeanCard,
  CatalogBeanDetail,
  BeanDiscoverPayload,
  BeanDiscoverQueryParams,
  BeansQueryParams,
  RoasterDetail,
  RoasterSummary,
  RoastersQueryParams,
} from '@coffee-atlas/shared-types';
import { buildBeanDetailPath, buildBeanDiscoverPath, buildBeansPath } from './beans';
import { ApiClientError, extractApiErrorMessage, isApiErrorPayload, unwrapApiResponse } from './errors';
import { buildRoasterDetailPath, buildRoastersPath } from './roasters';

async function readJsonPayload(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, options);
    const payload = await readJsonPayload(response);

    if (response.ok) {
      return unwrapApiResponse<T>(payload);
    }

    if (isApiErrorPayload(payload)) {
      throw new ApiClientError(payload.error.message, {
        code: payload.error.code,
        requestId: payload.meta.requestId,
      });
    }

    const errorMessage = extractApiErrorMessage(payload) ?? `请求失败: ${response.status}`;
    throw new ApiClientError(errorMessage, {
      code: String(response.status),
    });
  }

  async getBeans(params?: BeansQueryParams): Promise<PaginatedResult<CatalogBeanCard>> {
    return this.request(buildBeansPath(params));
  }

  async getBeanDetail(id: string): Promise<CatalogBeanDetail> {
    return this.request(buildBeanDetailPath(id));
  }

  async getBeanDiscover(params?: BeanDiscoverQueryParams): Promise<BeanDiscoverPayload> {
    return this.request(buildBeanDiscoverPath(params));
  }

  async getRoasters(params?: RoastersQueryParams): Promise<PaginatedResult<RoasterSummary>> {
    return this.request(buildRoastersPath(params));
  }

  async getRoasterDetail(id: string): Promise<RoasterDetail> {
    return this.request(buildRoasterDetailPath(id));
  }
}

export {
  ApiClientError,
  buildBeanDetailPath,
  buildBeanDiscoverPath,
  buildBeansPath,
  buildRoasterDetailPath,
  buildRoastersPath,
  extractApiErrorMessage,
  isApiErrorPayload,
  unwrapApiResponse,
};
