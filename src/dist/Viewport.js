"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Viewport = void 0;
var Transform_1 = require("./Transform");
var Vec2_1 = require("./Vec2");
var Viewport = /** @class */ (function () {
    function Viewport() {
        this.transform = new Transform_1.Transform();
        this.maxDeviation = new Vec2_1.Vec2(10, 100);
    }
    Object.defineProperty(Viewport.prototype, "position", {
        get: function () {
            return this.transform.position;
        },
        set: function (value) {
            console.log(value);
            this.transform.position = value;
            console.log(this.transform.position);
        },
        enumerable: false,
        configurable: true
    });
    Viewport.prototype.worldToCanvas = function (worldCoords) {
        var pos = this.position;
        return new Vec2_1.Vec2(pos.x - worldCoords.x / this.gridTransform.scale.x, pos.y - worldCoords.y / this.gridTransform.scale.y);
    };
    Viewport.prototype.canvasToWorld = function (canvasCoords) {
        var pos = this.position;
        return new Vec2_1.Vec2((pos.x - canvasCoords.x) / this.gridTransform.scale.x, (pos.y - canvasCoords.y) / this.gridTransform.scale.y);
    };
    Viewport.prototype.canvasToWorld2 = function (canvasCoords) {
        var pos = this.position;
        return new Vec2_1.Vec2((pos.x - canvasCoords.x), (pos.y - canvasCoords.y));
    };
    Viewport.prototype.canvasToSongTime = function (canvasCoords) {
        var pos = this.position;
        return new Vec2_1.Vec2((canvasCoords.x - pos.x), (canvasCoords.y - pos.y));
    };
    return Viewport;
}());
exports.Viewport = Viewport;
