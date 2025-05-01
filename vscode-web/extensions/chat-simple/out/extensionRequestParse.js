"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.myChatProvider = exports.providerResponse = void 0;
const vscode = __importStar(require("vscode"));
const _ = __importStar(require("lodash"));
const mockres_1 = require("./common/mockres");
const mockres1_1 = require("./common/mockres1");
const DataRouterService_1 = require("./services/DataRouterService");
const evet = new vscode.EventEmitter();
const providerResponse = async (messages, options, extensionId, progress, token, myprogress) => {
    console.log("register chat responsssssssssssssssssssssssssss", JSON.stringify(options.modelOptions));
    const stream = true;
    const res = await DataRouterService_1.DataRouterService.chat({
        messages,
        persistence: false,
        stream,
        model: 'deepseek-chat'
    });
    // const res: any = ''
    let chunks = [];
    const onDataEnd = async (content, id, reasoning_content, isEnd) => {
        console.log("on chunk end", content);
        // progress.report({
        await myprogress.report({
            index: chunks.length - 1,
            isEnd,
            part: new vscode.LanguageModelTextPart(content)
        });
    };
    if (!stream) {
        const cck = res.choices[0].message.content;
        const cckr = res.choices[0].message.reasoning_content;
        onDataEnd(cck, res.chatId, cckr);
        return;
    }
    const onData = async (isEnd) => {
        let cck = '';
        let cckr = '';
        // for (const chunk of chunks) {
        //     cck += chunk.choices[0].delta.content || ''
        //     cckr += chunk.choices[0].delta.reasoning_content || ''
        // }
        cck = chunks[chunks.length - 1].choices[0].delta.content || '';
        cckr = chunks[chunks.length - 1].choices[0].delta.reasoning_content || '';
        await onDataEnd(cck, chunks[0].chatId, cckr, isEnd);
    };
    function concatMultipleUint8Arrays(...arrays) {
        let totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
        let result = new Uint8Array(totalLength);
        let offset = 0;
        for (let arr of arrays) {
            result.set(arr, offset);
            offset += arr.length;
        }
        return result;
    }
    let lastChunk = '';
    let latsChunkBuffer = new Uint8Array(0);
    res.on('data', async (ck) => {
        const textDecoder = new TextDecoder();
        const textEncoder = new TextEncoder();
        try {
            // let ck2 = lastChunk + textDecoder.decode(ck)
            const combinedBuffer = concatMultipleUint8Arrays(latsChunkBuffer, ck);
            let ck2 = lastChunk + textDecoder.decode(combinedBuffer, { stream: true });
            const enk2 = textEncoder.encode(ck2);
            if (enk2.length < ck.length) {
                latsChunkBuffer = ck.slice(enk2.length);
            }
            else {
                latsChunkBuffer = new Uint8Array(0);
            }
            // console.log("chunksss0", ck2)
            for (const chunk of ck2.split("\n\n")) {
                const index1 = chunk.indexOf('data:');
                const index2 = chunk.indexOf('{');
                if (chunk.match(/data:\s+\[DONE\]/)) {
                    // end ignore
                }
                else if (index1 > -1 && index1 < index2) {
                    // console.log("chunksss", chunk.slice(index1 + 5))
                    lastChunk = chunk;
                    const pc = JSON.parse(chunk.slice(index1 + 5));
                    chunks.push(pc);
                    await onData();
                    lastChunk = '';
                }
                else if (chunk.trim().length) {
                    // console.log("chunksss2", chunk)
                    try {
                        lastChunk = chunk;
                        const pc = JSON.parse(chunk);
                        chunks.push(pc);
                        await onData();
                        lastChunk = '';
                    }
                    catch (e) {
                        // keep-alive ?
                        console.log("chunksss2", chunk);
                    }
                }
            }
        }
        catch (e) {
            console.log("deepseek on data error, will parse in next chunk", e);
        }
    });
    res.on('end', async () => {
        try {
            console.log("deepseek end", chunks);
            let cck = '';
            for (const chunk of chunks) {
                cck += chunk.choices[0].delta.content;
            }
            await onData(true);
        }
        catch (e) {
            console.log("deepseek on data end error", e);
        }
    });
};
exports.providerResponse = providerResponse;
let mockSendCount = 0;
exports.myChatProvider = {
    provideLanguageModelResponse: async (messages, options, extensionId, progress, token) => {
        const systemMessage = {
            role: 'system',
            content: "我会要求你进行一系列代码编辑的任务，为了对你的回答进行解析, 当你需要对文件或文件夹操作的时候要先进行标记: 先用magic 字符串 jellyvai-sss-ooo 进行声明，然后跟着包含文件名的文件路径，再跟着进行的操作类型(move, copy, link, delete, add, modify or search),然后跟着move, copy或者link的目标(可选的)，这三部分或四部分用竖杠(|)分割(尾部也加一个竖杠表示结束), 下一步再根据需要写出文件内容(markdown 格式). 文件操作案例展示：jellyvai-sss-ooo|index.js|add| \n ```js const k = 0; ```. 文件夹操作案例展示: jellyvai-sss-ooo|myfolder/|add|， 注意文件夹名后面加斜杠(/)以区别文件操作."
        };
        console.log("register chat responsssssssssssssssssssssssssss test");
        let globalIndex = 0;
        let reqMessages = [systemMessage];
        messages.forEach(m => {
            reqMessages.push({
                role: m.role === vscode.LanguageModelChatMessageRole.Assistant ? 'assistant' : 'user',
                name: m.name,
                content: ''
            });
            const last = reqMessages[reqMessages.length - 1];
            for (let ccount = 0; ccount < m.content.length; ccount++) {
                const c = m.content[ccount];
                if (c instanceof vscode.LanguageModelTextPart) {
                    console.log(`ccount1 ${ccount}`);
                    last.content += c.value;
                }
                else if (c instanceof vscode.LanguageModelToolResultPart) {
                    console.log(`ccount2 ${ccount}`);
                    last.content += `tool(${c.callId}) call result: [${c.content.map((x) => x.value)}]`;
                }
                else if (c instanceof vscode.LanguageModelToolCallPart) {
                    console.log(`ccount3 ${ccount}`);
                    last.content += `tool ${c.name}(${c.callId}) call with params: ${JSON.stringify(c.input)}`;
                }
                else {
                    console.log(`ccount1 ${ccount}`);
                    throw Error("ooo");
                }
                if (ccount < m.content.length - 1) {
                    last.content += '\n';
                }
            }
        });
        let accumulates = {};
        async function reportTool(fops, fpath, fcontent, options) {
            // console.log(`mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmjjjjjjjjjjjjjjjjjjjjj`, fops, fpath, fcontent, options?.subOps, options?.isEnd)
            if ((fops !== 'text') && (fcontent || options?.isEnd)) {
                const id = `${fops}-${fpath}`;
                if (!accumulates[id]) {
                    accumulates[id] = '';
                }
                accumulates[id] += fcontent;
                console.log(`count of content ${id}  ${accumulates[id].length}`);
                if (options?.isEnd || accumulates[id].length > 100) {
                    fcontent = accumulates[id];
                    accumulates[id] = '';
                    if (options?.isEnd)
                        delete accumulates[id];
                }
                else {
                    return;
                }
            }
            // if(fops !== 'text')
            // console.log(`passssss`, fcontent)
            const { subOps } = options || {};
            globalIndex++; // 使用globalIndex 会导致report 卡住，看来report中的index不是这样用的
            if (fops === 'text') {
                await progress.report({
                    index: 1,
                    part: new vscode.LanguageModelTextPart(fcontent)
                });
            }
            else {
                let name = 'chat-tools-sample_createFiles';
                if (fops === 'add' || fops === 'modify') {
                    name = 'chat-tools-sample_createFiles';
                }
                else if (fops === 'search') {
                    name = 'chat-tools-sample_findFiles';
                }
                else if (fops === 'delete') {
                    name = 'chat-tools-sample_deleteFiles';
                }
                else if (fops === 'copy') {
                    name = 'chat-tools-sample_copyFiles';
                }
                else if (fops === 'move') {
                    name = 'chat-tools-sample_moveFiles';
                }
                else if (fops === 'link') {
                    name = 'chat-tools-sample_linkFiles';
                }
                await progress.report({
                    index: 1,
                    part: new vscode.LanguageModelToolCallPart('tool0', name, {
                        filename: fpath, content: fcontent, subOps, isEnd: options?.isEnd, dest: options?.dest
                    })
                });
            }
        }
        let ask = JSON.stringify(reqMessages);
        console.log(`recv value: eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee: ${ask}`);
        const results = [
            mockres_1.mockres,
            "waitNextTool",
            "toolEnd"
        ];
        const result = results[mockSendCount];
        mockSendCount++;
        if (mockSendCount >= results.length) {
            mockSendCount = 0;
        }
        function parseByxxxx() {
            let state = 0;
            let state2 = 0;
            let current_check = 0;
            let reptstemp = '';
            const mm = ['jellyvai-sss-ooo', '```'];
            async function parsellmText(ss) {
                let repts = '';
                // todo: 改成每个列表同时并行匹配
                for (const s of ss) {
                    reptstemp += s;
                    while (true) {
                        const m = mm[state2];
                        let STATE_END = m.length;
                        if (s === m[reptstemp.length - 1]) {
                            current_check = state2;
                            state++;
                            if (state >= STATE_END) {
                                repts += reptstemp.substring(0, reptstemp.length - (STATE_END));
                                repts += '';
                                reptstemp = '';
                                state = 0;
                            }
                            break;
                        }
                        else {
                            state = 0;
                            state2 = (state2 + 1) % mm.length;
                            if (state2 === current_check) {
                                repts += reptstemp;
                                reptstemp = '';
                                break;
                            }
                        }
                    }
                }
                repts += reptstemp.substring(0, reptstemp.length - (state));
                reptstemp = reptstemp.substring(reptstemp.length - (state));
                if (repts)
                    await reportTool('text', '', repts);
                console.log(`reptssssssssssssssssssss ${repts}`, '+++++', reptstemp);
                return reptstemp;
            }
            return parsellmText;
        }
        let parsellmText = parseByxxxx();
        const toolsToCall = [];
        let gapContent = '';
        let stop = false;
        const parsellm = async (nextAppend, part, part2) => {
            const content = nextAppend + part;
            let content2 = content;
            let content1 = '';
            while (true) {
                const needAddContent = toolsToCall.length && !toolsToCall[toolsToCall.length - 1].fcontent && (toolsToCall[toolsToCall.length - 1].fops === 'add' || toolsToCall[toolsToCall.length - 1].fops === 'modify');
                // if ((needAddContent && content2.match(/^\s*```/)) || content2.match(/jellyvai-sss-ooo/)) {
                if ((needAddContent && content2.match(/^\s*```/)) || content2.match(/jellyvai-sss-ooo/)) {
                    stop = true;
                }
                else {
                    stop = false;
                }
                const matcha = content2.match(/(^\s*```\S*\s*)([\s\S]*?)\s*```/);
                if (matcha) {
                    parsellmText = parseByxxxx();
                    const [a2, fcontentemp] = [matcha[0], matcha[2]];
                    const fcontent = fcontentemp;
                    const otherIndex = (matcha.index || 0) + a2.length;
                    content1 = content2.substring(0, otherIndex);
                    content2 = content2.substring(otherIndex);
                    if (needAddContent) {
                        toolsToCall[toolsToCall.length - 1].fcontent = fcontent;
                        const lt = toolsToCall[toolsToCall.length - 1];
                        const cix = lt.currentIndex || matcha[1].length;
                        await reportTool(lt.fops, lt.fpath, a2.substring(cix, a2.length - 3), { subOps: 'append', currentIndex: lt.currentIndex, isEnd: true });
                        console.log(`get file operations ${lt.currentIndex} ${lt.fpath} ${lt.fops} ${(fcontent || '').length}`);
                    }
                    else {
                        if (content1.length > nextAppend.length)
                            await reportTool('text', '', content1.substring(nextAppend.length));
                    }
                    nextAppend = '';
                    part2 = '';
                    stop = false;
                    continue;
                }
                else if ((needAddContent && content2.match(/^\s*```/))) {
                    const matchb = content2.match(/(^\s*```\S*\s*)([\s\S]*)/);
                    if (matchb) {
                        const lt = toolsToCall[toolsToCall.length - 1];
                        const lll = matchb[2].substring(matchb[2].length - 3);
                        const ss = content2.substring((matchb.index || 0) + matchb[1].length);
                        // console.log("00000000000000000000000000000000000", matchb[2])
                        let se = ss.length > part.length ? part : ss;
                        lt.currentIndex = matchb[0].length;
                        if (lll.match(/\s``$/)) {
                            se = se.substring(0, se.length - 3);
                            lt.currentIndex -= 3;
                        }
                        else if (lll.match(/\s`$/)) {
                            se = se.substring(0, se.length - 2);
                            lt.currentIndex -= 2;
                        }
                        await reportTool(lt.fops, lt.fpath, se, { subOps: 'append', currentIndex: lt.currentIndex, isEnd: false });
                    }
                }
                let match1;
                let match1Type;
                const match1pre = content2.match(/jellyvai-sss-ooo\s*\|\s*(.*?)\s*\|\s*(\S+)\s*\|\s*(.*?)\s*\|/);
                if (match1pre) {
                    match1Type = 0;
                    match1 = match1pre;
                }
                else {
                    const match1pre2 = content2.match(/jellyvai-sss-ooo\s*\|\s*(.*?)\s*\|\s*(\S+)\s*\|/);
                    if (match1pre2) {
                        const mt21 = match1pre2[2].trim();
                        if (!(mt21 === 'copy' || mt21 === 'move' || mt21 === 'link')) {
                            match1Type = 1;
                            match1 = match1pre2;
                        }
                    }
                }
                if (match1) {
                    parsellmText = parseByxxxx();
                    const [m1, fpath, fopstemp] = [match1[0], match1[1], match1[2]];
                    let fops = fopstemp;
                    let dest = '';
                    let otherIndex = (match1.index || 0) + m1.length;
                    content1 = content2.substring(0, match1.index || 0);
                    content2 = content2.substring(otherIndex);
                    toolsToCall.push({ fpath, fops, fcontent: '' });
                    await reportTool('text', '', content1);
                    if (!match1Type) {
                        dest = match1[3];
                    }
                    console.log(`m1`, m1);
                    console.log(`get file operations ${fpath} ${fops} ${('').length}`);
                    await reportTool(fops, fpath, '', { isEnd: fops !== 'add' && fops !== 'modify', dest });
                    nextAppend = '';
                    part2 = '';
                    stop = false;
                }
                else {
                    if (!stop)
                        part2 = await parsellmText(content2.substring(nextAppend.length));
                    break;
                }
            }
            if (!stop)
                return [part2, part2];
            return [content2, part2];
        };
        let ddd = mockres1_1.mockres1;
        let nextAppend = '';
        let nextPart = '';
        let repcontents = '';
        await new Promise(async (resolve, reject) => {
            try {
                await (0, exports.providerResponse)(reqMessages, options, extensionId, progress, token, {
                    report: async (data) => {
                        try {
                            const text = data.part.value;
                            const isEnd = data.isEnd;
                            // console.log("feed parsellm", text)
                            // console.log("feed parsellm2", nextAppend + text)
                            const [keep, repContent] = await parsellm(nextAppend, text, nextPart);
                            nextAppend = keep;
                            nextPart = repContent;
                            if (isEnd) {
                                await reportTool('text', '', keep, { isEnd: true });
                                resolve('');
                            }
                        }
                        catch (e) {
                            reject(e);
                        }
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
        // while (true) {
        //     const rd = random(0, Math.ceil(mockres.length / 100))
        //     const needBreak = ddd.length <= rd
        //     const dddsub = ddd.substring(0, rd)
        //     ddd = ddd.substring(rd)
        //     const [keep, repContent] = parsellm(nextAppend, dddsub, nextPart)
        //     nextAppend = keep
        //     nextPart = repContent
        //     if (needBreak) {
        //         reportTool('text', '', keep, { isEnd: true })
        //         break;
        //     }
        // }
        const needSendTool = !!toolsToCall.length;
        // await new Promise(res => setTimeout(() => {
        //     progress.report({
        //         index: 1,
        //         ...(!false ? { part: new vscode.LanguageModelTextPart(parsed) } :
        //         {part: new vscode.LanguageModelToolCallPart('tool0', 'chat-tools-sample_findFiles', { pattern: 'config*'}) })
        //     })
        //     res('')
        // }, (1000)))
    },
    onDidReceiveLanguageModelResponse2: evet.event,
    provideTokenCount: async (text, token) => {
        let result = 0;
        if (_.isObject(text)) {
            const cc = text.content;
            let sum = 0;
            for (const c of cc) {
                if (_.has(c, 'value') && _.isString(c.value)) {
                    sum += c.value.length;
                }
                else if (_.has(c, 'content') && _.isArray(c.content)) {
                    for (const cm of c.content) {
                        if (_.has(cm, 'value') && _.isString(cm.value))
                            sum += cm.value.length;
                    }
                }
                else if (_.has(c, 'name') && _.isString(c.name)) {
                    sum += c.name.length;
                }
            }
            result = sum;
        }
        else {
            result = text.length;
        }
        // console.log(` chat count responsssssssssssssssssssssssssss3 ${result} ${_.isObject(text)} ${text instanceof vscode.LanguageModelChatMessage}`)
        return result;
    }
};
//# sourceMappingURL=extensionRequestParse.js.map