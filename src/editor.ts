/// <reference path ='../node_modules/@types/jquery/jquery.d.ts'/>

import { throws } from 'node:assert';
import { format } from 'node:path';
import { off } from 'node:process';
const { Howl, Howler } = require('howler');
import $ from 'jquery';

class Vec2 {
    
    readonly x: number;
    readonly y: number;
    
    constructor(x:number, y:number) {
        this.x = x;  
        this.y = y;
    }

    static Sum(v1: Vec2, v2: Vec2) : Vec2 { 
        return new Vec2(v1.x+v2.x, v1.y+v2.y);
    }

    static Substract(v1: Vec2, v2: Vec2) : Vec2 {
        return new Vec2(v1.x-v2.x, v1.y-v2.y);
    }

    static Multiply(v1: Vec2, v2: Vec2) : Vec2 { 
        return new Vec2(v1.x*v2.x, v1.y*v2.y);
    }

    static Divide(v1: Vec2, v2: Vec2) : Vec2 {
        return new Vec2(v1.x/v2.x, v1.y/v2.y);
    }
}

class RgbaColor {

    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r, g, b, a=1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    value() : string {
        if (this.a == 1)
            return 'rgba('+this.r+','+this.g+','+this.b+')';
        return 'rgba('+this.r+','+this.g+','+this.b+','+this.a+')';
    }
}

const appSettings = new class AppSettings {
    editorBackgroundColor = new RgbaColor(73, 75, 90);
    beatLineColor = new RgbaColor(130, 130, 130); // (74, 74, 74)
    mainBpmLineColorStrong = new RgbaColor(255,255,255);  //(92, 92, 92);
    mainBpmLineColorWeak = new RgbaColor(150, 150, 150);
    snapBpmLineColor = new RgbaColor(100,100,100);  //(74, 189, 166);
    creatableTimestampLineColor = new RgbaColor(10, 255, 206); //(116, 104, 222);
    loudnessBarColor = new RgbaColor(255, 103, 0);
    timestepLineColor = new RgbaColor(255, 103, 0);
}

class Event {
    private listeners = [];

    addListener(listener: any) {
        this.listeners.push(listener)
    }

    removeListener(listener: any) {
        var index = this.listeners.findIndex(listener);
        this.listeners.slice(index,index);
    }   

    invoke(data: any) {
        this.listeners.forEach(listener => {
            listener(data);
        });
    }
}


class SelectController {

    selectedElements: [];

    drawSelectZone(from, to) {
        


    }
}

class Input {
    
    editor: Editor;

    private snapSlider = new Slider('snap-lines');
    private volumeSlider = new Slider('volume-slider');
    private playbackSlider = new Slider('playback-rate');

    canvMousePosition = new Vec2(0,0);
    keysPressed = [];

    constructor(editor: Editor) {
        this.editor = editor;

        $('#files').on('change', (event) => { this.onAudioLoad(event); });

        $(window).on('resize', (event) => { this.editor.onWindowResize(event); });
        $(window).on('keydown', (event) => { this.onCanvasKeyDown(event);});
        $(window).on('keyup', (event) => { this.onCanvasKeyUp(event);});

        $('#editor-canvas').on('wheel', (event) => { this.onCanvasWheel(event.originalEvent);})
        .on('click', (event) => { editor.canvasClickHandle(event);})
        .on('mousemove', (event) => { this.onCanvasHover(event); editor.canvasPlaceElementHandler(event);});
        
        $('#play-button').on('click', (event) => {this.playButtonClick(event.target)})

        $('#follow-line').on('change', (event) => { this.onFollowLineChange(event); })
        $('#use-claps').on('change', (event) => { this.onUseClapsValueChange(event); })
        $('#hide-bpm').on('change', (event) => { this.onHideBpmLinesChange(event); })
        $('#hide-creatable').on('change', (event) => { this.onHideCreatableLinesChange(event); })
        $('#beat-lines').on('change', (event) => { this.onBeatLinesValueChange(event); })
        $('#bpm').on('change', (event) => { this.onBpmValueChange(event); })
        $('#offset').on('change', (event) => { this.onOffsetValueChange(event); })

        this.volumeSlider.setValue(0.5);
        this.playbackSlider.setValue(1);
        this.snapSlider.setValue(1);
        
        this.volumeSlider.onValueChange.addListener((value) => {this.onVolumeSliderValueChange(value); });
        this.playbackSlider.onValueChange.addListener((value) => { this.onPlaybackRateValueChange(value); });
        this.snapSlider.onValueChange.addListener((value) => { this.onSnapSliderValueChange(value); });
    }

