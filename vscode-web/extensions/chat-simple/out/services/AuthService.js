"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = exports.AuthService = void 0;
const fetch_axios_1 = __importDefault(require("./fetch-axios"));
const CommonService_1 = require("./CommonService");
const EventService_1 = require("./EventService");
async function postWithExtr(axios, url, data) {
    if (data) {
        data.from = EventService_1.sc.SITE_OWNER_SERVICE;
        data.emailName = EventService_1.sc.SITE_EMAIL_NAME;
    }
    return axios.post(url, data, {
        headers: {
            emailinfo: (0, CommonService_1.siteInfoHeader)(),
        },
    });
}
class AuthService {
    static async register(form) {
        return (await postWithExtr(fetch_axios_1.default, `${EventService_1.sc.BASE_API}/auth/register`, form)).data;
    }
    static async login(form) {
        return (await postWithExtr(fetch_axios_1.default, `${EventService_1.sc.BASE_API}/auth/login`, form)).data;
    }
    static async logout() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return postWithExtr(axios, `${EventService_1.sc.BASE_API}/auth/logout`).then((res) => {
            return res.data;
        });
    }
    static async sendLoginEmail(email, template) {
        return (await postWithExtr(fetch_axios_1.default, `${EventService_1.sc.BASE_API}/auth/sendLoginCode`, { email, template })).data;
    }
    static async sendVerifyEmail(email) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return (await postWithExtr(axios, `${EventService_1.sc.BASE_API}/mail/sendVerification`, { email })).data;
    }
    static async verify(email, code) {
        return (await postWithExtr(fetch_axios_1.default, `${EventService_1.sc.BASE_API}/mail/verify`, { email, code })).data;
    }
    static async forgotPassword(form) {
        return (await postWithExtr(fetch_axios_1.default, `${EventService_1.sc.BASE_API}/auth/forgotPassword`, form)).data;
    }
    static async resetPassword(form) {
        return (await postWithExtr(fetch_axios_1.default, `${EventService_1.sc.BASE_API}/auth/resetPassword`, form)).data;
    }
    static async createSession() {
        return (await postWithExtr(fetch_axios_1.default, `${EventService_1.sc.BASE_API}/auth/session`)).data;
    }
    static async loginEvernote() {
        return (await postWithExtr(fetch_axios_1.default, `${EventService_1.sc.BASE_API}/evernote/auth`)).data;
    }
    static async loginGoogle() {
        return (await postWithExtr(fetch_axios_1.default, `${EventService_1.sc.BASE_API}/google/auth`)).data;
    }
    static async generateToken() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return (await postWithExtr(axios, `${EventService_1.sc.BASE_API}/auth/generate-token`)).data;
    }
    static async getTokens() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return (await postWithExtr(axios, `${EventService_1.sc.BASE_API}/auth/get-tokens`)).data;
    }
    static async authGoogle() {
        const search = new URL(window.location.href).search;
        return (await postWithExtr(fetch_axios_1.default, `${EventService_1.sc.BASE_API}/google/authcallback${search}`)).data;
    }
    static async getDiscordUrl() {
        return 'https://discord.com/api/oauth2/authorize?client_id=1047582752628822087&redirect_uri=https%3A%2F%2Fbannereasy.art%2Fdiscord%2FauthCallback&response_type=code&scope=identify%20email';
    }
    static async authDiscord(params) {
        return (await postWithExtr(fetch_axios_1.default, `${EventService_1.sc.BASE_API}/auth/discord/auth/${params}`)).data;
    }
    static async activateSubscription(subscriptionId) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return (await postWithExtr(axios, `${EventService_1.sc.BASE_API}/orders/subscription/activate`, { subscriptionId })).data;
    }
    static async cancelSubscription(subscriptionId) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return (await postWithExtr(axios, `${EventService_1.sc.BASE_API}/orders/subscription/cancel`, { subscriptionId }))
            .data;
    }
    static async deactivateSubscription(subscriptionId) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return (await postWithExtr(axios, `${EventService_1.sc.BASE_API}/orders/subscription/deactivate`, { subscriptionId })).data;
    }
}
exports.AuthService = AuthService;
exports.Api = AuthService;
//# sourceMappingURL=AuthService.js.map