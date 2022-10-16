"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomClient = void 0;
const mediasoupClient = require("mediasoup-client");
const Listener_1 = require("./Listener");
class RoomClient {
    constructor(eventId, callbackRecognizing, callbackRecognized) {
        this.consumers = new Map();
        this.eventId = eventId;
        this.callbackRecognizing = callbackRecognizing;
        this.callbackRecognized = callbackRecognized;
    }
    close() {
        var _a, _b, _c;
        console.log(this.listener);
        (_a = this.listener) === null || _a === void 0 ? void 0 : _a.stopListening();
        (_b = this.sendTransport) === null || _b === void 0 ? void 0 : _b.close();
        (_c = this.recvTransport) === null || _c === void 0 ? void 0 : _c.close();
    }
    open() {
        var _a;
        console.log(this.listener);
        (_a = this.listener) === null || _a === void 0 ? void 0 : _a.startFunc();
    }
    initTranslation(key, userLanguage = 'en-US', translationLanguage = 'vi-VN') {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise(resolve => setTimeout(resolve, 2000));
            const region = 'southeastasia';
            this.listener = new Listener_1.Listener(userLanguage, translationLanguage, key, region);
            console.log('START');
            console.log(translationLanguage);
            console.log(userLanguage);
            console.log(key);
            console.log(region);
            this.listener.onText(this.onTextRecognizing.bind(this));
            this.listener.onTextRecognized(this.onTextRecognized.bind(this));
            // this.close.bind(this.listener)
            // this.listener.onTextRecognized(this.onRecognizedText.bind(this));
            this.listener.startListening();
        });
    }
    onTextRecognizing(text) {
        this.callbackRecognizing(text);
    }
    onTextRecognized(result) {
        this.callbackRecognized(result.translations['privMap']['privValues'][0]);
    }
    onRecognizingText(data) {
        console.log('onRecognizingText ', data);
    }
    onRecognizedText(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = data.data;
            let phraseText = `<br><br>Host: ${result.text}`;
            phraseText += `<br><b>${result.translationText}</b>`;
        });
    }
    initDevice() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('init device');
            this.device = new mediasoupClient.Device();
        });
    }
    static enumerateDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = new Map();
            const devices = yield navigator.mediaDevices.enumerateDevices();
            devices.forEach((device) => {
                if (!result.has(device.kind)) {
                    result.set(device.kind, new Map());
                }
                result.get(device.kind).set(device.deviceId, device);
            });
            return result;
        });
    }
}
exports.RoomClient = RoomClient;