    onAudioLoad(event) {
        var files = event.target.files;
        var file = files[0];
        this.editor.onAudioLoad(file.name, file.path);
        console.log(files[0]);
    }
    
    onVolumeSliderValueChange(value: string) {
        var val = parseFloat(value);
        this.editor.audioPlayer.setVolume(val);
    }

    onSnapSliderValueChange(value: string) {
        var val = parseInt(value);
        val = Math.pow(2, val);
        $('#snap-lines-text')[0].innerText = 'Snap lines 1/' + val.toString();
        this.editor.editorGrid.setSnapValue(val);
    }

    onCanvasHover(event) {
        
    }

    onPlaybackRateValueChange(value: string) {
        var val = parseFloat(value);
        $('#playback-rate-text')[0].innerText =  'Playback rate ' + val.toString() + 'x';
        this.editor.audioPlayer.setPlaybackRate(val);
    }

    playButtonClick(btn) {
        this.editor.onPlayButtonClick(btn);   
    }

    onCanvasKeyDown(event) {
        this.keysPressed[event.key] = true;
        if (event.code == 'Space')
            this.editor.createCustomBpmLine();
        if (event.code == 'Alt')
            this.editor.canvasPlaceElementHandler(event);
        console.log('Key pressed!' + event.key);
    }

    onCanvasKeyUp(event) {
        delete this.keysPressed[event.key];
        if (event.code == 'Alt')
            this.editor.canvasPlaceElementHandler(null);
        console.log('Key removed' + event.key);
        this.editor.drawEditor();
    }

    onCanvasWheel(event) {
        if (this.keysPressed['Control'])
            this.editor.onCanvasResize(parseInt(event.deltaY));
        else if (this.keysPressed['Shift'])
            this.editor.onCanvasScroll(parseInt(event.deltaY), true);
        else
            this.editor.onCanvasScroll(parseInt(event.deltaY), false); 
    }

    onBeatLinesValueChange(event) {
        console.log(event);
        this.editor.changeBeatlinesCount(event);
    }

    onBpmValueChange(event) {
        console.log(event);
        this.editor.changeBpmValue(event);
    }

    onOffsetValueChange(event) {
        console.log(event);
        this.editor.changeOffset(event);
    }

    onUseClapsValueChange(event) {
        console.log(event);
        this.editor.usingClaps = true;
    }

    onHideBpmLinesChange(event) {
        this.editor.hideBpmLines = event.target.checked;
        console.log(event);
    }

    onFollowLineChange(event) {
        this.editor.followingLine = event.target.checked;
        console.log(event);
    }

    onHideCreatableLinesChange(event) {
        this.editor.hideCreatableLines = event.target.checked
        console.log(event);
    }
}

class Viewport {
    
    transform = new Transform(); 
    maxDeviation: Vec2 = new Vec2(10,100);
    gridTransform: Transform;

    get position() {
        return this.transform.position;
    }

    set position(value : Vec2) {
        console.log(value);
        this.transform.position = value;
        console.log(this.transform.position);
    }

    worldToCanvas(worldCoords : Vec2) : Vec2 {
        const pos = this.position;
        return new Vec2(pos.x - worldCoords.x/this.gridTransform.scale.x,
                        pos.y - worldCoords.y/this.gridTransform.scale.y);
    }

