import { format } from "node:path";
import { off } from "node:process";
const { Howl, Howler } = require('howler');

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
    snapBpmLineColor = new RgbaColor(255,255,255);  //(74, 189, 166);
    creatableTimestampLineColor = new RgbaColor(10, 255, 206); //(116, 104, 222);
    loudnessBarColor = new RgbaColor(255, 103, 0);
    timestepLineColor = new RgbaColor(255, 103, 0);
}


class Visualizer {

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor() {
        
    }

    draw(editor: Editor) {

    }
}

class SelectController {

    selectedElements: [];

    drawSelectZone(from, to) {
        


    }
}

class InputsController {
    
    editor: Editor;
    onKeyUp = new Event;
    onKeyDown = new Event;

    private keysPressed = [];

    constructor(editor: Editor) {
        this.editor = editor;

        document.getElementById('files').onchange = (event) => {
            this.onAudioLoad(event); 
        };

        window.onresize = (event: UIEvent) => {
            this.editor.onWindowResize(event);
        }

        window.addEventListener('keydown', (event) => {this.onCanvasKeyDown(event);});
        window.addEventListener('keyup', (event) => { this.onCanvasKeyUp(event);});

        var editorCanvas = document.getElementById("editor-canvas");
        editorCanvas.addEventListener('wheel', (event) => { this.onCanvasWheel(event); });
        editorCanvas.addEventListener('click', (event) => { editor.canvasClickHandle(event); });
    
        var playBtn = document.getElementById("play-button");
        playBtn.onclick = () => {
            this.playButtonClick();
            playBtn.toggleAttribute("paused");
        };

        document.getElementById("follow-line").onchange = (event) => { this.onFollowLineChange(event); }
        document.getElementById("use-claps").onchange = (event) => { this.onUseClapsValueChange(event); }
        document.getElementById("hide-bpm").onchange = (event) => { this.onHideBpmLinesChange(event); }
        document.getElementById("hide-creatable").onchange = (event) => { this.onHideCreatableLinesChange(event); }
    }

    onAudioLoad(event) {
        var files = event.target.files;
        var file = files[0];
        this.editor.onAudioLoad(file.name, file.path);
        console.log(files[0]);
    }

    playButtonClick() {
        this.editor.onPlay();   
    }

    onCanvasKeyDown(event) {
        this.keysPressed[event.key] = true;
        if (event.code == "Space")
            this.editor.createCustomBpmLine();
        console.log("Key pressed!" + event.key);
    }

    onCanvasKeyUp(event) {
        delete this.keysPressed[event.key];
        console.log("Key removed" + event.key);
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
        this.editor.changeBeatlinesCount(event);
    }

