"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = exports.LocalCacheService = void 0;
const EventService_1 = require("./EventService");
class LocalCacheService {
    static NAME_AUTH = EventService_1.sc.NAME_AUTH;
    static cachedAuth = null;
    static async init() {
        await LocalCacheService.get(this.NAME_AUTH);
    }
    static async get(key) {
        if (key === LocalCacheService.NAME_AUTH && this.cachedAuth) {
            return LocalCacheService.cachedAuth;
        }
        const value = localStorage.getItem(key);
        if (value) {
            const parsed = JSON.parse(value);
            if (key === this.NAME_AUTH && !this.cachedAuth) {
                this.cachedAuth = parsed;
            }
            return parsed;
        }
        return null;
    }
    static async set(key, value) {
        const jvalue = JSON.stringify(value);
        localStorage.setItem(key, jvalue);
        if (key === LocalCacheService.NAME_AUTH) {
            LocalCacheService.cachedAuth = value;
        }
    }
}
exports.LocalCacheService = LocalCacheService;
class CacheService {
}
exports.CacheService = CacheService;
//# sourceMappingURL=StorageService.js.map