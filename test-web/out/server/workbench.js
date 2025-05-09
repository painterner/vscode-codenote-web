"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const path = require("path");
const fs_1 = require("fs");
const vscode_uri_1 = require("vscode-uri");
const Router = require("@koa/router");
const extensions_1 = require("./extensions");
const mounts_1 = require("./mounts");
const download_1 = require("./download");
function asJSON(value) {
    return JSON.stringify(value).replace(/"/g, '&quot;');
}
class Workbench {
    baseUrl;
    dev;
    esm;
    devCSSModules;
    builtInExtensions;
    productOverrides;
    constructor(baseUrl, dev, esm, devCSSModules, builtInExtensions = [], productOverrides) {
        this.baseUrl = baseUrl;
        this.dev = dev;
        this.esm = esm;
        this.devCSSModules = devCSSModules;
        this.builtInExtensions = builtInExtensions;
        this.productOverrides = productOverrides;
    }
    async render(workbenchWebConfiguration) {
        if (this.productOverrides) {
            workbenchWebConfiguration.productConfiguration = { ...workbenchWebConfiguration.productConfiguration, ...this.productOverrides };
        }
        const values = {
            WORKBENCH_WEB_CONFIGURATION: asJSON(workbenchWebConfiguration),
            WORKBENCH_WEB_BASE_URL: this.baseUrl,
            WORKBENCH_BUILTIN_EXTENSIONS: asJSON(this.builtInExtensions),
            WORKBENCH_MAIN: await this.getMain()
        };
        try {
            const workbenchTemplate = await (0, download_1.readFileInRepo)(`views/workbench${this.esm ? '-esm' : ''}.html`);
            return workbenchTemplate.replace(/\{\{([^}]+)\}\}/g, (_, key) => values[key] ?? 'undefined');
        }
        catch (e) {
            return String(e);
        }
    }
    async getMain() {
        const lines = [];
        if (this.esm) {
            let workbenchMain = await (0, download_1.readFileInRepo)(`out/browser/esm/main.js`);
            if (this.dev) {
                lines.push("<script>", `globalThis._VSCODE_CSS_MODULES = ${JSON.stringify(this.devCSSModules)};`, "</script>", "<script>", "const sheet = document.getElementById('vscode-css-modules').sheet;", "globalThis._VSCODE_CSS_LOAD = function (url) { sheet.insertRule(`@import url(${url});`); };", "", "const importMap = { imports: {} };", "for (const cssModule of globalThis._VSCODE_CSS_MODULES) {", "  const cssUrl = new URL(cssModule, globalThis._VSCODE_FILE_ROOT).href;", "  const jsSrc = `globalThis._VSCODE_CSS_LOAD('${cssUrl}');\\n`;", "  const blob = new Blob([jsSrc], { type: 'application/javascript' });", "  importMap.imports[cssUrl] = URL.createObjectURL(blob);", "}", "const importMapElement = document.createElement('script');", "importMapElement.type = 'importmap';", "importMapElement.setAttribute('nonce', '1nline-m4p');", "importMapElement.textContent = JSON.stringify(importMap, undefined, 2);", "document.head.appendChild(importMapElement);", "</script>");
                workbenchMain = workbenchMain.replace('./workbench.api', `${this.baseUrl}/out/vs/workbench/workbench.web.main.internal.js`);
                lines.push(`<script type="module">${workbenchMain}</script>`);
            }
            else {
                workbenchMain = workbenchMain.replace('./workbench.api', `${this.baseUrl}/out/vs/workbench/workbench.web.main.internal.js`);
                lines.push(`<script src="${this.baseUrl}/out/nls.messages.js"></script>`);
                lines.push(`<script type="module">${workbenchMain}</script>`);
            }
            return lines.join('\n');
        }
        else {
            let workbenchMain = await (0, download_1.readFileInRepo)(`out/browser/amd/main.js`); // defines a AMD module `vscode-web-browser-main`
            workbenchMain = workbenchMain.replace('./workbench.api', `vs/workbench/workbench.web.main`);
            workbenchMain = workbenchMain + '\nrequire(["vscode-web-browser-main"], function() { });';
            if (this.dev) {
            }
            else {
                lines.push(`<script src="${this.baseUrl}/out/nls.messages.js"></script>`);
                lines.push(`<script src="${this.baseUrl}/out/vs/workbench/workbench.web.main.nls.js"></script>`);
                lines.push(`<script src="${this.baseUrl}/out/vs/workbench/workbench.web.main.js"></script>`);
            }
            lines.push(`<script>${workbenchMain}</script>`);
        }
        return lines.join('\n');
    }
    async renderCallback() {
        return await (0, download_1.readFileInRepo)(`views/callback.html`);
    }
}
async function getWorkbenchOptions(ctx, config) {
    const options = {};
    if (config.extensionPaths) {
        const extensionPromises = config.extensionPaths.map((extensionPath, index) => {
            return (0, extensions_1.scanForExtensions)(extensionPath, {
                scheme: config.protocol,
                authority: config.domain,
                path: `/vscode-web/static/extensions/${index}`,
            });
        });
        options.additionalBuiltinExtensions = (await Promise.all(extensionPromises)).flat();
    }
    if (config.extensionIds) {
        if (!options.additionalBuiltinExtensions) {
            options.additionalBuiltinExtensions = [];
        }
        options.additionalBuiltinExtensions.push(...config.extensionIds);
    }
    if (config.extensionDevelopmentPath) {
        const developmentOptions = (options.developmentOptions = {});
        developmentOptions.extensions = await (0, extensions_1.scanForExtensions)(config.extensionDevelopmentPath, { scheme: config.protocol, authority: config.domain, path: '/vscode-web/static/devextensions' });
        if (config.extensionTestsPath) {
            let relativePath = path.relative(config.extensionDevelopmentPath, config.extensionTestsPath);
            if (process.platform === 'win32') {
                relativePath = relativePath.replace(/\\/g, '/');
            }
            developmentOptions.extensionTestsPath = {
                scheme: config.protocol,
                authority: config.domain,
                path: path.posix.join('/vscode-web/static/devextensions', relativePath),
            };
        }
    }
    if (config.folderMountPath) {
        if (!options.additionalBuiltinExtensions) {
            options.additionalBuiltinExtensions = [];
        }
        options.additionalBuiltinExtensions.push({ scheme: config.protocol, authority: config.domain, path: mounts_1.fsProviderExtensionPrefix });
        options.folderUri = vscode_uri_1.URI.parse(mounts_1.fsProviderFolderUri);
    }
    else if (config.folderUri) {
        options.folderUri = vscode_uri_1.URI.parse(config.folderUri);
    }
    else {
        options.workspaceUri = vscode_uri_1.URI.from({ scheme: 'tmp', path: `/default.code-workspace` });
    }
    options.productConfiguration = { enableTelemetry: false };
    return options;
}
function default_1(config) {
    const router = new Router();
    router.use(async (ctx, next) => {
        if (config.build.type === 'sources') {
            const builtInExtensions = await (0, extensions_1.getScannedBuiltinExtensions)(config.build.location);
            const productOverrides = await getProductOverrides(config.build.location);
            const esm = config.esm
            console.log('Using ESM loader:', esm);
            const devCSSModules = esm ? await getDevCssModules(config.build.location) : [];
            ctx.state.workbench = new Workbench(`${config.protocol}://${config.domain}/vscode-web/static/sources`, false, esm, devCSSModules, builtInExtensions, {
                ...productOverrides,
                webEndpointUrlTemplate: `${config.protocol}://{{uuid}}.${config.domain}/vscode-web/static/sources`,
                webviewContentExternalBaseUrlTemplate: `${config.protocol}://{{uuid}}.${config.domain}/vscode-web/static/sources/out/vs/workbench/contrib/webview/browser/pre/`
            });
        }
        else if (config.build.type === 'static') {
            const baseUrl = `${config.protocol}://${config.domain}/vscode-web/static/build`;
            ctx.state.workbench = new Workbench(baseUrl, false, config.esm, [], [], {
                webEndpointUrlTemplate: `${config.protocol}://{{uuid}}.${config.domain}/static/build`,
                webviewContentExternalBaseUrlTemplate: `${config.protocol}://{{uuid}}.${config.domain}/vscode-web/static/build/out/vs/workbench/contrib/webview/browser/pre/`
            });
        }
        else if (config.build.type === 'cdn') {
            ctx.state.workbench = new Workbench(config.build.uri, false, config.esm, []);
        }
        await next();
    });
    router.get('/vscode-web/callback', async (ctx) => {
        ctx.body = await ctx.state.workbench.renderCallback();
    });
    router.get('/vscode-web', async (ctx) => {
        const options = await getWorkbenchOptions(ctx, config);
        ctx.body = await ctx.state.workbench.render(options);
        if (config.coi) {
            ctx.set('Cross-Origin-Opener-Policy', 'same-origin');
            ctx.set('Cross-Origin-Embedder-Policy', 'require-corp');
        }
    });
    // router.use("/vscode-web/provider-proy", async (ctx) => {

    // })
    return router.routes();
}
async function getProductOverrides(vsCodeDevLocation) {
    try {
        return JSON.parse((await fs_1.promises.readFile(path.join(vsCodeDevLocation, 'product.overrides.json'))).toString());
    }
    catch (e) {
        return undefined;
    }
}
async function getDevCssModules(vsCodeDevLocation) {
    const glob = await Promise.resolve().then(() => require('glob'));
    return glob.glob('**/*.css', { cwd: path.join(vsCodeDevLocation, 'out') });
}
async function isESM(vsCodeDevLocation) {
    try {
        const packageJSON = await fs_1.promises.readFile(path.join(vsCodeDevLocation, 'out', 'package.json'));
        return JSON.parse(packageJSON.toString()).type === 'module';
    }
    catch (e) {
        // ignore
    }
    try {
        const packageJSON = await fs_1.promises.readFile(path.join(vsCodeDevLocation, 'package.json'));
        return JSON.parse(packageJSON.toString()).type === 'module';
    }
    catch (e) {
        return false;
    }
}
