"use strict";
/// <reference path ='../../node_modules/@types/jquery/jquery.d.ts'/>
/// <reference path='RgbaColor.ts'/>
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('howler'), Howl = _a.Howl, Howler = _a.Howler;
var jquery_1 = __importDefault(require("jquery"));
var RgbaColor_1 = require("./RgbaColor");
var Vec2_1 = require("./Vec2");
var Transform_1 = require("./Transform");
var Scale_1 = require("./Scale");
var GridElements_1 = require("./GridElements");
var Viewport_1 = require("./Viewport");
var AppSettings_1 = require("./AppSettings");
var Event = /** @class */ (function () {
    function Event() {
        this.listeners = [];
    }
    Event.prototype.addListener = function (listener) {
        this.listeners.push(listener);
    };
    Event.prototype.removeListener = function (listener) {
        var index = this.listeners.findIndex(listener);
        this.listeners.slice(index, index);
    };
    Event.prototype.invoke = function (data) {
        this.listeners.forEach(function (listener) {
            listener(data);
        });
    };
    return Event;
}());
var SelectController = /** @class */ (function () {
    function SelectController() {
    }
    SelectController.prototype.drawSelectZone = function (from, to) {
    };
    return SelectController;
}());
var Input = /** @class */ (function () {
    function Input(editor) {
        var _this = this;
        this.snapSlider = new Slider('snap-lines');
        this.volumeSlider = new Slider('volume-slider');
        this.playbackSlider = new Slider('playback-rate');
        this.canvMousePosition = new Vec2_1.Vec2(0, 0);
        this.keysPressed = [];
        this.editor = editor;
        jquery_1.default('#files').on('change', function (event) { _this.onAudioLoad(event); });
        jquery_1.default(window).on('resize', function (event) { _this.editor.onWindowResize(event); });
        jquery_1.default(window).on('keydown', function (event) { _this.onCanvasKeyDown(event); });
        jquery_1.default(window).on('keyup', function (event) { _this.onCanvasKeyUp(event); });
        jquery_1.default('#editor-canvas').on('wheel', function (event) { _this.onCanvasWheel(event.originalEvent); })
            .on('click', function (event) { editor.canvasClickHandle(event); })
            .on('mousemove', function (event) { _this.onCanvasHover(event); editor.canvasPlaceElementHandler(event); });
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
        this.keysPressed[event.key] = true;
        if (event.code == 'Space')
            this.editor.createCustomBpmLine();
        if (event.code == 'Alt')
            this.editor.canvasPlaceElementHandler(event);
        console.log('Key pressed!' + event.key);
    };
    Input.prototype.onCanvasKeyUp = function (event) {
        delete this.keysPressed[event.key];
        if (event.code == 'Alt')
            this.editor.canvasPlaceElementHandler(null);
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
        this.timestamps = Array(5).fill(null).map(function () { return Array(5); });
        this.transform = new Transform_1.Transform();
        this.viewport = new Viewport_1.Viewport();
        this.viewport.gridTransform = this.transform;
        // WARNING
        this.viewport.transform.parent = this.transform;
        this.viewport.transform.position = new Vec2_1.Vec2(-10, 0);
        // WARNING
        this.transform.position = new Vec2_1.Vec2(0, 0);
        this.transform.scale = new Vec2_1.Vec2(10, 1);
        this.canvas = jquery_1.default('#editor-canvas')[0];
        this.ctx = this.canvas.getContext('2d');
        //this.ctx.translate(0.5,0.5);
        this.audioPlayer = new AudioPlayer(this);
        this.topScale = new Scale_1.TopScale(10);
        this.leftScale = new Scale_1.LeftScale(10);
        this.bottomScale = new Scale_1.BottomScale(10);
        this.editorGrid = new EditorGrid(this, this.canvas);
        this.audioCanvas = new AudioAmplitudeCanvas(this);
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
        if (!this.audioPlayer.isPlaying())
            return;
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
    Editor.prototype.canvasPlaceElementHandler = function (event) {
        if (event == null) {
            this.phantomTimestamp = null;
            return;
        }
        var rect = this.canvas.getBoundingClientRect();
        var clickX = event.clientX - rect.left;
        var clickY = event.clientY - rect.top;
        var click = new Vec2_1.Vec2(clickX, clickY);
        var closestBeatline = this.findClosestBeatLine(click);
        if (this.inputController.keysPressed['Alt']) {
            var phantomTimestamp = new GridElements_1.Timestamp(new RgbaColor_1.RgbaColor(158, 23, 240, 0.7), click.x / this.editorGrid.transform.scale.x, closestBeatline.transform.position.y, 10, this.editorGrid.transform);
            this.phantomTimestamp = phantomTimestamp;
            this.drawEditor();
        }
        else {
            this.phantomTimestamp = null;
            this.drawEditor();
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
                    note.draw(_this.canvas);
                }
            });
        });
        this.audioCanvas.draw();
        this.topScale.draw(this.canvas);
        if (this.audioPlayer.isPlaying()) {
            this.timestepLine.transform.localPosition = new Vec2_1.Vec2(this.audioPlayer.sound.seek(), 0);
        }
        if (this.followingLine) {
            var result = new Vec2_1.Vec2(-this.timestepLine.transform.position.x + this.canvas.width / 2, 1);
            this.viewport.transform.position = result;
        }
        this.timestepLine.draw(this.viewport, this.canvas);
        (_a = this.phantomTimestamp) === null || _a === void 0 ? void 0 : _a.draw(this.canvas);
    };
    return Editor;
}());
var Slider = /** @class */ (function () {
    function Slider(sliderId) {
        var _this = this;
        this.maxValue = 100;
        this.minValue = 0;
        this.onValueChange = new Event();
        this.sliderInput = jquery_1.default('#' + sliderId)[0];
        this.sliderInput.value = '0';
        this.sliderInput.oninput = function (event) {
            _this.setValue(event.target.value);
        };
        this.value = 0;
    }
    Slider.prototype.setMaxValue = function (value) {
        this.maxValue = value;
        this.sliderInput.max = value.toString();
    };
    Slider.prototype.setMinValue = function (value) {
        this.minValue = value;
        this.sliderInput.min = value.toString();
    };
    Slider.prototype.setValue = function (value) {
        this.value = value;
        this.sliderInput.value = value.toString();
        this.onValueChange.invoke(value);
    };
    return Slider;
}());
var TimeAccuracy;
(function (TimeAccuracy) {
    TimeAccuracy[TimeAccuracy["seconds"] = 0] = "seconds";
    TimeAccuracy[TimeAccuracy["milliseconds"] = 1] = "milliseconds";
})(TimeAccuracy || (TimeAccuracy = {}));
var AudioPlayerView = /** @class */ (function () {
    function AudioPlayerView() {
        this.snapSlider = new Slider('snap-lines');
        this.volumeSlider = new Slider('volume-slider');
        this.audioFileName = jquery_1.default('#file-name')[0];
        this.audioCurrentTime = jquery_1.default('#current-audio-time')[0];
        this.audioDuration = jquery_1.default('#audio-duration')[0];
        this.songTimeSlider = new Slider('audio-slider');
    }
    AudioPlayerView.prototype.onAudioLoad = function (fileName, duration) {
        this.audioFileName.innerHTML = fileName;
        this.audioCurrentTime.innerHTML = '0:00';
        this.audioDuration.innerHTML = this.formatTime(duration, TimeAccuracy.seconds);
        this.songTimeSlider.setMaxValue(duration * 100);
    };
    AudioPlayerView.prototype.update = function (currentTime) {
        this.audioCurrentTime.innerHTML = this.formatTime(currentTime, TimeAccuracy.seconds);
        this.songTimeSlider.setValue(currentTime * 100);
    };
    AudioPlayerView.prototype.formatTime = function (time, accuracy) {
        var minutes = Math.floor(time / 60);
        var seconds = Math.floor(time - minutes * 60);
        var milliseconds = time % 1;
        if (seconds < 10)
            seconds = '0' + seconds.toString();
        if (accuracy == TimeAccuracy.milliseconds)
            return minutes + ':' + seconds + ':' + milliseconds;
        else
            return minutes + ':' + seconds;
    };
    return AudioPlayerView;
}());
var AudioPlayer = /** @class */ (function () {
    function AudioPlayer(editor) {
        this.view = new AudioPlayerView();
        this.editor = editor;
    }
    AudioPlayer.prototype.onSoundLoad = function (fileName, soundPath) {
        var _this = this;
        this.sound = new Howl({ src: [soundPath] });
        this.analyser = Howler.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.sound.on('load', function () {
            //this.soundId = this.sound.play();
            //this.sound.stop();
            _this.view.onAudioLoad(fileName, _this.sound.duration());
        });
        this.sound.on('play', function () {
            _this.setupEditor();
        });
        this.sound.on('seek', function () {
            _this.setupEditor();
        });
        this.sound.on('stop', function () {
            //setupEditor();
        });
    };
    AudioPlayer.prototype.setVolume = function (value) {
        this.sound.volume([value]);
    };
    AudioPlayer.prototype.update = function () {
        this.view.update(this.sound.seek());
    };
    AudioPlayer.prototype.setPlaybackRate = function (value) {
        console.log(value);
        this.sound.rate([value]);
    };
    AudioPlayer.prototype.setupEditor = function () {
        this.bufferSource = this.sound._soundById(this.soundId)._node.bufferSource;
        this.sound._soundById(this.soundId)._node.bufferSource.connect(this.analyser);
        editor.audioCanvas.onAudioLoad(this);
        editor.drawEditor();
    };
    AudioPlayer.prototype.isPlaying = function () {
        if (this.sound == undefined || this.sound == null)
            return false;
        return this.sound.playing([this.soundId]);
    };
    AudioPlayer.prototype.play = function () {
        this.soundId = this.sound.play();
    };
    AudioPlayer.prototype.pause = function () {
        this.sound.pause();
    };
    AudioPlayer.prototype.playClapSound = function () {
    };
    AudioPlayer.prototype.setMusicFromCanvasPosition = function (position, editor) {
        var second = editor.viewport.canvasToSongTime(position).x / editor.transform.scale.x;
        this.sound.seek([second]);
    };
    AudioPlayer.prototype.setMusicFromTimePosition = function () {
    };
    AudioPlayer.prototype.getDomainData = function () {
        var dataArray = new Float32Array(this.analyser.frequencyBinCount);
        this.analyser.getFloatTimeDomainData(dataArray);
        return dataArray;
    };
    return AudioPlayer;
}());
var AudioAmplitudeCanvas = /** @class */ (function () {
    function AudioAmplitudeCanvas(editor) {
        this.amplitudeData = new Array();
        this.sampleRate = 48000;
        this.divideValue = 10;
        this.samplesPerArrayValue = this.sampleRate / this.divideValue;
        this.editor = editor;
        this.audio = editor.audioPlayer;
        this.canvas = jquery_1.default('#audio-amplitude-canvas')[0];
        this.ctx = this.canvas.getContext('2d');
    }
    AudioAmplitudeCanvas.prototype.onWindowResize = function (event) {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;
        var info = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.setAttribute('width', info.width.toString());
        this.canvas.setAttribute('height', (info.height / 4).toString());
    };
    AudioAmplitudeCanvas.prototype.onAudioLoad = function (audio) {
        this.data = audio.bufferSource.buffer.getChannelData(0);
        this.calculateAmplitudeArray();
    };
    AudioAmplitudeCanvas.prototype.draw = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = AppSettings_1.appSettings.editorBackgroundColor.value();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.data == undefined || this.data == null)
            return;
        if (this.amplitudeData == undefined || this.amplitudeData == null)
            return;
        for (var i = 0; i < this.amplitudeData.length; i++) {
            var interpolated = this.amplitudeData[i] * this.canvas.height;
            var position = this.editor.viewport.position.x + i * this.editor.editorGrid.transform.scale.x / this.divideValue;
            var width = this.editor.editorGrid.transform.scale.x / this.divideValue;
            var gap = Math.floor(width / 3);
            this.ctx.fillStyle = AppSettings_1.appSettings.loudnessBarColor.value();
            this.ctx.fillRect(position + gap, 0, width - gap, interpolated);
            this.ctx.fill();
        }
    };
    AudioAmplitudeCanvas.prototype.calculateAmplitudeArray = function () {
        this.amplitudeData = [];
        for (var i = 0; i < this.data.length; i += this.samplesPerArrayValue) {
            var value = this.getAvarageAtRange(i, i + this.samplesPerArrayValue);
            this.amplitudeData.push(value);
        }
    };
    AudioAmplitudeCanvas.prototype.getAmplitudeBarWitdh = function () {
        return this.editor.transform.scale.x * this.samplesPerArrayValue / this.sampleRate;
    };
    AudioAmplitudeCanvas.prototype.getMaxAtRange = function (from, to) {
        var max = -10;
        for (var i = from; i < to && i < this.data.length; i++) {
            if (Math.abs(this.data[i]) >= max) {
                max = Math.abs(this.data[i]);
            }
        }
        return max;
    };
    AudioAmplitudeCanvas.prototype.getAvarageAtRange = function (from, to) {
        var result = 0;
        for (var i = from; i < to && i < this.data.length; i++) {
            result += Math.abs(this.data[i]);
        }
        result = result / (to - from);
        return result;
    };
    return AudioAmplitudeCanvas;
}());
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
var inputController = new Input(editor);
editor.inputController = inputController;
module.exports = editor;