    canvasToWorld(canvasCoords : Vec2) : Vec2 {
        const pos = this.position;
        return new Vec2((pos.x - canvasCoords.x) / this.gridTransform.scale.x, 
            (pos.y - canvasCoords.y) / this.gridTransform.scale.y);
    }

    canvasToWorld2(canvasCoords : Vec2) : Vec2 {
        const pos = this.position;
        return new Vec2((pos.x - canvasCoords.x), 
                        (pos.y - canvasCoords.y));
    }


    canvasToSongTime(canvasCoords : Vec2) : Vec2 {
        const pos = this.position;
        return new Vec2((canvasCoords.x - pos.x),
                        (canvasCoords.y - pos.y));
    }  
}

class Transform {

    private _parent: Transform = null;
    private _children: Array<Transform> = new Array<Transform>();
    private _localPosition: Vec2 = new Vec2(0,0);
    private _localScale: Vec2 = new Vec2(1,1);

    rotation: Vec2 = new Vec2(0,0);
    
    maxScale: Vec2 = new Vec2(1000, 1);
    minScale: Vec2 = new Vec2(1, 1);

    get localPosition() : Vec2 {
        return this._localPosition;
    }

    set localPosition(value: Vec2) {
        this._localPosition = value;
    }

    get position() : Vec2 {
        if (this._parent == null)
            return this._localPosition;
        return Vec2.Sum(Vec2.Multiply(this._localPosition, this._parent.scale), this._parent.position);
    }

    set position(value: Vec2) {
        if (this._parent == null) {
            this.localPosition = value;
            return;
        }
        
        var pos = Vec2.Substract(value, this.parent.position);
        this.localPosition = Vec2.Divide(pos, this._parent.scale);
    } 

    get scale() {
        if (this._parent == null)
            return this._localScale;
        
        return Vec2.Multiply(this._localScale, this._parent.scale);
    }
    
    set scale(value: Vec2) {
        if (this._parent == null) {
            this.localScale = value;
            return;
        }
        
        this.localScale = Vec2.Divide(this._parent.scale, value);
    } 

    get localScale() {
        return this._localScale;
    }

    set localScale(value) {
        this._localScale = value;
    }

    get parent() {
        return this._parent;
    }

    set parent(parent : Transform) {
        
        if (parent == null) {
            parent.removeChild(this);
            this._parent = parent;
            return;
        }

        this._parent = parent;
        this._parent?.addChild(this);
        this.position = this.localPosition;
    }


    private addChild(child : Transform) : void {
        this._children.push(child);
    }

    private removeChild(child : Transform) : void {
        let index = this._children.indexOf(child);
        if(index !== -1) {
            this._children.splice(index, 1);
        }
    }
}

// var parent = new Transform();
// parent.position = new Vec2(0,0);
// parent.scale = new Vec2(10, 1);

// var child1 = new Transform();
// child1.position = new Vec2(10,1);

// var child2 = new Transform();
// child2.position = new Vec2(20,1);

// child1.parent = parent;
// child2.parent = parent;

// console.log(child1.position)
// console.log(child2.localPosition);

class Editor {

    usingClaps: boolean = false;
    followingLine: boolean = false;
    hideBpmLines: boolean = false;
    hideCreatableLines: boolean = false;

    audioLoaded: boolean = false;
    scrollingSpeed : number = 0.2;
    resizingSpeed: number = 0.01;
    fastScrollingSpeed: number = 5;
    offset: number = 0;

    creatableLines = {};
    timestamps: Array<Array<Timestamp>>;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    viewport: Viewport;
    transform: Transform;
    topScale: TopScale;
    leftScale: LeftScale;
    bottomScale: BottomScale;
    editorGrid: EditorGrid;
    audioCanvas: AudioAmplitudeCanvas;    
    audioPlayer: AudioPlayer; 
    timestepLine: TimestepLine;
    inputController: Input;

