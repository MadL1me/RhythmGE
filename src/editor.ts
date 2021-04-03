'use strict';

import { off } from "node:process";
const {Howl, Howler} = require('howler');

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

class AppSettings {
    constructor() {
        
    }
}

class Transform {

    private _parent: Transform = null;
    private _children: Array<Transform> = new Array<Transform>();
    private _localPosition: Vec2 = new Vec2(0,0);
    
    scale: Vec2 = new Vec2(10,1);
    rotation: Vec2 = new Vec2(0,0);

    maxDeviation: Vec2 = new Vec2(100,100);
    maxScale: Vec2 = new Vec2(100, 100);
    minScale: Vec2 = new Vec2(1, 1);

    get localPosition() : Vec2 {
        return this._localPosition;
    }

    set localPosition(value: Vec2) {
        var oldLocalPos = this._localPosition;
        this._localPosition = value;
        this._children.forEach(child => {
            child.position = Vec2.Sum(child.position, oldLocalPos);
        });
    }

    get position() : Vec2 {
        if (this._parent == null)
            return this._localPosition;
        return Vec2.Sum(this._localPosition, this._parent.position);
    }

    set position(value: Vec2) {
        var pos = this.position;
        console.log("position change")
        this.localPosition = Vec2.Substract(pos, value);
    }

    canvasPosition() : Vec2 {
        return this.worldToCanvas(this.position);
    }

    worldToCanvas(worldCoords : Vec2) : Vec2 {
        const pos = this.position;
        return new Vec2(pos.x - worldCoords.x/this.scale.x,
                        pos.y- worldCoords.x/this.scale.y);
    }

