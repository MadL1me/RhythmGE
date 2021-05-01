"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimestepLineModule = exports.Editor = exports.EditorData = void 0;
var jquery_1 = __importDefault(require("jquery"));
var Vec2_1 = require("./Utils/Vec2");
var Transform_1 = require("./Transform");
var GridElements_1 = require("./GridElements");
var ViewportModule_1 = require("./EditorModules/ViewportModule");
var AppSettings_1 = require("./Utils/AppSettings");
var Input_1 = require("./Input");
var Utils_1 = require("./Utils/Utils");
var AudioModules_1 = require("./EditorModules/AudioModules");
var EditorData = /** @class */ (function () {
    function EditorData() {
        var _this = this;
        this._snapSlider = new Utils_1.Slider('snap-lines');
        this._playbackSpeedSlider = new Utils_1.Slider('playback-rate');
        this.useClaps = new Utils_1.EventVar(false);
        this.followLine = new Utils_1.EventVar(false);
        this.hideBpmLines = new Utils_1.EventVar(false);
        this.hideCreatableLines = new Utils_1.EventVar(false);
        this.scrollingSpeed = new Utils_1.EventVar(0.2);
        this.resizingSpeed = new Utils_1.EventVar(3);
        this.fastScrollingSpeed = new Utils_1.EventVar(5);
        this.offset = new Utils_1.EventVar(0);
        this.bpmValue = new Utils_1.EventVar(60);
        this.beatLinesCount = new Utils_1.EventVar(5);
        this.snapValue = new Utils_1.EventVar(0);
        this.playbackRate = new Utils_1.EventVar(1);
        this.audioFile = new Utils_1.EventVar(null);
        jquery_1.default('#files').on('change', function (event) { _this.onAudioLoad(event); });
        jquery_1.default('#follow-line').on('change', function (event) { _this.followLine.value = event.target.checked; });
        jquery_1.default('#use-claps').on('change', function (event) { _this.useClaps.value = event.target.checked; });
        jquery_1.default('#hide-bpm').on('change', function (event) { _this.hideBpmLines.value = event.target.checked; });
        jquery_1.default('#hide-creatable').on('change', function (event) { _this.hideCreatableLines.value = event.target.checked; });
        jquery_1.default('#beat-lines').on('change', function (event) { _this.beatLinesCount.value = parseInt(event.target.value); });
        jquery_1.default('#bpm').on('change', function (event) { _this.bpmValue.value = parseInt(event.target.value); });
        jquery_1.default('#offset').on('change', function (event) { _this.offset.value = parseInt(event.target.value); });
        this._playbackSpeedSlider.value = 1;
        this._snapSlider.value = 0;
        this._playbackSpeedSlider.onValueChange.addListener(function (value) { _this.onPlaybackRateValueChange(value); });
        this._snapSlider.onValueChange.addListener(function (value) { _this.onSnapSliderValueChange(value); });
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
        var _this = this;
        this.transform = new Transform_1.Transform();
        this.viewport = new ViewportModule_1.ViewportModule(this.transform);
        this.editorData = new EditorData();
        this.audio = new AudioModules_1.AudioModule();
        this._editorModules = new Array();
        this._editorCanvas = jquery_1.default("#editor-canvas")[0];
        this.transform.scale = new Vec2_1.Vec2(10, 1);
        this.viewport.init(this);
        this.audio.init(this);
        this.viewport.transform.parent = this.transform;
        this.audio.transform.parent = this.transform;
        setInterval(function () { _this.audio.checkForClaps(); }, 5);
        Input_1.Input.onWheelCanvas.addListener(function (event) { _this.onChangeScale((event.deltaY)); });
        Input_1.Input.onMouseClickCanvas.addListener(function (event) { _this.onCanvasClick(event); });
        this.update();
    }
    Editor.prototype.addEditorModule = function (element) {
        element.init(this);
        element.transform.parent = this.transform;
        this._editorModules.push(element);
    };
    Editor.prototype.update = function () {
        Input_1.Input.update();
        this.audio.updateModule();
        this.viewport.updateModule();
        for (var i = 0; i < this._editorModules.length; i++) {
            this._editorModules[i].updateModule();
        }
    };
    Editor.prototype.onCanvasClick = function (event) {
        var clickPos = new Vec2_1.Vec2(event.offsetX, event.offsetY);
        if (clickPos.y < 10) {
            this.audio.setMusicFromCanvasPosition(clickPos);
        }
    };
    Editor.prototype.onChangeScale = function (mouseDelta) {
        if (!Input_1.Input.keysPressed["ControlLeft"])
            return;
        mouseDelta = mouseDelta > 0 ? 1 : -1;
        var resultedDelta = mouseDelta * Math.log(this.transform.scale.x / this.editorData.resizingSpeed.value);
        var oldScale = this.transform.scale.x;
        var canvCenter = this.viewport.canvasToSongTime(new Vec2_1.Vec2(this._editorCanvas.width / 2, 0));
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
        this.viewport.position = Vec2_1.Vec2.Substract(new Vec2_1.Vec2(this._editorCanvas.width / 2, 0), canvCenter);
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
            if (this.editor.editorData.followLine.value) {
                var result = new Vec2_1.Vec2(-this.timestepLine.transform.position.x + this.canvas.width / 2, 0);
                this.editor.viewport.transform.position = result;
            }
        }
        this.timestepLine.draw(this.editor.viewport, this.canvas);
    };
    return TimestepLineModule;
}());
exports.TimestepLineModule = TimestepLineModule;
