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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const simple_1 = require("./simple");
const tools_1 = require("./tools");
const EventService_1 = require("./services/EventService");
const lodash_1 = __importDefault(require("lodash"));
function activate(context) {
    console.log("activateddddddddddddddddddddddddddddddddddddddddddddd chat-simple");
    (0, EventService_1.activateWindowEvent)();
    (0, simple_1.registerSimpleParticipant)(context);
    // registerToolUserChatParticipant(context);
    // registerChatLibChatParticipant(context);
    (0, tools_1.registerChatTools)(context);
    const evet = new vscode.EventEmitter();
    const deepSeekProvider = {
        provideLanguageModelResponse: async (messages, options, extensionId, progress, token) => {
            console.log("register chat responsssssssssssssssssssssssssss", JSON.stringify(options.modelOptions));
            const { chatRequest } = (0, EventService_1.getSiteMessage)();
            const stream = true;
            const res = await chatRequest({
                messages,
                persistence: false,
                stream,
                model: 'deepseek-chat'
            });
            // const res: any = await DataRouterService.chat({
            //     messages,
            //     persistence: false,
            //     stream,
            //     model: 'deepseek-chat'
            // })
            let chunks = [];
            const onDataEnd = (content, id, reasoning_content) => {
                progress.report({
                    index: chunks.length - 1,
                    part: new vscode.LanguageModelTextPart(content)
                });
            };
            if (!stream) {
                const cck = res.choices[0].message.content;
                const cckr = res.choices[0].message.reasoning_content;
                onDataEnd(cck, res.chatId, cckr);
                return;
            }
            const onData = () => {
                let cck = '';
                let cckr = '';
                // for (const chunk of chunks) {
                //     cck += chunk.choices[0].delta.content || ''
                //     cckr += chunk.choices[0].delta.reasoning_content || ''
                // }
                cck = chunks[chunks.length - 1].choices[0].delta.content || '';
                cckr = chunks[chunks.length - 1].choices[0].delta.reasoning_content || '';
                onDataEnd(cck, chunks[0].chatId, cckr);
            };
            let lastChunk = '';
            res.on('data', (ck) => {
                const textDecoder = new TextDecoder();
                try {
                    let ck2 = lastChunk + textDecoder.decode(ck);
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
                            onData();
                            lastChunk = '';
                        }
                        else if (chunk.trim().length) {
                            // console.log("chunksss2", chunk)
                            try {
                                lastChunk = chunk;
                                const pc = JSON.parse(chunk);
                                chunks.push(pc);
                                onData();
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
            res.on('end', () => {
                try {
                    console.log("deepseek end", chunks);
                    let cck = '';
                    for (const chunk of chunks) {
                        cck += chunk.choices[0].delta.content;
                    }
                }
                catch (e) {
                    console.log("deepseek on data end error", e);
                }
            });
        },
        onDidReceiveLanguageModelResponse2: evet.event,
        provideTokenCount: async (text, token) => {
            console.log("register chat responsssssssssssssssssssssssssss3", text);
            if (text instanceof vscode.LanguageModelChatMessage) {
                const cc = text.content;
                let sum = 0;
                for (const c of cc) {
                    if (c instanceof vscode.LanguageModelTextPart) {
                        sum += c.value.length;
                    }
                    else if (c instanceof vscode.LanguageModelToolResultPart) {
                        sum += c.content.length;
                    }
                    else {
                        sum += c.name.length;
                    }
                }
                return sum;
            }
            else {
                return text.length;
            }
        }
    };
    const metatdata = {
        vendor: 'jellyvai',
        name: 'deepseek',
        family: 'openai',
        version: '1',
        maxInputTokens: 99999999999,
        maxOutputTokens: 9999999999,
        isUserSelectable: true,
        capabilities: {
            vision: true,
            toolCalling: true,
            agentMode: true
        },
        isDefault: true
    };
    vscode.chat.registerChatResponseProvider('jellyvai', deepSeekProvider, metatdata);
    let mockSendCount = 0;
    const provider2 = {
        provideLanguageModelResponse: async (messages, options, extensionId, progress, token) => {
        },
        onDidReceiveLanguageModelResponse2: evet.event,
        provideTokenCount: async (text, token) => {
            let result = 0;
            if (lodash_1.default.isObject(text)) {
                const cc = text.content;
                let sum = 0;
                for (const c of cc) {
                    if (lodash_1.default.has(c, 'value') && lodash_1.default.isString(c.value)) {
                        sum += c.value.length;
                    }
                    else if (lodash_1.default.has(c, 'content') && lodash_1.default.isArray(c.content)) {
                        for (const cm of c.content) {
                            if (lodash_1.default.has(cm, 'value') && lodash_1.default.isString(cm.value))
                                sum += cm.value.length;
                        }
                    }
                    else if (lodash_1.default.has(c, 'name') && lodash_1.default.isString(c.name)) {
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
    const metadata2 = {
        ...metatdata,
        name: 'test-echo',
        isDefault: false
    };
    vscode.chat.registerChatResponseProvider('jellyvai2', provider2, metadata2);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map