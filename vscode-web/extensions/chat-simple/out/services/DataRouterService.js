"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRouterService = exports.getGsnServiceRoutePrefix = exports.getCurrentServiceRouteName = void 0;
const CommonService_1 = require("./CommonService");
const EventService_1 = require("./EventService");
const getCurrentServiceRouteName = () => {
    const sm = (0, EventService_1.getSiteMessage)();
    // const currentPathSuffix = window.location.pathname.split('/').slice(-1)[0];
    const currentPathFirst = sm.window.location.pathname.split('/').filter((v) => v)[0];
    const domainPrefix = sm.window.location.hostname.split('.')[0];
    // return currentPathSuffix || domainPrefix;
    return currentPathFirst || domainPrefix;
};
exports.getCurrentServiceRouteName = getCurrentServiceRouteName;
const getGsnServiceRoutePrefix = (params) => {
    const name = (0, exports.getCurrentServiceRouteName)();
    let prefix = `${EventService_1.sc.BASE_GSN_API}`;
    if (params?.IsRouterService) {
        prefix = `${EventService_1.sc.BASE_API}/gsn-${name}`;
    }
    return prefix;
};
exports.getGsnServiceRoutePrefix = getGsnServiceRoutePrefix;
class DataRouterService {
    static async chat(params) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const name = (0, exports.getCurrentServiceRouteName)();
        console.log("fetch remote", `${EventService_1.sc.BASE_API}/gsn-${name}/chat`);
        const response = await fetch(`${EventService_1.sc.BASE_API}/gsn-${name}/chat`, {
            method: 'post',
            // responseType: 'stream',
            headers: {
                // 'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                ...(await (0, CommonService_1.getEssentialHeaders)({})),
            },
            body: JSON.stringify(params),
        });
        if (response.status !== 200) {
            throw new Error(await response.text());
        }
        if (!params.stream) {
            return response.json();
        }
        const reader = response.body?.getReader();
        let callbacks = {};
        const toReturn = {
            on: (event, cb) => {
                callbacks[event] = cb;
            },
        };
        (async () => {
            let result = true;
            while (result) {
                const { done, value } = await reader.read();
                if (done) {
                    await callbacks['end']();
                    result = false;
                    break;
                }
                await callbacks['data'](value);
            }
        })();
        return toReturn;
        // const result = await axios.post(`${BASE_API}/gsn-${name}/chat`, params, { responseType: 'stream' });
        // return result.data
    }
    static async deleteChat(id) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const name = (0, exports.getCurrentServiceRouteName)();
        return axios.delete(`${EventService_1.sc.BASE_API}/gsn-${name}/chat/${id}`).then((res) => {
            return res.data;
        });
    }
    static async getChats(query) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const name = (0, exports.getCurrentServiceRouteName)();
        let queryString = new URLSearchParams(query).toString();
        if (queryString) {
            queryString = '&' + queryString;
        }
        return axios
            .get(`${EventService_1.sc.BASE_API}/gsn-${name}/chats?from=ui${queryString}`)
            .then((res) => {
            return res.data;
        });
    }
    static async getChat(id) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const name = (0, exports.getCurrentServiceRouteName)();
        return axios.get(`${EventService_1.sc.BASE_API}/gsn-${name}/chat/${id}`).then((res) => {
            return res.data;
        });
    }
    static async chatSearch(content, page, limit) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const name = (0, exports.getCurrentServiceRouteName)();
        return axios.get(`${EventService_1.sc.BASE_API}/gsn-${name}/search/${content}?page=${page}&limit=${limit}`).then((res) => {
            return res.data;
        });
    }
    static async chatLove(id, messageId, love) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const name = (0, exports.getCurrentServiceRouteName)();
        return axios.post(`${EventService_1.sc.BASE_API}/gsn-${name}/love/${id}`, { messageId, love }).then((res) => {
            return res.data;
        });
    }
    static async addMock(params) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const name = (0, exports.getCurrentServiceRouteName)();
        return axios.post(`${EventService_1.sc.BASE_API}/gsn-${name}/llm/mock`, params).then((res) => {
            return res.data;
        });
    }
    static async delMock(index) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const name = (0, exports.getCurrentServiceRouteName)();
        return axios.delete(`${EventService_1.sc.BASE_API}/gsn-${name}/llm/mock/${index}`).then((res) => {
            return res.data;
        });
    }
    static async getMock() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const name = (0, exports.getCurrentServiceRouteName)();
        return axios.get(`${EventService_1.sc.BASE_API}/gsn-${name}/llm/mock`).then((res) => {
            return res.data;
        });
    }
}
exports.DataRouterService = DataRouterService;
//# sourceMappingURL=DataRouterService.js.map