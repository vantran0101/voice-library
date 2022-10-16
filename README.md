<p>
<h1 align="center">
  speech-recognition-heitech
</h1>
<p>
<p align="center" style="font-size: 1.2rem;">A library that converts speech from the microphone to text and make voice from text that used in React.js components.</p>

<hr />

## Table of contents
* [How it works](#how-it-works)
* [Usage](#usage)
    - [textRecognizing](#textRecognizing)
    - [textRecognized](#textRecognized)
* [Init listening + speaking](#init-listening-+-speaking)
* [Others functions Client Room](#others-functions-client-room)
* [Lists devices](#lists-devices)

## How it works
It uses [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition). Note that browser support for this API is currently limited, with Chrome having the best experience - see [supported browsers](#supported-browsers) for more information.

`RoomClient` for listening from microphone, convert to text (+ translate to the choosen language). It also provides functions to speak the selected text.


## Usage
```ts
Import `RoomClient` from `react-speech-recognition-heitech`

const App = () => {
    UseEffect(()=>{
        const voiceRecognition = new RoomClient(key, region, (textRecognizing:string)=>{callbackonTextRecognizing(textRecognizing)},  (textRecognized)=>{callbackOnTextRecognized(textRecognized)});
    },[])
    return ()
}
```
You can get text with 2 functions callbackOnTextRecognizing, callbackOnTextRecognized:
### textRecognizing: string
### textRecognized 
    .privTranslations: 
    {
        privMap{
            privKeys: 'vi',
            privValues: 'Xin chào'
        }
    }

## Init listening + speaking:
```ts
Import `RoomClient` from `react-speech-recognition-heitech`

const Room = () => {

  const callbackonTextRecognizing = (e: string) => {
    console.log('callbackonTextRecognizing ', e);

  }
  const callbackOnTextRecognized = (e: Object) => {
    console.log('callbackOnTextRecognized ', e);
  }

   UseEffect(() => {
    const voiceRecognition = new RoomClient(
      key,
      region,
      (textRecognizing: string) => callbackonTextRecognizing(textRecognizing),
      (textRecognized: object) => callbackOnTextRecognized(textRecognized)
    );

    // init listener + speaker and translation
    // you can find out the language here: https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support
    voiceRecognition.initTranslation('vi-VN', 'en-US');
  }, [])

  return (
    // JSX here
  )
}

  
```

* log
```ts
callbackonTextRecognizing  Hello
callbackonTextRecognizing  Hello we
callbackonTextRecognizing  Hello we are 
callbackonTextRecognizing  Hello we are heitech
```
```ts
callbackOnTextRecognized  
    TranslationRecognitionResult {
        privDuration: 18000,
        privText: "Hello we are heitech",
        privTranslations: {
            privMap: {
                privValues: ['Xin chào chúng tôi là heitech']
            }
        }
    }
```

<h3> You can use redux to storage the textRecognized:</h3>

<b>action.ts</b>
```ts
export const onSpeech = (data: string) => ({
  type: TYPES.POST_SPEECH,
  payload: data
});

export const onSpeechFinished = (data: string) => ({
  type: TYPES.POST_SPEECH_FINISHED,
  payload: data
});
```
<b>reducer.ts</b>
```ts
switch (action.type) {
    case TYPES.POST_SPEECH:
      return {
        ...state,
        speeching: action.payload,
        error: '',
      };
      
    case TYPES.POST_SPEECH_FINISHED:
      return {
        ...state,
        textRecognized: action.payload,
        error: '',
      };

    default:
      return state;
  }
```
<b>Room.tsx</b>
```ts
const Room = () => {
  const dispatch = useDispatch();

 UseEffect(() => {
    const voiceRecognition = new RoomClient(
      key,
      region,
      (textRecognizing: string) => dispatch(onSpeech(textRecognizing)),
      (textRecognized: object) => dispatch(onSpeechFinished(textRecognizing))
    );

    voiceRecognition.initTranslation('vi-VN', 'en-US');
  }, [])


  return (
  // JSX here
  )
 }
```

### Others functions Client Room:
- voiceRecognition.changeLanguage(language)
- voiceRecognition.changetranslationLanguage(language)
- voiceRecognition.startListening()
- voiceRecognition.stopListening()
- voiceRecognition.onSpeakResult()

## Lists devices:
```ts
voiceRecognition.listDevices().then(data => {
  console.log(data);
})
```

## Room client devices functions:
- voiceRecognition.enableMic()
- voiceRecognition.enableWebcam()
- voiceRecognition.disableMic()
- voiceRecognition.disableWebcam()

## Contributors 
From [Heitech company](https://www.hei.io/company) :
- [Trang Truong](https://github.com/hei-trang-truong)
- [Van Tran. H](https://github.com/vantran0101)
## License

MIT