    constructor() {        
        this.timestamps = Array(5).fill(null).map(() => Array(5));
        this.transform = new Transform();

        this.viewport = new Viewport();
        this.viewport.gridTransform = this.transform;
        
        // WARNING
        this.viewport.transform.parent = this.transform;
        this.viewport.transform.position = new Vec2(-10,0);
        // WARNING

        this.transform.position = new Vec2(0,0);
        this.transform.scale = new Vec2(10,1);
        this.canvas = $('#editor-canvas')[0] as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d');
        //this.ctx.translate(0.5,0.5);
        
        this.audioPlayer = new AudioPlayer(this);
        this.topScale = new TopScale(10);
        this.leftScale = new LeftScale(10);
        this.bottomScale = new BottomScale(10);
        this.editorGrid = new EditorGrid(this, this.canvas);
        this.audioCanvas = new AudioAmplitudeCanvas(this);
        this.timestepLine = new TimestepLine(this.transform, appSettings.timestepLineColor);
        this.drawEditor();
    }

    changeBeatlinesCount(beatLines) {
        this.editorGrid.setBeatLinesCount(beatLines);
        this.drawEditor();
    }

    changeBpmValue(bpm) {
        this.editorGrid.setBpmValue(bpm);
        this.drawEditor();
    }

    changeOffset(offset) {
        this.offset = parseInt(offset.target.value);
        this.editorGrid.transform.localPosition = new Vec2(this.offset/100, 0);
    }

    updateLoop() {
        if (!this.audioPlayer.isPlaying())
            return;

        this.audioPlayer.update();
        this.drawEditor();
    }

    onAudioLoad(fileName: string, audioPath : string) {
        this.audioPlayer.onSoundLoad(fileName, audioPath);
        this.timestepLine.transform.parent = this.transform;
        
        this.audioPlayer.sound.on('load', () => 
        { 
            this.audioLoaded = true;
            var gridSize = this.editorGrid.getGridSize();
            this.timestamps = Array(gridSize.y).fill(null).map(() => Array(gridSize.x));
            this.editorGrid.initBpmLines();
            this.drawEditor(); 
        })
    }

    onPlayButtonClick(playBtn) {
        playBtn.classList.add('paused');
        
        if (this.audioPlayer.isPlaying() == true) {
            playBtn.classList.remove('paused');
            this.audioPlayer.pause();
        }
        else {
            this.audioPlayer.play();
        }
    }

    onPause() {
        if (this.audioPlayer.isPlaying() == false)
            return; 

        this.audioPlayer.sound.pause();
    }

    onCanvasScroll(mouseDelta : number, isSpeededUp : boolean) {
        if (this.followingLine)
            return;
        
        var resultedDelta = mouseDelta*this.scrollingSpeed / this.transform.scale.x;
        if (isSpeededUp) 
            resultedDelta *= this.fastScrollingSpeed; 

        this.viewport.transform.localPosition = new Vec2(this.viewport.transform.localPosition.x+resultedDelta, this.viewport.position.y);

        if (this.viewport.transform.localPosition.x > this.viewport.maxDeviation.x)
            this.viewport.transform.localPosition = new Vec2(this.viewport.maxDeviation.x, this.viewport.position.y);

        this.drawEditor();
    }

    onWindowResize(event) {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;

        var div = this.canvas.parentElement;
        div.setAttribute('style', 'height:' + (h*0.6).toString() + 'px');
        var info = this.canvas.parentElement.getBoundingClientRect();
        
        this.canvas.setAttribute('width', (info.width).toString());
        this.canvas.setAttribute('height', (info.height/4*3).toString());
    
        this.editorGrid.initGrid();
        this.audioCanvas.onWindowResize(event);
        this.drawEditor();
    }
    

