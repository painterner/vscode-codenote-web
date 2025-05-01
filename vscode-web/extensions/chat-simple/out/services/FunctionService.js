"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigate = void 0;
const navigate = (path, option) => {
    if (option?.relative) {
        window.location.pathname = window.location.pathname + path;
    }
    else {
        window.location.pathname = path;
    }
};
exports.navigate = navigate;
//# sourceMappingURL=FunctionService.js.map