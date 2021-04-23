"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioAmplitudeViewModule = exports.AudioModule = void 0;
var Utils_1 = require("./Utils");
var AppSettings_1 = require("./AppSettings");
var jquery_1 = __importDefault(require("jquery"));
var Transform_1 = require("./Transform");
var _a = require('howler'), Howl = _a.Howl, Howler = _a.Howler;
var TimeAccuracy;
(function (TimeAccuracy) {
    TimeAccuracy[TimeAccuracy["seconds"] = 0] = "seconds";
    TimeAccuracy[TimeAccuracy["milliseconds"] = 1] = "milliseconds";
})(TimeAccuracy || (TimeAccuracy = {}));
var AudioPlayerView = /** @class */ (function () {
    function AudioPlayerView(audio) {
        var _this = this;
        this.songTimeSlider = new Utils_1.Slider('audio-slider');
        this.volumeSlider = new Utils_1.Slider('volume-slider');
        this.onVolumeSliderChange = new Utils_1.Event();
        this.onPlayButtonClick = new Utils_1.Event();
        this.audioController = audio;
        this.audioFileName = jquery_1.default('#file-name')[0];
        this.audioCurrentTime = jquery_1.default('#current-audio-time')[0];
        this.audioDuration = jquery_1.default('#audio-duration')[0];
        this.volumeSlider.onValueChange.addListener(function (value) { _this.onVolumeSliderChange.invoke(value); });
        jquery_1.default('#play-button').on('click', function (event) { _this.onPlayClick(event.target); });
    }
    AudioPlayerView.prototype.onAudioLoad = function (fileName, duration) {
        this.audioFileName.innerHTML = fileName;
        this.audioCurrentTime.innerHTML = '0:00';
        this.audioDuration.innerHTML = this.formatTime(duration, TimeAccuracy.seconds);
        this.songTimeSlider.maxValue = duration * 100;
    };
    AudioPlayerView.prototype.update = function (currentTime) {
        this.audioCurrentTime.innerHTML = this.formatTime(currentTime, TimeAccuracy.seconds);
        this.songTimeSlider.value = currentTime * 100;
    };
    AudioPlayerView.prototype.onPlayClick = function (playBtn) {
        playBtn.classList.add('paused');
        if (this.audioController.isPlaying() == true) {
            playBtn.classList.remove('paused');
            this.audioController.pause();
        }
        else {
            this.audioController.play();
        }
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
var AudioModule = /** @class */ (function () {
    function AudioModule() {
        this.transform = new Transform_1.Transform();
        this._view = new AudioPlayerView(this);
        this.onAudioLoaded = new Utils_1.Event();
        this.onLoad = new Utils_1.Event();
        this.onSeek = new Utils_1.Event();
        this.onPlay = new Utils_1.Event();
        this.onStop = new Utils_1.Event();
    }
    Object.defineProperty(AudioModule.prototype, "bufferSource", {
        get: function () {
            return this._bufferSource;
        },
        enumerable: false,
        configurable: true
    });
    AudioModule.prototype.duration = function () {
        return this._howl.duration();
    };
    AudioModule.prototype.loadAudio = function (fileName, soundPath) {
        var _this = this;
        this._howl = new Howl({ src: [soundPath] });
        this._analyser = Howler.ctx.createAnalyser();
        this._analyser.fftSize = 256;
        this._howl.on('load', function () {
            _this._view.onAudioLoad(fileName, _this._howl.duration());
            _this.onAudioLoaded.invoke([fileName, soundPath]);
        });
        this._howl.on('play', function (id) {
            _this.setupData();
            _this.onPlay.invoke(id);
        });
        this._howl.on('seek', function (id) {
            _this.onSeek.invoke(id);
        });
        this._howl.on('stop', function (id) {
            _this.onStop.invoke(id);
        });
    };
    AudioModule.prototype.setVolume = function (value) {
        this._howl.volume([value]);
    };
    AudioModule.prototype.init = function (editorCoreModules) {
        var _this = this;
        this._editorCore = editorCoreModules;
        this._editorCore.editorData.audioFile.onValueChange.addListener(function (_a) {
            var s1 = _a[0], s2 = _a[1];
            _this.loadAudio(s1, s2);
        });
        this._view.onVolumeSliderChange.addListener(function (value) { _this.setVolume(value); });
    };
    AudioModule.prototype.updateModule = function () {
        if (this._howl == null || this._howl == undefined)
            return;
        this._view.update(this._howl.seek());
    };
    AudioModule.prototype.setPlaybackRate = function (value) {
        this._howl.rate([value]);
    };
    AudioModule.prototype.isAudioLoaded = function () {
        return false;
    };
    AudioModule.prototype.isPlaying = function () {
        if (this._howl == undefined || this._howl == null)
            return false;
        return this._howl.playing([this._soundId]);
    };
    AudioModule.prototype.play = function () {
        this._soundId = this._howl.play();
    };
    AudioModule.prototype.pause = function () {
        this._howl.pause();
    };
    AudioModule.prototype.seek = function () {
    };
    AudioModule.prototype.setMusicFromCanvasPosition = function (position, editor) {
        var second = editor.viewport.canvasToSongTime(position).x / editor.transform.scale.x;
        this._howl.seek([second]);
    };
    AudioModule.prototype.getDomainData = function () {
        var dataArray = new Float32Array(this._analyser.frequencyBinCount);
        this._analyser.getFloatTimeDomainData(dataArray);
        return dataArray;
    };
    AudioModule.prototype.setupData = function () {
        this._bufferSource = this._howl._soundById(this._soundId)._node.bufferSource;
        this._howl._soundById(this._soundId)._node.bufferSource.connect(this._analyser);
    };
    return AudioModule;
}());
exports.AudioModule = AudioModule;
var AudioAmplitudeViewModule = /** @class */ (function () {
    function AudioAmplitudeViewModule(parent) {
        this.transform = new Transform_1.Transform();
        this.amplitudeData = new Array();
        this.sampleRate = 48000;
        this.divideValue = 20;
        this.samplesPerArrayValue = this.sampleRate / this.divideValue;
        this.transform.parent = parent;
        this.canvas = jquery_1.default('#audio-amplitude-canvas')[0];
        this.ctx = this.canvas.getContext('2d');
    }
    AudioAmplitudeViewModule.prototype.onWindowResize = function (event) {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;
        var info = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.setAttribute('width', info.width.toString());
        this.canvas.setAttribute('height', (info.height / 4).toString());
    };
    AudioAmplitudeViewModule.prototype.onAudioLoad = function (audio) {
        this.analyserData = audio.bufferSource.buffer.getChannelData(0);
        this.calculateAmplitudeArray();
    };
    AudioAmplitudeViewModule.prototype.init = function (editorCore) {
        this.editorCore = editorCore;
    };
    AudioAmplitudeViewModule.prototype.updateModule = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = AppSettings_1.editorColorSettings.editorBackgroundColor.value();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        var view = this.editorCore.viewport;
        if (this.analyserData == undefined || this.analyserData == null)
            return;
        if (this.amplitudeData == undefined || this.amplitudeData == null)
            return;
        for (var i = 0; i < this.amplitudeData.length; i++) {
            var interpolated = this.amplitudeData[i] * this.canvas.height;
            var position = view.position.x + i * this.transform.scale.x / this.divideValue;
            var width = this.transform.scale.x / this.divideValue;
            var gap = Math.floor(width / 3);
            if (gap < 4)
                gap = 0;
            this.ctx.fillStyle = AppSettings_1.editorColorSettings.loudnessBarColor.value();
            this.ctx.fillRect(position + gap, 0, width - gap, interpolated);
            this.ctx.fill();
        }
    };
    AudioAmplitudeViewModule.prototype.calculateAmplitudeArray = function () {
        this.amplitudeData = [];
        for (var i = 0; i < this.analyserData.length; i += this.samplesPerArrayValue) {
            var value = this.getAvarageAtRange(i, i + this.samplesPerArrayValue);
            this.amplitudeData.push(value);
        }
    };
    AudioAmplitudeViewModule.prototype.getAvarageAtRange = function (from, to) {
        var result = 0;
        for (var i = from; i < to && i < this.analyserData.length; i++) {
            result += Math.abs(this.analyserData[i]);
        }
        result = result / (to - from);
        return result;
    };
    return AudioAmplitudeViewModule;
}());
exports.AudioAmplitudeViewModule = AudioAmplitudeViewModule;
