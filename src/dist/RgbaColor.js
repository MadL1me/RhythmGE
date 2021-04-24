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
    return RgbaColor;
}());
exports.RgbaColor = RgbaColor;
