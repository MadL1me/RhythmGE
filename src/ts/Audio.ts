import { Slider, Event, Action, EmptyAction } from "./Utils";
import { Editor, IEditorModule, IEditorCore, EditorData} from "./Editor";
import { Vec2 } from "./Vec2";
import { editorColorSettings } from "./AppSettings";
import { IDrawable } from "./GridElements";

import $ from 'jquery';
import { ViewportModule } from "./Viewport";
import { Transform } from "./Transform";
import { throws } from "node:assert";

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

    constructor() {
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
    onAudioLoaded: Event<[number, string]>;
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

    play();
    pause();
    seek();

    getDomainData() : Float32Array
    setMusicFromCanvasPosition(position : Vec2, editor : IEditorCore) 
}

export class AudioModule implements IAudioModule {

    transform: Transform;

    private _howl : any;
    private _soundId : number;
    private _clapSoundId: number;
    private _analyser : AnalyserNode;
    private _bufferSource: AudioBufferSourceNode;
    private _view = new AudioPlayerView();
    private _editorCore: IEditorCore;
    
    onAudioLoaded = new Event<[number, string]>();
    onLoad = new Event<number>();
    onSeek = new Event<number>();
    onPlay = new Event<number>();
    onStop = new Event<number>();

    get bufferSource() {
        return this._bufferSource;
    }

    duration() : number {
        return this._howl.duration();
    }

    loadAudio(fileName: string, soundPath : string) {
        this._howl = new Howl({src:[soundPath]});
        
        this._analyser = Howler.ctx.createAnalyser();
        this._analyser.fftSize = 256;

        this._howl.on('load', () => {
            this._view.onAudioLoad(fileName, this._howl.duration());
        })

        this._howl.on('play', (id) => {
            this.setupData();
            this.onPlay.invoke(id);
        });

        this._howl.on('seek', (id) => {
            this.onSeek.invoke(id);
        });

        this._howl.on('stop', (id) => {
            this.onStop.invoke(id);
        });

    }

    setVolume(value: number) {
        this._howl.volume([value]);
    }

    init(editorCoreModules: IEditorCore) {
        this._editorCore = editorCoreModules;
    }

    updateModule() {
        if (this._howl == null || this._howl == undefined)
            return;
        this._view.update(this._howl.seek());
    }

    setPlaybackRate(value: number) {
        this._howl.rate([value]);
    }

    isAudioLoaded() : boolean {
        return false;
    }

    isPlaying() : boolean {
        if (this._howl == undefined || this._howl == null)
            return false;
        return this._howl.playing([this._soundId]);
    }

    play() {
        this._soundId = this._howl.play();
    }
    
    pause() {
        this._howl.pause();
    }

    seek() {

    }

    setMusicFromCanvasPosition(position : Vec2, editor : IEditorCore) {
        var second = editor.viewport.canvasToSongTime(position).x/editor.transform.scale.x;
        this._howl.seek([second]);
    }

    getDomainData() : Float32Array {
        var dataArray = new Float32Array(this._analyser.frequencyBinCount);
        this._analyser.getFloatTimeDomainData(dataArray);
        return dataArray;
    }

    private setupData() {
        this._bufferSource = this._howl._soundById(this._soundId)._node.bufferSource;
        this._howl._soundById(this._soundId)._node.bufferSource.connect(this._analyser) 
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

    constructor(parent: Transform) {
        this.transform.parent = parent;
        this.canvas = $('#audio-amplitude-canvas')[0] as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d');
    }

    onWindowResize(event: UIEvent) {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;

        var info = this.canvas.parentElement.getBoundingClientRect();

        this.canvas.setAttribute('width', info.width.toString());
        this.canvas.setAttribute('height', (info.height/4).toString());
    }

    onAudioLoad(audio: AudioModule) {        
        this.analyserData = audio.bufferSource.buffer.getChannelData(0);
        this.calculateAmplitudeArray();
    }

    init(editorCore: IEditorCore){
        this.editorCore = editorCore;
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