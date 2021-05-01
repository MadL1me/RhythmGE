"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimestampsModule = void 0;
var jquery_1 = __importDefault(require("jquery"));
var RgbaColor_1 = require("../Utils/RgbaColor");
var Vec2_1 = require("../Utils/Vec2");
var Transform_1 = require("../Transform");
var GridElements_1 = require("../GridElements");
var Input_1 = require("../Input");
var Utils_1 = require("../Utils/Utils");
var CreatableLinesModule_1 = require("./CreatableLinesModule");
var TimestampsModule = /** @class */ (function () {
    function TimestampsModule(editorGrid, creatableLines) {
        this.transform = new Transform_1.Transform();
        this.selectedPrefabId = 0;
        this.idToPrefab = new Map();
        this.timestamps = new Map();
        this.clapTimings = new Array();
        this.editorGridModule = editorGrid;
        this.createableLinesModule = creatableLines;
        this.canvas = jquery_1.default("#editor-canvas")[0];
        this.createTimestampPrefab(new RgbaColor_1.RgbaColor(0, 255, 26));
        this.createTimestampPrefab(new RgbaColor_1.RgbaColor(252, 236, 8));
        this.createTimestampPrefab(new RgbaColor_1.RgbaColor(8, 215, 252));
        this.createTimestampPrefab(new RgbaColor_1.RgbaColor(134, 13, 255));
        this.createTimestampPrefab(new RgbaColor_1.RgbaColor(255, 13, 166));
        this.createTimestampPrefab(new RgbaColor_1.RgbaColor(255, 13, 74));
        this.selectedPrefab.select();
    }
    TimestampsModule.prototype.init = function (editorCoreModules) {
        var _this = this;
        this.editorCore = editorCoreModules;
        Input_1.Input.onMouseClickCanvas.addListener(function (event) { _this.onCanvasClick(event); });
        CreatableLinesModule_1.CreatableLinesModule.onCreateLineEvent.addListener(function (_a) {
            var line = _a[0], key = _a[1];
            if (!key.includes("Digit"))
                return;
            console.log("CREATING STUFF");
            console.log(parseInt(key[5]));
            _this.createTimestamp(new Vec2_1.Vec2(line.transform.position.x, parseInt(key[5]) * _this.editorGridModule.distanceBetweenBeatLines()));
        });
    };
    TimestampsModule.prototype.updateModule = function () {
        for (var _i = 0, _a = Object.entries(this.timestamps); _i < _a.length; _i++) {
            var _b = _a[_i], i = _b[0], value = _b[1];
            for (var _c = 0, _d = Object.entries(value); _c < _d.length; _c++) {
                var _e = _d[_c], j = _e[0], timestamp = _e[1];
                timestamp.draw(this.editorCore.viewport, this.canvas);
            }
        }
    };
    TimestampsModule.prototype.removeTimestamp = function (timestamp) {
        delete this.timestamps[timestamp.transform.localPosition.x][timestamp.transform.localPosition.y];
    };
    TimestampsModule.prototype.createTimestampPrefab = function (color) {
        var _this = this;
        var prefab = new GridElements_1.TimestampPrefab(TimestampsModule.nextPrefabId++, color);
        this.idToPrefab[prefab.prefabId] = prefab;
        prefab.onPrefabSelected.addListener(function (id) { _this.selectPrefab(id); });
        return prefab;
    };
    TimestampsModule.prototype.selectPrefab = function (id) {
        this.selectedPrefabId = id;
        Object.values(this.idToPrefab).forEach(function (prefab) {
            prefab.deselect();
        });
        this.selectedPrefab.select();
    };
    TimestampsModule.prototype.getTimestampsAtRange = function (startPos, endPos) {
        var _this = this;
        if (this.clapTimings.length < 1) {
            return;
        }
        var tmpStartPos = new Vec2_1.Vec2(Math.min(startPos.x, endPos.x), Math.min(startPos.y, endPos.y));
        endPos = new Vec2_1.Vec2(Math.max(startPos.x, endPos.x), Math.max(startPos.y, endPos.y));
        startPos = tmpStartPos;
        startPos = this.editorGridModule.transform.worldToLocal(startPos);
        endPos = this.editorGridModule.transform.worldToLocal(endPos);
        console.log(startPos.x);
        console.log(endPos.x);
        var startIndex = Utils_1.Utils.binaryNearestSearchNumber(this.clapTimings, startPos.x, Utils_1.Func.Ceil);
        var endIndex = Utils_1.Utils.binaryNearestSearchNumber(this.clapTimings, endPos.x, Utils_1.Func.Floor);
        var xValues = this.clapTimings.slice(startIndex, endIndex + 1);
        var resultTimestamps = new Array();
        console.log(startIndex);
        console.log(endIndex);
        console.log(xValues.length);
        xValues.forEach(function (value) {
            var yArray = _this.timestamps[value];
            for (var _i = 0, _a = Object.entries(yArray); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value_1 = _b[1];
                if (value_1.transform.localPosition.y > startPos.y
                    && value_1.transform.localPosition.y < endPos.y) {
                    resultTimestamps.push(value_1);
                }
            }
        });
        return resultTimestamps;
    };
    TimestampsModule.prototype.getClosestTimestamp = function (position) {
        if (this.clapTimings.length < 1)
            return;
        console.log("try get closest timestamps");
        position = this.editorGridModule.transform.worldToLocal(position);
        var index = Utils_1.Utils.binaryNearestSearchNumber(this.clapTimings, position.x);
        console.log(this.clapTimings[index]);
        var yArray = this.timestamps[this.clapTimings[index]];
        console.log(yArray);
        console.log("index is " + index);
        var result = null;
        var min = 10000;
        for (var _i = 0, _a = Object.entries(yArray); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], timestamp = _b[1];
            var distance = Math.abs(timestamp.transform.localPosition.y - position.y);
            if (distance < min) {
                min = distance;
                result = timestamp;
            }
        }
        return result;
    };
    Object.defineProperty(TimestampsModule.prototype, "selectedPrefab", {
        get: function () {
            return this.idToPrefab[this.selectedPrefabId];
        },
        enumerable: false,
        configurable: true
    });
    TimestampsModule.prototype.onCanvasClick = function (event) {
        var rect = this.canvas.getBoundingClientRect();
        var click = new Vec2_1.Vec2(event.clientX - rect.left, event.clientY - rect.top);
        var worldClickPos = this.editorCore.viewport.transform.canvasToWorld(click);
        worldClickPos = new Vec2_1.Vec2(worldClickPos.x, worldClickPos.y);
        var closestBeatline = this.editorGridModule.findClosestBeatLine(click);
        var closestObjects = new Array();
        if (!this.editorCore.editorData.hideBpmLines.value && this.editorGridModule.bpmLines.length > 0) {
            closestObjects.push(this.editorGridModule.findClosestBpmLine(worldClickPos.x));
        }
        if (!this.editorCore.editorData.hideCreatableLines.value && Object.keys(this.createableLinesModule.creatableLines).length > 0) {
            closestObjects.push(this.createableLinesModule.findClosestCreatableLine(worldClickPos.x));
        }
        if (closestObjects.length < 1)
            return;
        var min = 100000, index = 0;
        for (var i = 0; i < closestObjects.length; i++) {
            var diff = Math.abs(worldClickPos.x - closestObjects[i].transform.position.x);
            if (diff < min) {
                min = diff;
                index = i;
            }
        }
        var closestObject = closestObjects[index];
        var placeDistance = 30;
        if (Math.abs(closestObject.transform.position.x - worldClickPos.x) > placeDistance ||
            Math.abs(closestBeatline.transform.position.y - worldClickPos.y) > placeDistance)
            return;
        this.createTimestamp(new Vec2_1.Vec2(closestObject.transform.position.x, closestBeatline.transform.position.y));
    };
    TimestampsModule.prototype.createTimestamp = function (position) {
        var prefab = this.idToPrefab[this.selectedPrefabId];
        var newTimestamp = new GridElements_1.Timestamp(prefab, new Vec2_1.Vec2(position.x, position.y), this.editorGridModule.transform);
        var yArray = this.timestamps[newTimestamp.transform.localPosition.x];
        if (yArray == undefined) {
            this.timestamps[newTimestamp.transform.localPosition.x] = {};
            this.clapTimings.push(newTimestamp.transform.localPosition.x);
            this.clapTimings.sort(function (a, b) { return a - b; });
        }
        if (this.timestamps[newTimestamp.transform.localPosition.x][newTimestamp.transform.localPosition.y] == null) {
            this.timestamps[newTimestamp.transform.localPosition.x][newTimestamp.transform.localPosition.y] = newTimestamp;
        }
        else if (this.timestamps[newTimestamp.transform.localPosition.x][newTimestamp.transform.localPosition.y]
            .prefab.prefabId != prefab.prefabId) {
        }
        if (this.editorCore.editorData.useClaps.value)
            this.editorCore.audio.setClapTimings(this.clapTimings);
    };
    TimestampsModule.nextPrefabId = 0;
    return TimestampsModule;
}());
exports.TimestampsModule = TimestampsModule;
