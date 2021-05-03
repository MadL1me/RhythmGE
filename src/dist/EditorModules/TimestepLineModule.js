"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimestepLineModule = void 0;
var jquery_1 = __importDefault(require("jquery"));
var Vec2_1 = require("../Utils/Vec2");
var Transform_1 = require("../Transform");
var GridElements_1 = require("../GridElements");
var AppSettings_1 = require("../Utils/AppSettings");
var TimestepLineModule = /** @class */ (function () {
    function TimestepLineModule() {
        this.transform = new Transform_1.Transform();
        this.timestepLine = new GridElements_1.TimestepLine(this.transform, AppSettings_1.editorColorSettings.timestepLineColor);
        this.canvas = jquery_1.default("#editor-canvas")[0];
    }
    TimestepLineModule.prototype.init = function (editorCoreModules) {
        var _this = this;
        this.editor = editorCoreModules;
        this.editor.audio.onSeek.addListener(function () { _this.setLinePosition(); _this.timestepLine.draw(_this.editor.viewport, _this.canvas); });
    };
    TimestepLineModule.prototype.updateModule = function () {
        if (this.editor.audio.isPlaying()) {
            this.setLinePosition();
        }
        this.timestepLine.draw(this.editor.viewport, this.canvas);
    };
    TimestepLineModule.prototype.setLinePosition = function () {
        this.timestepLine.transform.localPosition = new Vec2_1.Vec2(this.editor.audio.seek(), 0);
        if (this.editor.editorData.followLine.value) {
            var result = new Vec2_1.Vec2(-this.timestepLine.transform.position.x + this.canvas.width / 2, 0);
            this.editor.viewport.transform.position = result;
        }
    };
    return TimestepLineModule;
}());
exports.TimestepLineModule = TimestepLineModule;
