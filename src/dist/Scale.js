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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopScale = void 0;
var Transform_1 = require("./Transform");
var jquery_1 = __importDefault(require("jquery"));
var Scale = /** @class */ (function () {
    function Scale(width) {
        this.width = width;
    }
    return Scale;
}());
var TopScale = /** @class */ (function (_super) {
    __extends(TopScale, _super);
    function TopScale(width) {
        var _this = _super.call(this, width) || this;
        _this.transform = new Transform_1.Transform();
        _this.canvas = jquery_1.default("#editor-canvas")[0];
        return _this;
    }
    TopScale.prototype.init = function (editorCoreModules) {
        this.editorCore = editorCoreModules;
    };
    TopScale.prototype.updateModule = function () {
        this.draw(this.canvas);
    };
    TopScale.prototype.draw = function (canvas) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1B1C21';
        ctx.fillRect(0, -5, canvas.width, this.width + 5);
    };
    return TopScale;
}(Scale));
exports.TopScale = TopScale;
