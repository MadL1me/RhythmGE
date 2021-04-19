"use strict";
/// <reference path ='../../node_modules/@types/jquery/jquery.d.ts'/>
/// <reference path='RgbaColor.ts'/>
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Editor = void 0;
var jquery_1 = __importDefault(require("jquery"));
var RgbaColor_1 = require("./RgbaColor");
var Vec2_1 = require("./Vec2");
var Transform_1 = require("./Transform");
var Scale_1 = require("./Scale");
var GridElements_1 = require("./GridElements");
var Viewport_1 = require("./Viewport");
var AppSettings_1 = require("./AppSettings");
var Input_1 = require("./Input");
var Audio_1 = require("./Audio");
var Editor = /** @class */ (function () {
    function Editor() {
        this.usingClaps = false;
        this.followingLine = false;
        this.hideBpmLines = false;
        this.hideCreatableLines = false;
        this.audioLoaded = false;
        this.scrollingSpeed = 0.2;
        this.resizingSpeed = 0.01;
        this.fastScrollingSpeed = 5;
        this.offset = 0;
        this.creatableLines = {};
        this.canvas = jquery_1.default('#editor-canvas')[0];
        this.ctx = this.canvas.getContext('2d');
        this.timestamps = Array(5).fill(null).map(function () { return Array(5); });
        this.transform = new Transform_1.Transform();
        this.viewport = new Viewport_1.Viewport(this.canvas);
        this.viewport.gridTransform = this.transform;
        // WARNING
        this.viewport.transform.parent = this.transform;
        this.viewport.transform.position = new Vec2_1.Vec2(-10, 0);
        // WARNING
        this.transform.position = new Vec2_1.Vec2(0, 0);
        this.transform.scale = new Vec2_1.Vec2(10, 1);
        //this.ctx.translate(0.5,0.5);
        this.audioPlayer = new Audio_1.AudioPlayer(this);
        this.topScale = new Scale_1.TopScale(10);
        this.leftScale = new Scale_1.LeftScale(10);
        this.bottomScale = new Scale_1.BottomScale(10);
        this.editorGrid = new EditorGrid(this, this.canvas);
        this.audioCanvas = new Audio_1.AudioAmplitudeCanvas(this);
        this.timestepLine = new GridElements_1.TimestepLine(this.transform, AppSettings_1.appSettings.timestepLineColor);
        this.drawEditor();
    }
    Editor.prototype.changeBeatlinesCount = function (beatLines) {
        this.editorGrid.setBeatLinesCount(beatLines);
        this.drawEditor();
    };
    Editor.prototype.changeBpmValue = function (bpm) {
        this.editorGrid.setBpmValue(bpm);
        this.drawEditor();
    };
    Editor.prototype.changeOffset = function (offset) {
        this.offset = parseInt(offset.target.value);
        this.editorGrid.transform.localPosition = new Vec2_1.Vec2(this.offset / 100, 0);
    };
    Editor.prototype.updateLoop = function () {
        //if (!this.audioPlayer.isPlaying())
        //return;
        this.inputController.update();
        this.canvasPlacePhantomElementHandler();
        this.audioPlayer.update();
        this.drawEditor();
    };
    Editor.prototype.onAudioLoad = function (fileName, audioPath) {
        var _this = this;
        this.audioPlayer.onSoundLoad(fileName, audioPath);
        this.timestepLine.transform.parent = this.transform;
        this.audioPlayer.sound.on('load', function () {
            _this.audioLoaded = true;
            var gridSize = _this.editorGrid.getGridSize();
            _this.timestamps = Array(gridSize.y).fill(null).map(function () { return Array(gridSize.x); });
            _this.editorGrid.initBpmLines();
            _this.drawEditor();
        });
    };
    Editor.prototype.onPlayButtonClick = function (playBtn) {
        playBtn.classList.add('paused');
        if (this.audioPlayer.isPlaying() == true) {
            playBtn.classList.remove('paused');
            this.audioPlayer.pause();
        }
        else {
            this.audioPlayer.play();
        }
    };
    Editor.prototype.onPause = function () {
        if (this.audioPlayer.isPlaying() == false)
            return;
        this.audioPlayer.sound.pause();
    };
    Editor.prototype.onCanvasScroll = function (mouseDelta, isSpeededUp) {
        if (this.followingLine)
            return;
        var resultedDelta = mouseDelta * this.scrollingSpeed / this.transform.scale.x;
        if (isSpeededUp)
            resultedDelta *= this.fastScrollingSpeed;
        this.viewport.transform.localPosition = new Vec2_1.Vec2(this.viewport.transform.localPosition.x + resultedDelta, this.viewport.position.y);
        if (this.viewport.transform.localPosition.x > this.viewport.maxDeviation.x)
            this.viewport.transform.localPosition = new Vec2_1.Vec2(this.viewport.maxDeviation.x, this.viewport.position.y);
        this.drawEditor();
    };
    Editor.prototype.onWindowResize = function (event) {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;
        var div = this.canvas.parentElement;
        div.setAttribute('style', 'height:' + (h * 0.6).toString() + 'px');
        var info = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.setAttribute('width', (info.width).toString());
        this.canvas.setAttribute('height', (info.height / 4 * 3).toString());
        this.editorGrid.initGrid();
        this.audioCanvas.onWindowResize(event);
        this.drawEditor();
    };
    Editor.prototype.onCanvasResize = function (mouseDelta) {
        var resultedDelta = mouseDelta * this.resizingSpeed;
        var oldScale = this.transform.scale.x;
        var canvCenter = this.viewport.canvasToSongTime(new Vec2_1.Vec2(this.canvas.width / 2, 0));
        // if (resultedDelta < 0)
        //     this.viewport.position = Vec2.Sum(this.viewport.position, canvCenter);
        // else
        //     this.viewport.position = Vec2.Substract(this.viewport.position, canvCenter);
        this.transform.scale = new Vec2_1.Vec2(this.transform.scale.x - resultedDelta, this.transform.scale.y);
        var scaleIsChanged = true;
        if (this.transform.scale.x <= this.transform.minScale.x) {
            this.transform.scale = new Vec2_1.Vec2(this.transform.minScale.x, this.transform.scale.y);
            scaleIsChanged = false;
        }
        if (this.transform.scale.x >= this.transform.maxScale.x) {
            this.transform.scale = new Vec2_1.Vec2(this.transform.maxScale.x, this.transform.scale.y);
            scaleIsChanged = false;
        }
        var newCanvCenter = this.viewport.canvasToSongTime(new Vec2_1.Vec2(this.canvas.width / 2, 0));
        //this.viewport.position = Vec2.Sum(this.viewport.position, Vec2.Substract(newCanvCenter, canvCenter));
        this.viewport.position = Vec2_1.Vec2.Substract(new Vec2_1.Vec2(this.canvas.width / 2, 0), canvCenter);
        // if (resultedDelta < 0)
        //     this.viewport.position = Vec2.Sum(this.viewport.position, this.viewport.canvasToWorld(new Vec2(this.canvas.width/2,0)));
        // else
        //     this.viewport.position = Vec2.Substract(this.viewport.position, this.viewport.canvasToWorld(new Vec2(this.canvas.width/2,0)));
        // const canvasCenter = this.viewport.canvasToWorld(new Vec2(this.canvas.width/2,0));
        // this.viewport.position = new Vec2(canvasCenter.x/scaleDiff, 1); 
        this.drawEditor();
    };
    Editor.prototype.canvasMouseDownHandle = function (event) {
    };
    Editor.prototype.canvasClickHandle = function (event) {
        if (!this.audioLoaded)
            return;
        var rect = this.canvas.getBoundingClientRect();
        var clickX = event.clientX - rect.left;
        var clickY = event.clientY - rect.top;
        var click = new Vec2_1.Vec2(clickX, clickY);
        if (clickY <= this.topScale.width) {
            this.audioPlayer.setMusicFromCanvasPosition(click, this);
        }
        var closestBeatline = this.findClosestBeatLine(click);
    };
    Editor.prototype.canvasPlacePhantomElementHandler = function () {
        if (this.inputController.keysPressed['Alt']) {
            var rect = this.canvas.getBoundingClientRect();
            var clickX = this.inputController.mousePosition.x - rect.left;
            var clickY = this.inputController.mousePosition.y - rect.top;
            var click = new Vec2_1.Vec2(clickX, clickY);
            var closestBeatline = this.findClosestBeatLine(click);
            this.phantomTimestamp = new GridElements_1.Timestamp(new RgbaColor_1.RgbaColor(158, 23, 240, 0.7), click.x / this.editorGrid.transform.scale.x, closestBeatline.transform.position.y, 10, this.editorGrid.transform);
        }
        else {
            this.phantomTimestamp = null;
        }
    };
    Editor.prototype.findClosestCreatableLine = function () {
    };
    Editor.prototype.findClosestBeatLine = function (canvasCoords) {
        var beatlinesCanvasDistance = this.editorGrid.distanceBetweenBeatLines();
        var beatlineIndex = Math.round(canvasCoords.y / beatlinesCanvasDistance) - 1;
        if (beatlineIndex < 0)
            beatlineIndex = 0;
        if (beatlineIndex > this.editorGrid.beatLinesCount - 1)
            beatlineIndex = this.editorGrid.beatLinesCount - 1;
        return this.editorGrid.beatLines[beatlineIndex];
    };
    Editor.prototype.findClosestBpmLine = function () {
    };
    Editor.prototype.createCustomBpmLine = function () {
        console.log('Custom bpm line created');
        var xPos = this.timestepLine.transform.position.x;
        var line = new GridElements_1.CreatableTimestampLine(xPos, this.transform, AppSettings_1.appSettings.creatableTimestampLineColor);
        this.creatableLines[line.transform.position.x] = line;
    };
    Editor.prototype.drawEditor = function () {
        var _this = this;
        var _a;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = AppSettings_1.appSettings.editorBackgroundColor.value();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.editorGrid.draw(this.audioPlayer != null
            && this.audioPlayer.sound != undefined
            && this.audioPlayer.sound != null
            && this.audioPlayer.sound.state() == 'loaded' && !this.hideBpmLines, this);
        //this.bottomScale.draw(this.canvas);
        //this.leftScale.draw(this.canvas);
        if (!this.hideCreatableLines) {
            for (var _i = 0, _b = Object.entries(this.creatableLines); _i < _b.length; _i++) {
                var _c = _b[_i], key = _c[0], value = _c[1];
                value.draw(this.viewport, this.canvas);
            }
        }
        this.timestamps.forEach(function (timestamps) {
            timestamps.forEach(function (note) {
                if (note != null) {
                    note.draw(_this.viewport, _this.canvas);
                }
            });
        });
        this.audioCanvas.draw();
        this.topScale.draw(this.canvas);
        if (this.audioPlayer.isPlaying()) {
            this.timestepLine.transform.localPosition = new Vec2_1.Vec2(this.audioPlayer.sound.seek(), 0);
            if (this.followingLine) {
                var result = new Vec2_1.Vec2(-this.timestepLine.transform.position.x + this.canvas.width / 2, 1);
                this.viewport.transform.position = result;
            }
        }
        this.timestepLine.draw(this.viewport, this.canvas);
        (_a = this.phantomTimestamp) === null || _a === void 0 ? void 0 : _a.draw(this.viewport, this.canvas);
    };
    return Editor;
}());
exports.Editor = Editor;
var EditorGrid = /** @class */ (function () {
    function EditorGrid(editor, canvas) {
        this.snapValue = 0;
        this.beatLinesRange = new Vec2_1.Vec2(1, 20);
        this.bpmRange = new Vec2_1.Vec2(1, 10000);
        this.editor = editor;
        this.canvas = canvas;
        this.bpmValue = 60;
        this.beatLinesCount = 5;
        this.bpmLines = [];
        this.beatLines = [];
        this.transform = new Transform_1.Transform();
        this.transform.parent = editor.transform;
        this.transform.localScale = new Vec2_1.Vec2(1, 1);
        this.initGrid();
    }
    EditorGrid.prototype.distanceBetweenBpmLines = function () {
        var soundLength = this.editor.audioPlayer.sound.duration();
        var bpmCount = (soundLength / 60) * this.bpmValue;
        var pixelsPerBeat = soundLength / bpmCount;
        return pixelsPerBeat;
    };
    EditorGrid.prototype.distanceBetweenBeatLines = function () {
        return (this.canvas.height) / (this.beatLinesCount + 1);
    };
    EditorGrid.prototype.setSnapValue = function (val) {
        console.log(val);
        this.snapValue = val;
        var distance = this.distanceBetweenBpmLines();
        this.bpmLines.forEach(function (line) {
            line.setSnapLines(val, distance);
        });
    };
    EditorGrid.prototype.setBpmValue = function (event) {
        var bpm = parseInt(event.target.value);
        bpm < this.bpmRange.x ? bpm = this.bpmRange.x : bpm = bpm;
        bpm > this.bpmRange.y ? bpm = this.bpmRange.y : bpm = bpm;
        this.bpmValue = bpm;
        this.initBpmLines();
        console.log(bpm);
    };
    EditorGrid.prototype.setBeatLinesCount = function (event) {
        var beatLines = parseInt(event.target.value);
        beatLines < this.beatLinesRange.x ? beatLines = this.beatLinesRange.x : beatLines = beatLines;
        beatLines > this.beatLinesRange.y ? beatLines = this.beatLinesRange.y : beatLines = beatLines;
        this.beatLinesCount = beatLines;
        this.initGrid();
    };
    EditorGrid.prototype.getGridSize = function () {
        return new Vec2_1.Vec2(this.bpmValue, this.beatLinesCount);
    };
    EditorGrid.prototype.initGrid = function () {
        for (var i = 0; i < this.beatLinesCount; i++) {
            if (i + 1 > this.beatLines.length) {
                console.log("distance between lines is " + this.distanceBetweenBeatLines());
                var beatLine = new GridElements_1.BeatLine((i + 1) * this.distanceBetweenBeatLines(), this.transform, AppSettings_1.appSettings.beatLineColor);
                this.beatLines.push(beatLine);
            }
            this.beatLines[i].transform.localPosition = new Vec2_1.Vec2(0, (i + 1) * this.distanceBetweenBeatLines());
            this.beatLines[i].activate();
        }
        for (var i = this.beatLinesCount; i < this.beatLines.length; i++) {
            this.beatLines[i].deactivate();
        }
    };
    EditorGrid.prototype.initBpmLines = function () {
        this.bpmLines = [];
        var soundLength = editor.audioPlayer.sound.duration();
        var bpmCount = (soundLength / 60) * this.bpmValue;
        for (var i = 0; i < bpmCount; i++) {
            var color;
            if (i % 2 == 0) {
                color = AppSettings_1.appSettings.mainBpmLineColorStrong;
            }
            else
                color = AppSettings_1.appSettings.mainBpmLineColorWeak;
            var bpmLine = new GridElements_1.BPMLine(i * this.distanceBetweenBpmLines(), this.transform, color);
            this.bpmLines.push(bpmLine);
        }
    };
    EditorGrid.prototype.draw = function (drawBpmLines, editor) {
        var canvas = this.canvas;
        var ctx = canvas.getContext('2d');
        this.beatLines.forEach(function (beatLine) {
            if (beatLine.isActive)
                beatLine.draw(editor.viewport, canvas);
        });
        if (drawBpmLines) {
            var soundLength = editor.audioPlayer.sound.duration();
            var bpmCount = (soundLength / 60) * this.bpmValue;
            var pixelsPerBeat = soundLength / bpmCount;
            this.bpmLines.forEach(function (bpmLine) {
                if (bpmLine.isActive)
                    bpmLine.draw(editor.viewport, canvas);
            });
        }
    };
    return EditorGrid;
}());
var editor = new Editor();
var inputController = new Input_1.Input(editor);
editor.inputController = inputController;
module.exports = editor;