    onCanvasResize(mouseDelta : number) {
        var resultedDelta = mouseDelta*this.resizingSpeed;
        var oldScale = this.transform.scale.x;
        
        const canvCenter = this.viewport.canvasToSongTime(new Vec2(this.canvas.width/2,0));

        // if (resultedDelta < 0)
        //     this.viewport.position = Vec2.Sum(this.viewport.position, canvCenter);
        // else
        //     this.viewport.position = Vec2.Substract(this.viewport.position, canvCenter);
        
        this.transform.scale = new Vec2(this.transform.scale.x-resultedDelta, this.transform.scale.y);
        var scaleIsChanged = true;

        if (this.transform.scale.x <= this.transform.minScale.x) {
            this.transform.scale = new Vec2(this.transform.minScale.x, this.transform.scale.y);
            scaleIsChanged = false;
        }
        if (this.transform.scale.x >= this.transform.maxScale.x) {
            this.transform.scale = new Vec2(this.transform.maxScale.x, this.transform.scale.y);
            scaleIsChanged = false;
        }
        
        const newCanvCenter =  this.viewport.canvasToSongTime(new Vec2(this.canvas.width/2,0));
        //this.viewport.position = Vec2.Sum(this.viewport.position, Vec2.Substract(newCanvCenter, canvCenter));
        this.viewport.position = Vec2.Substract(new Vec2(this.canvas.width/2, 0), canvCenter);

        // if (resultedDelta < 0)
        //     this.viewport.position = Vec2.Sum(this.viewport.position, this.viewport.canvasToWorld(new Vec2(this.canvas.width/2,0)));
        // else
        //     this.viewport.position = Vec2.Substract(this.viewport.position, this.viewport.canvasToWorld(new Vec2(this.canvas.width/2,0)));
        // const canvasCenter = this.viewport.canvasToWorld(new Vec2(this.canvas.width/2,0));
        // this.viewport.position = new Vec2(canvasCenter.x/scaleDiff, 1); 


        this.drawEditor();
    }

    canvasMouseDownHandle(event) {
        
    }

    phantomTimestamp: Timestamp;

    canvasClickHandle(event) {
        
        if (!this.audioLoaded)
            return;

        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        const click = new Vec2(clickX, clickY);

        if (clickY <= this.topScale.width) {
            this.audioPlayer.setMusicFromCanvasPosition(click, this);
        }

        var closestBeatline = this.findClosestBeatLine(click);
    }

    canvasPlaceElementHandler(event) {
        if (event == null) {
            this.phantomTimestamp = null;
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        const click = new Vec2(clickX, clickY);
        
        var closestBeatline = this.findClosestBeatLine(click);

        if (this.inputController.keysPressed['Alt']) {
            var phantomTimestamp = new Timestamp(new RgbaColor(158,23,240, 0.7), click.x / this.editorGrid.transform.scale.x, closestBeatline.transform.position.y, 10, this.editorGrid.transform);
            this.phantomTimestamp = phantomTimestamp;
            this.drawEditor();
        }
        else {
            this.phantomTimestamp = null;
            this.drawEditor();
        }
    }

    private findClosestCreatableLine() {
  
    }

    private findClosestBeatLine(canvasCoords: Vec2) : BeatLine {
        const beatlinesCanvasDistance = this.editorGrid.distanceBetweenBeatLines();
        let beatlineIndex = Math.round(canvasCoords.y / beatlinesCanvasDistance) - 1;
        if (beatlineIndex < 0)
            beatlineIndex = 0;
        if (beatlineIndex > this.editorGrid.beatLinesCount-1)
            beatlineIndex = this.editorGrid.beatLinesCount-1;

        return this.editorGrid.beatLines[beatlineIndex];
    }

    private findClosestBpmLine() {

    }

    createCustomBpmLine() {
        console.log('Custom bpm line created');
        var xPos = this.timestepLine.transform.position.x;
        var line = new CreatableTimestampLine(xPos, this.transform, appSettings.creatableTimestampLineColor);
        this.creatableLines[line.transform.position.x] = line;
    }

    drawEditor() {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = appSettings.editorBackgroundColor.value();
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height)
        
        this.editorGrid.draw(this.audioPlayer != null 
            && this.audioPlayer.sound != undefined 
            && this.audioPlayer.sound != null 
            && this.audioPlayer.sound.state()=='loaded' && !this.hideBpmLines, 
            this);
        
        //this.bottomScale.draw(this.canvas);
        //this.leftScale.draw(this.canvas);

        if (!this.hideCreatableLines) {
            for (const [key, value]  of Object.entries(this.creatableLines)) {
                (value as CreatableTimestampLine).draw(this.viewport, this.canvas);
            }
        }

        this.timestamps.forEach(timestamps => { timestamps.forEach(note => {
            if (note!=null) { note.draw(this.canvas);
        }})});
        
        this.audioCanvas.draw();
        this.topScale.draw(this.canvas);

        if (this.audioPlayer.isPlaying()){
            this.timestepLine.transform.localPosition = new Vec2(this.audioPlayer.sound.seek(), 0);
        }

        if (this.followingLine) {
            const result = new Vec2(-this.timestepLine.transform.position.x+this.canvas.width/2, 1);
            this.viewport.transform.position = result;
        }

        this.timestepLine.draw(this.viewport, this.canvas);
        this.phantomTimestamp?.draw(this.canvas);
    }
}

