"use strict";
// axios-fetch-wrapper.js
Object.defineProperty(exports, "__esModule", { value: true });
class FetchWrapper {
    defaultConfig;
    constructor(config = {}) {
        this.defaultConfig = {
            baseURL: config.baseURL || '',
            headers: config.headers || {},
            // 其他默认配置
        };
    }
    // 创建实例方法
    create(config) {
        return new FetchWrapper({ ...this.defaultConfig, ...config });
    }
    // 通用请求方法
    async request(config) {
        const { url, method = 'GET', data, params, headers = {}, ...otherConfig } = config;
        // 处理查询参数
        let queryString = '';
        if (params) {
            queryString = new URLSearchParams(params).toString();
        }
        const fullUrl = `${this.defaultConfig.baseURL}${url}${queryString ? `?${queryString}` : ''}`;
        // 合并 headers
        const mergedHeaders = {
            ...this.defaultConfig.headers,
            ...headers,
        };
        // Fetch 请求
        const response = await fetch(fullUrl, {
            method,
            headers: mergedHeaders,
            body: data ? JSON.stringify(data) : undefined,
            ...otherConfig,
        });
        // 处理响应
        if (!response.ok) {
            const error = new Error(`Request failed with status ${response.status}`);
            error.response = {
                status: response.status,
                statusText: response.statusText,
                data: await response.json().catch(() => null),
            };
            throw error;
        }
        const responseData = await response.json();
        return {
            data: responseData,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            config,
        };
    }
    // 快捷方法
    get(url, config = {}) {
        return this.request({ url, method: 'GET', ...config });
    }
    post(url, data, config) {
        return this.request({ url, method: 'POST', data, ...(config || {}) });
    }
    put(url, data, config) {
        return this.request({ url, method: 'PUT', data, ...(config || {}) });
    }
    delete(url, config = {}) {
        return this.request({ url, method: 'DELETE', ...config });
    }
    patch(url, data, config = {}) {
        return this.request({ url, method: 'PATCH', data, ...config });
    }
}
// 创建默认实例
const axiosFetch = new FetchWrapper();
// 添加默认的 create 方法
axiosFetch.create = (config) => new FetchWrapper(config);
exports.default = axiosFetch;
//# sourceMappingURL=fetch-axios.js.map