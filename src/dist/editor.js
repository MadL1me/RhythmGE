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
}
class Editor {
    constructor() {
        this.relativePosition = new Vec2(0, 0);
        this.maxDeviation = new Vec2(100, 100);
        this.scale = new Vec2(10, 1);
        this.scrollingSpeed = 0.2;
        this.fastScrollingSpeed = 5;
        this.isPlaying = false;
        this.notes = [...Array(10)].map(e => Array(5));
        this.canvas = document.getElementById("editor_canvas");
        this.ctx = this.canvas.getContext("2d");
        this.ctx.translate(0.5, 0.5);
        this.topScale = new TopScale(10);
        this.leftScale = new LeftScale(10);
        this.editorGrid = new EditorGrid(10, 10, this.canvas);
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
        this.audioController = new AudioController(audioPath);
        this.audioController.sound.on("load", () => { this.drawEditor(); });
    }
    onPlay() {
        this.isPlaying = true;
        this.audioController.play();
    }
    onPause() {
        this.isPlaying = false;
        this.audioController.sound.pause();
    }
    onCanvasScroll(mouseDelta, isSpeededUp) {
        var resultedDelta = mouseDelta * this.scrollingSpeed;
        if (isSpeededUp)
            resultedDelta *= this.fastScrollingSpeed;
        this.relativePosition.x += resultedDelta;
        if (this.relativePosition.x > this.maxDeviation.x)
            this.relativePosition.x = this.maxDeviation.x;
        console.log(this.relativePosition.x);
        this.drawEditor();
    }
    onCanvasResize(mouseDelta) {
    }
    canvasClickHandle(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left - this.relativePosition.x;
        const clickY = event.clientY - rect.top - this.relativePosition.y;
        var columnNum = Math.round((clickX - this.editorGrid.offset.x) / (this.editorGrid.distanceBetweenBeatLines) - 1);
        var rowNum = Math.round((clickY - this.editorGrid.offset.y) / (this.editorGrid.distanceBetweenBpmLines) - 1);
        if (columnNum < -0.6 || rowNum < -0.6) {
            return;
        }
        const x = this.editorGrid.bpmLines[columnNum].X - this.relativePosition.x;
        const y = this.editorGrid.beatLines[rowNum].Y - this.relativePosition.y;
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
                note.draw(this.canvas, this.relativePosition);
            }
        }
    }
    drawEditor() {
        console.log("draw editor");
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#EDEDED';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.editorGrid.draw(this.relativePosition, this.audioController != null && this.audioController.sound.state() == "loaded");
        this.notes.forEach(notes => {
            notes.forEach(note => {
                if (note != null) {
                    note.draw(this.canvas, this.relativePosition);
                }
            });
        });
        this.audioCanvas.draw(this.relativePosition);
        this.topScale.draw(this.canvas);
        this.leftScale.draw(this.canvas);
        if (this.isPlaying) {
            this.timestepLine.movePosition(this.scale.x * this.audioController.sound.seek());
        }
        this.timestepLine.draw(this.relativePosition.x);
    }
}
class AudioController {
    constructor(soundPath) {
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
        this.ctx.beginPath();
        this.ctx.fillStyle = "#f7075b";
        this.ctx.moveTo(this.x + offsetX, 10);
        this.ctx.lineTo(this.x + offsetX - 5, 0);
        this.ctx.lineTo(this.x + offsetX + 5, 0);
        this.ctx.fill();
        this.ctx.strokeStyle = "#f7075b";
        this.ctx.moveTo(this.x + offsetX, 0);
        this.ctx.lineTo(this.x + offsetX, this.canvas.height);
        this.ctx.stroke();
    }
}
class EditorSettings {
    constructor() {
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
        ctx.fillRect(0, 0, canvas.width, this.height);
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
    constructor(offsetX, offsetY, canvas) {
        this.canvas = canvas;
        this.bpmValue = 80;
        this.beatLinesCount = 5;
        this.offset = new Vec2(offsetX, offsetY);
        this.timestep = 0;
        this.bpmLines = [];
        this.beatLines = [];
    }
    get distanceBetweenBeatLines() {
        return (this.canvas.width - this.offset.x) / (this.bpmValue + 1);
    }
    get distanceBetweenBpmLines() {
        return (this.canvas.height - this.offset.y) / (this.beatLinesCount + 1);
    }
    setOffset(offset) {
        this.offset = offset;
    }
    setBpmValue(bpm) {
        this.bpmValue = bpm;
        console.log(bpm);
    }
    setBeatLinesCount(beatLines) {
        this.beatLinesCount = beatLines;
        console.log(beatLines);
    }
    draw(relativePosition, drawBpmLines) {
        const canvas = this.canvas;
        const ctx = canvas.getContext('2d');
        this.bpmLines = [];
        this.beatLines = [];
        var distanceBetweenBeatLines = this.distanceBetweenBeatLines;
        var distanceBetweenBpmLines = this.distanceBetweenBpmLines;
        //console.log(distanceBetweenBeatLines);
        //console.log(distanceBetweenBpmLines);
        for (var i = 1; i <= this.beatLinesCount; i++) {
            this.beatLines.push(new BeatLine(this.offset.x, this.offset.y + relativePosition.y, i * distanceBetweenBpmLines));
        }
        this.beatLines.forEach(beatLine => {
            beatLine.draw(canvas);
        });
        if (drawBpmLines) {
            for (var i = 1; i < canvas.width / (distanceBetweenBeatLines) - 1; i++) {
                this.bpmLines.push(new BPMLine(this.offset.x + relativePosition.x, this.offset.y, i * distanceBetweenBeatLines));
            }
            this.bpmLines.forEach(bpmLine => {
                bpmLine.draw(canvas);
            });
        }
    }
}
class BPMLine {
    constructor(offsetX, offsetY, x) {
        this.x = x;
        this.offset = new Vec2(offsetX, offsetY);
    }
    draw(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.x + this.offset.x, this.offset.y);
        ctx.lineTo(this.x + this.offset.x, canvas.height);
        ctx.stroke();
    }
    get X() {
        return this.x + this.offset.x;
    }
}
class BeatLine {
    constructor(offsetX, offsetY, y) {
        this.y = y;
        this.offset = new Vec2(offsetX, offsetY);
    }
    draw(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.offset.x, this.y + this.offset.y);
        ctx.lineTo(canvas.width, this.y + this.offset.y);
        ctx.stroke();
    }
    get Y() {
        return this.y + this.offset.y;
    }
}
var editor = new Editor();
module.exports = editor;
