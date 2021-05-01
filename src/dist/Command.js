"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveElementsCommand = exports.CreateElememtsCommand = exports.DeleteElementsCommand = exports.SelectElementsCommand = exports.CommandsController = void 0;
var Input_1 = require("./Input");
var CommandsController = /** @class */ (function () {
    function CommandsController() {
    }
    CommandsController.init = function () {
        var _this = this;
        this._init = true;
        this.undoBind.keysList = ["ControlLeft", "KeyZ"];
        this.redoBind.keysList = ["ControlLeft", "KeyY"];
        this.undoBind.onBindPress.addListener(function () { return _this.undoCommand(); });
        this.redoBind.onBindPress.addListener(function () { return _this.redoCommand(); });
        Input_1.Input.registerKeyBinding(this.undoBind);
        Input_1.Input.registerKeyBinding(this.redoBind);
    };
    CommandsController.executeCommand = function (executedCommand) {
        if (this.commandIndex != this.commands.length - 1) {
            this.commands = this.commands.slice(0, this.commandIndex);
        }
        if (this.commands.length > this.commandsCapacity) {
            this.commands.shift();
        }
        this.commands.push(executedCommand);
        this.commandIndex = this.commands.length - 1;
        executedCommand.execute();
    };
    CommandsController.undoCommand = function () {
        this.commands[this.commandIndex].undo();
        this.commandIndex--;
    };
    CommandsController.redoCommand = function () {
        if (this.commandIndex == this.commands.length - 1) {
            return;
        }
        this.commandIndex++;
        this.commands[this.commandIndex].execute();
    };
    CommandsController.commandsCapacity = 50;
    CommandsController.commandIndex = 0;
    CommandsController.commands = new Array();
    CommandsController._init = false;
    CommandsController.undoBind = new Input_1.KeyBinding();
    CommandsController.redoBind = new Input_1.KeyBinding();
    return CommandsController;
}());
exports.CommandsController = CommandsController;
var SelectElementsCommand = /** @class */ (function () {
    function SelectElementsCommand(elements, selector) {
        this.elements = elements;
        this.selector = selector;
    }
    SelectElementsCommand.prototype.execute = function () {
        var _this = this;
        this.elements.forEach(function (element) {
            _this.selector.selectElement(element);
        });
    };
    SelectElementsCommand.prototype.undo = function () {
        var _this = this;
        this.elements.forEach(function (element) {
            _this.selector.deselectElement(element);
        });
    };
    return SelectElementsCommand;
}());
exports.SelectElementsCommand = SelectElementsCommand;
var DeleteElementsCommand = /** @class */ (function () {
    function DeleteElementsCommand(gridElements, selector) {
        this.gridElements = gridElements;
        this.selector = selector;
    }
    DeleteElementsCommand.prototype.execute = function () {
        this.gridElements.forEach(function (element) {
            element.delete();
        });
        this.selector.deselectAll();
    };
    DeleteElementsCommand.prototype.undo = function () {
        this.gridElements.forEach(function (element) {
            element.restore();
        });
        this.selector.setSelectedElemetnts(this.gridElements);
    };
    return DeleteElementsCommand;
}());
exports.DeleteElementsCommand = DeleteElementsCommand;
var CreateElememtsCommand = /** @class */ (function () {
    function CreateElememtsCommand(gridElements) {
        this.gridElements = gridElements;
    }
    CreateElememtsCommand.prototype.execute = function () {
        this.gridElements.forEach(function (element) {
            element.restore();
        });
    };
    CreateElememtsCommand.prototype.undo = function () {
        this.gridElements.forEach(function (element) {
            element.delete();
        });
    };
    return CreateElememtsCommand;
}());
exports.CreateElememtsCommand = CreateElememtsCommand;
var MoveElementsCommand = /** @class */ (function () {
    function MoveElementsCommand(movedElements) {
        this.movedElements = movedElements;
    }
    MoveElementsCommand.prototype.execute = function () {
        var _this = this;
        this.movedElements.forEach(function (element) {
            _this.lastPositions.push(element.transform.position);
        });
    };
    MoveElementsCommand.prototype.undo = function () {
        for (var i = 0; i < this.movedElements.length; i++) {
            this.movedElements[i].transform.position = this.lastPositions[i];
        }
    };
    return MoveElementsCommand;
}());
exports.MoveElementsCommand = MoveElementsCommand;
CommandsController.init();
