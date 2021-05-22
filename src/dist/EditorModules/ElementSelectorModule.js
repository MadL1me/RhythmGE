"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
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
        if (event.button != 0)
            return;
        this.isActive = true;
        this.firstPoint = new Vec2_1.Vec2(event.offsetX, event.offsetY);
        this.secondPoint = new Vec2_1.Vec2(event.offsetX, event.offsetY);
    };
    SelectArea.prototype.onMouseMove = function (event) {
        var rect = this.canvas.getBoundingClientRect();
        this.secondPoint = new Vec2_1.Vec2(event.clientX - rect.left, event.clientY - rect.top);
    };
    SelectArea.prototype.onMouseUp = function (event) {
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
        Input_1.Input.onMouseUp.addListener(function (event) { return _this.onMouseUp(event); });
        Input_1.Input.onMouseClickCanvas.addListener(function (event) { return _this.onCanvasClick(event); });
        Input_1.Input.onMouseAfterCanvasClick.addListener(function () { return Input_1.Input.onMouseClickCanvas.allowFiring(); });
        this.selectArea = new SelectArea();
        this.selectArea.onSelect.addListener(function (_a) {
            var a = _a[0], b = _a[1];
            return _this.onAreaSelect(a, b);
        });
        Input_1.Input.onMouseDownCanvas.addListener(function (event) { return _this.onMouseDownCanvas(event); });
        Input_1.Input.onKeyDown.addListener(function (key) { return _this.checkForKeyDownActions(key); });
        //CreatableLinesModule.onLineClickEvent.addListener((line) => {this.onElementClicked(line);});
        //this.timestamps.onExistingElementClicked.addListener((element) => {this.onElementClicked(element)});
    };
    ElementSelectorModule.prototype.updateModule = function () {
        this.selectArea.draw(this.editor.viewport, this.canvas);
    };
    ElementSelectorModule.prototype.selectElement = function (element) {
        this.selectedElements.push(element);
        this.selectedElements.sort(function (a, b) { return a.transform.position.x - b.transform.position.x; });
        element.select();
    };
    ElementSelectorModule.prototype.deselectElement = function (element) {
        var index = Utils_1.Utils.binaryNearestSearch(this.selectedElements, element.transform.position.x);
        this.selectedElements.splice(index, 1);
        this.selectedElements.sort(function (a, b) { return a.transform.position.x - b.transform.position.x; });
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
    ElementSelectorModule.prototype.selectElementsCommand = function (elements) {
        var selectCommand = new Command_1.SelectElementsCommand(elements, this);
        Command_1.CommandsController.executeCommand(selectCommand);
    };
    ElementSelectorModule.prototype.checkForKeyDownActions = function (event) {
        if (Input_1.Input.keysPressed["Delete"]) {
            var deleteCommand = new Command_1.DeleteElementsCommand(this.selectedElements, this);
            Command_1.CommandsController.executeCommand(deleteCommand);
        }
        if (Input_1.Input.keysPressed["KeyF"]) {
            this.connectTimestamps();
        }
    };
    ElementSelectorModule.prototype.connectTimestamps = function () {
        var _a;
        if (this.selectedElements.length != 2) {
            return;
        }
        var _b = this.selectedElements, firstTimestamp = _b[0], secondTimestmap = _b[1];
        if (!(firstTimestamp instanceof GridElements_1.Timestamp || secondTimestmap instanceof GridElements_1.Timestamp)) {
            return;
        }
        if (firstTimestamp.transform.position.x == secondTimestmap.transform.position.x)
            return;
        if (firstTimestamp.transform.position.x > secondTimestmap.transform.position.x)
            _a = [secondTimestmap, firstTimestamp], firstTimestamp = _a[0], secondTimestmap = _a[1];
        if (firstTimestamp.isLongTimestamp && (firstTimestamp).isConnected(secondTimestmap)) {
            var unconnectCommand = new Command_1.RemoveConnectionCommand(firstTimestamp, secondTimestmap);
            Command_1.CommandsController.executeCommand(unconnectCommand);
        }
        else {
            var connectCommand = new Command_1.MakeConnectionCommand(firstTimestamp, secondTimestmap);
            Command_1.CommandsController.executeCommand(connectCommand);
        }
    };
    ElementSelectorModule.prototype.onAreaSelect = function (pointA, pointB) {
        if (Vec2_1.Vec2.Distance(pointA, pointB) < 30) {
            return;
        }
        if (Utils_1.Utils.isOutOfCanvasBounds(pointB, this.canvas))
            Input_1.Input.onMouseClickCanvas.preventFiring();
        pointA = this.editor.viewport.transform.canvasToWorld(pointA);
        pointB = this.editor.viewport.transform.canvasToWorld(pointB);
        var selectedLines = this.creatable.getLinesInRange(pointA, pointB);
        var selectedTimestamps = this.timestamps.getTimestampsAtRange(pointA, pointB);
        if (!Input_1.Input.keysPressed["ShiftLeft"]) {
            var deselectAllCommand = new Command_1.DeselectAllElementsCommand(__spreadArray([], this.selectedElements), this);
            Command_1.CommandsController.executeCommand(deselectAllCommand);
        }
        if (selectedLines != null)
            this.selectElementsCommand(selectedLines);
        if (selectedTimestamps != null)
            this.selectElementsCommand(selectedTimestamps);
    };
    ElementSelectorModule.prototype.deleteClosestTimestampAtClick = function (event) {
        var worldClickPos = this.editor.viewport.transform.canvasToWorld(new Vec2_1.Vec2(event.offsetX, event.offsetY));
        var closestElement = this.getClosestGridElement(worldClickPos);
        if (closestElement == null)
            return;
        var deleteCommand = new Command_1.DeleteElementsCommand([closestElement], this);
        Command_1.CommandsController.executeCommand(deleteCommand);
        return;
    };
    ElementSelectorModule.prototype.onCanvasClick = function (event) {
        // right button click
        if (Input_1.Input.keysPressed["ShiftLeft"] == true)
            Input_1.Input.onMouseClickCanvas.preventFiringEventOnce();
        else {
            if (this.selectedElements.length > 0) {
                Input_1.Input.onMouseClickCanvas.preventFiringEventOnce();
            }
            var deselectAllCommnad = new Command_1.DeselectAllElementsCommand(__spreadArray([], this.selectedElements), this);
            Command_1.CommandsController.executeCommand(deselectAllCommnad);
            return;
        }
        var worldClickPos = this.editor.viewport.transform.canvasToWorld(new Vec2_1.Vec2(event.offsetX, event.offsetY));
        this.onElementSelect(this.getClosestGridElement(worldClickPos));
    };
    ElementSelectorModule.prototype.onMouseDownCanvas = function (event) {
        if (event.button == 0) {
            this.elementMovingStartHandle(event);
        }
    };
    ElementSelectorModule.prototype.elementMovingStartHandle = function (event) {
        if (this.selectedElements.length != 1)
            return;
        var worldClickPos = this.editor.viewport.transform.canvasToWorld(new Vec2_1.Vec2(event.offsetX, event.offsetY));
        var closestElement = this.selectedElements[0];
        if (!closestElement.isSelected || Vec2_1.Vec2.Distance(worldClickPos, closestElement.transform.position) > 20)
            return;
        this.movingElement = closestElement;
        this.selectArea.isActive = false;
        this.isMoving = true;
    };
    ElementSelectorModule.prototype.elementMovingHandle = function (event) {
        if (!this.isMoving)
            return;
        var worldPos = this.editor.viewport.transform.canvasToWorld(new Vec2_1.Vec2(event.offsetX, event.offsetY));
        var color = Object.assign(this.movingElement);
        color.r = 0.6;
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
            phantomTimestamp.color = color;
            this.editor.addLastDrawableElement(phantomTimestamp);
            return;
        }
        var cLine = this.movingElement;
        var line = new GridElements_1.CreatableTimestampLine(worldPos.x, this.creatable.transform, color);
        this.editor.addLastDrawableElement(line);
    };
    ElementSelectorModule.prototype.onMouseUp = function (event) {
        if (event.button == 0) {
            this.elementMovingEndHandle(event);
        }
        else if (event.button == 2) {
            this.deleteClosestTimestampAtClick(event);
        }
    };
    ElementSelectorModule.prototype.elementMovingEndHandle = function (event) {
        if (!this.isMoving)
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
        this.isMoving = false;
    };
    ElementSelectorModule.prototype.getClosestGridElement = function (worldPos) {
        var clickedElemenet = null;
        var closestLine = this.creatable.getClosestLine(worldPos.x);
        var closestTimestamp = this.timestamps.getClosestTimestamp(worldPos);
        if (closestLine != null) {
            var lineDist = Vec2_1.Vec2.Distance(new Vec2_1.Vec2(closestLine.transform.position.x, this.canvas.height - 5), worldPos);
            if (lineDist < 10)
                clickedElemenet = closestLine;
        }
        if (closestTimestamp != null) {
            var timestampDist = Vec2_1.Vec2.Distance(closestTimestamp.transform.position, worldPos);
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
            this.selectElementsCommand([element]);
    };
    return ElementSelectorModule;
}());
exports.ElementSelectorModule = ElementSelectorModule;
