"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertElememtsCommand = exports.MoveElementsCommand = exports.DeleteElementsCommand = exports.SelectElementsCommand = exports.CommandsController = void 0;
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
    CommandsController.addCommandToList = function (executedCommand) {
        if (this.commandIndex != this.commands.length - 1) {
            this.commands = this.commands.slice(0, this.commandIndex);
        }
        if (this.commands.length > this.commandsCapacity) {
            this.commands.shift();
        }
        this.commands.push(executedCommand);
        this.commandIndex = this.commands.length;
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
    function DeleteElementsCommand(elements, selector) {
        this.elements = elements;
        this.selector = selector;
    }
    DeleteElementsCommand.prototype.execute = function () {
        throw new Error("Method not implemented.");
    };
    DeleteElementsCommand.prototype.undo = function () {
        throw new Error("Method not implemented.");
    };
    return DeleteElementsCommand;
}());
exports.DeleteElementsCommand = DeleteElementsCommand;
var MoveElementsCommand = /** @class */ (function () {
    function MoveElementsCommand() {
    }
    MoveElementsCommand.prototype.execute = function () {
        throw new Error("Method not implemented.");
    };
    MoveElementsCommand.prototype.undo = function () {
        throw new Error("Method not implemented.");
    };
    return MoveElementsCommand;
}());
exports.MoveElementsCommand = MoveElementsCommand;
var InsertElememtsCommand = /** @class */ (function () {
    function InsertElememtsCommand(insertedElements) {
        this.insertedElements = insertedElements;
    }
    InsertElememtsCommand.prototype.execute = function () {
        throw new Error("Method not implemented.");
    };
    InsertElememtsCommand.prototype.undo = function () {
        throw new Error("Method not implemented.");
    };
    return InsertElememtsCommand;
}());
exports.InsertElememtsCommand = InsertElememtsCommand;
CommandsController.init();
