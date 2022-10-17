"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listener = void 0;
// @ts-nocheck
// import { AudioConfig, ResultReason, SpeechConfig, SpeechRecognizer, SpeechRecognitionEventArgs, Recognizer } from 'microsoft-cognitiveservices-speech-sdk';
const lodash_1 = require("lodash");
require("./scriptjs");
class Listener {
    constructor(translationLanguage, listenLanguage, key, region) {
        this.lastOffset = 0;
        this.lastDuration = 0;
        this.lastText = '';
        this.isEmitInLastCallback = false;
        this.lastEmittedText = '';
        this.translationLanguage = translationLanguage;
        this.listenLanguage = listenLanguage;
        this.key = key;
        this.region = region;
        this.recognizer = null;
        this.onTextCallback = lodash_1.noop;
        this.OnTextRecognizedCallback = lodash_1.noop;
    }
    changeLanguage(language) {
        this.listenLanguage = language;
        this.startListening();
    }
    changetranslationLanguage(translationLanguage) {
        this.translationLanguage = translationLanguage;
        this.startListening();
    }
    startListening() {
        this.stopListening();
        this.lastOffset = 0;
        this.lastDuration = 0;
        this.lastText = '';
        this.lastEmittedText = '';
        const speechConfig = window.SpeechSDK.SpeechTranslationConfig.fromSubscription('9a5ce85f10a64d86a0eb9e15be562249', 'southeastasia');
        speechConfig.speechRecognitionLanguage = this.listenLanguage;
        speechConfig.addTargetLanguage(this.translationLanguage);
        console.log('Start listening ', speechConfig);
        const audioConfig = window.SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        this.recognizer = new window.SpeechSDK.TranslationRecognizer(speechConfig, audioConfig);
        this.recognizer.recognized = this._recognizerCallback.bind(this);
        this.recognizer.recognizing = this._recognizingNewCallback.bind(this);
        console.log('THIS RECOGNIZER ', this.recognizer);
        this.recognizer.startContinuousRecognitionAsync();
        console.log('nice');
    }
    startFunc() {
        if (!this.recognizer) {
            return;
        }
        this.recognizer.startContinuousRecognitionAsync();
    }
    stopListening() {
        if (!this.recognizer) {
            return;
        }
        this.recognizer.stopContinuousRecognitionAsync();
        // this.recognizer.close();
        // this.recognizer = null;
    }
    onText(callback) {
        this.onTextCallback = callback;
    }
    onTextRecognized(callback) {
        this.OnTextRecognizedCallback = callback;
    }
    _recognizingCallback(_, event) {
        console.log(event);
        const result = event.result;
        const reason = window.SpeechSDK.ResultReason[result.reason];
        if (reason !== 'RecognizingSpeech' && reason !== 'RecognizedSpeech') {
            return;
        }
        const intervalTicks = 30000000;
        const offset = result.offset;
        const duration = result.duration;
        if (this.lastOffset !== offset) {
            console.log('new offset', this.lastOffset, this.lastDuration, this.lastText, this.lastEmittedText, this.isEmitInLastCallback);
            // New offset (also means new sentence after a silent)
            const text = result.text.trim().toLowerCase();
            if (!this.isEmitInLastCallback) {
                console.log('emit last sentence');
                // Speak last sentence because it < intervalTicks
                this.onTextCallback(this.lastText);
                this.lastEmittedText = this.lastText;
            }
            this.lastText = text;
        }
        else {
            console.log('old offset', this.lastOffset, this.lastDuration, this.lastText, this.lastEmittedText);
            // Same offset
            const text = result.text.trim().toLowerCase();
            console.log('new off + duration', offset, duration, text);
            if (duration > this.lastDuration + intervalTicks && text.length) {
                console.log('meet interval');
                // Time passed interval
                const index = text.indexOf(this.lastEmittedText, 0);
                let toEmitText = text;
                if (index !== -1) {
                    toEmitText = text.substring(index + this.lastEmittedText.length);
                }
                if (toEmitText.length) {
                    this.onTextCallback(toEmitText);
                }
                this.lastEmittedText = text;
                this.isEmitInLastCallback = true;
            }
            else {
                this.isEmitInLastCallback = false;
            }
        }
        this.lastDuration = duration;
        this.lastOffset = offset;
    }
    _recognizingNewCallback(_, event) {
        // console.log('_recognizingNewCallback');
        this.onTextCallback(event.result.text);
        return;
        const result = event.result;
        const reason = window.SpeechSDK.ResultReason[result.reason];
        if (reason !== 'RecognizingSpeech' && reason !== 'RecognizedSpeech') {
            return;
        }
        // Ignore empty string
        if (!result.text.trim().length) {
            return;
        }
        this.onTextCallback(result.text.trim());
    }
    _recognizerCallback(_, event) {
        // console.log('_recognizerCallback');
        this.OnTextRecognizedCallback(event.result);
        // console.log(event.result);
        return;
        console.log(event);
        const result = event.result;
        const reason = window.SpeechSDK.ResultReason[result.reason];
        if (reason !== 'RecognizingSpeech' && reason !== 'RecognizedSpeech') {
            return;
        }
        // Ignore empty string
        if (!result.text.trim().length) {
            return;
        }
        this.onTextCallback(result.text.trim());
    }
}
exports.Listener = Listener;
