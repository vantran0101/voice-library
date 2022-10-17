import * as mediasoupClient from 'mediasoup-client';
import { Listener } from './Listener';

export class RoomClient {
    device: mediasoupClient.types.Device | undefined;
    sendTransport: mediasoupClient.types.Transport | undefined;
    recvTransport: mediasoupClient.types.Transport | undefined;
    micProducer: mediasoupClient.types.Producer | undefined;
    webcamProducer: mediasoupClient.types.Producer | undefined;
    screenProducer: mediasoupClient.types.Producer | undefined;
    consumers: Record<string, any> = new Map();
    requestJoinCallback: Function | undefined;
    responseRequestJoinCallback: Function | undefined;
    speaker: any | undefined;
    listener: Listener | undefined;
    text: string | undefined;
    callbackRecognizing: any;
    callbackRecognized: any;


    constructor(callbackRecognizing: any, callbackRecognized: any) {
        this.callbackRecognizing = callbackRecognizing;
        this.callbackRecognized = callbackRecognized;
    }

    close() {
        console.log(this.listener);
        this.listener?.stopListening();
        this.sendTransport?.close();
        this.recvTransport?.close();
    }

    open() {
        console.log(this.listener);
        this.listener?.startFunc();
    }

    async initTranslation(key: string, translationLanguage: string = 'en-US', userLanguage: string = 'vi-VN') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const region = 'southeastasia';

        this.listener = new Listener(userLanguage, translationLanguage, key, region);
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
    }

    onTextRecognizing(text: string) {
        this.callbackRecognizing(text)
    }

    onTextRecognized(result: any) {
        this.callbackRecognized(result.translations['privMap']['privValues'][0])
    }

    onRecognizingText(data: any) {
        console.log('onRecognizingText ', data);
    }

    async onRecognizedText(data: any) {
        const result = data.data
        let phraseText = `<br><br>Host: ${result.text}`;
        phraseText += `<br><b>${result.translationText}</b>`;
    }

    async initDevice() {
        console.log('init device');
        this.device = new mediasoupClient.Device();

    }

    static async enumerateDevices() {
        const result = new Map();

        const devices = await navigator.mediaDevices.enumerateDevices();

        devices.forEach((device) => {
            if (!result.has(device.kind)) {
                result.set(device.kind, new Map());
            }

            result.get(device.kind).set(device.deviceId, device);
        });

        return result;
    }

}
