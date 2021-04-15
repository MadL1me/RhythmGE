import { Slider } from "./Utils";
import { Editor } from "./Editor";
import { Vec2 } from "./Vec2";
import { appSettings } from "./AppSettings";

export enum TimeAccuracy {
    seconds, 
    milliseconds
}

export class AudioPlayerView {
    
    private playButton: HTMLButtonElement;
    private audioFileName: HTMLParagraphElement;
    private audioCurrentTime: HTMLParagraphElement;
    private audioDuration: HTMLParagraphElement;
    
    private songTimeSlider: Slider;
    private snapSlider = new Slider('snap-lines');
    private volumeSlider = new Slider('volume-slider');

    constructor() {
        this.audioFileName = $('#file-name')[0] as HTMLParagraphElement;
        this.audioCurrentTime = $('#current-audio-time')[0] as  HTMLParagraphElement;
        this.audioDuration = $('#audio-duration')[0] as HTMLParagraphElement;

        this.songTimeSlider = new Slider('audio-slider');
    }

    onAudioLoad(fileName: string, duration: number) {
        this.audioFileName.innerHTML = fileName;
        this.audioCurrentTime.innerHTML = '0:00';
        this.audioDuration.innerHTML = this.formatTime(duration, TimeAccuracy.seconds);
        this.songTimeSlider.setMaxValue(duration*100);
    }

    update(currentTime: number) {
        this.audioCurrentTime.innerHTML = this.formatTime(currentTime, TimeAccuracy.seconds);
        this.songTimeSlider.setValue(currentTime*100);
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

export class AudioPlayer {

    sound : any;
    soundId : number;
    clapSoundId: number;
    analyser : AnalyserNode;
    editor: Editor;
    bufferSource: AudioBufferSourceNode;
    view = new AudioPlayerView();
    songPos: number;

    
    constructor(editor: Editor) {
        this.editor = editor;
    }

    onSoundLoad(fileName: string, soundPath : string) {
        this.sound = new Howl({src:[soundPath]});
        
        this.analyser = Howler.ctx.createAnalyser();
        this.analyser.fftSize = 256;

        this.sound.on('load', () => {
            //this.soundId = this.sound.play();
            //this.sound.stop();
            this.view.onAudioLoad(fileName, this.sound.duration());
        })

        this.sound.on('play', () => {
            this.setupEditor();
        });

        this.sound.on('seek', () => {
            this.setupEditor();
        });

        this.sound.on('stop', () => {
            //setupEditor();
        });

    }

    setVolume(value: number) {
        this.sound.volume([value]);
    }

    update() {
        this.view.update(this.sound.seek());
    }

    setPlaybackRate(value: number) {
        console.log(value);
        this.sound.rate([value]);
    }

    private setupEditor() {
        this.bufferSource = this.sound._soundById(this.soundId)._node.bufferSource;
        this.sound._soundById(this.soundId)._node.bufferSource.connect(this.analyser) 
        editor.audioCanvas.onAudioLoad(this);
        editor.drawEditor();
    }

    isPlaying() : Boolean {
        if (this.sound == undefined || this.sound == null)
            return false;
        return this.sound.playing([this.soundId]);
    }

    play() : void {
        this.soundId = this.sound.play();
    }
    
    pause() : void {
        this.sound.pause();
    }

    playClapSound() : void {
        
    }

    setMusicFromCanvasPosition(position : Vec2, editor : Editor) : void {
        var second = editor.viewport.canvasToSongTime(position).x/editor.transform.scale.x;
        this.sound.seek([second]);
    }

    setMusicFromTimePosition() : void {

    }

    getDomainData() : Float32Array {
        var dataArray = new Float32Array(this.analyser.frequencyBinCount);
        this.analyser.getFloatTimeDomainData(dataArray);
        return dataArray;
    }
}

export class AudioAmplitudeCanvas {
    
    canvas : HTMLCanvasElement;
    ctx : CanvasRenderingContext2D;
    editor: Editor;
    audio: AudioPlayer;
    data: Float32Array;
    amplitudeData = new Array<number>();
    
    readonly sampleRate = 48000;
    divideValue = 10;
    samplesPerArrayValue = this.sampleRate/this.divideValue;

    constructor(editor: Editor) {
        this.editor = editor;
        this.audio = editor.audioPlayer;
        this.canvas = $('#audio-amplitude-canvas')[0] as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d');
    }

    onWindowResize(event: UIEvent) : void {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;

        var info = this.canvas.parentElement.getBoundingClientRect();

        this.canvas.setAttribute('width', info.width.toString());
        this.canvas.setAttribute('height', (info.height/4).toString());
    }

    onAudioLoad(audio: AudioPlayer) : void {        
        this.data = audio.bufferSource.buffer.getChannelData(0);
        this.calculateAmplitudeArray();
    }

    draw() : void {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = appSettings.editorBackgroundColor.value();
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

        if (this.data == undefined || this.data == null)
            return;

        if (this.amplitudeData == undefined || this.amplitudeData == null)
            return;

        for (var i = 0; i<this.amplitudeData.length; i++) {
            var interpolated = this.amplitudeData[i]*this.canvas.height;
            var position = this.editor.viewport.position.x + i*this.editor.editorGrid.transform.scale.x/this.divideValue;
            var width = this.editor.editorGrid.transform.scale.x/this.divideValue;
            var gap = Math.floor(width/3);

            this.ctx.fillStyle = appSettings.loudnessBarColor.value();
            this.ctx.fillRect(position + gap, 0, width - gap, interpolated)
            this.ctx.fill();
        }
    }

    private calculateAmplitudeArray() {
        this.amplitudeData = [];
        
        for (var i = 0; i<this.data.length; i+=this.samplesPerArrayValue) {
            var value = this.getAvarageAtRange(i, i+this.samplesPerArrayValue);
            this.amplitudeData.push(value);
        }
    }

    private getAmplitudeBarWitdh() : number {
        return this.editor.transform.scale.x * this.samplesPerArrayValue / this.sampleRate;
    }

    private getMaxAtRange(from: number, to: number) : number {
        var max = -10;
        
        for (var i = from; i<to && i<this.data.length; i++) {
            if (Math.abs(this.data[i]) >= max) {
                max = Math.abs(this.data[i]);
            }
        }
        return max;
    }

    private getAvarageAtRange(from: number, to: number) : number {
        var result = 0;
        
        for (var i = from; i<to && i<this.data.length; i++) {
            result += Math.abs(this.data[i]);
        }

        result = result/(to-from);
        return result;
    }
}