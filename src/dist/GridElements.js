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
exports.BeatLine = exports.BPMLine = exports.TimestepLine = exports.CreatableTimestampLine = exports.Timestamp = exports.GridElement = void 0;
var Transform_1 = require("./Transform");
var RgbaColor_1 = require("./RgbaColor");
var Vec2_1 = require("./Vec2");
var AppSettings_1 = require("./AppSettings");
var Utils_1 = require("./Utils");
var GridElement = /** @class */ (function () {
    function GridElement(parent, rgbaColor) {
        this.transform = new Transform_1.Transform();
        this.onDelete = new Utils_1.Event();
        this._isActive = true;
        this._isSelected = false;
        this.color = rgbaColor;
        this.transform.parent = parent;
    }
    Object.defineProperty(GridElement.prototype, "value", {
        get: function () {
            return this.transform.position.x;
        },
        enumerable: false,
        configurable: true
    });
    ;
    GridElement.prototype.draw = function (view, canvas) {
        this._outOfBounds = view.isOutOfViewportBounds(this.transform.position);
    };
    GridElement.prototype.delete = function () {
        this.onDelete.invoke(this);
    };
    Object.defineProperty(GridElement.prototype, "isActive", {
        get: function () {
            return this._isActive;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GridElement.prototype, "isSelected", {
        get: function () {
            return this._isSelected;
        },
        enumerable: false,
        configurable: true
    });
    GridElement.prototype.select = function () {
        this._isSelected = true;
    };
    GridElement.prototype.deselect = function () {
        this._isSelected = false;
    };
    GridElement.prototype.activate = function () {
        this._isActive = true;
    };
    GridElement.prototype.deactivate = function () {
        this._isActive = false;
    };
    return GridElement;
}());
exports.GridElement = GridElement;
var Timestamp = /** @class */ (function (_super) {
    __extends(Timestamp, _super);
    function Timestamp(color, position, width, parent) {
        var _this = _super.call(this, parent, color) || this;
        _this.maxWidth = 7;
        _this.minWidth = 1;
        _this.width = width;
        _this.transform.parent = parent;
        _this.transform.position = position;
        _this.color = color;
        return _this;
    }
    Timestamp.prototype.draw = function (view, canvas) {
        _super.prototype.draw.call(this, view, canvas);
        if (this._outOfBounds[0])
            return;
        var color = this._isSelected ? RgbaColor_1.RgbaColor.White : this.color;
        var ctx = canvas.getContext('2d');
        var pos = new Vec2_1.Vec2(this.transform.position.x + view.position.x, this.transform.position.y + view.position.y);
        var width = this.width + this.transform.scale.x / 5;
        if (width > this.maxWidth)
            width = this.maxWidth;
        if (width < this.minWidth)
            width = this.minWidth;
        ctx.fillStyle = color.value();
        ctx.beginPath();
        ctx.moveTo(pos.x - width, pos.y);
        ctx.lineTo(pos.x, pos.y - width);
        ctx.lineTo(pos.x + width, pos.y);
        ctx.lineTo(pos.x, pos.y + width);
        ctx.fill();
    };
    return Timestamp;
}(GridElement));
exports.Timestamp = Timestamp;
var CreatableTimestampLine = /** @class */ (function (_super) {
    __extends(CreatableTimestampLine, _super);
    function CreatableTimestampLine(x, parent, color) {
        var _this = _super.call(this, parent, color) || this;
        _this.transform.parent = parent;
        _this.transform.localPosition = new Vec2_1.Vec2(x, 0);
        return _this;
    }
    CreatableTimestampLine.prototype.draw = function (view, canvas) {
        _super.prototype.draw.call(this, view, canvas);
        if (this._outOfBounds[0])
            return;
        var x = this.transform.position.x + view.position.x;
        var ctx = canvas.getContext('2d');
        var color = this._isSelected ? AppSettings_1.editorColorSettings.selectedCreatableLineColor : this.color;
        ctx.beginPath();
        ctx.fillStyle = color.value();
        ctx.moveTo((x), canvas.height - 10);
        ctx.lineTo((x - 5), canvas.height);
        ctx.lineTo((x + 5), canvas.height);
        ctx.fill();
        ctx.strokeStyle = color.value();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    };
    return CreatableTimestampLine;
}(GridElement));
exports.CreatableTimestampLine = CreatableTimestampLine;
var TimestepLine = /** @class */ (function (_super) {
    __extends(TimestepLine, _super);
    function TimestepLine(parent, color) {
        return _super.call(this, parent, color) || this;
    }
    TimestepLine.prototype.draw = function (view, canvas) {
        _super.prototype.draw.call(this, view, canvas);
        var x = this.transform.position.x + view.position.x;
        var ctx = canvas.getContext('2d');
        if (x >= canvas.width)
            x = canvas.width - 5;
        if (x <= 0)
            x = 0;
        ctx.beginPath();
        ctx.fillStyle = AppSettings_1.editorColorSettings.timestepLineColor.value();
        ctx.moveTo(x, 10);
        ctx.lineTo(x - 5, 0);
        ctx.lineTo(x + 5, 0);
        ctx.fill();
        ctx.strokeStyle = AppSettings_1.editorColorSettings.timestepLineColor.value();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    };
    return TimestepLine;
}(GridElement));
exports.TimestepLine = TimestepLine;
var BPMLine = /** @class */ (function (_super) {
    __extends(BPMLine, _super);
    function BPMLine(x, parent, rgbaColor) {
        var _this = _super.call(this, parent, rgbaColor) || this;
        _this.snapLines = new Array();
        _this.transform.localPosition = new Vec2_1.Vec2(x, 0);
        return _this;
    }
    Object.defineProperty(BPMLine.prototype, "value", {
        get: function () {
            return this.transform.position.x;
        },
        enumerable: false,
        configurable: true
    });
    ;
    BPMLine.prototype.draw = function (view, canvas) {
        _super.prototype.draw.call(this, view, canvas);
        if (this._outOfBounds[0])
            return;
        if (!this.isActive)
            return;
        var ctx = canvas.getContext('2d');
        ctx.strokeStyle = this.color.value();
        ctx.beginPath();
        ctx.moveTo(this.transform.position.x + view.position.x, 0);
        ctx.lineTo(this.transform.position.x + view.position.x, canvas.height);
        ctx.stroke();
        this.snapLines.forEach(function (line) { line.draw(view, canvas); });
    };
    BPMLine.prototype.setSnapLines = function (snapValue, distanceBetweenBpmLines) {
        this.snapLines = new Array();
        var distance = distanceBetweenBpmLines / snapValue;
        for (var i = 0; i < snapValue - 1; i++) {
            this.snapLines.push(new BPMLine((i + 1) * distance, this.transform, AppSettings_1.editorColorSettings.snapBpmLineColor));
        }
    };
    return BPMLine;
}(GridElement));
exports.BPMLine = BPMLine;
var BeatLine = /** @class */ (function (_super) {
    __extends(BeatLine, _super);
    function BeatLine(y, parent, rgbaColor) {
        var _this = _super.call(this, parent, rgbaColor) || this;
        _this.transform.localPosition = new Vec2_1.Vec2(0, y);
        return _this;
    }
    BeatLine.prototype.draw = function (view, canvas) {
        _super.prototype.draw.call(this, view, canvas);
        var ctx = canvas.getContext('2d');
        ctx.strokeStyle = this.color.value();
        ctx.beginPath();
        ctx.moveTo(0, this.transform.position.y);
        ctx.lineTo(canvas.width, this.transform.position.y);
        ctx.stroke();
    };
    return BeatLine;
}(GridElement));
exports.BeatLine = BeatLine;
