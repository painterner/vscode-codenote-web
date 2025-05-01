"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSiteMessage = exports.onEnvReq = exports.sc = exports.WindowEventService = void 0;
exports.activateWindowEvent = activateWindowEvent;
class WindowEventService {
    static authLogin = 'authLogin';
    static authRegister = 'authRegister';
    static authForgotPassword = 'authForgotPassword';
    static authResetPassword = 'authResetPassword';
    static authLoginByCode = 'authLoginByCode';
    static navigate = 'customNavigate';
    static cropperModal = 'cropperModal';
    static uploadFileProgress = 'uploadFileProgress';
    static escCode = 'escCode';
    static pushEvent(name, data, error) {
        if (window)
            window.dispatchEvent(new CustomEvent(name, { detail: { data, error } }));
    }
    static on(name, callback) {
        if (window) {
            const listener = (d) => callback(d.detail);
            window.addEventListener(name, listener);
            return () => {
                window.removeEventListener(name, listener);
            };
        }
    }
}
exports.WindowEventService = WindowEventService;
exports.sc = {
    BASE_API: '',
    BASE_GSN_API: '',
    SERVICE_NAME: '',
    NAME_AUTH: "",
    SITE_EMAIL_NAME: '',
    SITE_OWNER: '',
    SITE_OWNER_SERVICE: '',
    profile: {},
    window: {}
};
let siteMessage = {
    profile: null,
    config: {},
    window: {}
};
const onEnvRes = (d) => {
    // console.log("onenve res", d)
    siteMessage = d.data;
    for (const key in siteMessage.config) {
        exports.sc[key] = siteMessage.config[key];
    }
    for (const key in (siteMessage.profile || {})) {
        exports.sc['profile'][key] = siteMessage.profile[key];
    }
    for (const key in (siteMessage.window || {})) {
        exports.sc['window'][key] = siteMessage.window[key];
    }
    // console.log("onenve res sc", sc)
};
const onEnvReq = (d) => {
    // console.log("onenve req", d)
    const data = d?.data || {};
    onEnvRes({
        data: {
            ...siteMessage,
            ...data
        }
    });
};
exports.onEnvReq = onEnvReq;
function activateWindowEvent() {
    try {
        // if (typeof window !== 'undefined') {
        if (typeof window !== 'undefined' && window)
            window.addEventListener('load', (ev) => {
                WindowEventService.on('codeask-res', (d) => {
                    onEnvRes(d);
                });
                WindowEventService.on('codeask-req', (d) => {
                    const data = d?.data || {};
                    try {
                        // @ts-ignore
                        // import('@/common/config').then(r => {
                        //     onEnvReq({
                        //         data: {
                        //             ...data,
                        //             config: r
                        //         }
                        //     })
                        // }).catch(e => {
                        // })
                    }
                    catch (e) {
                    }
                });
                WindowEventService.pushEvent('codeask-req', {});
            });
        else
            console.log("errrorrrrr1 window is not defined");
    }
    catch (e) {
        console.log("errorrrr2", e);
    }
}
const getSiteMessage = () => {
    return siteMessage || {};
};
exports.getSiteMessage = getSiteMessage;
//# sourceMappingURL=EventService.js.map