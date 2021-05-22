"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioAmplitudeViewModule = exports.AudioModule = void 0;
var Utils_1 = require("../Utils/Utils");
var AppSettings_1 = require("../Utils/AppSettings");
var jquery_1 = __importDefault(require("jquery"));
var Transform_1 = require("../Transform");
var Input_1 = require("../Input");
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
        this.volumeSlider.value = 1;
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
        if (!this.audioController.isAudioLoaded())
            return;
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
        this.clapSource = new Howl({ src: [__dirname + "/Resources/clap.wav"] });
        this.view = new AudioPlayerView(this);
        this.clappingTimings = new Array();
        this.clapTimingId = 0;
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
        return this.songSource.duration();
    };
    AudioModule.prototype.setClapTimings = function (array) {
        this.clappingTimings = array;
        if (this.editorCore.editorData.useClaps.value)
            this.findClapTimingsPosition();
    };
    AudioModule.prototype.findClapTimingsPosition = function () {
        var seek = this.seek() - this.editorCore.editorData.offset.value / 1000;
        this.clapTimingId = Utils_1.Utils.binaryNearestSearchNumber(this.clappingTimings, seek, Utils_1.Func.Ceil);
        if (this.clappingTimings[this.clapTimingId] < seek)
            this.clapTimingId++;
    };
    AudioModule.prototype.checkForClaps = function () {
        if (this.songSource == null || this.clappingTimings.length < 1
            || !this.editorCore.editorData.useClaps.value || this.clapTimingId > this.clappingTimings.length - 1)
            return;
        var seek = this.songSource.seek() - this.editorCore.editorData.offset.value / 1000;
        if (this.clappingTimings[this.clapTimingId] < seek) {
            this.clapTimingId++;
            this.playClapSound();
        }
    };
    AudioModule.prototype.loadAudio = function (fileName, soundPath) {
        var _this = this;
        this.songSource = new Howl({ src: [soundPath] });
        this.analyser = Howler.ctx.createAnalyser();
        this.analyser.fftSize = 128;
        this.songSource.on('load', function () {
            _this.audioLoaded = true;
            _this.view.onAudioLoad(fileName, _this.songSource.duration());
            _this.onAudioLoaded.invoke([fileName, soundPath]);
        });
        this.songSource.on('play', function (id) {
            _this.setupData();
            _this.onPlay.invoke(id);
        });
        this.songSource.on('seek', function (id) {
            _this.onSeek.invoke(id);
            _this.setupData();
            if (_this.editorCore.editorData.useClaps.value)
                _this.findClapTimingsPosition();
        });
        this.songSource.on('stop', function (id) {
            _this.onStop.invoke(id);
        });
    };
    AudioModule.prototype.setVolume = function (value) {
        var _a;
        (_a = this.songSource) === null || _a === void 0 ? void 0 : _a.volume([value]);
    };
    AudioModule.prototype.init = function (editorCoreModules) {
        var _this = this;
        this.editorCore = editorCoreModules;
        this.editorCore.editorData.audioFile.onValueChange.addListener(function (_a) {
            var s1 = _a[0], s2 = _a[1];
            _this.loadAudio(s1, s2);
        });
        this.view.onVolumeSliderChange.addListener(function (value) { _this.setVolume(value); });
        this.editorCore.editorData.playbackRate.onValueChange.addListener(function (value) { _this.setPlaybackRate(value); });
        this.editorCore.editorData.useClaps.onValueChange.addListener(function (value) { return _this.findClapTimingsPosition(); });
    };
    AudioModule.prototype.updateModule = function () {
        if (this.songSource == null || this.songSource == undefined)
            return;
        var seek = this.songSource.seek();
        this.view.update(seek);
        //this.checkForClaps();
    };
    AudioModule.prototype.setPlaybackRate = function (value) {
        var _a;
        (_a = this.songSource) === null || _a === void 0 ? void 0 : _a.rate([value]);
    };
    AudioModule.prototype.isAudioLoaded = function () {
        return this.audioLoaded;
    };
    AudioModule.prototype.isPlaying = function () {
        if (this.songSource == undefined || this.songSource == null)
            return false;
        return this.songSource.playing([this.soundId]);
    };
    AudioModule.prototype.play = function () {
        var _a;
        this.soundId = (_a = this.songSource) === null || _a === void 0 ? void 0 : _a.play();
    };
    AudioModule.prototype.playClapSound = function () {
        var _a, _b;
        (_a = this.clapSource) === null || _a === void 0 ? void 0 : _a.stop();
        this.clapSoundId = (_b = this.clapSource) === null || _b === void 0 ? void 0 : _b.play();
    };
    AudioModule.prototype.pause = function () {
        var _a;
        (_a = this.songSource) === null || _a === void 0 ? void 0 : _a.pause();
    };
    AudioModule.prototype.seek = function () {
        var _a;
        return (_a = this.songSource) === null || _a === void 0 ? void 0 : _a.seek();
    };
    AudioModule.prototype.setMusicFromCanvasPosition = function (position) {
        if (this.songSource == null || this.songSource == undefined)
            return;
        var second = this.editorCore.viewport.canvasToSongTime(position).x / this.editorCore.transform.scale.x;
        this.songSource.seek([second]);
        //this.setupData();
    };
    AudioModule.prototype.getDomainData = function () {
        var dataArray = new Float32Array(this.analyser.frequencyBinCount);
        this.analyser.getFloatTimeDomainData(dataArray);
        return dataArray;
    };
    AudioModule.prototype.getSpectrumData = function () {
        if (this.analyser == undefined)
            return new Uint8Array(0);
        var dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    };
    AudioModule.prototype.setupData = function () {
        this._bufferSource = this.songSource._soundById(this.soundId)._node.bufferSource;
        this.songSource._soundById(this.soundId)._node.bufferSource.connect(this.analyser);
    };
    return AudioModule;
}());
exports.AudioModule = AudioModule;
var AudioAmplitudeViewModule = /** @class */ (function () {
    function AudioAmplitudeViewModule() {
        this.transform = new Transform_1.Transform();
        this.amplitudeData = new Array();
        this.sampleRate = 48000;
        this.divideValue = 20;
        this.samplesPerArrayValue = this.sampleRate / this.divideValue;
        this.canvas = jquery_1.default('#audio-amplitude-canvas')[0];
        this.ctx = this.canvas.getContext('2d');
    }
    AudioAmplitudeViewModule.prototype.onWindowResize = function () {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;
        var info = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.setAttribute('width', info.width.toString());
        this.canvas.setAttribute('height', (info.height / 4).toString());
    };
    AudioAmplitudeViewModule.prototype.onAudioLoad = function () {
        this.analyserData = this.editorCore.audio.bufferSource.buffer.getChannelData(0);
        this.calculateAmplitudeArray();
    };
    AudioAmplitudeViewModule.prototype.init = function (editorCore) {
        var _this = this;
        this.editorCore = editorCore;
        Input_1.Input.onWindowResize.addListener(function () { _this.onWindowResize(); });
        this.editorCore.audio.onPlay.addListener(function () { _this.onAudioLoad(); });
    };
    AudioAmplitudeViewModule.prototype.updateModule = function () {
        this.onWindowResize();
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
