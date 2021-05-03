"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vec2 = void 0;
var Vec2 = /** @class */ (function () {
    function Vec2(x, y) {
        this.x = x;
        this.y = y;
    }
    Object.defineProperty(Vec2.prototype, "magnitude", {
        get: function () {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vec2.prototype, "normalized", {
        get: function () {
            var magnitude = this.magnitude;
            return new Vec2(this.x / magnitude, this.y / magnitude);
        },
        enumerable: false,
        configurable: true
    });
    Vec2.Sum = function (v1, v2) {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    };
    Vec2.Substract = function (v1, v2) {
        return new Vec2(v1.x - v2.x, v1.y - v2.y);
    };
    Vec2.Multiply = function (v1, v2) {
        return new Vec2(v1.x * v2.x, v1.y * v2.y);
    };
    Vec2.Divide = function (v1, v2) {
        return new Vec2(v1.x / v2.x, v1.y / v2.y);
    };
    Vec2.MultiplyToNum = function (v1, num) {
        return new Vec2(v1.x * num, v1.y * num);
    };
    Vec2.Distance = function (v1, v2) {
        return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
    };
    Vec2.Normal = function (v1) {
        return new Vec2(v1.y, -v1.x);
    };
    return Vec2;
}());
exports.Vec2 = Vec2;
