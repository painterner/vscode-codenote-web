"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createApp;
const fs_1 = require("fs");
const Koa = require("koa");
const morgan = require("koa-morgan");
const kstatic = require("koa-static");
const kmount = require("koa-mount");
const cors = require("@koa/cors");
const path_1 = require("path");
const workbench_1 = require("./workbench");
const mounts_1 = require("./mounts");
const extensions_1 = require("./extensions");
async function createApp(config) {
    const app = new Koa();
    app.use(morgan('dev', { skip: (req, res) => !config.printServerLog && (res.statusCode >= 200 && res.statusCode < 300) }));
    // CORS
    app.use(cors({
        allowMethods: ['GET'],
        credentials: true,
        origin: (ctx) => {
            const origin = ctx.get('Origin');
            if (/^https:\/\/[^.]+\.vscode-cdn\.net$/.test(origin) || // needed for the webviewContent
                /^https:\/\/[^.]+\.vscode-webview\.net$/.test(origin) ||
                new RegExp(`^${config.protocol}://[^.]+\\.${config.domain}$`).test(origin), // match subdomains of localhost
                new RegExp(`^${ctx.protocol}://[^.]+\\.${ctx.host}$`).test(origin) // match subdomains of localhost
            ) {
                return origin;
            }
            return undefined;
        },
    }));
    if (config.build.type !== 'sources' && config.build.type !== 'static') {
        // CSP: frame-ancestors
        app.use((ctx, next) => {
            ctx.set('Content-Security-Policy', `frame-ancestors 'none'`);
            return next();
        });
    }
    // COI
    app.use((ctx, next) => {
        // set COOP/COEP depending on vscode-coi-flags
        const value = ctx.query['vscode-coi'];
        if (value === '1') {
            ctx.set('Cross-Origin-Opener-Policy', 'same-origin');
        }
        else if (value === '2') {
            ctx.set('Cross-Origin-Embedder-Policy', 'require-corp');
        }
        else if (value === '3' || value === '') {
            ctx.set('Cross-Origin-Opener-Policy', 'same-origin');
            ctx.set('Cross-Origin-Embedder-Policy', 'require-corp');
        }
        // set CORP on all resources
        ctx.set('Cross-Origin-Resource-Policy', 'cross-origin');
        return next();
    });
    // shift the line numbers of source maps in extensions by 2 as the content is wrapped by an anonymous function
    app.use(async (ctx, next) => {
        await next();
        if (ctx.status === 200 && ctx.path.match(/\/(dev)?extensions\/.*\.js\.map$/) && ctx.body instanceof fs_1.ReadStream) {
            // we know it's a ReadStream as that's what kstatic uses
            const chunks = [];
            for await (const chunk of ctx.body) {
                chunks.push(Buffer.from(chunk));
            }
            const bodyContent = Buffer.concat(chunks).toString("utf-8");
            ctx.response.body = `{"version":3,"file":"${(0, path_1.basename)(ctx.path)}","sections":[{"offset":{"line":2,"column":0},"map":${bodyContent} }]}`;
        }
    });
    const serveOptions = { hidden: true };
    if (config.extensionDevelopmentPath) {
        console.log('Serving dev extensions from ' + config.extensionDevelopmentPath);
        app.use(kmount('/vscode-web/static/devextensions', kstatic(config.extensionDevelopmentPath, serveOptions)));
    }
    if (config.build.type === 'static') {
        app.use(kmount('/vscode-web/static/build', kstatic(config.build.location, serveOptions)));
    }
    else if (config.build.type === 'sources') {
        console.log('Serving VS Code sources from ' + config.build.location);
        app.use(kmount('/vscode-web/static/sources', kstatic(config.build.location, serveOptions)));
        app.use(kmount('/vscode-web/static/sources', kstatic((0, path_1.join)(config.build.location, 'resources', 'server'), serveOptions))); // for manifest.json, favicon and code icons.
        // built-in extension are at 'extensions` as well as prebuilt extensions downloaded from the marketplace
        app.use(kmount(`/vscode-web/static/sources/extensions`, kstatic((0, path_1.join)(config.build.location, extensions_1.prebuiltExtensionsLocation), serveOptions)));
    }
    (0, mounts_1.configureMounts)(config, app);
    if (config.extensionPaths) {
        config.extensionPaths.forEach((extensionPath, index) => {
            console.log('Serving additional built-in extensions from ' + extensionPath);
            app.use(kmount(`/vscode-web/static/extensions/${index}`, kstatic(extensionPath, serveOptions)));
        });
    }
    app.use((0, workbench_1.default)(config));
    return app;
}
