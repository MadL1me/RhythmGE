"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioAmplitudeCanvas = exports.AudioPlayer = exports.AudioPlayerView = exports.TimeAccuracy = void 0;
var Utils_1 = require("./Utils");
var AppSettings_1 = require("./AppSettings");
var jquery_1 = __importDefault(require("jquery"));
var _a = require('howler'), Howl = _a.Howl, Howler = _a.Howler;
var TimeAccuracy;
(function (TimeAccuracy) {
    TimeAccuracy[TimeAccuracy["seconds"] = 0] = "seconds";
    TimeAccuracy[TimeAccuracy["milliseconds"] = 1] = "milliseconds";
})(TimeAccuracy = exports.TimeAccuracy || (exports.TimeAccuracy = {}));
var AudioPlayerView = /** @class */ (function () {
    function AudioPlayerView() {
        this.snapSlider = new Utils_1.Slider('snap-lines');
        this.volumeSlider = new Utils_1.Slider('volume-slider');
        this.audioFileName = jquery_1.default('#file-name')[0];
        this.audioCurrentTime = jquery_1.default('#current-audio-time')[0];
        this.audioDuration = jquery_1.default('#audio-duration')[0];
        this.songTimeSlider = new Utils_1.Slider('audio-slider');
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
exports.AudioPlayerView = AudioPlayerView;
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
exports.AudioPlayer = AudioPlayer;
var AudioAmplitudeCanvas = /** @class */ (function () {
    function AudioAmplitudeCanvas(editor) {
        this.amplitudeData = new Array();
        this.sampleRate = 48000;
        this.divideValue = 20;
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
            if (gap < 4)
                gap = 0;
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
exports.AudioAmplitudeCanvas = AudioAmplitudeCanvas;
