"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportModule = void 0;
var Transform_1 = require("./Transform");
var Vec2_1 = require("./Vec2");
var jquery_1 = __importDefault(require("jquery"));
var ViewportModule = /** @class */ (function () {
    function ViewportModule(parent) {
        this.transform = new Transform_1.Transform();
        this.maxDeviation = new Vec2_1.Vec2(10, 100);
        this._canvas = jquery_1.default("#editor-canvas")[0];
        this.transform.parent = parent;
        this.transform.position = new Vec2_1.Vec2(10, 0);
    }
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
    ViewportModule.prototype.init = function (editorCore) { };
    ViewportModule.prototype.updateModule = function () {
    };
    ViewportModule.prototype.canvasToSongTime = function (canvasCoords) {
        var pos = this.transform.position;
        return new Vec2_1.Vec2((canvasCoords.x - pos.x), (canvasCoords.y - pos.y));
    };
    ViewportModule.prototype.isOutOfViewportBounds = function (position) {
        var rightPos = new Vec2_1.Vec2(this.transform.position.x + this._canvas.width, this.transform.position.y + this._canvas.height);
        return position.x < this.transform.position.x
            || position.y < this.transform.position.y
            || position.x > rightPos.x
            || position.y > rightPos.y;
    };
    return ViewportModule;
}());
exports.ViewportModule = ViewportModule;