class Slider {
    
    maxValue: number = 100;
    minValue: number = 0;
    value: number
    sliderInput: HTMLInputElement;
    onValueChange = new Event();

    constructor(sliderId: string) {
        this.sliderInput = $('#' + sliderId)[0] as HTMLInputElement;
        this.sliderInput.value = '0';
        this.sliderInput.oninput = (event : any) => {
            this.setValue(event.target.value);
        };
        this.value = 0;
    }

    setMaxValue(value: number) {
        this.maxValue = value;
        this.sliderInput.max = value.toString();
    }

    setMinValue(value: number) {
        this.minValue = value;
        this.sliderInput.min = value.toString();
    }

    setValue(value: number) {
        this.value = value;
        this.sliderInput.value = value.toString();
        this.onValueChange.invoke(value);
    }
}


enum TimeAccuracy {
    seconds, 
    milliseconds
}

class AudioPlayerView {
    
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

class AudioPlayer {

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

class AudioAmplitudeCanvas {
    
    canvas : HTMLCanvasElement;
    ctx : CanvasRenderingContext2D;
    editor: Editor;
    audio: AudioPlayer;
    data: Float32Array;
    amplitudeData = new Array<number>();
    
    readonly sampleRate = 48000;
    samplesPerArrayValue = this.sampleRate/100;


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
            var position = this.editor.viewport.position.x + i*this.editor.editorGrid.transform.scale.x/100;
            var width = this.editor.editorGrid.transform.scale.x/100;
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

class Timestamp {    
    
    id: number;
    transform: Transform = new Transform();
    width: number;
    color: RgbaColor;

    constructor(color: RgbaColor, x : number, y : number, width : number, parent: Transform) {
        this.width = width;
        this.transform.parent = parent;
        this.transform.localPosition = new Vec2(x,y);
        this.color = color;
    }

    draw(canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        const pos = new Vec2(this.transform.position.x, this.transform.position.y);
        const width = this.width*this.transform.parent.localScale.x;
        ctx.fillStyle = this.color.value();
        ctx.beginPath();
        ctx.moveTo(pos.x - width, pos.y);
        ctx.lineTo(pos.x, pos.y - width);
        ctx.lineTo(pos.x + width, pos.y);
        ctx.lineTo(pos.x, pos.y + width);
        ctx.fill();
    }
}

class EditorGrid {
    
    canvas: HTMLCanvasElement;

    bpmValue: number;
    beatLinesCount: number;
    snapValue = 0;

    bpmLines: Array<BPMLine>;
    beatLines: Array<BeatLine>;
    editor: Editor;
    transform: Transform;


    private beatLinesRange = new Vec2(1,20);
    private bpmRange = new Vec2(1,10000);


