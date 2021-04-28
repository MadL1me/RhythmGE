import { Slider, Event, Action, EmptyAction, Utils } from "./Utils";
import { Editor, IEditorModule, IEditorCore, EditorData} from "./Editor";
import { Vec2 } from "./Vec2";
import { editorColorSettings } from "./AppSettings";
import { IDrawable } from "./GridElements";

import $, { data } from 'jquery';
import { ViewportModule } from "./Viewport";
import { Transform } from "./Transform";
import { throws } from "node:assert";
import { Input } from "./Input";

const { Howl, Howler } = require('howler');

enum TimeAccuracy {
    seconds, 
    milliseconds
}

class AudioPlayerView {
    
    private audioFileName: HTMLParagraphElement;
    private audioCurrentTime: HTMLParagraphElement;
    private audioDuration: HTMLParagraphElement;
    
    private songTimeSlider = new Slider('audio-slider');
    private volumeSlider = new Slider('volume-slider');
    private audioController: AudioModule;

    onVolumeSliderChange = new Event<number>();
    onPlayButtonClick = new Event<boolean>();

    constructor(audio: AudioModule) {
        this.audioController = audio;
        this.audioFileName = $('#file-name')[0] as HTMLParagraphElement;
        this.audioCurrentTime = $('#current-audio-time')[0] as  HTMLParagraphElement;
        this.audioDuration = $('#audio-duration')[0] as HTMLParagraphElement;

        this.volumeSlider.onValueChange.addListener((value) => {this.onVolumeSliderChange.invoke(value)})
        $('#play-button').on('click', (event) => { this.onPlayClick(event.target)})
    }

    onAudioLoad(fileName: string, duration: number) {
        this.audioFileName.innerHTML = fileName;
        this.audioCurrentTime.innerHTML = '0:00';
        this.audioDuration.innerHTML = this.formatTime(duration, TimeAccuracy.seconds);
        this.songTimeSlider.maxValue = duration*100;
    }

    update(currentTime: number) {
        this.audioCurrentTime.innerHTML = this.formatTime(currentTime, TimeAccuracy.seconds);
        this.songTimeSlider.value = currentTime*100;
    }

    private onPlayClick(playBtn) {
        playBtn.classList.add('paused');

        if (this.audioController.isPlaying() == true) {
            playBtn.classList.remove('paused');
            this.audioController.pause();
        }
        else {
            this.audioController.play();
        }
    }
    
    private formatTime(time: number, accuracy: TimeAccuracy) : string {
        var minutes = Math.floor(time/60);
        var seconds = Math.floor(time - minutes*60) as any;
        var milliseconds = time % 1;
        
        if (seconds < 10)
            seconds = '0' + seconds.toString();

        if (accuracy == TimeAccuracy.milliseconds)
            return minutes + ':' + seconds + ':' + milliseconds;
        else 
            return minutes + ':' + seconds;
    }
}


export interface IAudioModule extends IEditorModule {
    onAudioLoaded: Event<[string, string]>;
    onLoad: Event<number>;
    onSeek: Event<number>;
    onPlay: Event<number>;
    onStop: Event<number>;
    bufferSource: AudioBufferSourceNode;

    loadAudio(fileName: string, soundPath : string);
    setPlaybackRate(value: number);

    duration(): number;
    isAudioLoaded() : boolean;
    isPlaying(): boolean;

    setClapTimings(array: number[]);

    play();
    pause();
    seek();

    getDomainData() : Float32Array;
    getSpectrumData(): Uint8Array;
    setMusicFromCanvasPosition(position : Vec2, editor : IEditorCore) 
}

export class AudioModule implements IAudioModule {

    transform = new Transform();

    private clapSource = new Howl({src:[__dirname+"/Resources/clap.wav"]});
    private songSource : any;

    private soundId : number;
    private clapSoundId: number;
    private analyser : AnalyserNode;
    private _bufferSource: AudioBufferSourceNode;
    private view = new AudioPlayerView(this);
    private editorCore: IEditorCore;
    private audioLoaded: boolean;
    
    private clappingTimings= new Array<number>();
    private clapTimingId = 0;

    onAudioLoaded = new Event<[string, string]>();
    onLoad = new Event<number>();
    onSeek = new Event<number>();
    onPlay = new Event<number>();
    onStop = new Event<number>();

    get bufferSource() {
        return this._bufferSource;
    }

    duration() : number {
        return this.songSource.duration();
    }

    setClapTimings(array: number[]) {
        this.clappingTimings = array;
        let seek = this.seek();
        //console.log(array);
        this.clapTimingId = Utils.binaryNearestSearchNumber(array, seek);
        console.log(this.clapTimingId);
        // for(let i = 0; i<array.length;i++) {
        //     console.log(array[i]);
        //     if (array[i] > seek) {
        //         console.log(i);
        //         this.clapTimingId = i;
        //         return;
        //     }
        // }
    }

    checkForClaps() {
        if (this.songSource == null || this.clappingTimings.length < 1 || !this.editorCore.editorData.useClaps.value)
            return;
    
        let seek = this.songSource.seek();
        // console.log("CLAP LOOP");
        // console.log(this.clappingTimings[this.clapTimingId]);
        // console.log(seek);
        // console.log(this.clapTimingId);
        if (this.clappingTimings[this.clapTimingId] < seek) {
            this.clapTimingId++;
            this.playClapSound();
            //console.log("PLAY CLAP");
        }
    }

