"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementSelectorModule = void 0;
var jquery_1 = __importDefault(require("jquery"));
var Vec2_1 = require("../Utils/Vec2");
var Transform_1 = require("../Transform");
var GridElements_1 = require("../GridElements");
var AppSettings_1 = require("../Utils/AppSettings");
var Input_1 = require("../Input");
var Utils_1 = require("../Utils/Utils");
var Command_1 = require("../Command");
var RgbaColor_1 = require("../Utils/RgbaColor");
var SelectArea = /** @class */ (function () {
    function SelectArea() {
        var _this = this;
        this.firstPoint = new Vec2_1.Vec2(0, 0);
        this.secondPoint = new Vec2_1.Vec2(0, 0);
        this.onSelect = new Utils_1.Event();
        this.canvas = jquery_1.default("#editor-canvas")[0];
        Input_1.Input.onMouseDownCanvas.addListener(function (event) { _this.onMouseDown(event); });
        Input_1.Input.onMouseUp.addListener(function (event) { _this.onMouseUp(event); });
        Input_1.Input.onHoverWindow.addListener(function (event) { _this.onMouseMove(event); });
    }
    SelectArea.prototype.draw = function (view, canvas) {
        if (!this.isActive)
            return;
        var ctx = canvas.getContext('2d');
        var sizeVec = Vec2_1.Vec2.Substract(this.secondPoint, this.firstPoint);
        ctx.fillStyle = AppSettings_1.editorColorSettings.selectAreaColor.value();
        ctx.fillRect(this.firstPoint.x, this.firstPoint.y, sizeVec.x, sizeVec.y);
    };
    SelectArea.prototype.onMouseDown = function (event) {
        //console.log(event);
        this.isActive = true;
        this.firstPoint = new Vec2_1.Vec2(event.offsetX, event.offsetY);
        this.secondPoint = new Vec2_1.Vec2(event.offsetX, event.offsetY);
    };
    SelectArea.prototype.onMouseMove = function (event) {
        //if (this.isActive)
        //    console.log(event);
        var rect = this.canvas.getBoundingClientRect();
        //console.log(rect);
        this.secondPoint = new Vec2_1.Vec2(event.clientX - rect.left, event.clientY - rect.top);
    };
    SelectArea.prototype.onMouseUp = function (event) {
        //console.log(event);
        if (!this.isActive)
            return;
        this.isActive = false;
        this.onSelect.invoke([this.firstPoint, this.secondPoint]);
    };
    return SelectArea;
}());
var ElementSelectorModule = /** @class */ (function () {
    function ElementSelectorModule(grid, creatable, timestamps) {
        this.transform = new Transform_1.Transform();
        this.selectedElements = new Array();
        this.grid = grid;
        this.creatable = creatable;
        this.timestamps = timestamps;
        this.canvas = jquery_1.default("#editor-canvas")[0];
    }
    ElementSelectorModule.prototype.init = function (editorCoreModules) {
        var _this = this;
        this.editor = editorCoreModules;
        Input_1.Input.onHoverWindow.addListener(function (event) { return _this.elementMovingHandle(event); });
        Input_1.Input.onMouseUp.addListener(function (event) { return _this.elementMovingEndHandle(event); });
        Input_1.Input.onMouseClickCanvas.addListener(function (event) { return _this.onCanvasClick(event); });
        Input_1.Input.onMouseAfterCanvasClick.addListener(function () { return Input_1.Input.onMouseClickCanvas.allowFiring(); });
        this.selectArea = new SelectArea();
        this.selectArea.onSelect.addListener(function (_a) {
            var a = _a[0], b = _a[1];
            return _this.onAreaSelect(a, b);
        });
        Input_1.Input.onMouseDownCanvas.addListener(function (event) { return _this.elementMovingStartHandle(event); });
        Input_1.Input.onKeyDown.addListener(function (key) { return _this.checkForKeyDownActions(key); });
        //CreatableLinesModule.onLineClickEvent.addListener((line) => {this.onElementClicked(line);});
        //this.timestamps.onExistingElementClicked.addListener((element) => {this.onElementClicked(element)});
    };
    ElementSelectorModule.prototype.updateModule = function () {
        this.selectArea.draw(this.editor.viewport, this.canvas);
    };
    ElementSelectorModule.prototype.selectElement = function (element) {
        console.log("element selected");
        //let selectCommand = new SelectElementsCommand([element], this);
        this.selectedElements.push(element);
        this.selectedElements.sort(function (a, b) { return a.transform.position.x - b.transform.position.x; });
        element.select();
    };
    ElementSelectorModule.prototype.deselectElement = function (element) {
        console.log("element deselected");
        var index = Utils_1.Utils.binaryNearestSearch(this.selectedElements, element.transform.position.x);
        console.log(this.selectedElements);
        this.selectedElements.splice(index, 1);
        this.selectedElements.sort(function (a, b) { return a.transform.position.x - b.transform.position.x; });
        console.log(this.selectedElements);
        element.deselect();
    };
    ElementSelectorModule.prototype.setSelectedElements = function (array) {
        this.selectedElements.forEach(function (element) {
            element.deselect();
        });
        this.selectedElements = array;
    };
    ElementSelectorModule.prototype.deselectAll = function () {
        this.selectedElements.forEach(function (element) {
            element.deselect();
        });
        this.selectedElements = [];
    };
    ElementSelectorModule.prototype.checkForKeyDownActions = function (event) {
        if (Input_1.Input.keysPressed["Delete"]) {
            console.log("DELETE COMMAND");
            var deleteCommand = new Command_1.DeleteElementsCommand(this.selectedElements, this);
            Command_1.CommandsController.executeCommand(deleteCommand);
        }
    };
    ElementSelectorModule.prototype.onAreaSelect = function (pointA, pointB) {
        var _this = this;
        if (Vec2_1.Vec2.Distance(pointA, pointB) < 30) {
            console.log("area is too smol");
            return;
        }
        if (Utils_1.Utils.isOutOfCanvasBounds(pointB, this.canvas))
            Input_1.Input.onMouseClickCanvas.preventFiring();
        pointA = this.editor.viewport.transform.canvasToWorld(pointA);
        pointB = this.editor.viewport.transform.canvasToWorld(pointB);
        var selectedLines = this.creatable.getLinesInRange(pointA, pointB);
        var selectedTimestamps = this.timestamps.getTimestampsAtRange(pointA, pointB);
        if (!Input_1.Input.keysPressed["ShiftLeft"])
            this.deselectAll();
        selectedLines === null || selectedLines === void 0 ? void 0 : selectedLines.forEach(function (line) {
            _this.selectElement(line);
        });
        selectedTimestamps === null || selectedTimestamps === void 0 ? void 0 : selectedTimestamps.forEach(function (timestamp) {
            _this.selectElement(timestamp);
        });
        console.log("selected timestamps count: " + (selectedTimestamps === null || selectedTimestamps === void 0 ? void 0 : selectedTimestamps.length));
        console.log("selected lines count: " + (selectedLines === null || selectedLines === void 0 ? void 0 : selectedLines.length));
    };
    ElementSelectorModule.prototype.onCanvasClick = function (event) {
        if (Input_1.Input.keysPressed["ShiftLeft"] == true)
            Input_1.Input.onMouseClickCanvas.preventFiringEventOnce();
        else {
            if (this.selectedElements.length > 0) {
                Input_1.Input.onMouseClickCanvas.preventFiringEventOnce();
            }
            console.log("DESELECTING ALL CLICK");
            this.deselectAll();
            return;
        }
        var worldClickPos = this.editor.viewport.transform.canvasToWorld(new Vec2_1.Vec2(event.offsetX, event.offsetY));
        this.onElementSelect(this.getClosestGridElement(worldClickPos));
    };
    ElementSelectorModule.prototype.elementMovingStartHandle = function (event) {
        console.log("MOSUE DOWN 0");
        if (this.selectedElements.length != 1)
            return;
        console.log("MOSUE DOWN");
        var worldClickPos = this.editor.viewport.transform.canvasToWorld(new Vec2_1.Vec2(event.clientX, event.clientY));
        var closestElement = this.selectedElements[0];
        if (!closestElement.isSelected && Vec2_1.Vec2.Distance(worldClickPos, closestElement.transform.position) > 20)
            return;
        console.log("MOSUE DOWN 2");
        this.movingElement = closestElement;
        this.selectArea.isActive = false;
        this.movingState = true;
    };
    ElementSelectorModule.prototype.elementMovingHandle = function (event) {
        if (!this.movingState)
            return;
        var worldPos = this.editor.viewport.transform.canvasToWorld(new Vec2_1.Vec2(event.offsetX, event.offsetY));
        if (this.movingElement instanceof GridElements_1.Timestamp) {
            var timestamp = this.movingElement;
            var closestBpm = this.grid.findClosestBpmLine(worldPos.x);
            var closestCreatable = this.creatable.findClosestCreatableLine(worldPos.x);
            var closestLine = void 0;
            if (closestBpm == null)
                closestLine = closestCreatable;
            else if (closestCreatable == null)
                closestLine = closestBpm;
            else
                closestLine = Math.abs(closestBpm.transform.position.x - worldPos.x) <
                    Math.abs(closestCreatable.transform.position.x - worldPos.x) ? closestBpm : closestCreatable;
            var closestBeatline = this.grid.findClosestBeatLine(worldPos);
            var position = new Vec2_1.Vec2(closestLine.transform.position.x, closestBeatline.transform.position.y);
            var phantomTimestamp = new GridElements_1.Timestamp(timestamp.prefab, position, this.timestamps.transform);
            this.editor.addLastDrawableElement(phantomTimestamp);
            return;
        }
        var cLine = this.movingElement;
        var line = new GridElements_1.CreatableTimestampLine(worldPos.x, this.creatable.transform, new RgbaColor_1.RgbaColor(cLine.color.r, cLine.color.g, cLine.color.b, 0.6));
        this.editor.addLastDrawableElement(line);
    };
    ElementSelectorModule.prototype.elementMovingEndHandle = function (event) {
        if (!this.movingState)
            return;
        var worldPos = this.editor.viewport.transform.canvasToWorld(new Vec2_1.Vec2(event.offsetX, event.offsetY));
        if (this.movingElement instanceof GridElements_1.Timestamp) {
            var timestamp = this.movingElement;
            var closestBpm = this.grid.findClosestBpmLine(worldPos.x);
            var closestCreatable = this.creatable.findClosestCreatableLine(worldPos.x);
            var closestLine = void 0;
            if (closestBpm == null)
                closestLine = closestCreatable;
            else if (closestCreatable == null)
                closestLine = closestBpm;
            else
                closestLine = Math.abs(closestBpm.transform.position.x - worldPos.x) <
                    Math.abs(closestCreatable.transform.position.x - worldPos.x) ? closestBpm : closestCreatable;
            var closestBeatline = this.grid.findClosestBeatLine(worldPos);
            var position = this.editor.viewport.transform.worldToLocal(new Vec2_1.Vec2(closestLine.transform.position.x, closestBeatline.transform.position.y));
            this.editor.addLastDrawableElement(null);
            //this.movingElement.move(position);
            var moveCommand = new Command_1.MoveElementsCommand([this.movingElement], [position]);
            Command_1.CommandsController.executeCommand(moveCommand);
        }
        else {
            var position = this.editor.viewport.transform.worldToLocal(worldPos);
            var moveCommand = new Command_1.MoveElementsCommand([this.movingElement], [position]);
            Command_1.CommandsController.executeCommand(moveCommand);
            //this.movingElement.move(position);
        }
        this.movingElement = null;
        this.selectArea.isActive = true;
        this.selectArea.onSelect.preventFiringEventOnce();
        this.movingState = false;
    };
    ElementSelectorModule.prototype.getClosestGridElement = function (worldPos) {
        var clickedElemenet = null;
        var closestLine = this.creatable.getClosestLine(worldPos.x);
        var closestTimestamp = this.timestamps.getClosestTimestamp(worldPos);
        if (closestLine != null) {
            var lineDist = Vec2_1.Vec2.Distance(new Vec2_1.Vec2(closestLine.transform.position.x, this.canvas.height - 5), worldPos);
            console.log("Ditstance to closest line: " + lineDist);
            if (lineDist < 10)
                clickedElemenet = closestLine;
        }
        if (closestTimestamp != null) {
            var timestampDist = Vec2_1.Vec2.Distance(closestTimestamp.transform.position, worldPos);
            console.log("Ditstance to closest timestamp: " + timestampDist);
            if (timestampDist < 20)
                clickedElemenet = closestTimestamp;
        }
        if (clickedElemenet == null) {
            return;
        }
        if (closestTimestamp != null && closestLine != null) {
            if (lineDist > timestampDist) {
                clickedElemenet = closestTimestamp;
            }
            else {
                clickedElemenet = closestLine;
            }
        }
        return clickedElemenet;
    };
    ElementSelectorModule.prototype.onElementSelect = function (element) {
        if (element == null || element == undefined)
            return;
        if (element.isSelected)
            this.deselectElement(element);
        else
            this.selectElement(element);
        console.log("Selected elements: ");
        console.log(this.selectedElements.length);
    };
    return ElementSelectorModule;
}());
exports.ElementSelectorModule = ElementSelectorModule;
