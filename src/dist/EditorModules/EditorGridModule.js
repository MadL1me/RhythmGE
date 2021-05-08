"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorGrid = void 0;
var jquery_1 = __importDefault(require("jquery"));
var Vec2_1 = require("../Utils/Vec2");
var Transform_1 = require("../Transform");
var GridElements_1 = require("../GridElements");
var AppSettings_1 = require("../Utils/AppSettings");
var Input_1 = require("../Input");
var Utils_1 = require("../Utils/Utils");
var EditorGrid = /** @class */ (function () {
    function EditorGrid() {
        this.bpmLines = new Array();
        this.beatLines = new Array();
        this.transform = new Transform_1.Transform();
        this.beatLinesRange = new Vec2_1.Vec2(1, 20);
        this.bpmRange = new Vec2_1.Vec2(1, 10000);
        this._canvas = jquery_1.default("#editor-canvas")[0];
        this.transform = new Transform_1.Transform();
        this.transform.localScale = new Vec2_1.Vec2(1, 1);
        //this.initGrid();
    }
    EditorGrid.prototype.init = function (editorCoreModules) {
        this.editorCore = editorCoreModules;
        this.subscribeOnEvents();
    };
    EditorGrid.prototype.subscribeOnEvents = function () {
        var _this = this;
        Input_1.Input.onWindowResize.addListener(function () { _this.onWindowResize(); });
        this.editorCore.editorData.offset.onValueChange.addListener(function (value) { _this.setOffsetValue(value); });
        this.editorCore.editorData.snapValue.onValueChange.addListener(function (value) { _this.setSnapValue(value); });
        this.editorCore.editorData.bpmValue.onValueChange.addListener(function (value) { _this.setBpmValue(value); });
        this.editorCore.editorData.beatLinesCount.onValueChange.addListener(function (value) { _this.setBeatLinesCount(value); });
        this.editorCore.audio.onAudioLoaded.addListener(function () { _this.onAudioLoad(); });
    };
    EditorGrid.prototype.onAudioLoad = function () {
        console.log("audio loaded");
        this.initGrid();
        this.initBpmLines();
    };
    EditorGrid.prototype.onWindowResize = function () {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight - this._canvas.parentElement.offsetTop - 10;
        var div = this._canvas.parentElement;
        div.setAttribute('style', 'height:' + (h * 0.95).toString() + 'px');
        var info = this._canvas.parentElement.getBoundingClientRect();
        this._canvas.setAttribute('width', (info.width).toString());
        this._canvas.setAttribute('height', (info.height / 4 * 3).toString());
        this.initGrid();
        //this.initBpmLines();
    };
    EditorGrid.prototype.updateModule = function () {
        var _this = this;
        this.onWindowResize();
        var ctx = this._canvas.getContext("2d");
        ctx.fillStyle = AppSettings_1.editorColorSettings.editorBackgroundColor.value();
        ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        this.beatLines.forEach(function (beatLine) {
            if (beatLine.isActive)
                beatLine.draw(_this.editorCore.viewport, _this._canvas);
        });
        if (!this.editorCore.editorData.hideBpmLines.value && this.editorCore.audio.isAudioLoaded()) {
            var soundLength = this.editorCore.audio.duration();
            var bpmCount = (soundLength / 60) * this.editorCore.editorData.bpmValue.value;
            var pixelsPerBeat = soundLength / bpmCount;
            this.bpmLines.forEach(function (bpmLine) {
                if (bpmLine.isActive)
                    bpmLine.draw(_this.editorCore.viewport, _this._canvas);
            });
        }
    };
    EditorGrid.prototype.distanceBetweenBpmLines = function () {
        var soundLength = this.editorCore.audio.duration();
        var bpmCount = (soundLength / 60) * this.editorCore.editorData.bpmValue.value;
        var pixelsPerBeat = soundLength / bpmCount;
        return pixelsPerBeat;
    };
    EditorGrid.prototype.distanceBetweenBeatLines = function () {
        return (this._canvas.height) / (this.editorCore.editorData.beatLinesCount.value + 1);
    };
    EditorGrid.prototype.setSnapValue = function (val) {
        console.log(val);
        var distance = this.distanceBetweenBpmLines();
        this.bpmLines.forEach(function (line) {
            line.setSnapLines(val, distance);
        });
    };
    EditorGrid.prototype.setBpmValue = function (value) {
        //var bpm = parseInt(event.target.value);
        var bpm = value;
        bpm < this.bpmRange.x ? bpm = this.bpmRange.x : bpm = bpm;
        bpm > this.bpmRange.y ? bpm = this.bpmRange.y : bpm = bpm;
        this.initBpmLines();
        console.log(bpm);
    };
    EditorGrid.prototype.setBeatLinesCount = function (value) {
        //var beatLines = parseInt(event.target.value);
        var beatLines = value;
        beatLines < this.beatLinesRange.x ? beatLines = this.beatLinesRange.x : beatLines = beatLines;
        beatLines > this.beatLinesRange.y ? beatLines = this.beatLinesRange.y : beatLines = beatLines;
        this.initGrid();
    };
    EditorGrid.prototype.setOffsetValue = function (value) {
        //var offset = parseInt(event);
        var offset = value;
        this.transform.localPosition = new Vec2_1.Vec2(offset / 10, this.transform.localPosition.y);
    };
    EditorGrid.prototype.getGridSize = function () {
        return new Vec2_1.Vec2(this.editorCore.editorData.bpmValue.value, this.editorCore.editorData.beatLinesCount.value);
    };
    EditorGrid.prototype.initGrid = function () {
        this.transform.parent.scale = new Vec2_1.Vec2(this.transform.parent.scale.x, this.distanceBetweenBeatLines());
        for (var i = 0; i < this.editorCore.editorData.beatLinesCount.value; i++) {
            if (i + 1 > this.beatLines.length) {
                var beatLine = new GridElements_1.BeatLine((i + 1), this.transform, AppSettings_1.editorColorSettings.beatLineColor);
                this.beatLines.push(beatLine);
            }
            this.beatLines[i].activate();
        }
        for (var i = this.editorCore.editorData.beatLinesCount.value; i < this.beatLines.length; i++) {
            this.beatLines[i].deactivate();
        }
    };
    EditorGrid.prototype.initBpmLines = function () {
        if (!this.editorCore.audio.isAudioLoaded())
            return;
        console.log("init BPM");
        this.bpmLines = [];
        var soundLength = this.editorCore.audio.duration();
        var bpmCount = (soundLength / 60) * this.editorCore.editorData.bpmValue.value;
        for (var i = 0; i < bpmCount; i++) {
            var color;
            if (i % 2 == 0) {
                color = AppSettings_1.editorColorSettings.mainBpmLineColorStrong;
            }
            else
                color = AppSettings_1.editorColorSettings.mainBpmLineColorWeak;
            var bpmLine = new GridElements_1.BPMLine(i * this.distanceBetweenBpmLines(), this.transform, color);
            this.bpmLines.push(bpmLine);
        }
        console.log(this.distanceBetweenBpmLines());
        console.log(this.bpmLines.length);
    };
    EditorGrid.prototype.findClosestBeatLine = function (canvasCoords) {
        var beatlinesCanvasDistance = this.distanceBetweenBeatLines();
        var beatlineIndex = Math.round(canvasCoords.y / beatlinesCanvasDistance) - 1;
        if (beatlineIndex < 0)
            beatlineIndex = 0;
        if (beatlineIndex > this.editorCore.editorData.beatLinesCount.value - 1)
            beatlineIndex = this.editorCore.editorData.beatLinesCount.value - 1;
        return this.beatLines[beatlineIndex];
    };
    EditorGrid.prototype.findClosestBpmLine = function (worldPos) {
        var _this = this;
        if (this.bpmLines.length < 1)
            return;
        var getClosestBpm = function () {
            if (_this.bpmLines.length - 1 > closestBpmIndex
                && Math.abs(_this.bpmLines[closestBpmIndex + 1].value - worldPos) <
                    Math.abs(_this.bpmLines[closestBpmIndex].value - worldPos))
                closestBpm = _this.bpmLines[closestBpmIndex + 1];
        };
        var closestBpmIndex = Utils_1.Utils.binaryNearestSearch(this.bpmLines, worldPos, Utils_1.Func.Floor);
        var closestBpm = this.bpmLines[closestBpmIndex];
        if (closestBpm.snapLines.length < 1) {
            getClosestBpm();
            return closestBpm;
        }
        var closestBpmSnapIndex = Utils_1.Utils.binaryNearestSearch(closestBpm.snapLines, worldPos);
        var closestBpmSnap = closestBpm.snapLines[closestBpmSnapIndex];
        getClosestBpm();
        if (closestBpmSnap != null && closestBpmSnap != undefined && Math.abs(worldPos - closestBpm.transform.position.x) >
            Math.abs(worldPos - closestBpmSnap.transform.position.x))
            return closestBpmSnap;
        else
            return closestBpm;
    };
    return EditorGrid;
}());
exports.EditorGrid = EditorGrid;