    loadAudio(fileName: string, soundPath : string) {
        this.songSource = new Howl({src:[soundPath]});

        this.analyser = Howler.ctx.createAnalyser();
        this.analyser.fftSize = 128;

        this.songSource.on('load', () => {
            this.audioLoaded = true;
            this.view.onAudioLoad(fileName, this.songSource.duration());
            this.onAudioLoaded.invoke([fileName, soundPath]);
        })

        this.songSource.on('play', (id) => {
            this.setupData();
            this.onPlay.invoke(id);
        });

        this.songSource.on('seek', (id) => {
            this.onSeek.invoke(id);
            console.log("FUUU");
        });

        this.songSource.on('stop', (id) => {
            this.onStop.invoke(id);
        });
    }

    setVolume(value: number) {
        this.songSource?.volume([value]);
    }

    init(editorCoreModules: IEditorCore) {
        this.editorCore = editorCoreModules;
        this.editorCore.editorData.audioFile.onValueChange.addListener(([s1, s2]) => {this.loadAudio(s1, s2);})
        this.view.onVolumeSliderChange.addListener((value) => {this.setVolume(value);});
        this.editorCore.editorData.playbackRate.onValueChange.addListener((value) => {this.setPlaybackRate(value);});
    }

    updateModule() {
        if (this.songSource == null || this.songSource == undefined)
            return;
          
        let seek = this.songSource.seek();
        this.view.update(seek);
        //this.checkForClaps();
    }

    setPlaybackRate(value: number) {
        this.songSource?.rate([value]);
    }

    isAudioLoaded() : boolean {
        return this.audioLoaded;
    }

    isPlaying() : boolean {
        if (this.songSource == undefined || this.songSource == null)
            return false;
        return this.songSource.playing([this.soundId]);
    }

    play() {
        this.soundId = this.songSource?.play();
    }
    
    playClapSound() {
        this.clapSource?.stop();
        this.clapSoundId = this.clapSource?.play();
    }
    
    pause() {
        this.songSource?.pause();
    }

    seek() : number {
        return this.songSource?.seek();
    }   

    setMusicFromCanvasPosition(position : Vec2) {
        if (this.songSource == null || this.songSource == undefined)
            return;
        var second = this.editorCore.viewport.canvasToSongTime(position).x/this.editorCore.transform.scale.x;
        this.songSource.seek([second]);
        this.setupData();
    }

    getDomainData() : Float32Array {
        let dataArray = new Float32Array(this.analyser.frequencyBinCount);
        this.analyser.getFloatTimeDomainData(dataArray);
        return dataArray;
    }

    getSpectrumData(): Uint8Array {
        if (this.analyser == undefined)
            return new Uint8Array(0);
        let dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }

    private setupData() {
        this._bufferSource = this.songSource._soundById(this.soundId)._node.bufferSource;
        this.songSource._soundById(this.soundId)._node.bufferSource.connect(this.analyser) 
    }
}

export class AudioAmplitudeViewModule implements IEditorModule {
   
    transform = new Transform();
   
    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;
    
    private analyserData: Float32Array;
    private amplitudeData = new Array<number>();
    
    private readonly sampleRate = 48000;
    private divideValue = 20;
    private samplesPerArrayValue = this.sampleRate/this.divideValue;
    private editorCore: IEditorCore;

    constructor() {
        this.canvas = $('#audio-amplitude-canvas')[0] as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d');
    }

    onWindowResize() {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;

        var info = this.canvas.parentElement.getBoundingClientRect();

        this.canvas.setAttribute('width', info.width.toString());
        this.canvas.setAttribute('height', (info.height/4).toString());
    }

    onAudioLoad() {        
        this.analyserData = this.editorCore.audio.bufferSource.buffer.getChannelData(0);
        this.calculateAmplitudeArray();
    }

    init(editorCore: IEditorCore){
        this.editorCore = editorCore;
        Input.onWindowResize.addListener(() => {this.onWindowResize();});
        this.editorCore.audio.onPlay.addListener(() => {this.onAudioLoad();});
    } 

    updateModule() {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = editorColorSettings.editorBackgroundColor.value();
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

        const view = this.editorCore.viewport;

        if (this.analyserData == undefined || this.analyserData == null)
            return;

        if (this.amplitudeData == undefined || this.amplitudeData == null)
            return;

        for (var i = 0; i<this.amplitudeData.length; i++) {
            var interpolated = this.amplitudeData[i]*this.canvas.height;
            var position = view.position.x + i*this.transform.scale.x/this.divideValue;
            var width = this.transform.scale.x/this.divideValue;
            var gap = Math.floor(width/3);

            if (gap < 4)
                gap = 0;

            this.ctx.fillStyle = editorColorSettings.loudnessBarColor.value();
            this.ctx.fillRect(position + gap, 0, width - gap, interpolated)
            this.ctx.fill();
        }
    }

    private calculateAmplitudeArray() {
        this.amplitudeData = [];
        
        for (var i = 0; i<this.analyserData.length; i+=this.samplesPerArrayValue) {
            var value = this.getAvarageAtRange(i, i+this.samplesPerArrayValue);
            this.amplitudeData.push(value);
        }
    }

    private getAvarageAtRange(from: number, to: number) : number {
        var result = 0;
        
        for (var i = from; i<to && i<this.analyserData.length; i++) {
            result += Math.abs(this.analyserData[i]);
        }

        result = result/(to-from);
        return result;
    }
}