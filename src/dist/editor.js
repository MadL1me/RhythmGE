"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorGrid = exports.Editor = exports.EditorData = void 0;
var jquery_1 = __importDefault(require("jquery"));
var RgbaColor_1 = require("./RgbaColor");
var Vec2_1 = require("./Vec2");
var Transform_1 = require("./Transform");
var GridElements_1 = require("./GridElements");
var Viewport_1 = require("./Viewport");
var AppSettings_1 = require("./AppSettings");
var Input_1 = require("./Input");
var Utils_1 = require("./Utils");
var Audio_1 = require("./Audio");
var EventVar = /** @class */ (function () {
    function EventVar(initialValue) {
        this.onValueChange = new Utils_1.Event();
        this._value = initialValue;
    }
    Object.defineProperty(EventVar.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            this._value = value;
            this.onValueChange.invoke(value);
        },
        enumerable: false,
        configurable: true
    });
    return EventVar;
}());
var EditorData = /** @class */ (function () {
    function EditorData() {
        var _this = this;
        this.snapSlider = new Utils_1.Slider('snap-lines');
        this.playbackSpeedSlider = new Utils_1.Slider('playback-rate');
        this.useClaps = new EventVar(false);
        this.followLine = new EventVar(false);
        this.hideBpmLines = new EventVar(false);
        this.hideCreatableLines = new EventVar(false);
        this.scrollingSpeed = new EventVar(0.2);
        this.resizingSpeed = new EventVar(0.01);
        this.fastScrollingSpeed = new EventVar(5);
        this.offset = new EventVar(0);
        this.bpmValue = new EventVar(60);
        this.beatLinesCount = new EventVar(5);
        this.snapValue = new EventVar(0);
        this.playbackRate = new EventVar(1);
        this.audioFile = new EventVar(null);
        jquery_1.default('#files').on('change', function (event) { _this.onAudioLoad(event); });
        jquery_1.default('#follow-line').on('change', function (event) { _this.followLine.value = event.target.checked; });
        jquery_1.default('#use-claps').on('change', function (event) { _this.useClaps.value = event.target.checked; });
        jquery_1.default('#hide-bpm').on('change', function (event) { _this.hideBpmLines.value = event.target.checked; });
        jquery_1.default('#hide-creatable').on('change', function (event) { _this.hideCreatableLines.value = event.target.checked; });
        jquery_1.default('#beat-lines').on('change', function (event) { _this.beatLinesCount.value = parseInt(event.target.value); });
        jquery_1.default('#bpm').on('change', function (event) { _this.bpmValue.value = parseInt(event.target.value); });
        jquery_1.default('#offset').on('change', function (event) { _this.offset.value = parseInt(event.target.value); });
        this.playbackSpeedSlider.value = 1;
        this.snapSlider.value = 1;
        this.playbackSpeedSlider.onValueChange.addListener(function (value) { _this.onPlaybackRateValueChange(value); });
        this.snapSlider.onValueChange.addListener(function (value) { _this.onSnapSliderValueChange(value); });
    }
    EditorData.prototype.onAudioLoad = function (event) {
        var files = event.target.files;
        var file = files[0];
        this.audioFile.value = [file.name, file.path];
        console.log(files[0]);
    };
    EditorData.prototype.onPlaybackRateValueChange = function (value) {
        jquery_1.default('#playback-rate-text')[0].innerText = 'Playback rate ' + value.toString() + 'x';
        this.playbackRate.value = value;
    };
    EditorData.prototype.onSnapSliderValueChange = function (value) {
        value = Math.pow(2, value);
        jquery_1.default('#snap-lines-text')[0].innerText = 'Snap lines 1/' + value.toString();
        this.snapValue.value = value;
    };
    return EditorData;
}());
exports.EditorData = EditorData;
var Editor = /** @class */ (function () {
    function Editor() {
        this.transform = new Transform_1.Transform();
        this.viewport = new Viewport_1.ViewportModule(this.transform);
        this.editorData = new EditorData();
        this.audio = new Audio_1.AudioModule();
        this.editorModules = new Array();
        this.viewport.init(this);
        this.audio.init(this);
        this.editorCanvas = jquery_1.default("#editor-canvas")[0];
        this.transform.scale = new Vec2_1.Vec2(10, 1);
        this.update();
    }
    Editor.prototype.addEditorModule = function (element) {
        this.editorModules.push(element);
    };
    Editor.prototype.update = function () {
        Input_1.Input.update();
        this.audio.updateModule();
        console.log("ABC");
        var ctx = this.editorCanvas.getContext("2d");
        ctx.fillStyle = "green";
        ctx.fillRect(0, 0, this.editorCanvas.width, this.editorCanvas.height);
        for (var i = 0; i < this.editorModules.length; i++) {
            this.editorModules[i].updateModule();
        }
    };
    Editor.prototype.onPlayButtonClick = function (playBtn) {
        playBtn.classList.add('paused');
        if (this.audio.isPlaying() == true) {
            playBtn.classList.remove('paused');
            this.audio.pause();
        }
        else {
            this.audio.play();
        }
    };
    Editor.prototype.onCanvasScroll = function (mouseDelta, isSpeededUp) {
        if (this.editorData.followLine)
            return;
        var resultedDelta = mouseDelta * this.editorData.scrollingSpeed.value / this.transform.scale.x;
        if (isSpeededUp)
            resultedDelta *= this.editorData.fastScrollingSpeed.value;
        this.viewport.transform.localPosition = new Vec2_1.Vec2(this.viewport.transform.localPosition.x + resultedDelta, this.viewport.position.y);
        if (this.viewport.transform.localPosition.x > this.viewport.maxDeviation.x)
            this.viewport.transform.localPosition = new Vec2_1.Vec2(this.viewport.maxDeviation.x, this.viewport.position.y);
        this.update();
    };
    Editor.prototype.onChangeScale = function (mouseDelta) {
        var resultedDelta = mouseDelta * this.editorData.resizingSpeed.value;
        var oldScale = this.transform.scale.x;
        var canvCenter = this.viewport.canvasToSongTime(new Vec2_1.Vec2(this.editorCanvas.width / 2, 0));
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
        this.viewport.position = Vec2_1.Vec2.Substract(new Vec2_1.Vec2(this.editorCanvas.width / 2, 0), canvCenter);
        this.update();
    };
    return Editor;
}());
exports.Editor = Editor;
var TimestepLineModule = /** @class */ (function () {
    function TimestepLineModule() {
        this.transform = new Transform_1.Transform();
        this.timestepLine = new GridElements_1.TimestepLine(this.transform, AppSettings_1.editorColorSettings.timestepLineColor);
        this.canvas = jquery_1.default("#editor-canvas")[0];
    }
    TimestepLineModule.prototype.init = function (editorCoreModules) {
        this.editor = editorCoreModules;
    };
    TimestepLineModule.prototype.updateModule = function () {
        if (this.editor.audio.isPlaying()) {
            this.timestepLine.transform.localPosition = new Vec2_1.Vec2(this.editor.audio.seek(), 0);
            if (this.editor.editorData.followLine) {
                var result = new Vec2_1.Vec2(-this.timestepLine.transform.position.x + this.canvas.width / 2, 1);
                this.editor.viewport.transform.position = result;
            }
        }
    };
    return TimestepLineModule;
}());
// class PhantomTimestampModule implements IEditorModule {
// }
var CreatableLinesModule = /** @class */ (function () {
    function CreatableLinesModule() {
        this.transform = new Transform_1.Transform();
        this.creatableLines = new Map();
    }
    CreatableLinesModule.prototype.init = function (editorCoreModules) {
        throw new Error('Method not implemented.');
    };
    CreatableLinesModule.prototype.updateModule = function () {
    };
    CreatableLinesModule.prototype.findClosestCreatableLine = function (positionX) {
        var objectsArr = Object.keys(this.creatableLines);
        objectsArr.forEach(function (el) {
            console.log(el);
        });
        var indexOfElement = Utils_1.Utils.binaryNearestSearch(objectsArr, positionX);
        var closestCreatable = this.creatableLines[objectsArr[indexOfElement]];
        return closestCreatable;
    };
    CreatableLinesModule.prototype.createCustomBpmLine = function () {
        console.log('Custom bpm line created');
        var xPos = this.transform.position.x;
        var line = new GridElements_1.CreatableTimestampLine(xPos, this.transform, AppSettings_1.editorColorSettings.creatableTimestampLineColor);
        this.creatableLines[line.transform.localPosition.x] = line;
    };
    return CreatableLinesModule;
}());
var TimestampPrefab = /** @class */ (function () {
    function TimestampPrefab(id, color) {
        this.prefabId = id;
        this.color = color;
    }
    return TimestampPrefab;
}());
var TimestampsModule = /** @class */ (function () {
    function TimestampsModule(editorGrid) {
        this.transform = new Transform_1.Transform();
        this.selectedPrefabId = 0;
        this.idToPrefab = new Map();
        this.timestamps = new Map();
        this.editorGrid = editorGrid;
        var defaultPrefab = this.createTimestampPrefab(new RgbaColor_1.RgbaColor(0, 255, 26));
        this.canvas = jquery_1.default("#editor-canvas")[0];
        this.idToPrefab[defaultPrefab.prefabId] = defaultPrefab;
    }
    TimestampsModule.prototype.init = function (editorCoreModules) {
        this.editorCore = editorCoreModules;
    };
    TimestampsModule.prototype.registerTimestampPrefab = function (timestampPrefab) {
        this.idToPrefab[timestampPrefab.prefabId] = timestampPrefab;
    };
    TimestampsModule.prototype.selectPrefab = function (id) {
        this.selectedPrefabId = id;
    };
    TimestampsModule.prototype.getSelectedPrefab = function () {
        return this.idToPrefab[this.selectedPrefabId];
    };
    TimestampsModule.prototype.onCanvasClick = function (event) {
        var rect = this.canvas.getBoundingClientRect();
        var clickX = event.clientX - rect.left;
        var clickY = event.clientY - rect.top;
        var click = new Vec2_1.Vec2(clickX, clickY);
        var worldClickPos = this.transform.canvasToWorld(click);
        worldClickPos = new Vec2_1.Vec2(-1 * worldClickPos.x, -1 * worldClickPos.y);
        var closestBeatline = this.editorGrid.findClosestBeatLine(click);
        var closestObjects = new Array();
        if (!this.editorCore.editorData.hideBpmLines && this.editorGrid.bpmLines.length > 0) {
            closestObjects.push(this.editorGrid.findClosestBpmLine(worldClickPos.x));
        }
        // if (!this.editorCore.editorData.hideCreatableLines && Object.keys(this.creatableLines).length > 0) {
        //     closestObjects.push(this.editorGrid.findClosestCreatableLine(worldClickPos.x));
        // }
        var min = 100000, index = 0;
        for (var i = 0; i < closestObjects.length; i++) {
            var diff = Math.abs(worldClickPos.x - closestObjects[i].transform.localPosition.x);
            if (diff < min) {
                min = diff;
                index = i;
            }
        }
        var closestObject = closestObjects[index];
        console.log(closestObjects);
        console.log(closestObject);
        var newTimestamp = new GridElements_1.Timestamp(new RgbaColor_1.RgbaColor(123, 123, 65), new Vec2_1.Vec2(closestObject.transform.localPosition.x, closestBeatline.transform.position.y), 5, this.editorGrid.transform);
        console.log(newTimestamp);
        this.timestamps[newTimestamp.transform.position.x] = newTimestamp;
    };
    TimestampsModule.prototype.canvasPlacePhantomElementHandler = function () {
        if (Input_1.Input.keysPressed['Alt']) {
            var rect = this.canvas.getBoundingClientRect();
            var clickX = Input_1.Input.mousePosition.x - rect.left;
            var clickY = Input_1.Input.mousePosition.y - rect.top;
            var click = new Vec2_1.Vec2(clickX, clickY);
            var closestBeatline = this.editorGrid.findClosestBeatLine(click);
            this.phantomTimestamp = new GridElements_1.Timestamp(new RgbaColor_1.RgbaColor(158, 23, 240, 0.7), new Vec2_1.Vec2(click.x / this.editorGrid.transform.scale.x, closestBeatline.transform.position.y), 10, this.editorGrid.transform);
        }
        else {
            this.phantomTimestamp = null;
        }
    };
    TimestampsModule.prototype.updateModule = function () {
        for (var _i = 0, _a = Object.entries(this.timestamps); _i < _a.length; _i++) {
            var _b = _a[_i], i = _b[0], value = _b[1];
            for (var _c = 0, _d = Object.entries(value); _c < _d.length; _c++) {
                var _e = _d[_c], j = _e[0], timestamp = _e[1];
                timestamp.draw(this.editorCore.viewport, this.canvas);
            }
        }
    };
    TimestampsModule.prototype.createTimestampPrefab = function (color) {
        return new TimestampPrefab(TimestampsModule.nextPrefabId++, color);
    };
    TimestampsModule.nextPrefabId = 0;
    return TimestampsModule;
}());
var EditorGrid = /** @class */ (function () {
    function EditorGrid() {
        this.bpmLines = new Array();
        this.beatLines = new Array();
        this.transform = new Transform_1.Transform();
        this.beatLinesRange = new Vec2_1.Vec2(1, 20);
        this.bpmRange = new Vec2_1.Vec2(1, 10000);
        this.transform = new Transform_1.Transform();
        this.transform.localScale = new Vec2_1.Vec2(1, 1);
        this.initGrid();
    }
    EditorGrid.prototype.init = function (editorCoreModules) {
        this.editorCore = editorCoreModules;
    };
    EditorGrid.prototype.subscribeOnEvents = function () {
    };
    EditorGrid.prototype.onWindowResize = function () {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;
        var div = this.canvas.parentElement;
        div.setAttribute('style', 'height:' + (h * 0.6).toString() + 'px');
        var info = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.setAttribute('width', (info.width).toString());
        this.canvas.setAttribute('height', (info.height / 4 * 3).toString());
        this.initGrid();
    };
    EditorGrid.prototype.inti = function (editorCore) {
        this.editorCore = editorCore;
    };
    EditorGrid.prototype.updateModule = function () {
        var _this = this;
        var ctx = this.canvas.getContext("2d");
        ctx.fillStyle = AppSettings_1.editorColorSettings.editorBackgroundColor.value();
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.beatLines.forEach(function (beatLine) {
            if (beatLine.isActive)
                beatLine.draw(_this.editorCore.viewport, _this.canvas);
        });
        if (this.drawBpmLines) {
            var soundLength = this.audioController.duration();
            var bpmCount = (soundLength / 60) * this.editorCore.editorData.bpmValue.value;
            var pixelsPerBeat = soundLength / bpmCount;
            this.bpmLines.forEach(function (bpmLine) {
                if (bpmLine.isActive)
                    bpmLine.draw(_this.editorCore.viewport, _this.canvas);
            });
        }
    };
    EditorGrid.prototype.distanceBetweenBpmLines = function () {
        var soundLength = this.audioController.duration();
        var bpmCount = (soundLength / 60) * this.editorCore.editorData.bpmValue.value;
        var pixelsPerBeat = soundLength / bpmCount;
        return pixelsPerBeat;
    };
    EditorGrid.prototype.distanceBetweenBeatLines = function () {
        return (this.canvas.height) / (this.editorCore.editorData.beatLinesCount.value + 1);
    };
    EditorGrid.prototype.setSnapValue = function (val) {
        console.log(val);
        this.editorCore.editorData.snapValue.value = val;
        var distance = this.distanceBetweenBpmLines();
        this.bpmLines.forEach(function (line) {
            line.setSnapLines(val, distance);
        });
    };
    EditorGrid.prototype.setBpmValue = function (event) {
        var bpm = parseInt(event.target.value);
        bpm < this.bpmRange.x ? bpm = this.bpmRange.x : bpm = bpm;
        bpm > this.bpmRange.y ? bpm = this.bpmRange.y : bpm = bpm;
        this.editorCore.editorData.bpmValue.value = bpm;
        this.initBpmLines();
        console.log(bpm);
    };
    EditorGrid.prototype.setBeatLinesCount = function (event) {
        var beatLines = parseInt(event.target.value);
        beatLines < this.beatLinesRange.x ? beatLines = this.beatLinesRange.x : beatLines = beatLines;
        beatLines > this.beatLinesRange.y ? beatLines = this.beatLinesRange.y : beatLines = beatLines;
        this.editorCore.editorData.beatLinesCount.value = beatLines;
        this.initGrid();
    };
    EditorGrid.prototype.getGridSize = function () {
        return new Vec2_1.Vec2(this.editorCore.editorData.bpmValue.value, this.editorCore.editorData.beatLinesCount.value);
    };
    EditorGrid.prototype.initGrid = function () {
        for (var i = 0; i < this.editorCore.editorData.beatLinesCount.value; i++) {
            if (i + 1 > this.beatLines.length) {
                console.log("distance between lines is " + this.distanceBetweenBeatLines());
                var beatLine = new GridElements_1.BeatLine((i + 1) * this.distanceBetweenBeatLines(), this.transform, AppSettings_1.editorColorSettings.beatLineColor);
                this.beatLines.push(beatLine);
            }
            this.beatLines[i].transform.localPosition = new Vec2_1.Vec2(0, (i + 1) * this.distanceBetweenBeatLines());
            this.beatLines[i].activate();
        }
        for (var i = this.editorCore.editorData.beatLinesCount.value; i < this.beatLines.length; i++) {
            this.beatLines[i].deactivate();
        }
    };
    EditorGrid.prototype.initBpmLines = function () {
        this.bpmLines = [];
        var soundLength = this.audioController.duration();
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
    EditorGrid.prototype.findClosestBpmLine = function (positionX) {
        var closestBpmIndex = Utils_1.Utils.binaryNearestSearch(Object.keys(this.bpmLines), positionX, true);
        var closestBpm = this.bpmLines[closestBpmIndex];
        var closestBpmSnapIndex = Utils_1.Utils.binaryNearestSearch(Object.keys(closestBpm.snapLines), positionX);
        var closestBpmSnap = closestBpm.snapLines[closestBpmSnapIndex];
        if (closestBpmSnap != null && closestBpmSnap != undefined && Math.abs(positionX - closestBpm.transform.position.x) >
            Math.abs(positionX - closestBpmSnap.transform.position.x))
            return closestBpmSnap;
        else
            return closestBpm;
    };
    return EditorGrid;
}());
exports.EditorGrid = EditorGrid;
