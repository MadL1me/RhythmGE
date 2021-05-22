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
exports.BeatLine = exports.BPMLine = exports.TimestepLine = exports.CreatableTimestampLine = exports.Timestamp = exports.TimestampPrefab = exports.GridElement = void 0;
var Transform_1 = require("./Transform");
var RgbaColor_1 = require("./Utils/RgbaColor");
var Vec2_1 = require("./Utils/Vec2");
var AppSettings_1 = require("./Utils/AppSettings");
var Utils_1 = require("./Utils/Utils");
var jquery_1 = __importDefault(require("jquery"));
var GridElement = /** @class */ (function () {
    function GridElement(parent, rgbaColor) {
        this.transform = new Transform_1.Transform();
        this.onRestore = new Utils_1.Event();
        this.onDelete = new Utils_1.Event();
        this.onMoved = new Utils_1.Event();
        this.onSelected = new Utils_1.Event();
        this.onDeselected = new Utils_1.Event();
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
    GridElement.prototype.move = function (newLocalPos) {
        this.onMoved.invoke([this, newLocalPos]);
    };
    GridElement.prototype.draw = function (view, canvas) {
        this._outOfBounds = view.isOutOfViewportBounds(this.transform.position);
    };
    GridElement.prototype.delete = function () {
        this.onDelete.invoke(this);
    };
    GridElement.prototype.restore = function () {
        this.onRestore.invoke(this);
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
        this.onDeselected.invoke(this);
        this._isSelected = false;
    };
    GridElement.prototype.activate = function () {
        this.onSelected.invoke(this);
        this._isActive = true;
    };
    GridElement.prototype.deactivate = function () {
        this._isActive = false;
    };
    return GridElement;
}());
exports.GridElement = GridElement;
var TimestampPrefab = /** @class */ (function () {
    function TimestampPrefab(id, color) {
        this.width = 0.2;
        this.onPrefabSelected = new Utils_1.Event();
        this.onPrefabDeselected = new Utils_1.Event();
        this.prefabId = id;
        this.color = color;
        this.createButton();
    }
    Object.defineProperty(TimestampPrefab.prototype, "isSelected", {
        get: function () {
            return this._isSelected;
        },
        enumerable: false,
        configurable: true
    });
    TimestampPrefab.prototype.createButton = function () {
        var _this = this;
        var prefabsContainer = jquery_1.default('#prefabs-container');
        this.buttonElement = jquery_1.default("<div>", { id: this.prefabId, "class": "prefab-button" });
        this.diamondElement = jquery_1.default("<div>", { "class": "diamond-shape" });
        this.diamondElement.attr("style", "background-color:" + this.color.value());
        this.buttonElement.append(this.diamondElement);
        prefabsContainer.append(this.buttonElement);
        this.buttonElement.on("click", function () {
            if (!_this._isSelected)
                _this.select(true);
        });
    };
    TimestampPrefab.prototype.select = function (callEvent) {
        if (callEvent === void 0) { callEvent = false; }
        this._isSelected = true;
        this.buttonElement.addClass("selected");
        if (callEvent)
            this.onPrefabSelected.invoke(this.prefabId);
    };
    TimestampPrefab.prototype.deselect = function (callEvent) {
        if (callEvent === void 0) { callEvent = false; }
        this._isSelected = false;
        this.buttonElement.removeClass("selected");
        if (callEvent)
            this.onPrefabDeselected.invoke(this.prefabId);
    };
    return TimestampPrefab;
}());
exports.TimestampPrefab = TimestampPrefab;
var Timestamp = /** @class */ (function (_super) {
    __extends(Timestamp, _super);
    function Timestamp(prefab, position, parent) {
        var _this = _super.call(this, parent, prefab.color) || this;
        _this.maxWidth = 7;
        _this.minWidth = 1;
        _this.width = prefab.width;
        _this.color = prefab.color;
        _this._prefab = prefab;
        _this.transform.parent = parent;
        _this.transform.position = position;
        return _this;
    }
    Object.defineProperty(Timestamp.prototype, "prefab", {
        get: function () {
            return this._prefab;
        },
        set: function (value) {
            this._prefab = value;
            this.color = value.color;
            this.width = value.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Timestamp.prototype, "connectedTimestamps", {
        get: function () {
            return this._connectedTimestamps;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Timestamp.prototype, "isLongTimestamp", {
        get: function () {
            return this._connectedTimestamps != null && this._connectedTimestamps.length > 0;
        },
        enumerable: false,
        configurable: true
    });
    Timestamp.prototype.draw = function (view, canvas) {
        var _this = this;
        var _a;
        _super.prototype.draw.call(this, view, canvas);
        if (!this._outOfBounds[0])
            this.drawTimestampCore(view, canvas);
        (_a = this._connectedTimestamps) === null || _a === void 0 ? void 0 : _a.forEach(function (element) {
            if (!view.isOutOfViewportBounds(element[0].transform.position)[0])
                _this.drawConncetion(view, canvas, element[0]);
        });
    };
    Timestamp.prototype.connectToTimestamp = function (timestamp) {
        var _this = this;
        if (this._connectedTimestamps == null)
            this._connectedTimestamps = new Array();
        var id = timestamp.onDelete.addListener(function (element) { return _this.removeConnection(element); });
        this._connectedTimestamps.push([timestamp, id]);
    };
    Timestamp.prototype.removeConnection = function (timestamp) {
        var index = this._connectedTimestamps.findIndex(function (stamp, id) { return stamp[0].id == timestamp.id; });
        var removed = this._connectedTimestamps.splice(index, 1);
        timestamp.onDelete.removeListener(removed[0][1]);
    };
    Timestamp.prototype.isConnected = function (timestamp) {
        var index = this._connectedTimestamps.findIndex(function (stamp, id) { return stamp[0].id == timestamp.id; });
        return index != -1;
    };
    Timestamp.prototype.getColor = function () {
        return this._isSelected ? AppSettings_1.editorColorSettings.selectedTimestampColor : this.color;
    };
    Timestamp.prototype.drawConncetion = function (view, canvas, timestamp) {
        var pos = new Vec2_1.Vec2(this.transform.position.x + view.position.x, this.transform.position.y + view.position.y);
        var ctx = canvas.getContext('2d');
        var width = this.getWidth() / 2;
        var color = this.getColor();
        color = new RgbaColor_1.RgbaColor(color.r, color.g, color.b, 0.6);
        var elementPos = new Vec2_1.Vec2(timestamp.transform.position.x + view.position.x, timestamp.transform.position.y + view.position.y);
        var directionVec = Vec2_1.Vec2.Substract(elementPos, pos);
        var normalVec = Vec2_1.Vec2.Normal(directionVec).normalized;
        ctx.fillStyle = color.value();
        ctx.beginPath();
        ctx.moveTo(pos.x + normalVec.x * width, pos.y + normalVec.y * width);
        ctx.lineTo(elementPos.x + normalVec.x * width, elementPos.y + normalVec.y * width);
        ctx.lineTo(elementPos.x - normalVec.x * width, elementPos.y - normalVec.y * width);
        ctx.lineTo(pos.x - normalVec.x * width, pos.y - normalVec.y * width);
        ctx.fill();
        ctx.closePath();
    };
    Timestamp.prototype.drawTimestampCore = function (view, canvas) {
        var color = this.getColor();
        var ctx = canvas.getContext('2d');
        var pos = new Vec2_1.Vec2(this.transform.position.x + view.position.x, this.transform.position.y + view.position.y);
        var width = this.getWidth();
        ctx.fillStyle = color.value();
        ctx.beginPath();
        ctx.moveTo(pos.x - width, pos.y);
        ctx.lineTo(pos.x, pos.y - width);
        ctx.lineTo(pos.x + width, pos.y);
        ctx.lineTo(pos.x, pos.y + width);
        ctx.fill();
    };
    Timestamp.prototype.getWidth = function () {
        var width = this.width + this.transform.scale.x / 5;
        if (width > this.maxWidth)
            width = this.maxWidth;
        if (width < this.minWidth)
            width = this.minWidth;
        return width;
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
        if (!this.isActive)
            return;
        if (!this._outOfBounds[0])
            this.drawLine(view, canvas);
        this.snapLines.forEach(function (line) { line.draw(view, canvas); });
    };
    BPMLine.prototype.drawLine = function (view, canvas) {
        var ctx = canvas.getContext('2d');
        ctx.strokeStyle = this.color.value();
        ctx.beginPath();
        ctx.moveTo(this.transform.position.x + view.position.x, 0);
        ctx.lineTo(this.transform.position.x + view.position.x, canvas.height);
        ctx.stroke();
    };
    BPMLine.prototype.setSnapLines = function (snapValue, distanceBetweenBpmLines) {
        this.snapLines = new Array();
        var distance = distanceBetweenBpmLines / snapValue;
        for (var i = 0; i < snapValue - 1; i++) {
            var color = this.getSnapLineColor(snapValue, i);
            this.snapLines.push(new BPMLine((i + 1) * distance, this.transform, color));
        }
    };
    BPMLine.prototype.getSnapLineColor = function (snapValue, lineId) {
        // с-з-с
        // с-з-с-к-с-з-с
        // с-з-с-к-с-з-с-ж-с-з-с-к-с-з-с
        switch (snapValue) {
            case 2: {
                return AppSettings_1.editorColorSettings.snapBpmLineColor;
            }
            case 4: {
                if (lineId % 2 == 1)
                    return AppSettings_1.editorColorSettings.snapBpmLineColor;
                return AppSettings_1.editorColorSettings.oneFourthLineColor;
            }
            case 8: {
                if (lineId % 4 == 3)
                    return AppSettings_1.editorColorSettings.snapBpmLineColor;
                else if (lineId % 2 == 1)
                    return AppSettings_1.editorColorSettings.oneFourthLineColor;
                return AppSettings_1.editorColorSettings.oneEighthLineColor;
            }
            case 16: {
                if (lineId % 8 == 7)
                    return AppSettings_1.editorColorSettings.snapBpmLineColor;
                else if (lineId % 4 == 3)
                    return AppSettings_1.editorColorSettings.oneFourthLineColor;
                else if (lineId % 2 == 1)
                    return AppSettings_1.editorColorSettings.oneEighthLineColor;
                return AppSettings_1.editorColorSettings.oneSixteenLineColor;
            }
        }
        return AppSettings_1.editorColorSettings.snapBpmLineColor;
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
