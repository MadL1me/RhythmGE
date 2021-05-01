import { ElementSelectorModule } from "./EditorModules/ElementSelectorModule";
import { GridElement } from "./GridElements";
import { Input, KeyBinding } from "./Input";

export interface ICommand {
    execute();
    undo();
}

export class CommandsController {
    
    private static commandsCapacity = 50;
    private static commandIndex = 0;
    private static commands = new Array<ICommand>();
    private static _init: boolean = false;

    private static undoBind = new KeyBinding();
    private static redoBind = new KeyBinding();

    static init() {
        this._init = true;
        
        this.undoBind.keysList = ["ControlLeft", "KeyZ"];
        this.redoBind.keysList = ["ControlLeft", "KeyY"]
        this.undoBind.onBindPress.addListener(() => this.undoCommand());
        this.redoBind.onBindPress.addListener(() => this.redoCommand());

        Input.registerKeyBinding(this.undoBind);
        Input.registerKeyBinding(this.redoBind);
    }

    static addCommandToList(executedCommand: ICommand) {
        if (this.commandIndex != this.commands.length-1) {
            this.commands = this.commands.slice(0, this.commandIndex);
        }

        if (this.commands.length > this.commandsCapacity) {
            this.commands.shift();
        }

        this.commands.push(executedCommand);
        this.commandIndex=this.commands.length;
    }

    static undoCommand() {
        this.commands[this.commandIndex].undo();
        this.commandIndex--;
    }

    static redoCommand() {
        if (this.commandIndex == this.commands.length-1) {
            return;
        }
        this.commandIndex++
        this.commands[this.commandIndex].execute();
    }
}

export class SelectElementsCommand implements ICommand {

    constructor (
        private elements: Array<GridElement>, 
        private selector: ElementSelectorModule) {}

    execute() {
        this.elements.forEach((element) => {
            this.selector.selectElement(element);
        });
    }

    undo() {
        this.elements.forEach((element) => {
            this.selector.deselectElement(element);
        });
    }
}

export class DeleteElementsCommand implements ICommand {
    
    constructor (
        private elements: Array<GridElement>, 
        private selector: ElementSelectorModule) {}
   
    execute() {
        throw new Error("Method not implemented.");
    }
    undo() {
        throw new Error("Method not implemented.");
    }
}

export class MoveElementsCommand implements ICommand{
    execute() {
        throw new Error("Method not implemented.");
    }
    undo() {
        throw new Error("Method not implemented.");
    }

}

export class InsertElememtsCommand implements ICommand {
    
    constructor(
        private insertedElements: Array<GridElement>
        ) {}

    execute() {
        throw new Error("Method not implemented.");
    }
    undo() {
        throw new Error("Method not implemented.");
    }
}

CommandsController.init();