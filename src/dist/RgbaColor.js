"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RgbaColor = void 0;
var RgbaColor = /** @class */ (function () {
    function RgbaColor(r, g, b, a) {
        if (a === void 0) { a = 1; }
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    RgbaColor.prototype.value = function () {
        if (this.a == 1)
            return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ')';
        return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
    };
    RgbaColor.prototype.normalizeValue = function (value) {
        if (value < 0)
            return 0;
        if (value > 255)
            return 255;
        return value;
    };
    Object.defineProperty(RgbaColor.prototype, "r", {
        get: function () {
            return this._r;
        },
        set: function (value) {
            this._r = this.normalizeValue(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RgbaColor.prototype, "g", {
        get: function () {
            return this._g;
        },
        set: function (value) {
            this._g = this.normalizeValue(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RgbaColor.prototype, "b", {
        get: function () {
            return this._b;
        },
        set: function (value) {
            this._b = this.normalizeValue(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RgbaColor.prototype, "a", {
        get: function () {
            return this._a;
        },
        set: function (value) {
            value = this.normalizeValue(value);
            if (value > 1)
                value = 1;
            this._a = value;
        },
        enumerable: false,
        configurable: true
    });
    return RgbaColor;
}());
exports.RgbaColor = RgbaColor;
