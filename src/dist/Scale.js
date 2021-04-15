"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeftScale = exports.BottomScale = exports.TopScale = void 0;
var Scale = /** @class */ (function () {
    function Scale(width) {
        this.width = width;
    }
    return Scale;
}());
var TopScale = /** @class */ (function (_super) {
    __extends(TopScale, _super);
    function TopScale() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TopScale.prototype.draw = function (canvas) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1B1C21';
        ctx.fillRect(0, -5, canvas.width, this.width + 5);
    };
    return TopScale;
}(Scale));
exports.TopScale = TopScale;
var BottomScale = /** @class */ (function (_super) {
    __extends(BottomScale, _super);
    function BottomScale() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BottomScale.prototype.draw = function (canvas) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1B1C21';
        ctx.fillRect(0, canvas.height + 5, canvas.width, -this.width - 5);
    };
    return BottomScale;
}(Scale));
exports.BottomScale = BottomScale;
var LeftScale = /** @class */ (function (_super) {
    __extends(LeftScale, _super);
    function LeftScale() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LeftScale.prototype.draw = function (canvas) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1B1C21';
        ctx.fillRect(0, 0, this.width, canvas.height);
    };
    return LeftScale;
}(Scale));
exports.LeftScale = LeftScale;
