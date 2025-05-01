"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const fetch_axios_1 = __importDefault(require("./fetch-axios"));
const EventService_1 = require("./EventService");
async function postWithExtr(axios, url, data) {
    if (data) {
        data.from = EventService_1.sc.SITE_OWNER;
        data.emailName = EventService_1.sc.SITE_EMAIL_NAME;
    }
    return axios.post(url, data);
}
class MessageService {
    static async leaveMessage(form) {
        return (await postWithExtr(fetch_axios_1.default, `${EventService_1.sc.BASE_API}/message/leaveMessage`, form)).data;
    }
    static async subscribeEmail(email) {
        return (await fetch_axios_1.default.get(`${EventService_1.sc.BASE_API}/email/subscribe?email=${email}`)).data;
    }
}
exports.MessageService = MessageService;
//# sourceMappingURL=MessageService.js.map