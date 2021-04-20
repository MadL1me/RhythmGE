"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
var Utils_1 = require("./Utils");
var Vec2_1 = require("./Vec2");
var jquery_1 = __importDefault(require("jquery"));
var Input = /** @class */ (function () {
    function Input(editor) {
        var _this = this;
        this.snapSlider = new Utils_1.Slider('snap-lines');
        this.volumeSlider = new Utils_1.Slider('volume-slider');
        this.playbackSlider = new Utils_1.Slider('playback-rate');
        this.lastMousePosition = new Vec2_1.Vec2(0, 0);
        this.mousePosition = new Vec2_1.Vec2(0, 0);
        this.keysPressed = [];
        this.editor = editor;
        jquery_1.default('#files').on('change', function (event) { _this.onAudioLoad(event); });
        jquery_1.default(window).on('resize', function (event) { _this.editor.onWindowResize(event); });
        jquery_1.default(window).on('keydown', function (event) { _this.onCanvasKeyDown(event); });
        jquery_1.default(window).on('keyup', function (event) { _this.onCanvasKeyUp(event); });
        jquery_1.default('#editor-canvas').on('wheel', function (event) { _this.onCanvasWheel(event.originalEvent); })
            .on('click', function (event) { editor.canvasMouseClickHandle(event); })
            .on('mousemove', function (event) { _this.onCanvasHover(event); });
        jquery_1.default('#play-button').on('click', function (event) { _this.playButtonClick(event.target); });
        jquery_1.default('#follow-line').on('change', function (event) { _this.onFollowLineChange(event); });
        jquery_1.default('#use-claps').on('change', function (event) { _this.onUseClapsValueChange(event); });
        jquery_1.default('#hide-bpm').on('change', function (event) { _this.onHideBpmLinesChange(event); });
        jquery_1.default('#hide-creatable').on('change', function (event) { _this.onHideCreatableLinesChange(event); });
        jquery_1.default('#beat-lines').on('change', function (event) { _this.onBeatLinesValueChange(event); });
        jquery_1.default('#bpm').on('change', function (event) { _this.onBpmValueChange(event); });
        jquery_1.default('#offset').on('change', function (event) { _this.onOffsetValueChange(event); });
        this.volumeSlider.setValue(0.5);
        this.playbackSlider.setValue(1);
        this.snapSlider.setValue(1);
        this.volumeSlider.onValueChange.addListener(function (value) { _this.onVolumeSliderValueChange(value); });
        this.playbackSlider.onValueChange.addListener(function (value) { _this.onPlaybackRateValueChange(value); });
        this.snapSlider.onValueChange.addListener(function (value) { _this.onSnapSliderValueChange(value); });
    }
    Input.prototype.isMouseMoved = function () {
        return this.lastMousePosition == this.mousePosition;
    };
    Input.prototype.update = function () {
        this.lastMousePosition = this.mousePosition;
    };
    Input.prototype.onAudioLoad = function (event) {
        var files = event.target.files;
        var file = files[0];
        this.editor.onAudioLoad(file.name, file.path);
        console.log(files[0]);
    };
    Input.prototype.onVolumeSliderValueChange = function (value) {
        var val = parseFloat(value);
        this.editor.audioPlayer.setVolume(val);
    };
    Input.prototype.onSnapSliderValueChange = function (value) {
        var val = parseInt(value);
        val = Math.pow(2, val);
        jquery_1.default('#snap-lines-text')[0].innerText = 'Snap lines 1/' + val.toString();
        this.editor.editorGrid.setSnapValue(val);
    };
    Input.prototype.onCanvasHover = function (event) {
        this.mousePosition = new Vec2_1.Vec2(event.clientX, event.clientY);
    };
    Input.prototype.onPlaybackRateValueChange = function (value) {
        var val = parseFloat(value);
        jquery_1.default('#playback-rate-text')[0].innerText = 'Playback rate ' + val.toString() + 'x';
        this.editor.audioPlayer.setPlaybackRate(val);
    };
    Input.prototype.playButtonClick = function (btn) {
        this.editor.onPlayButtonClick(btn);
    };
    Input.prototype.onCanvasKeyDown = function (event) {
        if (event.key == 'Alt') {
            console.log("prevent default");
            event.preventDefault();
        }
        this.keysPressed[event.key] = true;
        if (event.code == 'Space')
            this.editor.createCustomBpmLine();
        if (event.key == 'Alt') {
            this.editor.canvasPlacePhantomElementHandler();
        }
        console.log('Key pressed!' + event.key);
    };
    Input.prototype.onCanvasKeyUp = function (event) {
        delete this.keysPressed[event.key];
        console.log('Key removed' + event.key);
        this.editor.drawEditor();
    };
    Input.prototype.onCanvasWheel = function (event) {
        if (this.keysPressed['Control'])
            this.editor.onCanvasResize(parseInt(event.deltaY));
        else if (this.keysPressed['Shift'])
            this.editor.onCanvasScroll(parseInt(event.deltaY), true);
        else
            this.editor.onCanvasScroll(parseInt(event.deltaY), false);
    };
    Input.prototype.onBeatLinesValueChange = function (event) {
        console.log(event);
        this.editor.changeBeatlinesCount(event);
    };
    Input.prototype.onBpmValueChange = function (event) {
        console.log(event);
        this.editor.changeBpmValue(event);
    };
    Input.prototype.onOffsetValueChange = function (event) {
        console.log(event);
        this.editor.changeOffset(event);
    };
    Input.prototype.onUseClapsValueChange = function (event) {
        console.log(event);
        this.editor.usingClaps = true;
    };
    Input.prototype.onHideBpmLinesChange = function (event) {
        this.editor.hideBpmLines = event.target.checked;
        console.log(event);
    };
    Input.prototype.onFollowLineChange = function (event) {
        this.editor.followingLine = event.target.checked;
        console.log(event);
    };
    Input.prototype.onHideCreatableLinesChange = function (event) {
        this.editor.hideCreatableLines = event.target.checked;
        console.log(event);
    };
    return Input;
}());
exports.Input = Input;
