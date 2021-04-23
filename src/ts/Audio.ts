import { Slider, Event, Action, EmptyAction } from "./Utils";
import { Editor, IEditorModule, IEditorCore, EditorData} from "./Editor";
import { Vec2 } from "./Vec2";
import { editorColorSettings } from "./AppSettings";
import { IDrawable } from "./GridElements";

import $ from 'jquery';
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

    play();
    pause();
    seek();

    getDomainData() : Float32Array
    setMusicFromCanvasPosition(position : Vec2, editor : IEditorCore) 
}

export class AudioModule implements IAudioModule {

    transform = new Transform();

    private howl : any;
    private soundId : number;
    private clapSoundId: number;
    private analyser : AnalyserNode;
    private _bufferSource: AudioBufferSourceNode;
    private view = new AudioPlayerView(this);
    private editorCore: IEditorCore;
    private audioLoaded: boolean;

    onAudioLoaded = new Event<[string, string]>();
    onLoad = new Event<number>();
    onSeek = new Event<number>();
    onPlay = new Event<number>();
    onStop = new Event<number>();

    get bufferSource() {
        return this._bufferSource;
    }

    duration() : number {
        return this.howl.duration();
    }

    loadAudio(fileName: string, soundPath : string) {
        this.howl = new Howl({src:[soundPath]});
        
        this.analyser = Howler.ctx.createAnalyser();
        this.analyser.fftSize = 256;

        this.howl.on('load', () => {
            this.audioLoaded = true;
            this.view.onAudioLoad(fileName, this.howl.duration());
            this.onAudioLoaded.invoke([fileName, soundPath]);
        })

        this.howl.on('play', (id) => {
            this.setupData();
            this.onPlay.invoke(id);
        });

        this.howl.on('seek', (id) => {
            this.onSeek.invoke(id);
        });

        this.howl.on('stop', (id) => {
            this.onStop.invoke(id);
        });

    }

    setVolume(value: number) {
        this.howl.volume([value]);
    }

    init(editorCoreModules: IEditorCore) {
        this.editorCore = editorCoreModules;
        this.editorCore.editorData.audioFile.onValueChange.addListener(([s1, s2]) => {this.loadAudio(s1, s2);})
        this.view.onVolumeSliderChange.addListener((value) => {this.setVolume(value);});
        this.editorCore.editorData.playbackRate.onValueChange.addListener((value) => {this.setPlaybackRate(value);});
    }

    updateModule() {
        if (this.howl == null || this.howl == undefined)
            return;
        this.view.update(this.howl.seek());
    }

    setPlaybackRate(value: number) {
        this.howl.rate([value]);
    }

    isAudioLoaded() : boolean {
        return this.audioLoaded;
    }

    isPlaying() : boolean {
        if (this.howl == undefined || this.howl == null)
            return false;
        return this.howl.playing([this.soundId]);
    }

    play() {
        this.soundId = this.howl.play();
    }
    
    pause() {
        this.howl.pause();
    }

    seek() : number {
        return this.howl.seek();
    }   

    setMusicFromCanvasPosition(position : Vec2, editor : IEditorCore) {
        var second = editor.viewport.canvasToSongTime(position).x/editor.transform.scale.x;
        this.howl.seek([second]);
    }

    getDomainData() : Float32Array {
        var dataArray = new Float32Array(this.analyser.frequencyBinCount);
        this.analyser.getFloatTimeDomainData(dataArray);
        return dataArray;
    }

    private setupData() {
        this._bufferSource = this.howl._soundById(this.soundId)._node.bufferSource;
        this.howl._soundById(this.soundId)._node.bufferSource.connect(this.analyser) 
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
        console.log("asdasdasdsad");
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