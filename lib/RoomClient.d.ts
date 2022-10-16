import * as mediasoupClient from 'mediasoup-client';
import { Listener } from './Listener';
export declare class RoomClient {
    device: mediasoupClient.types.Device | undefined;
    sendTransport: mediasoupClient.types.Transport | undefined;
    recvTransport: mediasoupClient.types.Transport | undefined;
    micProducer: mediasoupClient.types.Producer | undefined;
    webcamProducer: mediasoupClient.types.Producer | undefined;
    screenProducer: mediasoupClient.types.Producer | undefined;
    consumers: Record<string, any>;
    eventId: number;
    requestJoinCallback: Function | undefined;
    responseRequestJoinCallback: Function | undefined;
    speaker: any | undefined;
    listener: Listener | undefined;
    text: string | undefined;
    callbackRecognizing: any;
    callbackRecognized: any;
    constructor(eventId: number, callbackRecognizing: any, callbackRecognized: any);
    close(): void;
    open(): void;
    initTranslation(key: string, userLanguage?: string, translationLanguage?: string): Promise<void>;
    onTextRecognizing(text: string): void;
    onTextRecognized(result: any): void;
    onRecognizingText(data: any): void;
    onRecognizedText(data: any): Promise<void>;
    initDevice(): Promise<void>;
    static enumerateDevices(): Promise<Map<any, any>>;
}
