#!/usr/bin/env node
"use strict";
/* eslint-disable header/header */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTests = runTests;
exports.open = open;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const main_1 = require("./main");
const download_1 = require("./download");
const playwright = require("playwright");
const minimist = require("minimist");
const path = require("path");
/**
 * Runs the tests in a browser.
 *
 * @param options The options defining browser type, extension and test location.
 */
async function runTests(options) {
    const config = {
        extensionDevelopmentPath: options.extensionDevelopmentPath,
        extensionTestsPath: options.extensionTestsPath,
        build: await getBuild(options),
        folderUri: options.folderUri,
        folderMountPath: options.folderPath,
        printServerLog: options.printServerLog ?? options.hideServerLog === false,
        extensionPaths: options.extensionPaths,
        extensionIds: options.extensionIds,
        coi: !!options.coi,
        esm: !!options.esm,
    };
    const host = options.host ?? 'localhost';
    const port = options.port ?? 3000;
    const server = await (0, main_1.runServer)(host, port, config);
    return new Promise(async (s, e) => {
        const endpoint = `http://${host}:${port}`;
        const configPage = async (page, browser) => {
            const unreportedOutput = [];
            await page.exposeFunction('codeAutomationLog', (type, args) => {
                console[type](...args);
            });
            await page.exposeFunction('codeAutomationExit', async (code) => {
                try {
                    await browser.close();
                }
                catch (error) {
                    console.error(`Error when closing browser: ${error}`);
                }
                if (unreportedOutput.length) {
                    console.error(`There were ${unreportedOutput.length} messages that could not be reported to the console:`);
                    unreportedOutput.forEach(({ type, args }) => console[type](...args));
                }
                server.close();
                if (code === 0) {
                    s();
                }
                else {
                    e(new Error('Test failed'));
                }
            });
        };
        console.log(`Opening browser on ${endpoint}...`);
        const context = await openBrowser(endpoint, options, configPage);
        if (context) {
            context.once('close', () => server.close());
        }
        else {
            server.close();
            e(new Error('Can not run test as opening of browser failed.'));
        }
    });
}
async function getBuild(options) {
    if (options.vsCodeDevPath) {
        return {
            type: 'sources',
            location: options.vsCodeDevPath,
        };
    }
    const quality = options.quality || options.version;
    const commit = options.commit;
    const testRunnerDataDir = options.testRunnerDataDir ?? path.resolve(process.cwd(), '.vscode-test-web');
    return await (0, download_1.downloadAndUnzipVSCode)(testRunnerDataDir, quality === 'stable' ? 'stable' : 'insider', commit);
}
async function open(options) {
    const config = {
        extensionDevelopmentPath: options.extensionDevelopmentPath,
        extensionTestsPath: options.extensionTestsPath,
        build: await getBuild(options),
        folderUri: options.folderUri,
        folderMountPath: options.folderPath,
        printServerLog: options.printServerLog ?? options.hideServerLog === false,
        extensionPaths: options.extensionPaths,
        extensionIds: options.extensionIds,
        coi: !!options.coi,
        esm: !!options.esm,
        domain: options.domain,
        protocol: options.protocol
    };
    const host = options.host ?? 'localhost';
    const port = options.port ?? 3000;
    const server = await (0, main_1.runServer)(host, port, config);
    const endpoint = `http://${host}:${port}`;
    const context = await openBrowser(endpoint, options);
    context?.once('close', () => server.close());
    return {
        dispose: () => {
            server.close();
            context?.browser()?.close();
        },
    };
}
async function openBrowser(endpoint, options, configPage) {
    if (options.browserType === 'none') {
        return undefined;
    }
    const browserType = await playwright[options.browserType];
    if (!browserType) {
        console.error(`Can not open browser type: ${options.browserType}`);
        return undefined;
    }
    const args = [];
    if (options.browserOptions) {
        args.push(...options.browserOptions);
    }
    if (process.platform === 'linux' && options.browserType === 'chromium') {
        args.push('--no-sandbox');
    }
    if (options.waitForDebugger) {
        args.push(`--remote-debugging-port=${options.waitForDebugger}`);
    }
    const headless = options.headless ?? options.extensionTestsPath !== undefined;
    const browser = await browserType.launch({ headless, args, devtools: options.devTools });
    const context = await browser.newContext({ viewport: null });
    if (options.permissions) {
        context.grantPermissions(options.permissions);
    }
    // forcefully close browser if last page is closed. workaround for https://github.com/microsoft/playwright/issues/2946
    let openPages = 0;
    context.on('page', page => {
        openPages++;
        page.once('close', () => {
            openPages--;
            if (openPages === 0) {
                browser.close();
            }
        });
    });
    const page = context.pages()[0] ?? (await context.newPage());
    if (configPage) {
        await configPage(page, browser);
    }
    if (options.waitForDebugger) {
        await page.waitForFunction(() => '__jsDebugIsReady' in globalThis);
    }
    if (options.verbose) {
        page.on('console', (message) => {
            console.log(message.text());
        });
    }
    await page.goto(endpoint);
    return context;
}
function validateStringOrUndefined(options, name) {
    const value = options[name];
    if (value === undefined || typeof value === 'string') {
        return value;
    }
    console.log(`'${name}' needs to be a string value.`);
    showHelp();
    process.exit(-1);
}
async function validatePathOrUndefined(options, name, isFile) {
    const loc = validateStringOrUndefined(options, name);
    return loc && validatePath(loc, isFile);
}
function validateBooleanOrUndefined(options, name) {
    const value = options[name];
    if (value === undefined || typeof value === 'boolean') {
        return value;
    }
    console.log(`'${name}' needs to be a boolean value.`);
    showHelp();
    process.exit(-1);
}
function validatePrintServerLog(options) {
    const printServerLog = validateBooleanOrUndefined(options, 'printServerLog');
    if (printServerLog !== undefined) {
        return printServerLog;
    }
    const hideServerLog = validateBooleanOrUndefined(options, 'hideServerLog');
    if (hideServerLog !== undefined) {
        return !hideServerLog;
    }
    return false;
}
function validateBrowserType(options) {
    const browserType = options.browser || options.browserType;
    if (browserType === undefined) {
        return 'chromium';
    }
    if (options.browserType && options.browser) {
        console.log(`Ignoring browserType option '${options.browserType}' as browser option '${options.browser}' is set.`);
    }
    if (typeof browserType === 'string' && ['chromium', 'firefox', 'webkit', 'none'].includes(browserType)) {
        return browserType;
    }
    console.log(`Invalid browser option ${browserType}.`);
    showHelp();
    process.exit(-1);
}
function validatePermissions(permissions) {
    if (permissions === undefined) {
        return undefined;
    }
    function isValidPermission(p) {
        return typeof p === 'string';
    }
    if (isValidPermission(permissions)) {
        return [permissions];
    }
    if (Array.isArray(permissions) && permissions.every(isValidPermission)) {
        return permissions;
    }
    console.log(`Invalid permission: ${permissions}`);
    showHelp();
    process.exit(-1);
}
function validateBrowserOptions(browserOptions) {
    if (browserOptions === undefined) {
        return undefined;
    }
    function isValidOption(p) {
        return typeof p === 'string';
    }
    if (isValidOption(browserOptions)) {
        return [browserOptions];
    }
    if (Array.isArray(browserOptions) && browserOptions.every(isValidOption)) {
        return browserOptions;
    }
    console.log(`Invalid browser option: ${browserOptions}`);
    showHelp();
    process.exit(-1);
}
async function validateExtensionPaths(extensionPaths) {
    if (extensionPaths === undefined) {
        return undefined;
    }
    if (!Array.isArray(extensionPaths)) {
        extensionPaths = [extensionPaths];
    }
    if (Array.isArray(extensionPaths)) {
        const res = [];
        for (const extensionPath of extensionPaths) {
            if (typeof extensionPath === 'string') {
                res.push(await validatePath(extensionPath));
            }
            else {
                break;
            }
        }
        return res;
    }
    console.log(`Invalid extensionPath`);
    showHelp();
    process.exit(-1);
}
const EXTENSION_IDENTIFIER_PATTERN = /^([a-z0-9A-Z][a-z0-9-A-Z]*\.[a-z0-9A-Z][a-z0-9-A-Z]*)(@prerelease)?$/;
async function validateExtensionIds(extensionIds) {
    if (extensionIds === undefined) {
        return undefined;
    }
    if (!Array.isArray(extensionIds)) {
        extensionIds = [extensionIds];
    }
    if (Array.isArray(extensionIds)) {
        const res = [];
        for (const extensionId of extensionIds) {
            const m = typeof extensionId === 'string' && extensionId.match(EXTENSION_IDENTIFIER_PATTERN);
            if (m) {
                if (m[2]) {
                    res.push({ id: m[1], preRelease: true });
                }
                else {
                    res.push({ id: m[1] });
                }
            }
            else {
                console.log(`Invalid extension id: ${extensionId}. Format is publisher.name[@prerelease].`);
                break;
            }
        }
        return res;
    }
    else {
        console.log(`Invalid extensionId`);
    }
    showHelp();
    process.exit(-1);
}
async function validatePath(loc, isFile) {
    loc = path.resolve(loc);
    if (isFile) {
        if (!(await (0, download_1.fileExists)(loc))) {
            console.log(`'${loc}' must be an existing file.`);
            process.exit(-1);
        }
    }
    else {
        if (!(await (0, download_1.directoryExists)(loc))) {
            console.log(`'${loc}' must be an existing folder.`);
            process.exit(-1);
        }
    }
    return loc;
}
function validateQuality(quality, version, vsCodeDevPath) {
    if (version) {
        console.log(`--version has been replaced by --quality`);
        quality = quality || version;
    }
    if (vsCodeDevPath && quality) {
        console.log(`Sources folder is provided as input, quality is ignored.`);
        return undefined;
    }
    if (quality === undefined || (typeof quality === 'string' && ['insiders', 'stable'].includes(quality))) {
        return quality;
    }
    if (version === 'sources') {
        console.log(`Instead of version=sources use 'sourcesPath' with the location of the VS Code repository.`);
    }
    else {
        console.log(`Invalid quality.`);
    }
    showHelp();
    process.exit(-1);
}
function validateCommit(commit, vsCodeDevPath) {
    if (vsCodeDevPath && commit) {
        console.log(`Sources folder is provided as input, commit is ignored.`);
        return undefined;
    }
    if (commit === undefined || (typeof commit === 'string' && commit.match(/^[0-9a-f]{40}$/))) {
        return commit;
    }
    else {
        console.log(`Invalid format for commit. Expected a 40 character long SHA1 hash.`);
    }
    showHelp();
    process.exit(-1);
}
function validatePortNumber(port) {
    if (typeof port === 'string') {
        const number = Number.parseInt(port);
        if (!Number.isNaN(number) && number >= 0) {
            return number;
        }
    }
    return undefined;
}
function showHelp() {
    console.log('Usage:');
    console.log(`  --browser 'chromium' | 'firefox' | 'webkit' | 'none': The browser to launch. [Optional, defaults to 'chromium']`);
    console.log(`  --browserOption option: Command line argument to use when launching the browser instance. [Optional, Multiple]`);
    console.log(`  --extensionDevelopmentPath path: A path pointing to an extension under development to include. [Optional]`);
    console.log(`  --extensionTestsPath path: A path to a test module to run. [Optional]`);
    console.log(`  --quality 'insiders' | 'stable' [Optional, default 'insiders', ignored when running from sources]`);
    console.log(`  --commit commitHash [Optional, defaults to latest build version of the given quality, ignored when running from sources]`);
    console.log(`  --sourcesPath path: If provided, running from VS Code sources at the given location. [Optional]`);
    console.log(`  --open-devtools: If set, opens the dev tools. [Optional]`);
    console.log(`  --headless: Whether to hide the browser. Defaults to true when an extensionTestsPath is provided, otherwise false. [Optional]`);
    console.log(`  --permission: Permission granted in the opened browser: e.g. 'clipboard-read', 'clipboard-write'. [Optional, Multiple]`);
    console.log(`  --coi: Enables cross origin isolation [Optional]`);
    console.log(`  --esm: Serve the ESM variant of VS Code [Optional]`);
    console.log(`  --folder-uri: workspace to open VS Code on. Ignored when folderPath is provided. [Optional]`);
    console.log(`  --extensionPath: A path pointing to a folder containing additional extensions to include [Optional, Multiple]`);
    console.log(`  --extensionId: The id of an extension include. The format is '\${publisher}.\${name}'. Append '@prerelease' to use a prerelease version [Optional, Multiple]`);
    console.log(`  --host: The host name the server is opened on. [Optional, defaults to localhost]`);
    console.log(`  --port: The port the server is opened on. [Optional, defaults to 3000]`);
    console.log(`  --domain: The domain the server is opened on. [Optional, defaults to localhost]`);
    console.log(`  --protocol: The protocol the server is opened on. [Optional, defaults to http]`);
    console.log(`  --open-devtools: If set, opens the dev tools. [Optional]`);
    console.log(`  --verbose: If set, prints out more information when running the server. [Optional]`);
    console.log(`  --printServerLog: If set, prints the server access log. [Optional]`);
    console.log(`  --testRunnerDataDir: If set, the temporary folder for storing the VS Code builds used for running the tests. [Optional, defaults to '$CURRENT_WORKING_DIR/.vscode-test-web']`);
    console.log(`  folderPath. A local folder to open VS Code on. The folder content will be available as a virtual file system. [Optional]`);
}
async function cliMain() {
    process.on('unhandledRejection', (e) => {
        console.error('unhandledRejection', e);
    });
    process.on('uncaughtException', (e) => {
        console.error('uncaughtException', e);
    });
    /* eslint-disable @typescript-eslint/no-var-requires */
    /* eslint-disable @typescript-eslint/no-require-imports */
    const manifest = JSON.parse(await (0, download_1.readFileInRepo)('package.json'));
    console.log(`${manifest.name}: ${manifest.version}`);
    const options = {
        string: ['extensionDevelopmentPath', 'extensionTestsPath', 'browser', 'browserOption', 'browserType', 'quality', 'version', 'commit', 'waitForDebugger', 'folder-uri', 'permission', 'extensionPath', 'extensionId', 'sourcesPath', 'host', 'port', 'domain', "protocol", 'testRunnerDataDir'],
        boolean: ['open-devtools', 'headless', 'hideServerLog', 'printServerLog', 'help', 'verbose', 'coi', 'esm'],
        unknown: arg => {
            if (arg.startsWith('-')) {
                console.log(`Unknown argument ${arg}`);
                showHelp();
                process.exit();
            }
            return true;
        },
    };
    const args = minimist(process.argv.slice(2), options);
    if (args.help) {
        showHelp();
        process.exit();
    }
    const browserOptions = validateBrowserOptions(args.browserOption);
    const browserType = validateBrowserType(args);
    const extensionTestsPath = await validatePathOrUndefined(args, 'extensionTestsPath', true);
    const extensionDevelopmentPath = await validatePathOrUndefined(args, 'extensionDevelopmentPath');
    const extensionPaths = await validateExtensionPaths(args.extensionPath);
    const extensionIds = await validateExtensionIds(args.extensionId);
    const vsCodeDevPath = await validatePathOrUndefined(args, 'sourcesPath');
    const quality = validateQuality(args.quality, args.version, vsCodeDevPath);
    const commit = validateCommit(args.commit, vsCodeDevPath);
    const devTools = validateBooleanOrUndefined(args, 'open-devtools');
    const headless = validateBooleanOrUndefined(args, 'headless');
    const permissions = validatePermissions(args.permission);
    const printServerLog = validatePrintServerLog(args);
    const verbose = validateBooleanOrUndefined(args, 'verbose');
    const port = validatePortNumber(args.port);
    const host = validateStringOrUndefined(args, 'host');
    const domain = validateStringOrUndefined(args, 'domain') || "localhost";
    const protocol = validateStringOrUndefined(args, 'protocol') || "http";
    console.log("domain", domain)
    const coi = validateBooleanOrUndefined(args, 'coi');
    const esm = validateBooleanOrUndefined(args, 'esm');
    // const esm = true;
    const testRunnerDataDir = validateStringOrUndefined(args, 'testRunnerDataDir');
    const waitForDebugger = validatePortNumber(args.waitForDebugger);
    let folderUri = validateStringOrUndefined(args, 'folder-uri');
    let folderPath;
    const inputs = args._;
    if (inputs.length) {
        const input = await validatePath(inputs[0]);
        if (input) {
            folderPath = input;
            if (folderUri) {
                console.log(`Local folder provided as input, ignoring 'folder-uri'`);
                folderUri = undefined;
            }
        }
    }
    if (extensionTestsPath) {
        runTests({
            extensionTestsPath,
            extensionDevelopmentPath,
            browserOptions,
            browserType,
            quality,
            commit,
            devTools,
            waitForDebugger,
            folderUri,
            folderPath,
            headless,
            printServerLog,
            permissions,
            extensionPaths,
            extensionIds,
            vsCodeDevPath,
            verbose,
            esm,
            coi,
            host,
            port,
            domain,
            protocol,
            testRunnerDataDir,
        }).catch(e => {
            console.log('Error running tests:', e);
            process.exit(1);
        });
    }
    else {
        open({
            extensionDevelopmentPath,
            browserOptions,
            browserType,
            quality,
            commit,
            devTools,
            waitForDebugger,
            folderUri,
            folderPath,
            headless,
            printServerLog,
            permissions,
            extensionPaths,
            extensionIds,
            vsCodeDevPath,
            verbose,
            esm,
            coi,
            host,
            port,
            domain,
            protocol,
            testRunnerDataDir,
        });
    }
}
if (require.main === module) {
    cliMain();
}
