#!/usr/bin/env node
export type BrowserType = 'chromium' | 'firefox' | 'webkit' | 'none';
export type VSCodeQuality = 'insiders' | 'stable';
export type GalleryExtension = {
    readonly id: string;
    readonly preRelease?: boolean;
};
export interface Options {
    /**
     * Browser to open: 'chromium' | 'firefox' | 'webkit' | 'none'.
     */
    browserType: BrowserType;
    /**
     * Browser command line options.
     */
    browserOptions?: string[];
    /**
     * Absolute path to folder that contains one or more extensions (in subfolders).
     * Extension folders include a `package.json` extension manifest.
     */
    extensionDevelopmentPath?: string;
    /**
     * Absolute path to the extension tests runner module.
     * Can be either a file path or a directory path that contains an `index.js`.
     * The module is expected to have a `run` function of the following signature:
     *
     * ```ts
     * function run(): Promise<void>;
     * ```
     *
     * When running the extension test, the Extension Development Host will call this function
     * that runs the test suite. This function should throws an error if any test fails.
     */
    extensionTestsPath?: string;
    /**
     * The quality of the VS Code to use. Supported qualities are:
     * - `'stable'` : The latest stable build will be used
     * - `'insiders'` : The latest insiders build will be used
     *
     * Currently defaults to `insiders`, which is latest stable insiders.
     *
     * The setting is ignored when a vsCodeDevPath is provided.
     */
    quality?: VSCodeQuality;
    /**
     * The commit of the VS Code build to use. If not set, the latest build is used.
     *
     * The setting is ignored when a vsCodeDevPath is provided.
     */
    commit?: string;
    /**
     * @deprecated. Use `quality` or `vsCodeDevPath` instead.
     */
    version?: string;
    /**
     * Open the dev tools.
     */
    devTools?: boolean;
    /**
     * Do not show the browser. Defaults to `true` if a `extensionTestsPath` is provided, `false` otherwise.
     */
    headless?: boolean;
    /**
     * If set, opens the page with cross origin isolation enabled.
     */
    coi?: boolean;
    /**
     * If set, serves the page with ESM usage.
     */
    esm?: boolean;
    /**
     * @deprecated. Use `printServerLog` instead.
     */
    hideServerLog?: boolean;
    /**
     * If set, the server access log is printed to the console. Defaults to `false`.
     */
    printServerLog?: boolean;
    /**
     * Expose browser debugging on this port number, and wait for the debugger to attach before running tests.
     */
    waitForDebugger?: number;
    /**
     * A local path to open VSCode on. VS Code for the browser will open an a virtual
     * file system ('vscode-test-web://mount') where the files of the local folder will served.
     * The file system is read/write, but modifications are stored in memory and not written back to disk.
     */
    folderPath?: string;
    /**
     * The folder URI to open VSCode on. If 'folderPath' is set this will be ignored and 'vscode-test-web://mount'
     * is used as folder URI instead.
     */
    folderUri?: string;
    /**
     * Permissions granted to the opened browser. An list of permissions can be found at
     * https://playwright.dev/docs/api/class-browsercontext#browser-context-grant-permissions
     * Example: [ 'clipboard-read', 'clipboard-write' ]
     */
    permissions?: string[];
    /**
     * Absolute paths pointing to built-in extensions to include.
     */
    extensionPaths?: string[];
    /**
     * List of extensions to include. The id format is ${publisher}.${name}.
     */
    extensionIds?: GalleryExtension[];
    /**
     * Absolute path pointing to VS Code sources to use.
     */
    vsCodeDevPath?: string;
    /**
     * Print out more information while the server is running, e.g. the console output in the browser
     */
    verbose?: boolean;
    /**
     * The port to start the server on. Defaults to `3000`.
     */
    port?: number;
    /**
     * The host name to start the server on. Defaults to `localhost`
     */
    host?: string;
    /**
     * The temporary folder for storing the VS Code builds used for running the tests. Defaults to `$CURRENT_WORKING_DIR/.vscode-test-web`.
     */
    testRunnerDataDir?: string;
}
export interface Disposable {
    dispose(): void;
}
/**
 * Runs the tests in a browser.
 *
 * @param options The options defining browser type, extension and test location.
 */
export declare function runTests(options: Options & {
    extensionTestsPath: string;
}): Promise<void>;
export declare function open(options: Options): Promise<Disposable>;