    canvasToWorld(canvasCoords : Vec2) : Vec2 {
        const pos = this.position;
        return new Vec2(pos.x-canvasCoords.x * this.scale.x,
                        pos.y-canvasCoords.y * this.scale.y);
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

    isPlaying: boolean = false;
    audioLoaded: boolean = false;
    scrollingSpeed : number = 0.2;
    resizingSpeed: number = 0.01;
    fastScrollingSpeed :number = 5;

    transform: Transform;
    notes: Array<Array<Timestamp>>;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    topScale: TopScale;
    leftScale: LeftScale;
    editorGrid: EditorGrid;
    audioCanvas: AudioAmplitudeCanvas;    
    audioController: AudioController; 
    timestepLine: TimestepLine;

    constructor() {
        this.notes = Array(5).fill(null).map(() => Array(5));
        this.transform = new Transform();
        this.transform.position = new Vec2(100,0);

        this.canvas = document.getElementById("editor_canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d");
        //this.ctx.translate(0.5,0.5);
        
        this.topScale = new TopScale(10);
        this.leftScale = new LeftScale(10);
        this.editorGrid = new EditorGrid(this, this.canvas);
        this.audioCanvas = new AudioAmplitudeCanvas();
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
        
        if (!this.isPlaying)
            return;

        this.drawEditor();
    }

    onAudioLoad(audioPath : string) {
        this.audioController = new AudioController(this, audioPath, this.timestepLine);
        this.audioController.sound.on("load", () => 
        { 
            this.audioLoaded = true;
            var gridSize = this.editorGrid.getGridSize();
            this.notes = Array(gridSize.y).fill(null).map(() => Array(gridSize.x));
            this.drawEditor(); 
            this.editorGrid.initBpmLines();
        })
    }

    onPlay() {
        if (this.isPlaying == true)
            return;
        
        this.isPlaying = true;
        this.audioController.play();
    }

    onPause() {
        if (this.isPlaying == false)
            return; 

        this.isPlaying = false;
        this.audioController.sound.pause();
    }

    onCanvasScroll(mouseDelta : number, isSpeededUp : boolean) {
        var resultedDelta = mouseDelta*this.scrollingSpeed;
        if (isSpeededUp) 
            resultedDelta *= this.fastScrollingSpeed; 

        this.transform.position = new Vec2(this.transform.position.x+resultedDelta, this.transform.position.y);

        if (this.transform.position.x > this.transform.maxDeviation.x)
            this.transform.position = new Vec2(this.transform.maxDeviation.x, this.transform.position.y);

        console.log(this.transform.position.x);
        this.drawEditor();
    }

    onCanvasResize(mouseDelta : number) {
        var resultedDelta = mouseDelta*this.resizingSpeed;
        console.log("resized!!");
        var oldScale = this.transform.scale.x;
        this.transform.scale = new Vec2(this.transform.scale.x-resultedDelta, this.transform.scale.y);
        this.transform.position = new Vec2(this.transform.position.x*this.transform.scale.x/oldScale, this.transform.position.y);

        if (this.transform.scale.x <= this.transform.minScale.x) 
            this.transform.scale = new Vec2(this.transform.minScale.x, this.transform.scale.y);
        if (this.transform.scale.x >= this.transform.maxScale.x)
            this.transform.scale = new Vec2(this.transform.maxScale.x, this.transform.scale.y);
            
        this.drawEditor();
    }

    canvasClickHandle(event) {
        
        if (!this.audioLoaded)
            return;

        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left - this.transform.position.x;
        const clickY = event.clientY - rect.top - this.transform.position.y;
        const click = new Vec2(clickX, clickY);

        console.log(clickY);

        if (clickY <= this.topScale.height) {
            console.log("Set Music!!!");
            this.audioController.setMusicFromCanvasPosition(click, this);
        }

        var columnNum = Math.round((clickX)/(this.editorGrid.distanceBetweenBeatLines())-1);
        var rowNum = Math.round((clickY)/(this.editorGrid.distanceBetweenBpmLines())-1); 

        if (columnNum < -0.6 || rowNum < -0.6) {
            return;
        }

        console.log(columnNum);
        console.log(rowNum);

        const x = this.editorGrid.bpmLines[columnNum].transform.position.x+this.transform.position.x - this.transform.position.x;
        const y = this.editorGrid.beatLines[rowNum].transform.position.y+this.transform.position.y - this.transform.position.y;

        //console.log(this.editorGrid.distanceBetweenBpmLines);
        //console.log(this.editorGrid.distanceBetweenBeatLines);
        console.log(columnNum+":"+rowNum);
        console.log(Math.abs(x - clickX) + ":" + Math.abs(y - clickY))

        if (Math.abs(y - clickY) <= 20 && Math.abs(x - clickX) <= 20) {
            
            //console.log(this.notes[columnNum][rowNum]);
            
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

    drawEditor() {
        //console.log("draw editor")
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = '#EDEDED'
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height)
        
        this.editorGrid.draw(this.audioController != null && this.audioController.sound.state()=="loaded", this);

        this.notes.forEach(notes => { notes.forEach(note => {
            if (note!=null) { note.draw(this.canvas);
        }})});
        
        this.audioCanvas.draw(this.transform.position);

        this.topScale.draw(this.canvas);
        this.leftScale.draw(this.canvas);

        if (this.isPlaying){
            this.timestepLine.transform.position = new Vec2(this.transform.scale.x*this.audioController.sound.seek(), this.transform.scale.y);
        }

        this.timestepLine.draw();
    }
}


class AudioController {
   
    sound : any;
    soundId : number;
    analyser : AnalyserNode;
    timestepLine: TimestepLine;
    editor: Editor;

    constructor(editor: Editor, soundPath : string, timestepLine: TimestepLine) {

        this.editor = editor;
        this.timestepLine = timestepLine;
        this.sound = new Howl({src:[soundPath]});
        
        this.analyser = Howler.ctx.createAnalyser();
        this.analyser.fftSize = 256;

        this.sound.on("play", () => {
            console.log(this);
            console.log(this.soundId);
            this.sound._soundById(this.soundId)._node.bufferSource.connect(this.analyser) 
        });
    }

    play() {
        this.soundId = this.sound.play();
        console.log(this.soundId);
        console.log(this.analyser); 
    }

    setMusicFromCanvasPosition(position : Vec2, editor : Editor) {
        this.timestepLine.transform.position = this.editor.transform.canvasToWorld(position);
        editor
    }

    setMusicFromTimePosition() {

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

    constructor() {
        this.canvas = document.getElementById("audio_amplitude_canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d");
    }

    draw(offset : Vec2) {
        //var 
    }
}


class TimestepLine {
    
    transform: Transform = new Transform();
    canvas: HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;

    constructor() {
        this.canvas = document.getElementById("editor_canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d");
    }

    draw() {
        var x = this.transform.position.x
        if (x>=this.canvas.width)
            x = this.canvas.width-5;
        if (x<=0)
            x = 0;

        this.ctx.beginPath();
        this.ctx.fillStyle = "#f7075b";
        this.ctx.moveTo(x, 10);
        this.ctx.lineTo(x-5, 0);
        this.ctx.lineTo(x+5, 0);
        this.ctx.fill();

        this.ctx.strokeStyle = "#f7075b";
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
        var soundLength = this.editor.audioController.sound.duration();
        var bpmCount = (soundLength/60) * this.bpmValue;
        var pixelsPerBeat = soundLength / bpmCount;
        return pixelsPerBeat * this.editor.transform.scale.x;
        //return (this.canvas.width)/(this.bpmValue+1);
    }

    distanceBetweenBeatLines() {
        return (this.canvas.height)/(this.beatLinesCount+1);
    }

    setBpmValue(bpm : number) {
        this.bpmValue = bpm;
        console.log(bpm);
    }

    setBeatLinesCount(beatLines : number) {
        this.beatLinesCount = beatLines;
        console.log(beatLines);
    }

    getGridSize() : Vec2 {
        return new Vec2(this.bpmValue, this.beatLinesCount);    
    }

    initGrid() {
        for (var i=0; i<this.beatLinesCount; i++){ 
            var beatLine = new BeatLine(i*this.distanceBetweenBeatLines());
            beatLine.transform.parent = this.editor.transform;
            this.beatLines.push(beatLine);
        }
    }

    initBpmLines() {
        var soundLength = editor.audioController.sound.duration();
        var bpmCount = (soundLength/60) * this.bpmValue;
        
        for (var i=0; i<bpmCount; i++) {
            var bpmLine = new BPMLine(i*this.distanceBetweenBpmLines());
            bpmLine.transform.parent = this.editor.transform;
            this.bpmLines.push(bpmLine);
        }
    }

    draw(drawBpmLines: boolean, editor: Editor) {
        const canvas = this.canvas;
        const ctx = canvas.getContext('2d');

        //console.log(distanceBetweenBeatLines);
        //console.log(distanceBetweenBpmLines);
        
        // for (var i=0; i<this.beatLines.length; i++){ 
        //     this.beatLines[i].moveY((i+1)*this.distanceBetweenBeatLines());
        // }

        this.beatLines.forEach(beatLine => {
            if (beatLine.isActive)
                beatLine.draw(canvas);
        });

        if (drawBpmLines) {
            var soundLength = editor.audioController.sound.duration();
            var bpmCount = (soundLength/60) * this.bpmValue;
            var pixelsPerBeat = soundLength / bpmCount;

            //console.log(this.bpmLines.length);
            
            // for (var i=0; i<this.bpmLines.length; i++){ 
            //     //console.log("bpm line is pushed");
            //     this.bpmLines[i].moveX(i*scale.x*pixelsPerBeat);
            // }
            
            this.bpmLines.forEach(bpmLine => {
                if (bpmLine.isActive)
                    bpmLine.draw(canvas)
            });
        }
    }
}

class BPMLine {

    transform: Transform = new Transform();
    isActive: boolean = true;
    
    constructor(x : number) {
        this.transform.position = new Vec2(x, 0);
    }

    draw(canvas : HTMLCanvasElement) {
        if (!this.isActive)
            return;
        
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = "black";

        ctx.beginPath();
        ctx.moveTo(this.transform.position.x, 0);
        ctx.lineTo(this.transform.position.x, canvas.height);
        ctx.stroke();
    }

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }
}

class CreatableTimestampLine {
    
    transform: Transform = new Transform();

    constructor(x: number) {
        
    }
}


class BeatLine {
    
    transform: Transform = new Transform();
    isActive: boolean = true;

    constructor(y:number) {
        this.transform.position = new Vec2(0,y)
    }

    draw(canvas : HTMLCanvasElement) {
        console.log("betline draw")
        console.log(this.transform.position);
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(0, -this.transform.position.y);
        ctx.lineTo(canvas.width, -this.transform.position.y);
        ctx.stroke();
    }

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }
}


class TopScale {
   
    height: number;
   
    constructor(height : number) {
        this.height = height;
    }

    draw(canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#A6A6A6';
        ctx.fillRect(0,-5,canvas.width,this.height+5);
    }
}

class LeftScale {
    
    width: number;
    
    constructor(width : number) {
        this.width = width;
    }

    draw(canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#A6A6A6';
        ctx.fillRect(0,0, this.width,canvas.height);
    }
}

const editor = new Editor();
module.exports = editor;