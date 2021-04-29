"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualiserEditorModule = exports.EditorGrid = exports.ElementSelectorModule = exports.TimestampsModule = exports.CreatableLinesModule = exports.TimestepLineModule = exports.Editor = exports.EditorData = void 0;
var jquery_1 = __importDefault(require("jquery"));
var RgbaColor_1 = require("./RgbaColor");
var Vec2_1 = require("./Vec2");
var Transform_1 = require("./Transform");
var GridElements_1 = require("./GridElements");
var Viewport_1 = require("./Viewport");
var AppSettings_1 = require("./AppSettings");
var Input_1 = require("./Input");
var Utils_1 = require("./Utils");
var Audio_1 = require("./Audio");
var CommandsController = /** @class */ (function () {
    function CommandsController() {
        this.commandsCapacity = 20;
        this.commandIndex = 0;
        this.commands = new Array();
    }
    CommandsController.prototype.addCommandToList = function (executedCommand) {
        if (this.commandIndex != this.commands.length - 1) {
            this.commands = this.commands.slice(0, this.commandIndex);
        }
        if (this.commands.length > this.commandsCapacity) {
            this.commands.shift();
        }
        this.commands.push(executedCommand);
        this.commandIndex = this.commands.length;
    };
    CommandsController.prototype.undoCommand = function () {
        this.commands[this.commandIndex].undo();
        this.commandIndex--;
    };
    CommandsController.prototype.redoCommand = function () {
        if (this.commandIndex == this.commands.length - 1) {
            return;
        }
        this.commandIndex++;
        this.commands[this.commandIndex].execute();
    };
    return CommandsController;
}());
var EventVar = /** @class */ (function () {
    function EventVar(initialValue) {
        this.onValueChange = new Utils_1.Event();
        this._value = initialValue;
    }
    Object.defineProperty(EventVar.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            this._value = value;
            this.onValueChange.invoke(value);
        },
        enumerable: false,
        configurable: true
    });
    return EventVar;
}());
var EditorData = /** @class */ (function () {
    function EditorData() {
        var _this = this;
        this._snapSlider = new Utils_1.Slider('snap-lines');
        this._playbackSpeedSlider = new Utils_1.Slider('playback-rate');
        this.useClaps = new EventVar(false);
        this.followLine = new EventVar(false);
        this.hideBpmLines = new EventVar(false);
        this.hideCreatableLines = new EventVar(false);
        this.scrollingSpeed = new EventVar(0.2);
        this.resizingSpeed = new EventVar(3);
        this.fastScrollingSpeed = new EventVar(5);
        this.offset = new EventVar(0);
        this.bpmValue = new EventVar(60);
        this.beatLinesCount = new EventVar(5);
        this.snapValue = new EventVar(0);
        this.playbackRate = new EventVar(1);
        this.audioFile = new EventVar(null);
        jquery_1.default('#files').on('change', function (event) { _this.onAudioLoad(event); });
        jquery_1.default('#follow-line').on('change', function (event) { _this.followLine.value = event.target.checked; });
        jquery_1.default('#use-claps').on('change', function (event) { _this.useClaps.value = event.target.checked; });
        jquery_1.default('#hide-bpm').on('change', function (event) { _this.hideBpmLines.value = event.target.checked; });
        jquery_1.default('#hide-creatable').on('change', function (event) { _this.hideCreatableLines.value = event.target.checked; });
        jquery_1.default('#beat-lines').on('change', function (event) { _this.beatLinesCount.value = parseInt(event.target.value); });
        jquery_1.default('#bpm').on('change', function (event) { _this.bpmValue.value = parseInt(event.target.value); });
        jquery_1.default('#offset').on('change', function (event) { _this.offset.value = parseInt(event.target.value); });
        this._playbackSpeedSlider.value = 1;
        this._snapSlider.value = 0;
        this._playbackSpeedSlider.onValueChange.addListener(function (value) { _this.onPlaybackRateValueChange(value); });
        this._snapSlider.onValueChange.addListener(function (value) { _this.onSnapSliderValueChange(value); });
    }
    EditorData.prototype.onAudioLoad = function (event) {
        var files = event.target.files;
        var file = files[0];
        this.audioFile.value = [file.name, file.path];
        console.log(files[0]);
    };
    EditorData.prototype.onPlaybackRateValueChange = function (value) {
        jquery_1.default('#playback-rate-text')[0].innerText = 'Playback rate ' + value.toString() + 'x';
        this.playbackRate.value = value;
    };
    EditorData.prototype.onSnapSliderValueChange = function (value) {
        value = Math.pow(2, value);
        jquery_1.default('#snap-lines-text')[0].innerText = 'Snap lines 1/' + value.toString();
        this.snapValue.value = value;
    };
    return EditorData;
}());
exports.EditorData = EditorData;
var Editor = /** @class */ (function () {
    function Editor() {
        var _this = this;
        this.transform = new Transform_1.Transform();
        this.viewport = new Viewport_1.ViewportModule(this.transform);
        this.editorData = new EditorData();
        this.audio = new Audio_1.AudioModule();
        this._editorModules = new Array();
        this._editorCanvas = jquery_1.default("#editor-canvas")[0];
        this.transform.scale = new Vec2_1.Vec2(10, 1);
        this.viewport.init(this);
        this.audio.init(this);
        this.viewport.transform.parent = this.transform;
        this.audio.transform.parent = this.transform;
        setInterval(function () { _this.audio.checkForClaps(); }, 5);
        Input_1.Input.onWheelCanvas.addListener(function (event) { _this.onChangeScale((event.deltaY)); });
        Input_1.Input.onMouseClickCanvas.addListener(function (event) { _this.onCanvasClick(event); });
        this.update();
    }
    Editor.prototype.addEditorModule = function (element) {
        element.init(this);
        element.transform.parent = this.transform;
        this._editorModules.push(element);
    };
    Editor.prototype.update = function () {
        Input_1.Input.update();
        this.audio.updateModule();
        this.viewport.updateModule();
        for (var i = 0; i < this._editorModules.length; i++) {
            this._editorModules[i].updateModule();
        }
    };
    Editor.prototype.onCanvasClick = function (event) {
        var clickPos = new Vec2_1.Vec2(event.offsetX, event.offsetY);
        if (clickPos.y < 10) {
            this.audio.setMusicFromCanvasPosition(clickPos);
        }
    };
    Editor.prototype.onChangeScale = function (mouseDelta) {
        if (!Input_1.Input.keysPressed["ControlLeft"])
            return;
        mouseDelta = mouseDelta > 0 ? 1 : -1;
        var resultedDelta = mouseDelta * Math.log(this.transform.scale.x / this.editorData.resizingSpeed.value);
        var oldScale = this.transform.scale.x;
        var canvCenter = this.viewport.canvasToSongTime(new Vec2_1.Vec2(this._editorCanvas.width / 2, 0));
        this.transform.scale = new Vec2_1.Vec2(this.transform.scale.x - resultedDelta, this.transform.scale.y);
        var scaleIsChanged = true;
        if (this.transform.scale.x <= this.transform.minScale.x) {
            this.transform.scale = new Vec2_1.Vec2(this.transform.minScale.x, this.transform.scale.y);
            scaleIsChanged = false;
        }
        if (this.transform.scale.x >= this.transform.maxScale.x) {
            this.transform.scale = new Vec2_1.Vec2(this.transform.maxScale.x, this.transform.scale.y);
            scaleIsChanged = false;
        }
        this.viewport.position = Vec2_1.Vec2.Substract(new Vec2_1.Vec2(this._editorCanvas.width / 2, 0), canvCenter);
        this.update();
    };
    return Editor;
}());
exports.Editor = Editor;
var TimestepLineModule = /** @class */ (function () {
    function TimestepLineModule() {
        this.transform = new Transform_1.Transform();
        this.timestepLine = new GridElements_1.TimestepLine(this.transform, AppSettings_1.editorColorSettings.timestepLineColor);
        this.canvas = jquery_1.default("#editor-canvas")[0];
    }
    TimestepLineModule.prototype.init = function (editorCoreModules) {
        this.editor = editorCoreModules;
    };
    TimestepLineModule.prototype.updateModule = function () {
        if (this.editor.audio.isPlaying()) {
            this.timestepLine.transform.localPosition = new Vec2_1.Vec2(this.editor.audio.seek(), 0);
            if (this.editor.editorData.followLine.value) {
                var result = new Vec2_1.Vec2(-this.timestepLine.transform.position.x + this.canvas.width / 2, 0);
                this.editor.viewport.transform.position = result;
            }
        }
        this.timestepLine.draw(this.editor.viewport, this.canvas);
    };
    return TimestepLineModule;
}());
exports.TimestepLineModule = TimestepLineModule;
var CreatableLinesModule = /** @class */ (function () {
    function CreatableLinesModule() {
        this.transform = new Transform_1.Transform();
        this.creatableLines = new Array();
        this.canvas = jquery_1.default("#editor-canvas")[0];
    }
    CreatableLinesModule.prototype.init = function (editorCoreModules) {
        var _this = this;
        this.editor = editorCoreModules;
        Input_1.Input.onKeyDown.addListener(function () { _this.handleInput(); });
    };
    CreatableLinesModule.prototype.updateModule = function () {
        var _this = this;
        if (this.editor.editorData.hideCreatableLines.value)
            return;
        this.creatableLines.forEach(function (element) {
            element.draw(_this.editor.viewport, _this.canvas);
        });
    };
    CreatableLinesModule.prototype.getLinesInRange = function (startPos, endPos) {
        if (this.creatableLines.length < 1)
            return;
        var tmpStartPos = new Vec2_1.Vec2(Math.min(startPos.x, endPos.x), Math.min(startPos.y, endPos.y));
        endPos = new Vec2_1.Vec2(Math.max(startPos.x, endPos.x), Math.max(startPos.y, endPos.y));
        startPos = tmpStartPos;
        var startIndex = Utils_1.Utils.binaryNearestSearch(this.creatableLines, startPos.x, Utils_1.Func.Ceil);
        var endIndex = Utils_1.Utils.binaryNearestSearch(this.creatableLines, endPos.x, Utils_1.Func.Floor);
        console.log(startIndex);
        console.log(endIndex);
        if ((startPos.y < this.canvas.height && endPos.y > this.canvas.height - 10)
            || (endPos.y < this.canvas.height && startPos.y > this.canvas.height - 10))
            return this.creatableLines.slice(startIndex, endIndex + 1);
        return null;
    };
    CreatableLinesModule.prototype.getClosestLine = function (posX) {
        if (this.creatableLines.length < 1)
            return;
        var index = Utils_1.Utils.binaryNearestSearch(this.creatableLines, posX);
        return this.creatableLines[index];
    };
    CreatableLinesModule.prototype.findClosestCreatableLine = function (positionX) {
        //this.creatableLines.sort((a,b) => { return a.transform.position.x-b.transform.position.x; });
        var objectsArr = this.creatableLines;
        if (objectsArr.length < 1)
            return;
        var indexOfElement = Utils_1.Utils.binaryNearestSearch(objectsArr, positionX);
        var closestCreatable = objectsArr[indexOfElement];
        return closestCreatable;
    };
    CreatableLinesModule.prototype.handleInput = function () {
        if (Input_1.Input.keysPressed["Space"] == true) {
            this.createCustomBpmLine("Space");
        }
        for (var i = 1; i <= 5; i++) {
            if (Input_1.Input.keysPressed["Digit" + i] == true) {
                this.createCustomBpmLine("Digit" + i);
            }
        }
    };
    CreatableLinesModule.prototype.createCustomBpmLine = function (keyPressed) {
        var xPos = this.editor.audio.seek();
        var line = new GridElements_1.CreatableTimestampLine(xPos, this.transform, AppSettings_1.editorColorSettings.creatableTimestampLineColor);
        this.creatableLines.push(line);
        this.creatableLines.sort(function (a, b) { return a.transform.position.x - b.transform.position.x; });
        console.log(line.transform.position);
        console.log(this.editor.viewport.transform.position);
        CreatableLinesModule.onCreateLineEvent.invoke([line, keyPressed]);
    };
    CreatableLinesModule.onCreateLineEvent = new Utils_1.Event();
    return CreatableLinesModule;
}());
exports.CreatableLinesModule = CreatableLinesModule;
var TimestampPrefab = /** @class */ (function () {
    function TimestampPrefab(id, color) {
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
var TimestampsModule = /** @class */ (function () {
    function TimestampsModule(editorGrid, creatableLines) {
        this.transform = new Transform_1.Transform();
        this.selectedPrefabId = 0;
        this.idToPrefab = new Map();
        this.timestamps = new Map();
        this.clapTimings = new Array();
        this.onExistingElementClicked = new Utils_1.Event();
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
        CreatableLinesModule.onCreateLineEvent.addListener(function (_a) {
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
        var prefab = new TimestampPrefab(TimestampsModule.nextPrefabId++, color);
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
        if (this.timestamps.keys.length < 1 || this.timestamps.values.length < 1)
            return;
        if (startPos.x > endPos.x) {
            var tmp = startPos;
            startPos = endPos;
            endPos = tmp;
        }
        var startIndex = Utils_1.Utils.binaryNearestSearchNumber(this.clapTimings, startPos.x, Utils_1.Func.Ceil);
        var endIndex = Utils_1.Utils.binaryNearestSearchNumber(this.clapTimings, endPos.x, Utils_1.Func.Floor);
        var xValues = this.clapTimings.slice(startIndex, endIndex);
        var resultTimestamps = new Array();
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
        if (this.timestamps.keys.length < 1 || this.timestamps.values.length < 1)
            return;
        console.log("try get closest timestamps");
        var index = Utils_1.Utils.binaryNearestSearchNumber(this.clapTimings, position.x);
        var yArray = this.timestamps[this.clapTimings[index]].values;
        console.log("index is " + index);
        console.log("yLenght: " + yArray.length);
        var result = null;
        var min = 10000;
        yArray.forEach(function (timestamp) {
            var distance = Math.abs(timestamp.transform.position.y - position.y);
            if (distance < min) {
                min = distance;
                result = timestamp;
            }
        });
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
        var newTimestamp = new GridElements_1.Timestamp(prefab.color, new Vec2_1.Vec2(position.x, position.y), 0.5, this.editorGridModule.transform);
        //console.log(newTimestamp); 
        if (this.timestamps[newTimestamp.transform.localPosition.x] == undefined) {
            this.timestamps[newTimestamp.transform.localPosition.x] = {};
        }
        if (this.timestamps[newTimestamp.transform.localPosition.x][newTimestamp.transform.localPosition.y] == null) {
            this.timestamps[newTimestamp.transform.localPosition.x][newTimestamp.transform.localPosition.y] = newTimestamp;
            this.clapTimings.push(newTimestamp.transform.localPosition.x);
            this.clapTimings.sort(function (a, b) { return a - b; });
        }
        else if (Input_1.Input.keysPressed["LeftControl"])
            this.onExistingElementClicked.invoke(this.timestamps[newTimestamp.transform.localPosition.x][newTimestamp.transform.localPosition.y]);
        if (this.editorCore.editorData.useClaps.value)
            this.editorCore.audio.setClapTimings(this.clapTimings);
    };
    TimestampsModule.nextPrefabId = 0;
    return TimestampsModule;
}());
exports.TimestampsModule = TimestampsModule;
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
        Input_1.Input.onMouseClickCanvas.addListener(function (event) { _this.onCanvasClick(event); });
        this.selectArea = new SelectArea();
        this.selectArea.onSelect.addListener(function (_a) {
            var a = _a[0], b = _a[1];
            _this.onAreaSelect(a, b);
        });
        //CreatableLinesModule.onLineClickEvent.addListener((line) => {this.onElementClicked(line);});
        //this.timestamps.onExistingElementClicked.addListener((element) => {this.onElementClicked(element)});
    };
    ElementSelectorModule.prototype.updateModule = function () {
        this.selectArea.draw(this.editor.viewport, this.canvas);
    };
    ElementSelectorModule.prototype.onAreaSelect = function (pointA, pointB) {
        var _this = this;
        if (Vec2_1.Vec2.Distance(pointA, pointB) < 30) {
            console.log("area is too smol");
            return;
        }
        //Input.onMouseUp.preventFiringEvent();
        Input_1.Input.onMouseClickCanvas.preventFiringEvent();
        pointA = this.editor.viewport.transform.canvasToWorld(pointA);
        pointB = this.editor.viewport.transform.canvasToWorld(pointB);
        var selectedLines = this.creatable.getLinesInRange(pointA, pointB);
        var selectedTimestamps = this.timestamps.getTimestampsAtRange(pointA, pointB);
        if (!Input_1.Input.keysPressed["ShiftLeft"])
            this.deselectAll();
        selectedLines === null || selectedLines === void 0 ? void 0 : selectedLines.forEach(function (line) {
            _this.onElementSelect(line);
        });
        selectedTimestamps === null || selectedTimestamps === void 0 ? void 0 : selectedTimestamps.forEach(function (timestamp) {
            _this.onElementSelect(timestamp);
        });
        console.log("selected timestamps count: " + (selectedTimestamps === null || selectedTimestamps === void 0 ? void 0 : selectedTimestamps.length));
        console.log("selected lines count: " + (selectedLines === null || selectedLines === void 0 ? void 0 : selectedLines.length));
    };
    ElementSelectorModule.prototype.onCanvasClick = function (event) {
        if (Input_1.Input.keysPressed["ShiftLeft"] == true)
            Input_1.Input.onMouseClickCanvas.preventFiringEvent();
        else {
            if (this.selectedElements.length > 0) {
                Input_1.Input.onMouseClickCanvas.preventFiringEvent();
            }
            this.deselectAll();
            return;
        }
        var worldClickPos = this.editor.viewport.transform.canvasToWorld(new Vec2_1.Vec2(event.offsetX, event.offsetY));
        var clickedElemenet = null;
        var closestLine = this.creatable.getClosestLine(worldClickPos.x);
        var closestTimestamp = this.timestamps.getClosestTimestamp(worldClickPos);
        if (closestLine != null) {
            var lineDist = Vec2_1.Vec2.Distance(new Vec2_1.Vec2(closestLine.transform.position.x, this.canvas.height - 5), worldClickPos);
            console.log("Ditstance to closest line: " + lineDist);
            if (lineDist < 10)
                clickedElemenet = closestLine;
        }
        if (closestTimestamp != null) {
            var timestampDist = Vec2_1.Vec2.Distance(closestTimestamp.transform.position, worldClickPos);
            console.log("Ditstance to closest timestamp: " + timestampDist);
            if (timestampDist < 20)
                clickedElemenet = closestLine;
        }
        if (clickedElemenet == null) {
            return;
        }
        if (lineDist > timestampDist) {
            clickedElemenet = closestTimestamp;
        }
        else {
            clickedElemenet = closestLine;
        }
        this.onElementSelect(clickedElemenet);
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
    ElementSelectorModule.prototype.selectElement = function (element) {
        console.log("element selected");
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
    ElementSelectorModule.prototype.deselectAll = function () {
        this.selectedElements.forEach(function (element) {
            element.deselect();
        });
        this.selectedElements = [];
    };
    return ElementSelectorModule;
}());
exports.ElementSelectorModule = ElementSelectorModule;
var EditorGrid = /** @class */ (function () {
    function EditorGrid() {
        this.bpmLines = new Array();
        this.beatLines = new Array();
        this.transform = new Transform_1.Transform();
        this.beatLinesRange = new Vec2_1.Vec2(1, 20);
        this.bpmRange = new Vec2_1.Vec2(1, 10000);
        this._canvas = jquery_1.default("#editor-canvas")[0];
        this.transform = new Transform_1.Transform();
        this.transform.localScale = new Vec2_1.Vec2(1, 1);
        //this.initGrid();
    }
    EditorGrid.prototype.init = function (editorCoreModules) {
        this.editorCore = editorCoreModules;
        this.subscribeOnEvents();
    };
    EditorGrid.prototype.subscribeOnEvents = function () {
        var _this = this;
        Input_1.Input.onWindowResize.addListener(function () { _this.onWindowResize(); });
        this.editorCore.editorData.offset.onValueChange.addListener(function (value) { _this.setOffsetValue(value); });
        this.editorCore.editorData.snapValue.onValueChange.addListener(function (value) { _this.setSnapValue(value); });
        this.editorCore.editorData.bpmValue.onValueChange.addListener(function (value) { _this.setBpmValue(value); });
        this.editorCore.editorData.beatLinesCount.onValueChange.addListener(function (value) { _this.setBeatLinesCount(value); });
        this.editorCore.audio.onAudioLoaded.addListener(function () { _this.onAudioLoad(); });
    };
    EditorGrid.prototype.onAudioLoad = function () {
        console.log("audio loaded");
        this.initGrid();
        this.initBpmLines();
    };
    EditorGrid.prototype.onWindowResize = function () {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight - this._canvas.parentElement.offsetTop - 10;
        var div = this._canvas.parentElement;
        div.setAttribute('style', 'height:' + (h * 0.95).toString() + 'px');
        var info = this._canvas.parentElement.getBoundingClientRect();
        this._canvas.setAttribute('width', (info.width).toString());
        this._canvas.setAttribute('height', (info.height / 4 * 3).toString());
        this.initGrid();
        //this.initBpmLines();
    };
    EditorGrid.prototype.updateModule = function () {
        var _this = this;
        var ctx = this._canvas.getContext("2d");
        ctx.fillStyle = AppSettings_1.editorColorSettings.editorBackgroundColor.value();
        ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        this.beatLines.forEach(function (beatLine) {
            if (beatLine.isActive)
                beatLine.draw(_this.editorCore.viewport, _this._canvas);
        });
        if (!this.editorCore.editorData.hideBpmLines.value && this.editorCore.audio.isAudioLoaded()) {
            var soundLength = this.editorCore.audio.duration();
            var bpmCount = (soundLength / 60) * this.editorCore.editorData.bpmValue.value;
            var pixelsPerBeat = soundLength / bpmCount;
            this.bpmLines.forEach(function (bpmLine) {
                if (bpmLine.isActive)
                    bpmLine.draw(_this.editorCore.viewport, _this._canvas);
            });
        }
    };
    EditorGrid.prototype.distanceBetweenBpmLines = function () {
        var soundLength = this.editorCore.audio.duration();
        var bpmCount = (soundLength / 60) * this.editorCore.editorData.bpmValue.value;
        var pixelsPerBeat = soundLength / bpmCount;
        return pixelsPerBeat;
    };
    EditorGrid.prototype.distanceBetweenBeatLines = function () {
        return (this._canvas.height) / (this.editorCore.editorData.beatLinesCount.value + 1);
    };
    EditorGrid.prototype.setSnapValue = function (val) {
        console.log(val);
        var distance = this.distanceBetweenBpmLines();
        this.bpmLines.forEach(function (line) {
            line.setSnapLines(val, distance);
        });
    };
    EditorGrid.prototype.setBpmValue = function (value) {
        //var bpm = parseInt(event.target.value);
        var bpm = value;
        bpm < this.bpmRange.x ? bpm = this.bpmRange.x : bpm = bpm;
        bpm > this.bpmRange.y ? bpm = this.bpmRange.y : bpm = bpm;
        this.initBpmLines();
        console.log(bpm);
    };
    EditorGrid.prototype.setBeatLinesCount = function (value) {
        //var beatLines = parseInt(event.target.value);
        var beatLines = value;
        beatLines < this.beatLinesRange.x ? beatLines = this.beatLinesRange.x : beatLines = beatLines;
        beatLines > this.beatLinesRange.y ? beatLines = this.beatLinesRange.y : beatLines = beatLines;
        this.initGrid();
    };
    EditorGrid.prototype.setOffsetValue = function (value) {
        //var offset = parseInt(event);
        var offset = value;
        this.transform.localPosition = new Vec2_1.Vec2(offset / 10, this.transform.localPosition.y);
    };
    EditorGrid.prototype.getGridSize = function () {
        return new Vec2_1.Vec2(this.editorCore.editorData.bpmValue.value, this.editorCore.editorData.beatLinesCount.value);
    };
    EditorGrid.prototype.initGrid = function () {
        this.transform.parent.scale = new Vec2_1.Vec2(this.transform.parent.scale.x, this.distanceBetweenBeatLines());
        for (var i = 0; i < this.editorCore.editorData.beatLinesCount.value; i++) {
            if (i + 1 > this.beatLines.length) {
                var beatLine = new GridElements_1.BeatLine((i + 1), this.transform, AppSettings_1.editorColorSettings.beatLineColor);
                this.beatLines.push(beatLine);
            }
            this.beatLines[i].activate();
        }
        for (var i = this.editorCore.editorData.beatLinesCount.value; i < this.beatLines.length; i++) {
            this.beatLines[i].deactivate();
        }
    };
    EditorGrid.prototype.initBpmLines = function () {
        if (!this.editorCore.audio.isAudioLoaded())
            return;
        console.log("init BPM");
        this.bpmLines = [];
        var soundLength = this.editorCore.audio.duration();
        var bpmCount = (soundLength / 60) * this.editorCore.editorData.bpmValue.value;
        for (var i = 0; i < bpmCount; i++) {
            var color;
            if (i % 2 == 0) {
                color = AppSettings_1.editorColorSettings.mainBpmLineColorStrong;
            }
            else
                color = AppSettings_1.editorColorSettings.mainBpmLineColorWeak;
            var bpmLine = new GridElements_1.BPMLine(i * this.distanceBetweenBpmLines(), this.transform, color);
            this.bpmLines.push(bpmLine);
        }
        console.log(this.distanceBetweenBpmLines());
        console.log(this.bpmLines.length);
    };
    EditorGrid.prototype.findClosestBeatLine = function (canvasCoords) {
        var beatlinesCanvasDistance = this.distanceBetweenBeatLines();
        var beatlineIndex = Math.round(canvasCoords.y / beatlinesCanvasDistance) - 1;
        if (beatlineIndex < 0)
            beatlineIndex = 0;
        if (beatlineIndex > this.editorCore.editorData.beatLinesCount.value - 1)
            beatlineIndex = this.editorCore.editorData.beatLinesCount.value - 1;
        return this.beatLines[beatlineIndex];
    };
    EditorGrid.prototype.findClosestBpmLine = function (worldPos) {
        var _this = this;
        if (this.bpmLines.length < 1)
            return;
        var getClosestBpm = function () {
            if (_this.bpmLines.length - 1 > closestBpmIndex
                && Math.abs(_this.bpmLines[closestBpmIndex + 1].value - worldPos) <
                    Math.abs(_this.bpmLines[closestBpmIndex].value - worldPos))
                closestBpm = _this.bpmLines[closestBpmIndex + 1];
        };
        var closestBpmIndex = Utils_1.Utils.binaryNearestSearch(this.bpmLines, worldPos, Utils_1.Func.Floor);
        var closestBpm = this.bpmLines[closestBpmIndex];
        if (closestBpm.snapLines.length < 1) {
            getClosestBpm();
            return closestBpm;
        }
        var closestBpmSnapIndex = Utils_1.Utils.binaryNearestSearch(closestBpm.snapLines, worldPos);
        var closestBpmSnap = closestBpm.snapLines[closestBpmSnapIndex];
        getClosestBpm();
        if (closestBpmSnap != null && closestBpmSnap != undefined && Math.abs(worldPos - closestBpm.transform.position.x) >
            Math.abs(worldPos - closestBpmSnap.transform.position.x))
            return closestBpmSnap;
        else
            return closestBpm;
    };
    return EditorGrid;
}());
exports.EditorGrid = EditorGrid;
var VisualiserEditorModule = /** @class */ (function () {
    function VisualiserEditorModule() {
        this.transform = new Transform_1.Transform();
        this.displayData = new Uint8Array();
        this.sampleRate = 48000;
        this.divideValue = 20;
        this.samplesPerArrayValue = this.sampleRate / this.divideValue;
        this.canvas = jquery_1.default("#visualiser-canvas")[0];
        this.ctx = this.canvas.getContext("2d");
    }
    VisualiserEditorModule.prototype.init = function (editorCoreModules) {
        var _this = this;
        this.editor = editorCoreModules;
        Input_1.Input.onWindowResize.addListener(function () { _this.onWindowResize(); });
        this.editor.audio.onPlay.addListener(function () { _this.onAudioLoad(); });
    };
    VisualiserEditorModule.prototype.onAudioLoad = function () {
        //this.spectrumData = this.editor.audio.getSpectrumData();
        this.displayData = this.editor.audio.getSpectrumData();
        this.calculateDisplayDataArray();
    };
    VisualiserEditorModule.prototype.calculateDisplayDataArray = function () {
    };
    VisualiserEditorModule.prototype.updateModule = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = AppSettings_1.editorColorSettings.editorBackgroundColor.value();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.displayData == undefined || this.displayData == null)
            return;
        if (this.spectrumData == undefined || this.spectrumData == null) {
            this.spectrumData = this.displayData;
            return;
        }
        var view = this.editor.viewport;
        this.onAudioLoad();
        var barHeight;
        var gap = 1; //- gap * this.displayData.length
        var barWidth = ((this.canvas.width) / (this.displayData.length - 10)) * 1;
        var x = 0;
        for (var i = 0; i < this.displayData.length - 10; i++) {
            barHeight = this.displayData[i] / 600 * this.canvas.height + 2 * (this.displayData[i] - this.spectrumData[i]);
            this.ctx.fillStyle = AppSettings_1.editorColorSettings.creatableTimestampLineColor.value();
            this.ctx.fillRect(x, this.canvas.height, barWidth, -barHeight);
            x += barWidth + gap;
        }
        this.spectrumData = this.displayData;
    };
    VisualiserEditorModule.prototype.onWindowResize = function () {
        var div = this.canvas.parentElement;
        //div.setAttribute('style', 'height:' + (h * 0.6).toString() + 'px');
        var info = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.setAttribute('width', (info.width).toString());
        this.canvas.setAttribute('height', (info.height * 0.7).toString());
    };
    return VisualiserEditorModule;
}());
exports.VisualiserEditorModule = VisualiserEditorModule;
