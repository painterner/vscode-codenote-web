"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDownloadURL = getDownloadURL;
exports.downloadAndUnzipVSCode = downloadAndUnzipVSCode;
exports.fetch = fetch;
exports.fetchJSON = fetchJSON;
exports.directoryExists = directoryExists;
exports.fileExists = fileExists;
exports.readFileInRepo = readFileInRepo;
const fs_1 = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const https_proxy_agent_1 = require("https-proxy-agent");
const http_proxy_agent_1 = require("http-proxy-agent");
const url_1 = require("url");
async function getLatestBuild(quality) {
    return await fetchJSON(`https://update.code.visualstudio.com/api/update/web-standalone/${quality}/latest`);
}
async function getDownloadURL(quality, commit) {
    return new Promise((resolve, reject) => {
        const url = `https://update.code.visualstudio.com/commit:${commit}/web-standalone/${quality}`;
        const httpLibrary = url.startsWith('https') ? https : http;
        httpLibrary.get(url, { method: 'HEAD', ...getAgent(url) }, res => {
            console.log(res.statusCode, res.headers.location);
            if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) && res.headers.location) {
                resolve(res.headers.location);
            }
            else {
                resolve(undefined);
            }
        });
    });
}
const reset = '\x1b[G\x1b[0K';
async function downloadAndUntar(downloadUrl, destination, message) {
    process.stdout.write(message);
    if (!(0, fs_1.existsSync)(destination)) {
        await fs_1.promises.mkdir(destination, { recursive: true });
    }
    const tar = await Promise.resolve().then(() => require('tar-fs'));
    const gunzip = await Promise.resolve().then(() => require('gunzip-maybe'));
    return new Promise((resolve, reject) => {
        const httpLibrary = downloadUrl.startsWith('https') ? https : http;
        httpLibrary.get(downloadUrl, getAgent(downloadUrl), res => {
            const total = Number(res.headers['content-length']);
            let received = 0;
            let timeout;
            res.on('data', chunk => {
                if (!timeout) {
                    timeout = setTimeout(() => {
                        process.stdout.write(`${reset}${message}: ${received}/${total} (${(received / total * 100).toFixed()}%)`);
                        timeout = undefined;
                    }, 100);
                }
                received += chunk.length;
            });
            res.on('end', () => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                process.stdout.write(`${reset}${message}: complete\n`);
            });
            const extract = res.pipe(gunzip()).pipe(tar.extract(destination, { strip: 1 }));
            extract.on('finish', () => {
                process.stdout.write(`Extracted to ${destination}\n`);
                resolve();
            });
            extract.on('error', reject);
        });
    });
}
async function downloadAndUnzipVSCode(vscodeTestDir, quality, commit) {
    let downloadURL;
    if (!commit) {
        const info = await getLatestBuild(quality);
        commit = info.version;
        downloadURL = info.url;
    }
    const folderName = `vscode-web-${quality}-${commit}`;
    const downloadedPath = path.resolve(vscodeTestDir, folderName);
    if ((0, fs_1.existsSync)(downloadedPath) && (0, fs_1.existsSync)(path.join(downloadedPath, 'version'))) {
        return { type: 'static', location: downloadedPath, quality, version: commit };
    }
    if (!downloadURL) {
        downloadURL = await getDownloadURL(quality, commit);
        if (!downloadURL) {
            throw Error(`Failed to find a download for ${quality} and ${commit}`);
        }
    }
    if ((0, fs_1.existsSync)(vscodeTestDir)) {
        await fs_1.promises.rm(vscodeTestDir, { recursive: true, maxRetries: 5 });
    }
    await fs_1.promises.mkdir(vscodeTestDir, { recursive: true });
    const productName = `VS Code ${quality === 'stable' ? 'Stable' : 'Insiders'}`;
    try {
        await downloadAndUntar(downloadURL, downloadedPath, `Downloading ${productName}`);
        await fs_1.promises.writeFile(path.join(downloadedPath, 'version'), folderName);
    }
    catch (err) {
        console.error(err);
        throw Error(`Failed to download and unpack ${productName}.${commit ? ' Did you specify a valid commit?' : ''}`);
    }
    return { type: 'static', location: downloadedPath, quality, version: commit };
}
async function fetch(api) {
    return new Promise((resolve, reject) => {
        const httpLibrary = api.startsWith('https') ? https : http;
        httpLibrary.get(api, getAgent(api), res => {
            if (res.statusCode !== 200) {
                reject('Failed to get content from ');
            }
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
            res.on('error', err => {
                reject(err);
            });
        });
    });
}
async function fetchJSON(api) {
    const data = await fetch(api);
    try {
        return JSON.parse(data);
    }
    catch (err) {
        throw new Error(`Failed to parse response from ${api}`);
    }
}
let PROXY_AGENT = undefined;
let HTTPS_PROXY_AGENT = undefined;
if (process.env.npm_config_proxy) {
    PROXY_AGENT = new http_proxy_agent_1.HttpProxyAgent(process.env.npm_config_proxy);
    HTTPS_PROXY_AGENT = new https_proxy_agent_1.HttpsProxyAgent(process.env.npm_config_proxy);
}
if (process.env.npm_config_https_proxy) {
    HTTPS_PROXY_AGENT = new https_proxy_agent_1.HttpsProxyAgent(process.env.npm_config_https_proxy);
}
function getAgent(url) {
    const parsed = new url_1.URL(url);
    const options = {};
    if (PROXY_AGENT && parsed.protocol.startsWith('http:')) {
        options.agent = PROXY_AGENT;
    }
    if (HTTPS_PROXY_AGENT && parsed.protocol.startsWith('https:')) {
        options.agent = HTTPS_PROXY_AGENT;
    }
    return options;
}
async function directoryExists(path) {
    try {
        const stats = await fs_1.promises.stat(path);
        return stats.isDirectory();
    }
    catch {
        return false;
    }
}
async function fileExists(path) {
    try {
        const stats = await fs_1.promises.stat(path);
        return stats.isFile();
    }
    catch {
        return false;
    }
}
async function readFileInRepo(pathInRepo) {
    return (await fs_1.promises.readFile(path.resolve(__dirname, '../..', pathInRepo))).toString();
}
