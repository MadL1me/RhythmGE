"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualiserEditorModule = void 0;
var jquery_1 = __importDefault(require("jquery"));
var Transform_1 = require("../Transform");
var AppSettings_1 = require("../Utils/AppSettings");
var Input_1 = require("../Input");
var VisualiserEditorModule = /** @class */ (function () {
    function VisualiserEditorModule() {
        this.transform = new Transform_1.Transform();
        this.displayData = new Uint8Array();
        this.sampleRate = 48000;
        this.divideValue = 20;
        this.samplesPerArrayValue = this.sampleRate / this.divideValue;
        this.canvas = jquery_1.default("#visualiser-canvas")[0];
        this.ctx = this.canvas.getContext("2d");
    }
    VisualiserEditorModule.prototype.init = function (editorCoreModules) {
        var _this = this;
        this.editor = editorCoreModules;
        Input_1.Input.onWindowResize.addListener(function () { _this.onWindowResize(); });
        this.editor.audio.onPlay.addListener(function () { _this.onAudioLoad(); });
    };
    VisualiserEditorModule.prototype.onAudioLoad = function () {
        //this.spectrumData = this.editor.audio.getSpectrumData();
        this.displayData = this.editor.audio.getSpectrumData();
        this.calculateDisplayDataArray();
    };
    VisualiserEditorModule.prototype.calculateDisplayDataArray = function () {
    };
    VisualiserEditorModule.prototype.updateModule = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = AppSettings_1.editorColorSettings.editorBackgroundColor.value();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.displayData == undefined || this.displayData == null)
            return;
        if (this.spectrumData == undefined || this.spectrumData == null) {
            this.spectrumData = this.displayData;
            return;
        }
        var view = this.editor.viewport;
        this.onAudioLoad();
        var barHeight;
        var gap = 1; //- gap * this.displayData.length
        var barWidth = ((this.canvas.width) / (this.displayData.length - 10)) * 1;
        var x = 0;
        for (var i = 0; i < this.displayData.length - 10; i++) {
            barHeight = this.displayData[i] / 600 * this.canvas.height + 2 * (this.displayData[i] - this.spectrumData[i]);
            this.ctx.fillStyle = AppSettings_1.editorColorSettings.creatableTimestampLineColor.value();
            this.ctx.fillRect(x, this.canvas.height, barWidth, -barHeight);
            x += barWidth + gap;
        }
        this.spectrumData = this.displayData;
    };
    VisualiserEditorModule.prototype.onWindowResize = function () {
        var div = this.canvas.parentElement;
        //div.setAttribute('style', 'height:' + (h * 0.6).toString() + 'px');
        var info = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.setAttribute('width', (info.width).toString());
        this.canvas.setAttribute('height', (info.height * 0.7).toString());
    };
    return VisualiserEditorModule;
}());
exports.VisualiserEditorModule = VisualiserEditorModule;
