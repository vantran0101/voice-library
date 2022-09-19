import * as mediasoupClient from 'mediasoup-client';
import { Listener } from './Listener';
// import { Speaker } from './Speaker';



const WEBCAM_SIMULCAST_ENCODINGS = [
    {
        rid: 'r0',
        maxBitrate: 100000,
        //scaleResolutionDownBy: 10.0,
        scalabilityMode: 'S1T3',
    },
    {
        rid: 'r1',
        maxBitrate: 300000,
        scalabilityMode: 'S1T3',
    },
    {
        rid: 'r2',
        maxBitrate: 900000,
        scalabilityMode: 'S1T3',
    },
];

const VIDEO_CONSTRAINS = {
    qvga: {
        width: {
            ideal: 320,
        },
        height: {
            ideal: 240,
        },
    },
    vga: {
        width: {
            ideal: 640,
        },
        height: {
            ideal: 480,
        },
    },
    hd: {
        width: {
            ideal: 1280,
        },
        height: {
            ideal: 720,
        },
    },
};

export class RoomClient {
    device: mediasoupClient.types.Device | undefined;
    sendTransport: mediasoupClient.types.Transport | undefined;
    recvTransport: mediasoupClient.types.Transport | undefined;
    micProducer: mediasoupClient.types.Producer | undefined;
    webcamProducer: mediasoupClient.types.Producer | undefined;
    screenProducer: mediasoupClient.types.Producer | undefined;
    consumers: Record<string, any> = new Map();
    store: any;
    userStore: any;
    eventId: number;
    useWebcam: boolean = true;
    useMic: boolean = true;
    requestJoinCallback: Function | undefined;
    responseRequestJoinCallback: Function | undefined;
    speaker: any | undefined;
    listener: Listener | undefined;
    text: string | undefined;

    constructor(eventId: number, store: any, userStore: any) {
        this.eventId = eventId;
        this.store = store;
        this.userStore = userStore;
    }

    close() {
        this.speaker?.destroySpeaker();
        this.listener?.stopListening();
        this.sendTransport?.close();
        this.recvTransport?.close();
        this.store?.reset();
        this.userStore?.reset();
    }

    async initTranslation(userLanguage: any, translationLanguage: any) {
        const key = '9a5ce85f10a64d86a0eb9e15be562249';
        const region = 'southeastasia';

        // this.speaker = new Speaker(translationLanguage.service, key, region, this);
        // this.speaker.createSpeaker();

        this.listener = new Listener('vi-VN', 'en-US', key, region, this.store);
        console.log('START');
        console.log(translationLanguage.service);
        console.log(userLanguage.service);
        console.log(key);
        console.log(region);
        this.listener.onText(this.onTextRecognizing.bind(this));
        this.listener.onTextRecognized(this.onTextRecognized.bind(this));
        // this.listener.onTextRecognized(this.onRecognizedText.bind(this));
        this.listener.startListening();
    }

    onTextRecognizing(text: string) {
        console.log('onTextRecognizing ', text);

        const recognizingText = this.store.recognizingText.replace(/(.*)(^|[\r\n]+).*\[\.\.\.\][\r\n]+/, '$1$2') + `${text} [...]\r\n`;
        this.store.setRecognizingText(recognizingText);
    }

    onTextRecognized(result: any) {
        this.text = '';
        console.log('onTextRecognized ', result);
        if (!result.text) return;
        const data = { text: result.text, translationText: '', language: this.store.translationLanguage }
        let phraseText = `<br><br>Host: ${data.text}`;
        if (result.translations) {
            var resultJson = JSON.parse(result.json);
            resultJson['privTranslationPhrase']['Translation']['Translations'].forEach((translation: any) => {
                data.translationText += translation.Text;
                this.store.pushLastestSub(translation.Text);
            });
        }
        phraseText += `<br><b>${data.translationText}</b>`;
        this.text = phraseText;

        this.store.pushPhraseDiv(phraseText);
        this.store.setRecognizingText('');
    }

    onTranslatedText(data: any) {
        console.log(data);
        this.store.newTranslation(data);

        // Do not speak current user's text
        if (data.peerId !== this.store.currentPeer.id) {
            this.speaker?.speak(data.translatedText);
        }
    }

    onRecognizingText(data: any) {
        console.log('onRecognizingText ', data);
        // if (this.store.isCurrentRoleHost) return;
        // this.store.setRecognizingText(data.text);
        // Do not speak current user's text
        // this.speaker?.speak(data.text);
    }

    async onRecognizedText(data: any) {
        const result = data.data
        if (this.store.isCurrentRoleHost && this.store.fullScreenSubRole == this.userStore.currentUser.email) {
            // await this.mute();
            this.speaker?.hostSpeak(result.translationText, result.language);
            // let duration = 0;
            // const interval = await setInterval(() => {
            //   duration = this.speaker?.duration || 0;
            //   if (duration != 0) {
            //     clearInterval(interval);
            //     setTimeout(() => {
            //       this.unmute();
            //       this.speaker?.onSpeakFinish(0);
            //     }, duration / 10000);
            //   }
            // }, 100);
            return;
        }
        if (this.store.isCurrentRoleHost) return;
        let phraseText = `<br><br>Host: ${result.text}`;
        phraseText += `<br><b>${result.translationText}</b>`;
        this.store.pushPhraseDiv(phraseText);
        this.speaker?.speak(result.translationText, result.language);
        this.store.setRecognizingText('');
    }

    async initDevice() {
        console.log('init device');
        this.device = new mediasoupClient.Device();

    }

    async enableMic() {
        if (this.micProducer) return true;

        if (!this.device?.canProduce('audio')) {
            console.log('Cannot produce audio');
            return false;
        }

        let track;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            track = stream.getAudioTracks()[0];

            this.micProducer = await this.sendTransport?.produce({
                track,
                codecOptions: {
                    opusStereo: true,
                    opusDtx: true,
                },
            });

            this.micProducer?.on('transportclose', () => {
                this.micProducer = undefined;
            });

            this.store.setMuted(false);

            return true;
        } catch (err) {


            return false;
        }
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

    async enableWebcam() {
        if (this.webcamProducer) return true;

        if (!this.device?.canProduce('video')) {
            return false;
        }

        let track;

        try {
            const webcams = await RoomClient.enumerateDevices();
            const device = webcams.get('videoinput').size ? webcams.get('videoinput').values().next().value : null;

            if (!device) {
                throw new Error('No webcam device');
            }

            const resolution = 'hd';
            const encodings = WEBCAM_SIMULCAST_ENCODINGS;

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: {
                        ideal: device.deviceId,
                    },
                    ...VIDEO_CONSTRAINS[resolution],
                },
            });

            track = stream.getVideoTracks()[0];

            this.webcamProducer = await this.sendTransport?.produce({
                track,
                encodings,
                codecOptions: {
                    videoGoogleStartBitrate: 1000,
                },
            });

            this.webcamProducer?.on('transportclose', () => {
                this.webcamProducer = undefined;
            });

            this.webcamProducer?.on('trackended', () => {
                this.disableWebcam();
            });

            return true;
        } catch (err) {
            if (track) {
                track.stop();
            }
            return false;
        }
    }

    async disableWebcam() {
        if (!this.webcamProducer) return true;

        this.webcamProducer?.close();

        this.webcamProducer = undefined;
        return true;
    }

}
