"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.runServer = runServer;
const app_1 = require("./app");
async function runServer(host, port, config) {
    const app = await (0, app_1.default)(config);
    // host = '0.0.0.0'
    try {
        const server = app.listen(port, host);
        console.log(`Listening on http://${host}:${port}`);
        return server;
    }
    catch (e) {
        console.error(`Failed to listen to port ${port} on host ${host}`, e);
        throw e;
    }
}