    constructor(editor: Editor, canvas: HTMLCanvasElement) {
        this.editor = editor;
        this.canvas = canvas;
        this.bpmValue = 60;
        this.beatLinesCount = 5;
        this.bpmLines = [];
        this.beatLines = [];

        this.transform = new Transform();
        this.transform.parent = editor.transform;
        this.transform.localScale = new Vec2(1,1);
        this.initGrid();
    }

    distanceBetweenBpmLines() {
        var soundLength = this.editor.audioPlayer.sound.duration();
        var bpmCount = (soundLength/60) * this.bpmValue;
        var pixelsPerBeat = soundLength / bpmCount;
        return pixelsPerBeat;
    }

    distanceBetweenBeatLines() {
        return (this.canvas.height)/(this.beatLinesCount+1);
    }

    setSnapValue(val: number) {
        console.log(val);
        this.snapValue = val;
        const distance = this.distanceBetweenBpmLines();

        this.bpmLines.forEach(line => {
            line.setSnapLines(val, distance);
        });
    }

    setBpmValue(event) {            
        var bpm = parseInt(event.target.value);
        
        bpm < this.bpmRange.x ? bpm = this.bpmRange.x : bpm = bpm;
        bpm > this.bpmRange.y ? bpm = this.bpmRange.y : bpm = bpm;

        this.bpmValue = bpm;
        this.initBpmLines();
        console.log(bpm);
    }

    setBeatLinesCount(event) {
        var beatLines = parseInt(event.target.value);
        
        beatLines < this.beatLinesRange.x ? beatLines = this.beatLinesRange.x : beatLines = beatLines;
        beatLines > this.beatLinesRange.y ? beatLines = this.beatLinesRange.y : beatLines = beatLines;
        
        this.beatLinesCount = beatLines;
        this.initGrid();
    }

    getGridSize() : Vec2 {
        return new Vec2(this.bpmValue, this.beatLinesCount);    
    }

    initGrid() {
        for (var i=0; i<this.beatLinesCount; i++){ 
            if (i+1 > this.beatLines.length) {
                console.log(`distance between lines is ${this.distanceBetweenBeatLines()}`)
                var beatLine = new BeatLine((i+1)*this.distanceBetweenBeatLines(), this.transform, appSettings.beatLineColor);
                this.beatLines.push(beatLine);
            }
            this.beatLines[i].transform.localPosition = new Vec2(0, (i+1)*this.distanceBetweenBeatLines());
            this.beatLines[i].activate();
        }
        for (var i = this.beatLinesCount; i < this.beatLines.length; i++) {
            this.beatLines[i].deactivate();
        }
    }

    initBpmLines() {
        this.bpmLines = [];
        var soundLength = editor.audioPlayer.sound.duration();
        var bpmCount = (soundLength/60) * this.bpmValue;

        for (var i=0; i<bpmCount; i++) {
            var color: RgbaColor;
            
            if (i%2 == 0) {
                color = appSettings.mainBpmLineColorStrong;
            }
            else 
                color = appSettings.mainBpmLineColorWeak;
            
            var bpmLine = new BPMLine(i*this.distanceBetweenBpmLines(), this.transform, color);
            this.bpmLines.push(bpmLine);
        }
    }

    draw(drawBpmLines: boolean, editor: Editor) {
        const canvas = this.canvas;
        const ctx = canvas.getContext('2d');

        this.beatLines.forEach(beatLine => {
            if (beatLine.isActive)
                beatLine.draw(editor.viewport, canvas);
        });

        if (drawBpmLines) {
            var soundLength = editor.audioPlayer.sound.duration();
            var bpmCount = (soundLength/60) * this.bpmValue;
            var pixelsPerBeat = soundLength / bpmCount;
            
            this.bpmLines.forEach(bpmLine => {
                if (bpmLine.isActive)
                    bpmLine.draw(editor.viewport, canvas)
            });
        }
    }
}

abstract class GridLine {
    
    transform: Transform = new Transform();
    isActive: boolean = true;
    color: RgbaColor;

