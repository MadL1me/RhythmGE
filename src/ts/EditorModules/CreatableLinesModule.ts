import $ from 'jquery';
import { Vec2 } from "../Utils/Vec2";
import { Transform } from "../Transform";
import { CreatableTimestampLine } from "../GridElements";
import { editorColorSettings } from "../Utils/AppSettings";
import { Input } from "../Input";
import { Utils, Event, Func } from "../Utils/Utils";
import { IEditorModule, IEditorCore } from '../Editor';


export class CreatableLinesModule implements IEditorModule {

    transform = new Transform();
    creatableLines = new Array<CreatableTimestampLine>();

    private editor: IEditorCore;
    private canvas: HTMLCanvasElement;

    static onCreateLineEvent = new Event<[CreatableTimestampLine, string]>();

    constructor() {
        this.canvas = $("#editor-canvas")[0] as HTMLCanvasElement;
    }

    init(editorCoreModules: IEditorCore) {
        this.editor = editorCoreModules;
        Input.onKeyDown.addListener(() => { this.handleInput(); });
    }

    updateModule() {
        if (this.editor.editorData.hideCreatableLines.value)
            return;

        this.creatableLines.forEach(element => {
            element.draw(this.editor.viewport, this.canvas);
        });
    }

    getLinesInRange(startPos: Vec2, endPos: Vec2): CreatableTimestampLine[] {
        if (this.creatableLines.length < 1)
            return;

        let tmpStartPos = new Vec2(Math.min(startPos.x, endPos.x), Math.min(startPos.y, endPos.y));
        endPos = new Vec2(Math.max(startPos.x, endPos.x), Math.max(startPos.y, endPos.y));
        startPos = tmpStartPos;

        let startIndex = Utils.binaryNearestSearch(this.creatableLines, startPos.x, Func.Ceil);
        let endIndex = Utils.binaryNearestSearch(this.creatableLines, endPos.x, Func.Floor);

        console.log(startIndex);
        console.log(endIndex);

        if ((startPos.y < this.canvas.height && endPos.y > this.canvas.height - 10)
            || (endPos.y < this.canvas.height && startPos.y > this.canvas.height - 10))
            return this.creatableLines.slice(startIndex, endIndex + 1);
        return null;
    }

    getClosestLine(posX): CreatableTimestampLine {
        if (this.creatableLines.length < 1)
            return;

        let index = Utils.binaryNearestSearch(this.creatableLines, posX);
        return this.creatableLines[index];
    }

    findClosestCreatableLine(positionX: number) {
        //this.creatableLines.sort((a,b) => { return a.transform.position.x-b.transform.position.x; });
        const objectsArr = this.creatableLines;

        if (objectsArr.length < 1)
            return;
        const indexOfElement = Utils.binaryNearestSearch(objectsArr, positionX);
        const closestCreatable = objectsArr[indexOfElement];
        return closestCreatable;
    }

    private deleteLine(line: CreatableTimestampLine) {
        let indexOf = Utils.binaryNearestSearch(this.creatableLines, line.transform.position.x, Func.Round);
        this.creatableLines.splice(indexOf, 1);
    }

    private restoreLine(line: CreatableTimestampLine) {
        this.creatableLines.push(line);
        this.creatableLines.sort((a, b) => { return a.transform.position.x - b.transform.position.x; });
    }

    private handleInput() {
        if (Input.keysPressed["Space"] == true) {
            this.createCustomBpmLine("Space");
        }
        for (let i = 1; i <= 5; i++) {
            if (Input.keysPressed[`Digit${i}`] == true) {
                this.createCustomBpmLine(`Digit${i}`);
            }
        }
    }

    private createCustomBpmLine(keyPressed: string) {
        let xPos = this.editor.audio.seek();
        let line = new CreatableTimestampLine(xPos, this.transform, editorColorSettings.creatableTimestampLineColor);
        line.onRestore.addListener((line) => {this.restoreLine(line)});
        line.onDelete.addListener((line) => {this.deleteLine(line)});
        
        this.creatableLines.push(line);
        this.creatableLines.sort((a, b) => { return a.transform.position.x - b.transform.position.x; });

        console.log(line.transform.position);
        console.log(this.editor.viewport.transform.position);
        CreatableLinesModule.onCreateLineEvent.invoke([line, keyPressed]);
    }
}
