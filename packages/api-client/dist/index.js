export class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async request(path, options) {
        const url = `${this.baseUrl}${path}`;
        const response = await fetch(url, options);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error.message);
        }
        const result = await response.json();
        return result.data;
    }
    async getBeans(params) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/v1/beans?${query}`);
    }
    async getBeanDetail(id) {
        return this.request(`/api/v1/beans/${id}`);
    }
    async getBeanDiscover(params) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/v1/beans/discover${query ? `?${query}` : ''}`);
    }
    async getRoasters(params) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/v1/roasters?${query}`);
    }
    async getRoasterDetail(id) {
        return this.request(`/api/v1/roasters/${id}`);
    }
}
export * from './beans';
export * from './roasters';
export * from './errors';
//# sourceMappingURL=index.js.map