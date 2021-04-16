/// <reference path ='../../node_modules/@types/jquery/jquery.d.ts'/>
/// <reference path='RgbaColor.ts'/>

import { throws } from 'node:assert';
import { format } from 'node:path';
import { off } from 'node:process';

import $ from 'jquery';

import { RgbaColor } from "./RgbaColor";
import { Vec2 } from "./Vec2";
import { Transform } from "./Transform";
import { TopScale, LeftScale, BottomScale } from "./Scale";
import { BPMLine, CreatableTimestampLine, Timestamp, TimestepLine, BeatLine } from "./GridElements";
import { Viewport } from "./Viewport";
import { appSettings } from "./AppSettings";
import { Input } from "./Input";
import { Slider } from "./Utils";
import { AudioAmplitudeCanvas, AudioPlayer } from "./Audio";

export class Editor {

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

const editor = new Editor();
const inputController = new Input(editor);
editor.inputController = inputController;
module.exports = editor;