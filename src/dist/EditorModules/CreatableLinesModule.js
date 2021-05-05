"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatableLinesModule = void 0;
var jquery_1 = __importDefault(require("jquery"));
var Vec2_1 = require("../Utils/Vec2");
var Transform_1 = require("../Transform");
var GridElements_1 = require("../GridElements");
var AppSettings_1 = require("../Utils/AppSettings");
var Input_1 = require("../Input");
var Utils_1 = require("../Utils/Utils");
var Command_1 = require("../Command");
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
        if (endPos.x < this.creatableLines[0].transform.position.x ||
            startPos.x > this.creatableLines[this.creatableLines.length - 1].transform.position.x)
            return null;
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
    CreatableLinesModule.prototype.deleteLine = function (line) {
        var indexOf = Utils_1.Utils.binaryNearestSearch(this.creatableLines, line.transform.position.x, Utils_1.Func.Round);
        this.creatableLines.splice(indexOf, 1);
    };
    CreatableLinesModule.prototype.restoreLine = function (line) {
        this.creatableLines.push(line);
        this.creatableLines.sort(function (a, b) { return a.transform.position.x - b.transform.position.x; });
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
        var _this = this;
        var xPos = this.editor.audio.seek();
        var line = new GridElements_1.CreatableTimestampLine(xPos, this.transform, AppSettings_1.editorColorSettings.creatableTimestampLineColor);
        line.onRestore.addListener(function (line) { _this.restoreLine(line); });
        line.onDelete.addListener(function (line) { _this.deleteLine(line); });
        this.creatableLines.push(line);
        this.creatableLines.sort(function (a, b) { return a.transform.position.x - b.transform.position.x; });
        var createCommand = new Command_1.CreateElememtsCommand([line]);
        Command_1.CommandsController.executeCommand(createCommand);
        CreatableLinesModule.onCreateLineEvent.invoke([line, keyPressed]);
    };
    CreatableLinesModule.onCreateLineEvent = new Utils_1.Event();
    return CreatableLinesModule;
}());
exports.CreatableLinesModule = CreatableLinesModule;