    constructor(parent : Transform, rgbaColor: RgbaColor) {
        this.color = rgbaColor;
        this.transform.parent = parent;
    }

    abstract draw(view : Viewport, canvas : HTMLCanvasElement);

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }
}

class CreatableTimestampLine extends GridLine {

    constructor(x: number, parent: Transform, color: RgbaColor) {
        super(parent, color);
        this.transform.parent = parent;
        this.transform.position = new Vec2(x, 0);
    }

    draw(view: Viewport, canvas: HTMLCanvasElement) {
        var x = this.transform.position.x + view.position.x;
        const ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.fillStyle = this.color.value();
        ctx.moveTo((x), canvas.height-10);
        ctx.lineTo((x-5), canvas.height);
        ctx.lineTo((x+5), canvas.height);
        ctx.fill();

        ctx.strokeStyle = this.color.value();
        ctx.moveTo(x,0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

class TimestepLine extends GridLine {
    
    constructor(parent: Transform, color: RgbaColor) {
        super(parent, color);
    }

    draw(view : Viewport, canvas: HTMLCanvasElement) {
        var x = this.transform.position.x + view.position.x;
        const ctx = canvas.getContext('2d');

        if (x >= canvas.width)
            x = canvas.width-5;
        if (x<=0)
            x = 0;

        ctx.beginPath();
        ctx.fillStyle = appSettings.timestepLineColor.value();
        ctx.moveTo(x, 10);
        ctx.lineTo(x-5, 0);
        ctx.lineTo(x+5, 0);
        ctx.fill();

        ctx.strokeStyle = appSettings.timestepLineColor.value();
        ctx.moveTo(x,0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

class BPMLine extends GridLine {
    
    snapLines = new Array<BPMLine>();

    constructor(x : number, parent : Transform, rgbaColor: RgbaColor) {
        super(parent, rgbaColor)
        this.transform.localPosition = new Vec2(x, 0);
    }

    draw(view : Viewport, canvas : HTMLCanvasElement) {
        if (!this.isActive)
            return;
        
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = this.color.value();
        ctx.beginPath();
        ctx.moveTo(this.transform.position.x+view.position.x, 0);
        ctx.lineTo(this.transform.position.x+view.position.x, canvas.height);
        ctx.stroke();

        this.snapLines.forEach(line => { line.draw(view, canvas); });
    }

    setSnapLines(snapValue: number, distanceBetweenBpmLines) : void {
        this.snapLines = new Array<BPMLine>();
        
        const distance = distanceBetweenBpmLines/snapValue;

        for (var i = 0; i<snapValue-1; i++) {
            this.snapLines.push(new BPMLine((i+1)*distance, this.transform, appSettings.snapBpmLineColor));
        }
    }
}

class BeatLine extends GridLine {
    
    constructor(y:number, parent: Transform, rgbaColor: RgbaColor) {
        super(parent, rgbaColor)
        this.transform.localPosition = new Vec2(0,y)
    }

    draw(view: Viewport, canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = this.color.value();
        ctx.beginPath();
        ctx.moveTo(0, this.transform.position.y);
        ctx.lineTo(canvas.width, this.transform.position.y);
        ctx.stroke();
    }
}

abstract class Scale {
    width: number;
   
    constructor(width : number) {
        this.width = width;
    }

    abstract draw(canvas : HTMLCanvasElement);
}

class TopScale extends Scale {
    draw(canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1B1C21';
        ctx.fillRect(0,-5,canvas.width,this.width+5);
    }
}

class BottomScale extends Scale {
    draw(canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1B1C21';
        ctx.fillRect(0, canvas.height+5, canvas.width, -this.width-5);
    }
}

class LeftScale extends Scale {
    draw(canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1B1C21'; 
        ctx.fillRect(0,0, this.width,canvas.height);
    }
}

const editor = new Editor();
const inputController = new Input(editor);
editor.inputController = inputController;
module.exports = editor;