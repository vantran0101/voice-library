import './scriptjs';
declare type OnTextCallback = (text: string) => void;
declare type OnTextRecognizedCallback = (text: string) => void;
export declare class Listener {
    listenLanguage: string;
    translationLanguage: string;
    key: string;
    region: string;
    recognizer: any | null;
    onTextCallback: OnTextCallback;
    OnTextRecognizedCallback: OnTextRecognizedCallback;
    lastOffset: number;
    lastDuration: number;
    lastText: string;
    isEmitInLastCallback: boolean;
    lastEmittedText: string;
    constructor(translationLanguage: string, listenLanguage: string, key: string, region: string);
    changeLanguage(language: any): void;
    changetranslationLanguage(translationLanguage: any): void;
    startListening(): void;
    startFunc(): void;
    stopListening(): void;
    onText(callback: OnTextCallback): void;
    onTextRecognized(callback: OnTextRecognizedCallback): void;
    private _recognizingCallback;
    private _recognizingNewCallback;
    private _recognizerCallback;
}
export {};
