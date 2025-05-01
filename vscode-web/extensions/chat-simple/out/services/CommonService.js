"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalcVariable = exports.getEssentialHeaders = exports.getAuthHeaders = exports.CommonService = void 0;
exports.siteInfoHeader = siteInfoHeader;
const StorageService_1 = require("./StorageService");
const EventService_1 = require("./EventService");
const SimpleEventEmitter_1 = require("./SimpleEventEmitter");
const EventService_2 = require("./EventService");
const axioss = __importStar(require("./fetch-axios"));
class CommonService {
    static async uploadFiles(axios, url, files, p, options) {
        const formData = new FormData();
        if (files) {
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
        }
        if (p) {
            formData.append('body', JSON.stringify(p));
        }
        return (await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (files) {
                    const percentage = Math.round((100 * progressEvent.loaded) / progressEvent.total);
                    console.log('upload percentage', percentage);
                    // WindowEventService.pushEvent(WindowEventService.uploadFileProgress, percentage);
                    SimpleEventEmitter_1.EventEmitter.dispatch('uploadFileProgress', percentage);
                }
            },
            ...options,
        })).data;
    }
    static async uploadFile(axios, url, file, p) {
        const formData = new FormData();
        if (file)
            formData.append('file', file);
        if (p) {
            formData.append('body', JSON.stringify(p));
        }
        return (await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (file) {
                    const percentage = Math.round((100 * progressEvent.loaded) / progressEvent.total);
                    console.log('upload percentage', percentage);
                    // WindowEventService.pushEvent(WindowEventService.uploadFileProgress, percentage);
                    SimpleEventEmitter_1.EventEmitter.dispatch('uploadFileProgress', percentage);
                }
            },
        })).data;
    }
}
exports.CommonService = CommonService;
const getAuthHeaders = async (tryGet) => {
    let auth = {};
    if (typeof localStorage !== 'undefined') {
        auth = await StorageService_1.LocalCacheService.get(StorageService_1.LocalCacheService.NAME_AUTH);
    }
    else {
        auth = {
            token: EventService_1.sc.profile?.token
        };
    }
    if (!auth) {
        if (tryGet)
            return {};
        throw new Error('Not logged in');
    }
    return {
        Authorization: `Bearer ${auth.token}`,
    };
};
exports.getAuthHeaders = getAuthHeaders;
function siteInfoHeader() {
    const { SERVICE_NAME, SITE_DOMAIN, SITE_EMAIL_LOGO, SITE_EMAIL_NAME, SITE_OWNER, SITE_URL, profile } = (0, EventService_2.getSiteMessage)().config || {};
    const emailInfo = {
        from: SITE_OWNER,
        emailName: SITE_EMAIL_NAME,
        email: profile?.email,
        logo: SITE_EMAIL_LOGO,
        domain: SITE_DOMAIN,
        site: SITE_URL,
        service_name: SERVICE_NAME,
    };
    return JSON.stringify(emailInfo);
}
const getEssentialHeaders = async (params) => {
    const { withAuth = true, tryAuth = false } = params || {};
    let authHeaders = {};
    if (withAuth)
        authHeaders = await (0, exports.getAuthHeaders)(tryAuth);
    return {
        ...authHeaders,
        emailinfo: siteInfoHeader(),
    };
};
exports.getEssentialHeaders = getEssentialHeaders;
class CalcVariable {
    static getAxios = async (params) => {
        const h = await (0, exports.getEssentialHeaders)(params);
        // fetch('https://jellyvai.com/api/test/echo/1')
        return axioss.default.create({
            headers: h,
        });
    };
}
exports.CalcVariable = CalcVariable;
//# sourceMappingURL=CommonService.js.map