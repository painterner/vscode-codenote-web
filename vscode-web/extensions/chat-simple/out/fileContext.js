"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilePrompt = void 0;
const prompt_tsx_1 = require("@vscode/prompt-tsx");
/**
 * In this example, we want to include the contents of all files the user is
 * currently looking at in their prompt. But, these files could be big, to the
 * point where including all of them would lead to their text being pruned!
 *
 * This example shows you how to use the `flexGrow` property to cooperatively
 * size the file contents to fit within the token budget. Each element receives
 * information about how much of the token budget it is suggested to consume in
 * its `PromptSizing` object, passed to both `prepare` and `render`.
 *
 * By default, each element has a `flexGrow` value of `0`. This means they're
 * all rendered concurrently and split the budget equally (unless modified by
 * a `flexBasis` value.) If you assign elements to a higher `flexGrow` value,
 * then they're rendered after everything else, and they're given any remaining
 * unused budget. This gives you a great way to create elements that size to
 * fit but not exceed your total budget.
 *
 * Let's use this to make the `FileContext` grow to fill the available space.
 * We'll assign it a `flexGrow` value of `1`, and then it will be rendered after
 * the instructions and query.
 *
 * History can be big, however, and we'd prefer to bring in more context rather
 * than more history. So, we'll assign the `History` element a `flexGrow` value
 * of `2` for the sole purpose of keeping its token consumption out of the
 * `FileContext` budget. However, we will set `flexReserve="/5"` to have it
 * 'reserve' 1/5th of the total budget from being given to the sizing of
 * earlier elements, just to make sure we have some amount of history in the
 * prompt.
 *
 * It's important to note that the `flexGrow` value, and `PromptSizing` in
 * general, allows **cooperative** use of the token budget. If the prompt is
 * over budget after everything is rendered, then pruning still happens as
 * usual. `flex*` values have no impact on the priority or pruning process.
 *
 * While we're using the active files and selections here, these same concepts
 * can be applied in other scenarios too.
 */
class FilePrompt extends prompt_tsx_1.PromptElement {
    render() {
        return (vscpp(vscppf, null,
            vscpp(FileContext, { priority: 70, flexGrow: 1, files: this.props.files })));
    }
}
exports.FilePrompt = FilePrompt;
class FileContext extends prompt_tsx_1.PromptElement {
    async render(_state, sizing) {
        const files = await this.getExpandedFiles(sizing);
        return vscpp(vscppf, null, files.map(f => f.toString()));
    }
    /**
     * The idea here is:
     *
     * 1. We wrap each file in markdown-style code fences, so get the base
     *    token consumption of each of those.
     * 2. Keep looping through the files. Each time, add one line from each file
     *    until either we're out of lines (anyHadLinesToExpand=false) or until
     *    the next line would cause us to exceed our token budget.
     *
     * This always will produce files that are under the budget because
     * tokenization can cause content on multiple lines to 'merge', but it will
     * never exceed the budget.
     *
     * (`tokenLength(a) + tokenLength(b) <= tokenLength(a + b)` in all current
     * tokenizers.)
     */
    async getExpandedFiles(sizing) {
        const files = this.props.files.map(f => new FileContextTracker(f.document, f.line));
        let tokenCount = 0;
        // count the base amount of tokens used by the files:
        for (const file of files) {
            tokenCount += await file.tokenCount(sizing);
        }
        while (true) {
            let anyHadLinesToExpand = false;
            for (const file of files) {
                const nextLine = file.nextLine();
                if (nextLine === undefined) {
                    continue;
                }
                anyHadLinesToExpand = true;
                const nextTokenCount = await sizing.countTokens(nextLine);
                if (tokenCount + nextTokenCount > sizing.tokenBudget) {
                    return files;
                }
                file.expand();
                tokenCount += nextTokenCount;
            }
            if (!anyHadLinesToExpand) {
                return files;
            }
        }
    }
}
class FileContextTracker {
    document;
    originLine;
    prefix;
    suffix = '\n```\n';
    lines = [];
    aboveLine;
    belowLine;
    nextLineIs = 'above';
    constructor(document, originLine) {
        this.document = document;
        this.originLine = originLine;
        this.aboveLine = this.originLine;
        this.belowLine = this.originLine;
        this.prefix = `# ${this.document.fileName}\n\`\`\`\n`;
    }
    /** Counts the length of the current data. */
    async tokenCount(sizing) {
        const before = await sizing.countTokens(this.prefix);
        const after = await sizing.countTokens(this.suffix);
        return before + after;
    }
    /** Gets the next line that will be added on the following `expand` call. */
    nextLine() {
        switch (this.nextLineIs) {
            case 'above':
                return this.document.lineAt(this.aboveLine).text + '\n';
            case 'below':
                return this.document.lineAt(this.belowLine).text + '\n';
            case 'none':
                return undefined;
        }
    }
    /** Adds in the 'next line' */
    expand() {
        if (this.nextLineIs === 'above') {
            this.lines.unshift(this.document.lineAt(this.aboveLine).text);
            if (this.belowLine < this.document.lineCount - 1) {
                this.belowLine++;
                this.nextLineIs = 'below';
            }
            else if (this.aboveLine > 0) {
                this.aboveLine--;
            }
            else {
                this.nextLineIs = 'none';
            }
        }
        else if (this.nextLineIs === 'below') {
            this.lines.push(this.document.lineAt(this.belowLine).text);
            if (this.aboveLine > 0) {
                this.aboveLine--;
                this.nextLineIs = 'above';
            }
            else if (this.belowLine < this.document.lineCount - 1) {
                this.belowLine++;
            }
            else {
                this.nextLineIs = 'none';
            }
        }
    }
    /** Gets the file content as a string. */
    toString() {
        return this.prefix + this.lines.join('\n') + this.suffix;
    }
}
//# sourceMappingURL=fileContext.js.map