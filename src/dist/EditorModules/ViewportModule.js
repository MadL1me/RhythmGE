"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportModule = void 0;
var Transform_1 = require("../Transform");
var Vec2_1 = require("../Utils/Vec2");
var jquery_1 = __importDefault(require("jquery"));
var Input_1 = require("../Input");
var ViewportModule = /** @class */ (function () {
    function ViewportModule(parent) {
        var _this = this;
        this.transform = new Transform_1.Transform();
        this.maxDeviation = new Vec2_1.Vec2(10, 100);
        this._canvas = jquery_1.default("#editor-canvas")[0];
        this.transform.parent = parent;
        this.transform.position = new Vec2_1.Vec2(100, 0);
        Input_1.Input.onWheelCanvas.addListener(function (event) { _this.onCanvasScroll(event); });
    }
    ViewportModule.prototype.onCanvasScroll = function (event) {
        if (Input_1.Input.keysPressed["ControlLeft"])
            return;
        var isSpeededUp = Input_1.Input.keysPressed["ShiftLeft"] == true;
        var mouseDelta = event.deltaY;
        if (this.editor.editorData.followLine.value)
            return;
        var resultedDelta = mouseDelta * this.editor.editorData.scrollingSpeed.value / this.transform.scale.x;
        if (isSpeededUp)
            resultedDelta *= this.editor.editorData.fastScrollingSpeed.value;
        this.transform.localPosition = new Vec2_1.Vec2(this.transform.localPosition.x + resultedDelta, this.position.y);
        if (this.transform.localPosition.x > this.maxDeviation.x)
            this.transform.localPosition = new Vec2_1.Vec2(this.maxDeviation.x, this.position.y);
        console.log(this.transform.localPosition);
    };
    Object.defineProperty(ViewportModule.prototype, "position", {
        get: function () {
            return this.transform.position;
        },
        set: function (pos) {
            this.transform.position = pos;
        },
        enumerable: false,
        configurable: true
    });
    ViewportModule.prototype.init = function (editorCore) { this.editor = editorCore; };
    ViewportModule.prototype.updateModule = function () {
        //console.log(this.transform.position);
    };
    ViewportModule.prototype.canvasToSongTime = function (canvasCoords) {
        var pos = this.transform.position;
        return new Vec2_1.Vec2((canvasCoords.x - pos.x), (canvasCoords.y - pos.y));
    };
    ViewportModule.prototype.isOutOfViewportBounds = function (position) {
        var objectPos = Vec2_1.Vec2.Sum(position, this.position);
        return [objectPos.x < 0 || objectPos.x > this._canvas.width,
            objectPos.y < 0 || objectPos.y > this._canvas.height];
    };
    return ViewportModule;
}());
exports.ViewportModule = ViewportModule;