    onBpmValueChange(event) {
        this.editor.changeBpmValue(event);
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
    
    position: Vec2;
    maxDeviation: Vec2 = new Vec2(100,100);
    gridTransform: Transform;

    worldToCanvas(worldCoords : Vec2) : Vec2 {
        const pos = this.position;
        return new Vec2(worldCoords.x - pos.x,
                        worldCoords.y - pos.y);
    }

    canvasToWorld(canvasCoords : Vec2) : Vec2 {
        const pos = this.position;
        return new Vec2(100,0);
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
    
    scale: Vec2 = new Vec2(10,1);
    rotation: Vec2 = new Vec2(0,0);

    maxScale: Vec2 = new Vec2(100, 100);
    minScale: Vec2 = new Vec2(10, 10);

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
        if (this.parent == null) {
            this.localPosition = value;
            return;
        }
        
        var pos = Vec2.Substract(value, this.position);
        //console.log("position change")
        this.localPosition = Vec2.Divide(Vec2.Sum(this.localPosition, pos), this._parent.scale);
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

class Editor {

    usingClaps: boolean = false;
    followingLine: boolean = false;
    hideBpmLines: boolean = false;
    hideCreatableLines: boolean = false;

    audioLoaded: boolean = false;
    scrollingSpeed : number = 0.2;
    resizingSpeed: number = 0.01;
    fastScrollingSpeed: number = 5;

    creatableLines = new Array<CreatableTimestampLine>();
    notes: Array<Array<Timestamp>>;
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

    constructor() {        
        this.notes = Array(5).fill(null).map(() => Array(5));
        this.transform = new Transform();
        
        this.viewport = new Viewport();
        this.viewport.gridTransform = this.transform;
        this.viewport.position = new Vec2(100,0);
        
        this.transform.position = new Vec2(0,0);
        this.canvas = document.getElementById("editor-canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d");
        //this.ctx.translate(0.5,0.5);
        
        this.audioPlayer = new AudioPlayer(this);
        this.topScale = new TopScale(10);
        this.leftScale = new LeftScale(10);
        this.bottomScale = new BottomScale(10);
        this.editorGrid = new EditorGrid(this, this.canvas);
        this.audioCanvas = new AudioAmplitudeCanvas(this);
        this.timestepLine = new TimestepLine();
        this.timestepLine.transform.parent = this.transform;
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

    updateLoop() {
        if (!this.audioPlayer.isPlaying())
            return;

        this.audioPlayer.update();
        this.drawEditor();
    }

    onAudioLoad(fileName: string, audioPath : string) {
        this.audioPlayer.onSoundLoad(fileName, audioPath);
        this.timestepLine.transform.parent = this.transform;
        
        this.audioPlayer.sound.on("load", () => 
        { 
            this.audioLoaded = true;
            var gridSize = this.editorGrid.getGridSize();
            this.notes = Array(gridSize.y).fill(null).map(() => Array(gridSize.x));
            this.editorGrid.initBpmLines();
            this.drawEditor(); 
        })
    }

    onPlay() {
        if (this.audioPlayer.isPlaying() == true)
            return;
        
        this.audioPlayer.play();
    }

    onPause() {
        if (this.audioPlayer.isPlaying() == false)
            return; 

        this.audioPlayer.sound.pause();
    }

    onCanvasScroll(mouseDelta : number, isSpeededUp : boolean) {
        if (this.followingLine)
            return;
        
        var resultedDelta = mouseDelta*this.scrollingSpeed;
        if (isSpeededUp) 
            resultedDelta *= this.fastScrollingSpeed; 

        this.viewport.position = new Vec2(this.viewport.position.x+resultedDelta, this.viewport.position.y);

        if (this.viewport.position.x > this.viewport.maxDeviation.x)
            this.viewport.position = new Vec2(this.viewport.maxDeviation.x, this.viewport.position.y);

        //console.log(this.viewport.position.x);
        this.drawEditor();
    }

    onWindowResize(event: UIEvent) {
        //console.log(event);
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;

        var div = this.canvas.parentElement;
        div.setAttribute("style", "height:" + (h*0.6).toString() + "px");
        var info = this.canvas.parentElement.getBoundingClientRect();
        
        this.canvas.setAttribute('width', (info.width).toString());
        this.canvas.setAttribute('height', (info.height/4*3).toString());
    
        this.editorGrid.initGrid();
        this.audioCanvas.onWindowResize(event);
        this.drawEditor();
    }
    

    onCanvasResize(mouseDelta : number) {
        var resultedDelta = mouseDelta*this.resizingSpeed;
        //console.log("resized!!");
        var oldScale = this.transform.scale.x;
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
        
        this.viewport.position = this.viewport.canvasToWorld(new Vec2(this.canvas.width/2,0));
        this.drawEditor();
    }

    canvasMouseDownHandle(event) {
        
    }

    canvasClickHandle(event) {
        
        if (!this.audioLoaded)
            return;

        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        const click = new Vec2(clickX, clickY);

        console.log(clickY);

        if (clickY <= this.topScale.width) {
            //console.log("Set Music!!!");
            this.audioPlayer.setMusicFromCanvasPosition(click, this);
        }

        var columnNum = Math.round((clickX)/(this.editorGrid.distanceBetweenBeatLines())-1);
        var rowNum = Math.round((clickY)/(this.editorGrid.distanceBetweenBpmLines())-1); 

        if (columnNum < -0.6 || rowNum < -0.6) {
            return;
        }

        //console.log(columnNum);
        //console.log(rowNum);

        const x = this.editorGrid.bpmLines[columnNum].transform.position.x+this.transform.position.x - this.transform.position.x;
        const y = this.editorGrid.beatLines[rowNum].transform.position.y+this.transform.position.y - this.transform.position.y;

        //console.log(columnNum+":"+rowNum);
       // console.log(Math.abs(x - clickX) + ":" + Math.abs(y - clickY))

        if (Math.abs(y - clickY) <= 20 && Math.abs(x - clickX) <= 20) {
            if (this.notes[columnNum][rowNum] != undefined && this.notes[columnNum][rowNum] != null) {
                console.log("remove timestamp");
                this.notes[columnNum][rowNum] = null;
                this.drawEditor();
            }
            else {
                console.log("add timestamp")
                const note = new Timestamp(x, y, 10);
                note.transform.parent = this.transform;
                this.notes[columnNum][rowNum] = note;
                note.draw(this.canvas);
            }
        }
    }

    createCustomBpmLine() {
        console.log("Custom bpm line created");
        var xPos = this.timestepLine.transform.position.x;
        var line = new CreatableTimestampLine(xPos, this.transform);
        this.creatableLines.push(line);
    }

    drawEditor() {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = appSettings.editorBackgroundColor.value();
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height)
        
        this.editorGrid.draw(this.audioPlayer != null 
            && this.audioPlayer.sound != undefined 
            && this.audioPlayer.sound != null 
            && this.audioPlayer.sound.state()=="loaded" && !this.hideBpmLines, 
            this);
        
        //this.bottomScale.draw(this.canvas);
        //this.leftScale.draw(this.canvas);

        if (!this.hideCreatableLines) {
            this.creatableLines.forEach(line => { 
                line.draw(this.viewport);
            });
        }

        this.notes.forEach(notes => { notes.forEach(note => {
            if (note!=null) { note.draw(this.canvas);
        }})});
        
        this.audioCanvas.draw();
        this.topScale.draw(this.canvas);

        if (this.audioPlayer.isPlaying()){
            this.timestepLine.transform.localPosition = new Vec2(this.audioPlayer.sound.seek(), 0);
        }

        this.timestepLine.draw(this.viewport);

        if (this.followingLine)
            this.viewport.position = new Vec2(-this.timestepLine.transform.position.x+this.canvas.width/2, 0);
    }
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

class Slider {
    
    maxValue: number = 100;
    minValue: number = 0;
    value: number
    sliderInput: HTMLInputElement;
    onValueChange = new Event();

    constructor(sliderId: string) {
        this.sliderInput = document.getElementById(sliderId) as HTMLInputElement;
        this.sliderInput.value = "0";
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
    
    playButton: HTMLButtonElement;
    audioFileName: HTMLParagraphElement;
    audioCurrentTime: HTMLParagraphElement;
    audioDuration: HTMLParagraphElement;
    slider: Slider;
    
    constructor() {
        this.audioFileName = document.getElementById("file-name") as HTMLParagraphElement;
        this.audioCurrentTime = document.getElementById("current-audio-time") as  HTMLParagraphElement;
        this.audioDuration = document.getElementById("audio-duration") as HTMLParagraphElement;
        this.slider = new Slider("audio-slider");
    }

    onAudioLoad(fileName: string, duration: number) {
        this.audioFileName.innerHTML = fileName;
        this.audioCurrentTime.innerHTML = "0:00";
        this.audioDuration.innerHTML = this.formatTime(duration, TimeAccuracy.seconds);
        this.slider.setMaxValue(duration*100);
    }

    update(currentTime: number) {
        this.audioCurrentTime.innerHTML = this.formatTime(currentTime, TimeAccuracy.seconds);
        this.slider.setValue(currentTime*100);
    }
    
    private formatTime(time: number, accuracy: TimeAccuracy) : string {
        //console.log("Format time time is: " + time);
        
        var minutes = Math.floor(time/60);
        var seconds = Math.floor(time - minutes*60) as any;
        var milliseconds = time % 1;
        
        if (seconds < 10)
            seconds = "0" + seconds.toString();

        if (accuracy == TimeAccuracy.milliseconds)
            return minutes + ":" + seconds + ":" + milliseconds;
        else 
            return minutes + ":" + seconds;
    }
}

class AudioPlayer {
   
    sound : any;
    soundId : number;
    analyser : AnalyserNode;
    editor: Editor;
    bufferSource: AudioBufferSourceNode;
    view = new AudioPlayerView();

    constructor(editor: Editor) {
        this.editor = editor;
    }

    onSoundLoad(fileName: string, soundPath : string) {
        this.sound = new Howl({src:[soundPath]});
        
        this.analyser = Howler.ctx.createAnalyser();
        this.analyser.fftSize = 256;

        this.sound.on("load", () => {
            //this.soundId = this.sound.play();
            //this.sound.stop();
            this.view.onAudioLoad(fileName, this.sound.duration());
        })

        this.sound.on("play", () => {
            this.setupEditor();
        });

        this.sound.on("seek", () => {
            this.setupEditor();
        });

        this.sound.on("stop", () => {
            //setupEditor();
        });

    }

    update() {
        this.view.update(this.sound.seek());
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
    
    playClapSound() : void {
        
    }

    setMusicFromCanvasPosition(position : Vec2, editor : Editor) : void {
        //console.log(position);
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
    samplesPerArrayValue = this.sampleRate/10;


    constructor(editor: Editor) {
        this.editor = editor;
        this.audio = editor.audioPlayer;
        this.canvas = document.getElementById("audio-amplitude-canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d");
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
        //console.log(appSettings.editorBackgroundColor.value());
        this.ctx.fillStyle = appSettings.editorBackgroundColor.value();
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

        if (this.data == undefined || this.data == null)
            return;

        if (this.amplitudeData == undefined || this.amplitudeData == null)
            return;

        //console.log("DRAWING CANVAS!!!");

        for (var i = 0; i<this.amplitudeData.length; i++) {
            var interpolated = this.amplitudeData[i]*this.canvas.height;
            var position = this.editor.viewport.position.x + i*this.editor.transform.scale.x/10;
            var width = this.editor.transform.scale.x/10;
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
        //console.log(this.amplitudeData);
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

class CreatableTimestampLine {
    
    transform: Transform = new Transform();
    canvas: HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;

    constructor(x: number, parent: Transform) {
        this.transform.parent = parent;
        this.transform.position = new Vec2(x, 0);

        this.canvas = document.getElementById("editor-canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d");
    }

    draw(view: Viewport) {
        var x = this.transform.position.x + view.position.x;
        
        this.ctx.beginPath();
        this.ctx.fillStyle = appSettings.creatableTimestampLineColor.value();
        this.ctx.moveTo(x, this.canvas.height-10);
        this.ctx.lineTo(x-5, this.canvas.height);
        this.ctx.lineTo(x+5, this.canvas.height);
        this.ctx.fill();

        this.ctx.strokeStyle = appSettings.creatableTimestampLineColor.value();
        this.ctx.moveTo(x,0);
        this.ctx.lineTo(x, this.canvas.height);
        this.ctx.stroke();
    }

    move() {

    }
}

class TimestepLine {
    
    transform: Transform = new Transform();
    canvas: HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;

    constructor() {
        this.canvas = document.getElementById("editor-canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d");
    }

    draw(view : Viewport) {
        var x = this.transform.position.x + view.position.x;
        
        if (x>=this.canvas.width)
            x = this.canvas.width-5;
        if (x<=0)
            x = 0;

        this.ctx.beginPath();
        this.ctx.fillStyle = appSettings.timestepLineColor.value();
        this.ctx.moveTo(x, 10);
        this.ctx.lineTo(x-5, 0);
        this.ctx.lineTo(x+5, 0);
        this.ctx.fill();

        this.ctx.strokeStyle = appSettings.timestepLineColor.value();
        this.ctx.moveTo(x,0);
        this.ctx.lineTo(x, this.canvas.height);
        this.ctx.stroke();
    }
}

class Timestamp {    
    
    transform: Transform = new Transform();
    width: number;
   
    constructor(x : number, y : number, width : number) {
        this.transform.position = new Vec2(x,y);
        this.width = width;
    }

    draw(canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        const pos = new Vec2(this.transform.position.x, this.transform.position.y);
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.moveTo(pos.x -this.width, pos.y);
        ctx.lineTo(pos.x, pos.y-this.width);
        ctx.lineTo(pos.x + this.width, pos.y);
        ctx.lineTo(pos.x, pos.y+this.width);
        ctx.fill();
    }
}

class EditorGrid {
    
    canvas: HTMLCanvasElement;

    bpmValue: number;
    beatLinesCount: number;

    bpmLines: Array<BPMLine>;
    beatLines: Array<BeatLine>;
    editor: Editor;

    private beatLinesRange = new Vec2(1,20);
    private bpmRange = new Vec2(1,10000);


    constructor(editor: Editor, canvas: HTMLCanvasElement) {
        this.editor = editor;
        this.canvas = canvas;
        this.bpmValue = 60;
        this.beatLinesCount = 5;
        this.bpmLines = [];
        this.beatLines = [];

        this.initGrid();
    }

    distanceBetweenBpmLines() {
        var soundLength = this.editor.audioPlayer.sound.duration();
        var bpmCount = (soundLength/60) * this.bpmValue;
        var pixelsPerBeat = soundLength / bpmCount;
        return pixelsPerBeat * this.editor.transform.scale.x;
        //return (this.canvas.width)/(this.bpmValue+1);
    }

    distanceBetweenBeatLines() {
        return (this.canvas.height)/(this.beatLinesCount+1);
    }

    setBpmValue(event) {            
        var bpm = parseInt(event.target.value);
        
        bpm < this.bpmRange.x ? bpm = this.bpmRange.x : bpm = bpm;
        bpm > this.bpmRange.y ? bpm = this.bpmRange.y : bpm = bpm;

        this.bpmValue = bpm;
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
                var beatLine = new BeatLine((i+1)*this.distanceBetweenBeatLines(), this.editor.transform);
                this.beatLines.push(beatLine);
            }
            this.beatLines[i].transform.position = new Vec2(0, (i+1)*this.distanceBetweenBeatLines());
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
            
            var bpmLine = new BPMLine(i, this.editor.transform, color);
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

class BPMSnapLine {

}

class BPMLine {

    transform: Transform = new Transform();
    isActive: boolean = true;
    color: RgbaColor;

    constructor(x : number, parent : Transform, rgbaColor: RgbaColor) {
        this.color = rgbaColor;
        this.transform.parent = parent;
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
    }

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }
}

class BeatLine {
    
    transform: Transform = new Transform();
    isActive: boolean = true;

    constructor(y:number, parent: Transform) {
        this.transform.parent = parent;
        this.transform.position = new Vec2(0,y)
    }

    draw(view: Viewport, canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = appSettings.beatLineColor.value();
        ctx.beginPath();
        ctx.moveTo(0, this.transform.position.y);
        ctx.lineTo(canvas.width, this.transform.position.y);
        ctx.stroke();
    }

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
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
const inputController = new InputsController(editor);
module.exports = editor;