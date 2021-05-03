import { CreatableLinesModule } from "./EditorModules/CreatableLinesModule";
import { ElementSelectorModule } from "./EditorModules/ElementSelectorModule";
import { TimestampsModule } from "./EditorModules/TimestampsModule";
import { CreatableTimestampLine, GridElement, Timestamp } from "./GridElements";
import { Input, KeyBinding } from "./Input";
import { Vec2 } from "./Utils/Vec2";

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

    static executeCommand(executedCommand: ICommand) {
        if (this.commandIndex != this.commands.length-1) {
            this.commands.splice(this.commandIndex);
        }

        if (this.commands.length > this.commandsCapacity) {
            this.commands.shift();
        }

        this.commands.push(executedCommand);
        this.commandIndex=this.commands.length-1;
        executedCommand.execute();
    }

    static undoCommand() {
        if (this.commands.length < 1)
            return;
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

export class CopyCommand implements ICommand {
    execute() {
        throw new Error("Method not implemented.");
    }
    undo() {
        throw new Error("Method not implemented.");
    }

}

export class PasteCommand implements ICommand {
    execute() {
        throw new Error("Method not implemented.");
    }
    undo() {
        throw new Error("Method not implemented.");
    }
}

export class CutCommand implements ICommand {
    execute() {
        throw new Error("Method not implemented.");
    }
    undo() {
        throw new Error("Method not implemented.");
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
    
    constructor 
    (
        private gridElements: Array<GridElement>,
        private selector: ElementSelectorModule
        ) {}
   
    execute() {
        this.gridElements.forEach((element) => {
            element.delete();
        });
        this.selector.deselectAll();
    }
    undo() {
        this.gridElements.forEach((element) => {
           element.restore();
        });
        this.selector.setSelectedElements(this.gridElements);
    }
}

export class CreateElememtsCommand implements ICommand {
    
    constructor (private gridElements: Array<GridElement>) {}
   
    execute() {
        this.gridElements.forEach((element) => {
            element.restore();
        });
    }
    undo() {
        this.gridElements.forEach((element) => {
            element.delete();
        });
    }
 }

export class MoveElementsCommand implements ICommand{
    
    private lastPositions = new Array<Vec2>();

    constructor(private movedElements: GridElement[], private newPositions: Vec2[]) {}
    
    execute() {
        this.movedElements.forEach(element => {
            this.lastPositions.push(element.transform.position);
        });
        for(let i = 0; i<this.movedElements.length; i++) {
            this.movedElements[i].move(this.newPositions[i]);
        }
    }

    undo() {
        for(let i = 0; i<this.movedElements.length; i++) {
            this.movedElements[i].move(this.lastPositions[i]);
        }
    }

}

CommandsController.init();