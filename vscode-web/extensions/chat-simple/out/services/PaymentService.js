"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const CommonService_1 = require("./CommonService");
const EventService_1 = require("./EventService");
class PaymentService {
    static async stripeRequestCheckout(data) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.post(`${EventService_1.sc.BASE_API}/stripe/checkout/create-checkout-session`, data).then((res) => {
            return res.data;
        });
    }
    static async stripeCheckoutCapture(id) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.post(`${EventService_1.sc.BASE_API}/stripe/checkout/${id}/capture`).then((res) => {
            return res.data;
        });
    }
    static async kodepayCreateOrder(data) {
        const axios = await CommonService_1.CalcVariable.getAxios();
        return axios.post(`${EventService_1.sc.BASE_API}/kodepay/orders`, data).then((res) => {
            return res.data;
        });
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=PaymentService.js.map