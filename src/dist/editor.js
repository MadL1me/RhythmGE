'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
//var Howler = require("howler");
//var Howl = require("howler");
const { Howl, Howler } = require('howler');
class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static Sum(v1, v2) {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }
    static Multiply(v1, v2) {
        return new Vec2(v1.x * v2.x, v1.y * v2.y);
    }
}
class AppSettings {
    constructor() {
    }
}
class Transform {
    constructor() {
        this._parent = null;
        this._children = null;
        this._position = new Vec2(100, 0);
        this.scale = new Vec2(10, 1);
        this.rotation = new Vec2(0, 0);
        this.maxDeviation = new Vec2(100, 100);
        this.maxScale = new Vec2(100, 100);
        this.minScale = new Vec2(1, 1);
    }
    get position() {
        if (parent == null)
            return this._position;
        return Vec2.Sum(this._position, this._parent.position);
    }
    set position(value) {
        var oldVal = this._position;
        this._position = value;
        this._children.forEach(child => {
            child.position = Vec2.Sum(child.position, oldVal);
        });
    }
    canvasPosition() {
        return this.worldToCanvas(this.position);
    }
    worldToCanvas(worldCoords) {
        return new Vec2(this.position.x - worldCoords.x / this.scale.x, this.position.y - worldCoords.x / this.scale.y);
    }
    canvasToWorld(canvasCoords) {
        return new Vec2(this.position.x - canvasCoords.x * this.scale.x, this.position.y - canvasCoords.y * this.scale.y);
    }
    get parent() {
        return this._parent;
    }
    set parent(parent) {
        if (parent == null) {
            parent.removeChild(this);
            this._parent = parent;
            return;
        }
        this._parent = parent;
        this._parent?.addChild(this);
    }
    addChild(child) {
        this._children.push(child);
    }
    removeChild(child) {
    }
}
class Editor {
    constructor() {
        this.isPlaying = false;
        this.audioLoaded = false;
        this.scrollingSpeed = 0.2;
        this.resizingSpeed = 0.01;
        this.fastScrollingSpeed = 5;
        this.notes = Array(5).fill(null).map(() => Array(5));
        this.transform = new Transform();
        this.canvas = document.getElementById("editor_canvas");
        this.ctx = this.canvas.getContext("2d");
        //this.ctx.translate(0.5,0.5);
        this.topScale = new TopScale(10);
        this.leftScale = new LeftScale(10);
        this.editorGrid = new EditorGrid(this.canvas);
        this.audioCanvas = new AudioAmplitudeCanvas();
        this.timestepLine = new TimestepLine();
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
    onAudioLoad(audioPath) {
        this.audioController = new AudioController(this, audioPath, this.timestepLine);
        this.audioController.sound.on("load", () => {
            this.audioLoaded = true;
            var gridSize = this.editorGrid.getGridSize();
            this.notes = Array(gridSize.y).fill(null).map(() => Array(gridSize.x));
            this.drawEditor();
            this.editorGrid.initBpmLines();
        });
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
    onCanvasScroll(mouseDelta, isSpeededUp) {
        var resultedDelta = mouseDelta * this.scrollingSpeed;
        if (isSpeededUp)
            resultedDelta *= this.fastScrollingSpeed;
        this.transform.position.x += resultedDelta;
        if (this.transform.position.x > this.transform.maxDeviation.x)
            this.transform.position.x = this.transform.maxDeviation.x;
        console.log(this.transform.position.x);
        this.drawEditor();
    }
    onCanvasResize(mouseDelta) {
        var resultedDelta = mouseDelta * this.resizingSpeed;
        console.log("resized!!");
        var oldScale = this.transform.scale.x;
        this.transform.scale.x -= resultedDelta;
        console.log(this.transform.scale);
        this.transform.position.x = this.transform.position.x * this.transform.scale.x / oldScale;
        if (this.transform.scale.x <= this.transform.minScale.x)
            this.transform.scale.x = this.transform.minScale.x;
        if (this.transform.scale.x >= this.transform.maxScale.x)
            this.transform.scale.x = this.transform.maxScale.x;
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
        var columnNum = Math.round((clickX) / (this.editorGrid.distanceBetweenBeatLines()) - 1);
        var rowNum = Math.round((clickY) / (this.editorGrid.distanceBetweenBpmLines(this)) - 1);
        if (columnNum < -0.6 || rowNum < -0.6) {
            return;
        }
        console.log(columnNum);
        console.log(rowNum);
        const x = this.editorGrid.bpmLines[columnNum].x + this.transform.position.x - this.transform.position.x;
        const y = this.editorGrid.beatLines[rowNum].y + this.transform.position.y - this.transform.position.y;
        //console.log(this.editorGrid.distanceBetweenBpmLines);
        //console.log(this.editorGrid.distanceBetweenBeatLines);
        console.log(columnNum + ":" + rowNum);
        console.log(Math.abs(x - clickX) + ":" + Math.abs(y - clickY));
        if (Math.abs(y - clickY) <= 20 && Math.abs(x - clickX) <= 20) {
            //console.log(this.notes[columnNum][rowNum]);
            if (this.notes[columnNum][rowNum] != undefined && this.notes[columnNum][rowNum] != null) {
                console.log("remove timestamp");
                this.notes[columnNum][rowNum] = null;
                this.drawEditor();
            }
            else {
                console.log("add timestamp");
                const note = new Timestamp(x, y, 10);
                this.notes[columnNum][rowNum] = note;
                note.draw(this.canvas, this.transform.position);
            }
        }
    }
    drawEditor() {
        //console.log("draw editor")
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#EDEDED';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.editorGrid.draw(this.transform.position, this.audioController != null && this.audioController.sound.state() == "loaded", this.transform.scale, this);
        this.notes.forEach(notes => {
            notes.forEach(note => {
                if (note != null) {
                    note.draw(this.canvas, this.transform.position);
                }
            });
        });
        this.audioCanvas.draw(this.transform.position);
        this.topScale.draw(this.canvas);
        this.leftScale.draw(this.canvas);
        if (this.isPlaying) {
            this.timestepLine.movePosition(this.transform.scale.x * this.audioController.sound.seek());
        }
        this.timestepLine.draw(this.transform.position.x);
    }
}
class AudioController {
    constructor(editor, soundPath, timestepLine) {
        this.editor = editor;
        this.timestepLine = timestepLine;
        this.sound = new Howl({ src: [soundPath] });
        this.analyser = Howler.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.sound.on("play", () => {
            console.log(this);
            console.log(this.soundId);
            this.sound._soundById(this.soundId)._node.bufferSource.connect(this.analyser);
        });
    }
    play() {
        this.soundId = this.sound.play();
        console.log(this.soundId);
        console.log(this.analyser);
    }
    setMusicFromCanvasPosition(position, editor) {
        this.timestepLine.movePosition(this.editor.transform.canvasToWorld(position).x);
        editor;
    }
    setMusicFromTimePosition() {
    }
    getDomainData() {
        var dataArray = new Float32Array(this.analyser.frequencyBinCount);
        this.analyser.getFloatTimeDomainData(dataArray);
        return dataArray;
    }
}
class AudioAmplitudeCanvas {
    constructor() {
        this.canvas = document.getElementById("audio_amplitude_canvas");
        this.ctx = this.canvas.getContext("2d");
    }
    draw(offset) {
        //var 
    }
}
class TimestepLine {
    constructor() {
        this.x = 0;
        this.canvas = document.getElementById("editor_canvas");
        this.ctx = this.canvas.getContext("2d");
    }
    movePosition(x) {
        this.x = x;
    }
    draw(offsetX) {
        var x = this.x + offsetX;
        if (x >= this.canvas.width)
            x = this.canvas.width - 5;
        if (x <= 0)
            x = 0;
        this.ctx.beginPath();
        this.ctx.fillStyle = "#f7075b";
        this.ctx.moveTo(x, 10);
        this.ctx.lineTo(x - 5, 0);
        this.ctx.lineTo(x + 5, 0);
        this.ctx.fill();
        this.ctx.strokeStyle = "#f7075b";
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvas.height);
        this.ctx.stroke();
    }
}
class Timestamp {
    constructor(x, y, width) {
        this.pos = new Vec2(x, y);
        this.width = width;
    }
    changePosition(newPos) {
        this.pos = newPos;
    }
    draw(canvas, offset) {
        const ctx = canvas.getContext('2d');
        const pos = new Vec2(this.pos.x + offset.x, this.pos.y + offset.y);
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.moveTo(pos.x - this.width, pos.y);
        ctx.lineTo(pos.x, pos.y - this.width);
        ctx.lineTo(pos.x + this.width, pos.y);
        ctx.lineTo(pos.x, pos.y + this.width);
        ctx.fill();
    }
}
class TopScale {
    constructor(height) {
        this.height = height;
    }
    draw(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#A6A6A6';
        ctx.fillRect(0, -5, canvas.width, this.height + 5);
    }
}
class LeftScale {
    constructor(width) {
        this.width = width;
    }
    draw(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#A6A6A6';
        ctx.fillRect(0, 0, this.width, canvas.height);
    }
}
class EditorGrid {
    constructor(canvas) {
        this.canvas = canvas;
        this.bpmValue = 60;
        this.beatLinesCount = 5;
        this.timestep = 0;
        this.bpmLines = [];
        this.beatLines = [];
        this.initGrid();
    }
    distanceBetweenBpmLines(editor) {
        var soundLength = editor.audioController.sound.duration();
        var bpmCount = (soundLength / 60) * this.bpmValue;
        var pixelsPerBeat = soundLength / bpmCount;
        return pixelsPerBeat * editor.transform.scale.x;
        //return (this.canvas.width)/(this.bpmValue+1);
    }
    distanceBetweenBeatLines() {
        return (this.canvas.height) / (this.beatLinesCount + 1);
    }
    setBpmValue(bpm) {
        this.bpmValue = bpm;
        console.log(bpm);
    }
    setBeatLinesCount(beatLines) {
        this.beatLinesCount = beatLines;
        console.log(beatLines);
    }
    getGridSize() {
        return new Vec2(this.bpmValue, this.beatLinesCount);
    }
    initGrid() {
        for (var i = 0; i < this.beatLinesCount; i++) {
            this.beatLines.push(new BeatLine(i * this.distanceBetweenBeatLines()));
        }
    }
    initBpmLines() {
        var soundLength = editor.audioController.sound.duration();
        var bpmCount = (soundLength / 60) * this.bpmValue;
        for (var i = 0; i < bpmCount; i++) {
            this.bpmLines.push(new BPMLine(i * this.distanceBetweenBpmLines(editor)));
        }
    }
    draw(position, drawBpmLines, scale, editor) {
        const canvas = this.canvas;
        const ctx = canvas.getContext('2d');
        //console.log(distanceBetweenBeatLines);
        //console.log(distanceBetweenBpmLines);
        for (var i = 0; i < this.beatLines.length; i++) {
            this.beatLines[i].moveY((i + 1) * this.distanceBetweenBeatLines());
        }
        this.beatLines.forEach(beatLine => {
            if (beatLine.isActive)
                beatLine.draw(position, canvas);
        });
        if (drawBpmLines) {
            var soundLength = editor.audioController.sound.duration();
            var bpmCount = (soundLength / 60) * this.bpmValue;
            var pixelsPerBeat = soundLength / bpmCount;
            //console.log(this.bpmLines.length);
            for (var i = 0; i < this.bpmLines.length; i++) {
                //console.log("bpm line is pushed");
                this.bpmLines[i].moveX(i * scale.x * pixelsPerBeat);
            }
            this.bpmLines.forEach(bpmLine => {
                if (bpmLine.isActive)
                    bpmLine.draw(position, canvas);
            });
        }
    }
}
class BPMLine {
    constructor(x) {
        this.isActive = true;
        this.x = x;
    }
    draw(offset, canvas) {
        if (!this.isActive)
            return;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.x + offset.x, offset.y);
        ctx.lineTo(this.x + offset.x, canvas.height);
        ctx.stroke();
    }
    moveX(x) {
        this.x = x;
    }
    activate() {
        this.isActive = true;
    }
    deactivate() {
        this.isActive = false;
    }
}
class CreatableTimestampLine {
    constructor(x) {
    }
}
class BeatLine {
    constructor(y) {
        this.isActive = true;
        this.y = y;
    }
    draw(offset, canvas) {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(0, this.y + offset.y);
        ctx.lineTo(canvas.width, this.y + offset.y);
        ctx.stroke();
    }
    moveY(y) {
        this.y = y;
    }
    activate() {
        this.isActive = true;
    }
    deactivate() {
        this.isActive = false;
    }
}
const editor = new Editor();
module.exports = editor;
