"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataService = void 0;
const CommonService_1 = require("./CommonService");
const DataRouterService_1 = require("./DataRouterService");
const EventService_1 = require("./EventService");
const GenerateSubName = '/generate';
// const GenerateSubName = '${GenerateSubName}';
class DataService {
    static async loadProfile() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.get(`${EventService_1.sc.BASE_API}/profile?service_name=${EventService_1.sc.SERVICE_NAME}`).then((res) => {
            return res.data;
        });
    }
    static async updateProfileSettingsAdmin(attributes) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.post(`${EventService_1.sc.BASE_API}/profile/settings/admin`, attributes).then((res) => {
            return res.data;
        });
    }
    static async getDbData(name, limit, page, sort) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .get(`${EventService_1.sc.BASE_API}/admin/db/${name}?limit=${limit}&page=${page}${sort ? `&sort=${sort}` : ''}`)
            .then((res) => {
            return res.data;
        });
    }
    static async getUndermaintenance() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.get(`${EventService_1.sc.BASE_API}/admin/undermaintenance`).then((res) => {
            return res.data;
        });
    }
    static async recharge(email, num) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.post(`${EventService_1.sc.BASE_API}/admin/recharge`, { email, num }).then((res) => {
            return res.data;
        });
    }
    static async getCollections() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.get(`${EventService_1.sc.BASE_API}/admin/collections`).then((res) => {
            return res.data;
        });
    }
    static async addResourceCalcTotal(resource_name, ak, value) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .post(`${EventService_1.sc.BASE_API}/admin/addResourceCalcTotal/${resource_name}`, { ak, value })
            .then((res) => {
            return res.data;
        });
    }
    static async addResourceTotal(resource_name, ak, value) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .post(`${EventService_1.sc.BASE_API}/admin/addResourceTotal/${resource_name}`, { ak, value })
            .then((res) => {
            return res.data;
        });
    }
    static async addResourceOne(resource_name, ak, value) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.post(`${EventService_1.sc.BASE_API}/admin/addResourceOne/${resource_name}`, { ak }).then((res) => {
            return res.data;
        });
    }
    static async subResourceOne(resource_name, ak, value) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.post(`${EventService_1.sc.BASE_API}/admin/subResourceOne/${resource_name}`, { ak }).then((res) => {
            return res.data;
        });
    }
    static async getMetadata() {
        const axios = await CommonService_1.CalcVariable.getAxios({ withAuth: false });
        return axios.get(`${EventService_1.sc.BASE_API}/metadata`).then((res) => {
            return res.data;
        });
    }
    static async getSessionId() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.post(`${EventService_1.sc.BASE_API}/session`).then((res) => {
            return res.data;
        });
    }
    static async getSessionStatus() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.get(`${EventService_1.sc.BASE_API}/session`).then((res) => {
            return res.data;
        });
    }
    static async uploadAvatar(files) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return await CommonService_1.CommonService.uploadFiles(axios, `${EventService_1.sc.BASE_API}/profile/avatar`, files);
    }
    static async queryImageResult() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.get(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/result`).then((res) => {
            return res.data;
        });
    }
    static async queueImageResult() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.get(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/queue`).then((res) => {
            return res.data;
        });
    }
    static async queueImageAvailable() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.get(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/available`).then((res) => {
            return res.data;
        });
    }
    static async composeImageAck() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.post(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/ack`).then((res) => {
            return res.data;
        });
    }
    static async getShareLink(id, type) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .get(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/sharelink/${id}?type=${type}`)
            .then((res) => {
            return res.data;
        });
    }
    static async getShareLinkPublic(id, type) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .get(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/sharelink-public/${id}?type=${type}`)
            .then((res) => {
            return res.data;
        });
    }
    static async deleteShareLink(id, type) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .delete(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/sharelink/${id}?type=${type}`)
            .then((res) => {
            return res.data;
        });
    }
    static async shareToBearbeeAi(id, type, value) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .post(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/shareself/${id}?type=${type}`, {
            description: value,
        })
            .then((res) => {
            return res.data;
        });
    }
    static async deleteShareToBearbeeAi(id, type) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .delete(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/shareself/${id}?type=${type}`)
            .then((res) => {
            return res.data;
        });
    }
    static async composeChangeAttributes(id, attributes) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .post(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/history/changeAttributes/${id}`, attributes)
            .then((res) => {
            return res.data;
        });
    }
    static async composeImageHistory(page, limit, id, template, params) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const idstring = id ? `&id=${id}` : '';
        const name = (0, DataRouterService_1.getCurrentServiceRouteName)();
        let prefix = `${EventService_1.sc.BASE_GSN_API}`;
        if (params?.IsRouterService) {
            prefix = `${EventService_1.sc.BASE_API}/gsn-${name}`;
        }
        return axios
            .get(`${prefix}${GenerateSubName}/history?page=${page}&limit=${limit}${idstring}&template=${template}`)
            .then((res) => {
            return res.data;
        });
        // const h = await getEssentialHeaders();
        // return fetch(`${sc.BASE_GSN_API}${GenerateSubName}/history?page=${page}&limit=${limit}`, {headers: h}).then((res) => {
        //   return res;
        // });
    }
    static async getMySharedHistory(page, limit, id) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const idstring = id ? `&id=${id}` : '';
        return axios
            .get(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/history?page=${page}&limit=${limit}${idstring}&isShared=true&isShareSelf=true`)
            .then((res) => {
            return res.data;
        });
    }
    static async uploadsImageHistory(page, limit) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .get(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/uploads?page=${page}&limit=${limit}`)
            .then((res) => {
            return res.data;
        });
    }
    static async getPromptHistory(page, limit, id) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const idstring = id ? `&id=${id}` : '';
        return axios
            .get(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/history-prompt?page=${page}&limit=${limit}${idstring}`)
            .then((res) => {
            return res.data;
        });
    }
    static async deletePromptHistory(id) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const idstring = id;
        return axios
            .delete(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/history-prompt/${idstring}`)
            .then((res) => {
            return res.data;
        });
    }
    static async getMyModelHistory(page, limit, id) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const idstring = id ? `&id=${id}` : '';
        return axios
            .get(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/history-mymodels?page=${page}&limit=${limit}${idstring}`)
            .then((res) => {
            return res.data;
        });
    }
    static stylesStore = [];
    static async stylesHistory(page, limit, params) {
        const name = (0, DataRouterService_1.getCurrentServiceRouteName)();
        let prefix = `${EventService_1.sc.BASE_GSN_API}`;
        if (params?.IsRouterService) {
            prefix = `${EventService_1.sc.BASE_API}/gsn-${name}`;
        }
        // const mockData = [
        //   { url: '/assets/styles/style-backlight.jpg', name: 'General', displayName: 'Flux General', isDefault: true },
        //   { url: '/assets/styles/style-backlight.jpg', name: 'Digital_illustration', displayName: 'Digital Illustration' },
        //   { url: '/assets/styles/style-cat.jpg', name: 'vector_illustration', displayName: 'Vector Style' },
        //   { url: '/assets/styles/style-backlight.jpg', name: 'anime', displayName: 'Anime Style' },
        //   { url: '/assets/styles/style-backlight.jpg', name: 'retro anime', displayName: 'Retro Anime' },
        //   { url: '/assets/styles/style-flower.jpg', name: 'icon', displayName: 'Icon Style' },
        // ];
        const axios = await CommonService_1.CalcVariable.getAxios({ withAuth: false });
        let mockData = await axios
            .get(`${prefix}${GenerateSubName}/style-classes`)
            .then((res) => {
            return res.data;
        });
        DataService.stylesStore = mockData;
        mockData = mockData.filter((m) => !m.isHidden);
        const result = { results: mockData, total: mockData.length };
        const start = (page - 1) * limit;
        const end = start + limit;
        result.results = mockData.slice(start, end);
        return result;
    }
    static async getStylesHistoryStored(page, limit) {
        // if (!DataService.stylesStore.length) {
        await DataService.stylesHistory(page, limit);
        // }
        const start = (page - 1) * limit;
        const end = start + limit;
        const result = { results: DataService.stylesStore, total: DataService.stylesStore.length };
        result.results = DataService.stylesStore.slice(start, end);
        return result;
    }
    static async getAssetsMyLikes(page, limit) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .get(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/mylikes?page=${page}&limit=${limit}`)
            .then((res) => {
            return res.data;
        });
    }
    static async getAssetsMyAavatar(page, limit) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .get(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/myavatars?page=${page}&limit=${limit}`)
            .then((res) => {
            return res.data;
        });
    }
    static async addToMylikes(id, like, type, dataType) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .post(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/mylikes`, { id, type, dislike: !like, dataType })
            .then((res) => {
            return res.data;
        });
    }
    static async exploreHistory(page, limit, options) {
        const axios = await CommonService_1.CalcVariable.getAxios({ tryAuth: true });
        if (options.search) {
            return axios
                .get(`${EventService_1.sc.BASE_GSN_API}/explore?page=${page}&limit=${limit}&search=${options.search}`)
                .then((res) => {
                return res.data;
            });
        }
        return axios.get(`${EventService_1.sc.BASE_GSN_API}/explore?page=${page}&limit=${limit}`).then((res) => {
            return res.data;
        });
    }
    // static async exploreHistory(page, limit, options) {
    //   const axios = await CalcVariable.getAxios();
    //   if (options.search) {
    //     return axios
    //       .get(`${sc.BASE_GSN_API}${GenerateSubName}/history?page=${page}&limit=${limit}&search=${options.search}&isShareSelf=true&isShared=true`)
    //       .then((res) => {
    //         return res.data;
    //       });
    //   }
    //   return axios.get(`${sc.BASE_GSN_API}${GenerateSubName}/history?page=${page}&limit=${limit}&isShareSelf=true&isShared=true`).then((res) => {
    //     return res.data;
    //   });
    // }
    static async exploreHistoryId(id) {
        const axios = await CommonService_1.CalcVariable.getAxios({ tryAuth: true });
        return axios.get(`${EventService_1.sc.BASE_GSN_API}/explore/${id}`).then((res) => {
            return res.data;
        });
    }
    static async deleteGenerateHistory(id, type, params) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const name = (0, DataRouterService_1.getCurrentServiceRouteName)();
        let prefix = `${EventService_1.sc.BASE_GSN_API}`;
        if (params?.IsRouterService) {
            prefix = `${EventService_1.sc.BASE_API}/gsn-${name}`;
        }
        return axios
            .delete(`${prefix}${GenerateSubName}/history-trash/${id}/${type}`)
            .then((res) => {
            return res.data;
        });
    }
    static async deleteTrashGenerateAll() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.delete(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/history-trash`).then((res) => {
            return res.data;
        });
    }
    static async trashGenerateHistory(id, type, isTrash = true) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .post(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/history-trash/${id}/${type}`, { isTrash })
            .then((res) => {
            return res.data;
        });
    }
    static async getAssetsTrash(page, limit) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .get(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/history-trash?page=${page}&limit=${limit}`)
            .then((res) => {
            return res.data;
        });
    }
    static async deleteImageAsset(id) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.delete(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/uploads/${id}`).then((res) => {
            return res.data;
        });
    }
    static async composeAvatar(file, params) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const p = params || {};
        const body = { ...p };
        if (!params.background) {
            return CommonService_1.CommonService.uploadFile(axios, `${(0, DataRouterService_1.getGsnServiceRoutePrefix)(params)}${GenerateSubName}/composeavatar`, file, body);
        }
    }
    static async deleteAvatar(id) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.delete(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/myavatars/${id}`).then((res) => {
            return res.data;
        });
    }
    static async redoTransparent(id) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios
            .post(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/transparent/${id}`, { prompt })
            .then((res) => {
            return res.data;
        });
    }
    static async composeImage(file, prompt, params) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const p = params || {};
        const body = { ...p, prompt };
        if (!params.background) {
            return CommonService_1.CommonService.uploadFile(axios, `${(0, DataRouterService_1.getGsnServiceRoutePrefix)(params)}${GenerateSubName}`, file, body);
        }
        const dt = new DataTransfer();
        if (file) {
            dt.items.add(file);
            // dt.items.add(new File([prompt], 'prompt.txt');
            dt.items.add(params.background);
        }
        const fileList = dt.files;
        return CommonService_1.CommonService.uploadFiles(axios, `${(0, DataRouterService_1.getGsnServiceRoutePrefix)(params)}${GenerateSubName}`, !!params.batch && fileList, body);
        // return axios.post(`${sc.BASE_API}/gsn${GenerateSubName}`).then((res) => {
        //   return res.data;
        // });
        // return await CommonService.uploadFile(axios, `${sc.BASE_API}/gsn${GenerateSubName}`, file);
    }
    static async composeImagePrepareCheck(logoName) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const body = { logoName };
        return axios.post(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/check`, body).then((res) => {
            return res.data;
        });
    }
    static async checkCivitaiLora(loras) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const body = { loras };
        return axios
            .post(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/check-lora-available`, body)
            .then((res) => {
            return res.data;
        });
    }
    static async getTextPromptExamples() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.get(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/text-prompt-examples`).then((res) => {
            return res.data;
        });
    }
    static async getUserEvents() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.get(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/userEvents`).then((res) => {
            return res.data;
        });
    }
    static async checkUserEvents() {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.post(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/userEvents/check`).then((res) => {
            return res.data;
        });
    }
    static async clearUserEvents(type) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.delete(`${EventService_1.sc.BASE_GSN_API}${GenerateSubName}/userEvents/${type}`).then((res) => {
            return res.data;
        });
    }
    static async composeImagePrepare(file, prompt, params) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const p = params || {};
        const body = { ...p, prompt };
        if (!params.background) {
            return CommonService_1.CommonService.uploadFile(axios, `${(0, DataRouterService_1.getGsnServiceRoutePrefix)(params)}${GenerateSubName}/prepare`, file, body);
        }
        const dt = new DataTransfer();
        dt.items.add(file);
        // dt.items.add(new File([prompt], 'prompt.txt');
        dt.items.add(params.background);
        const fileList = dt.files;
        if (!fileList.length) {
            return Promise.reject(new Error('No files to upload'));
        }
        return CommonService_1.CommonService.uploadFiles(axios, `${(0, DataRouterService_1.getGsnServiceRoutePrefix)(params)}${GenerateSubName}/prepare`, fileList, body, { signal: AbortSignal.timeout(1000 * 60 * 10) });
        // return axios.post(`${sc.BASE_API}/gsn${GenerateSubName}`).then((res) => {
        //   return res.data;
        // });
        // return await CommonService.uploadFile(axios, `${sc.BASE_API}/gsn${GenerateSubName}`, file);
    }
    static async composeImageGetVector(files, prompt, params) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        const p = params || {};
        const body = { ...p, prompt };
        const dt = new DataTransfer();
        files.forEach((file) => dt.items.add(file));
        const fileList = dt.files;
        if (!fileList.length) {
            return Promise.reject(new Error('No files to upload'));
        }
        return CommonService_1.CommonService.uploadFiles(axios, `${(0, DataRouterService_1.getGsnServiceRoutePrefix)(params)}${GenerateSubName}/get-vector`, fileList, body, { responseType: 'arraybuffer' });
    }
}
exports.DataService = DataService;
//# sourceMappingURL=DataService.js.map