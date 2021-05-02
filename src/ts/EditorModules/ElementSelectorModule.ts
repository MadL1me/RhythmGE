import $ from 'jquery';
import { Vec2 } from "../Utils/Vec2";
import { Transform } from "../Transform";
import { CreatableTimestampLine, GridElement, IDrawable, Timestamp } from "../GridElements";
import { IViewportModule } from "./ViewportModule";
import { editorColorSettings } from "../Utils/AppSettings";
import { Input } from "../Input";
import { Utils, Event } from "../Utils/Utils";
import { EditorGrid } from './EditorGridModule';
import { IEditorModule, IEditorCore, Editor } from '../Editor';
import { CreatableLinesModule } from "./CreatableLinesModule";
import { TimestampsModule } from "./TimestampsModule";
import { CommandsController, DeleteElementsCommand, MoveElementsCommand } from '../Command';
import { RgbaColor } from '../Utils/RgbaColor';

class SelectArea implements IDrawable {
    private firstPoint = new Vec2(0, 0);
    private secondPoint = new Vec2(0, 0);
    private canvas: HTMLCanvasElement;

    onSelect = new Event<[Vec2, Vec2]>();
    isActive: boolean;

    constructor() {
        this.canvas = $("#editor-canvas")[0] as HTMLCanvasElement;

        Input.onMouseDownCanvas.addListener((event) => { this.onMouseDown(event); });
        Input.onMouseUp.addListener((event) => { this.onMouseUp(event); });
        Input.onHoverWindow.addListener((event) => { this.onMouseMove(event); });
    }

    draw(view: IViewportModule, canvas: HTMLCanvasElement) {
        if (!this.isActive)
            return;
        const ctx = canvas.getContext('2d');
        const sizeVec = Vec2.Substract(this.secondPoint, this.firstPoint);
        ctx.fillStyle = editorColorSettings.selectAreaColor.value();
        ctx.fillRect(this.firstPoint.x, this.firstPoint.y, sizeVec.x, sizeVec.y);
    }

    onMouseDown(event: JQuery.MouseDownEvent) {
        //console.log(event);
        this.isActive = true;
        this.firstPoint = new Vec2(event.offsetX, event.offsetY);
        this.secondPoint = new Vec2(event.offsetX, event.offsetY);
    }

    onMouseMove(event: JQuery.MouseMoveEvent) {
        //if (this.isActive)
        //    console.log(event);
        const rect = this.canvas.getBoundingClientRect();
        //console.log(rect);
        this.secondPoint = new Vec2(event.clientX - rect.left, event.clientY - rect.top);
    }

    onMouseUp(event: JQuery.MouseUpEvent) {
        //console.log(event);
        if (!this.isActive)
            return;
        this.isActive = false;
        this.onSelect.invoke([this.firstPoint, this.secondPoint]);
    }
}

export class ElementSelectorModule implements IEditorModule {
    transform = new Transform();

    private editor: IEditorCore;
    private selectedElements = new Array<GridElement>();
    private selectArea: SelectArea;
    private grid: EditorGrid;
    private timestamps: TimestampsModule;
    private creatable: CreatableLinesModule;
    private canvas: HTMLCanvasElement;
    
    private movingState: boolean;
    private movingElement: GridElement;

    constructor(grid: EditorGrid, creatable: CreatableLinesModule, timestamps: TimestampsModule) {
        this.grid = grid;
        this.creatable = creatable;
        this.timestamps = timestamps;
        this.canvas = $("#editor-canvas")[0] as HTMLCanvasElement;
    }

    init(editorCoreModules: IEditorCore) {
        this.editor = editorCoreModules;
        Input.onHoverWindow.addListener((event) => this.onMouseMove(event));
        Input.onMouseUp.addListener((event) => this.onMouseUp(event));
        Input.onMouseClickCanvas.addListener((event) => this.onCanvasClick(event));
        Input.onMouseAfterCanvasClick.addListener(() => Input.onMouseClickCanvas.allowFiring());
        
        this.selectArea = new SelectArea();
        this.selectArea.onSelect.addListener(([a, b]) => this.onAreaSelect(a, b));
        
        Input.onMouseDownCanvas.addListener((event) => this.onMouseDown(event));
        Input.onKeyDown.addListener((key) => this.onKeyDown(key));
        //CreatableLinesModule.onLineClickEvent.addListener((line) => {this.onElementClicked(line);});
        //this.timestamps.onExistingElementClicked.addListener((element) => {this.onElementClicked(element)});
    }

    updateModule() {
        this.selectArea.draw(this.editor.viewport, this.canvas);
    }

    selectElement(element: GridElement) {
        console.log("element selected");
        //let selectCommand = new SelectElementsCommand([element], this);
        this.selectedElements.push(element);
        this.selectedElements.sort((a, b) => a.transform.position.x - b.transform.position.x);
        element.select();
    }

    deselectElement(element: GridElement) {
        console.log("element deselected");
        const index = Utils.binaryNearestSearch(this.selectedElements, element.transform.position.x);
        console.log(this.selectedElements);
        this.selectedElements.splice(index, 1);
        this.selectedElements.sort((a, b) => a.transform.position.x - b.transform.position.x);
        console.log(this.selectedElements);
        element.deselect();
    }

    setSelectedElements(array: Array<GridElement>) {
        this.selectedElements.forEach((element) => {
            element.deselect();
        });
        this.selectedElements = array;
    }
    
    deselectAll() {
        this.selectedElements.forEach(element => {
            element.deselect();
        });

        this.selectedElements = [];
    }
    
    private onKeyDown(event: JQuery.KeyDownEvent) {
        if (Input.keysPressed["Delete"]) {
            console.log("DELETE COMMAND");
            let deleteCommand = new DeleteElementsCommand(this.selectedElements, this);
            CommandsController.executeCommand(deleteCommand);
        }
    }

    private onAreaSelect(pointA: Vec2, pointB: Vec2) {
        if (Vec2.Distance(pointA, pointB) < 30) {
            console.log("area is too smol");
            return;
        }

        //Input.onMouseUp.preventFiringEvent();
        Input.onMouseClickCanvas.preventFiring();

        pointA = this.editor.viewport.transform.canvasToWorld(pointA);
        pointB = this.editor.viewport.transform.canvasToWorld(pointB);

        let selectedLines = this.creatable.getLinesInRange(pointA, pointB);
        let selectedTimestamps = this.timestamps.getTimestampsAtRange(pointA, pointB);

        if (!Input.keysPressed["ShiftLeft"])
            this.deselectAll();

        selectedLines?.forEach((line) => {
            this.selectElement(line);
        });

        selectedTimestamps?.forEach((timestamp) => {
            this.selectElement(timestamp);
        });

        console.log(`selected timestamps count: ${selectedTimestamps?.length}`);
        console.log(`selected lines count: ${selectedLines?.length}`);
    }

    private onMouseDown(event: JQuery.MouseDownEvent) {
        console.log("MOSUE DOWN 0");
        
        if (this.selectedElements.length != 1)
            return;

        console.log("MOSUE DOWN");

        let worldClickPos = this.editor.viewport.transform.canvasToWorld(new Vec2(event.offsetX, event.offsetY));
        let closestElement = this.selectedElements[0];
        
        if (!closestElement.isSelected && Vec2.Distance(worldClickPos, closestElement.transform.position) > 20)
            return;

        console.log("MOSUE DOWN 2");

        this.movingElement = closestElement;
        this.selectArea.isActive = false;
        this.movingState = true;
    }

    private onMouseMove(event: JQuery.MouseMoveEvent) {
        if (!this.movingState)
            return;

        let worldPos = this.editor.viewport.transform.canvasToWorld(new Vec2(event.offsetX, event.offsetY));

        if (this.movingElement instanceof Timestamp) {
            let timestamp = this.movingElement as Timestamp;
            let closestBpm = this.grid.findClosestBpmLine(worldPos.x);
            let closestCreatable = this.creatable.findClosestCreatableLine(worldPos.x);
            let closestLine: GridElement;

            if (closestBpm == null)
                closestLine = closestCreatable;
            else if (closestCreatable == null)
                closestLine = closestBpm;
            else
                closestLine = Math.abs(closestBpm.transform.position.x - worldPos.x) <
                    Math.abs(closestCreatable.transform.position.x - worldPos.x) ? closestBpm : closestCreatable;


            let closestBeatline = this.grid.findClosestBeatLine(worldPos);
            let position = new Vec2(closestLine.transform.position.x, closestBeatline.transform.position.y);

            let phantomTimestamp = new Timestamp(timestamp.prefab, position, this.timestamps.transform);
            (this.editor as Editor).addLastDrawableElement(phantomTimestamp);
            
            return;
        }
        let cLine = this.movingElement as CreatableTimestampLine;

        let line = new CreatableTimestampLine(worldPos.x, this.creatable.transform, new RgbaColor(cLine.color.r, cLine.color.g, cLine.color.b, 0.6));
        (this.editor as Editor).addLastDrawableElement(line);
    }   

    private onMouseUp(event: JQuery.MouseUpEvent) {
        if (!this.movingState)
            return;
        
        let worldPos = this.editor.viewport.transform.canvasToWorld(new Vec2(event.offsetX, event.offsetY));
        
        if (this.movingElement instanceof Timestamp) {
            let timestamp = this.movingElement as Timestamp;
            let closestBpm = this.grid.findClosestBpmLine(worldPos.x);
            let closestCreatable = this.creatable.findClosestCreatableLine(worldPos.x);
            let closestLine: GridElement;

            if (closestBpm == null)
                closestLine = closestCreatable;
            else if (closestCreatable == null)
                closestLine = closestBpm;
            else
                closestLine = Math.abs(closestBpm.transform.position.x - worldPos.x) <
                    Math.abs(closestCreatable.transform.position.x - worldPos.x) ? closestBpm : closestCreatable;


            let closestBeatline = this.grid.findClosestBeatLine(worldPos);
            let position = this.editor.viewport.transform.worldToLocal(new Vec2(closestLine.transform.position.x, closestBeatline.transform.position.y));
            (this.editor as Editor).addLastDrawableElement(null);

            //this.movingElement.move(position);
            let moveCommand = new MoveElementsCommand([this.movingElement], [position]);
            CommandsController.executeCommand(moveCommand);
            return;
        }
        else {
            let position = this.editor.viewport.transform.worldToLocal(worldPos);
            let moveCommand = new MoveElementsCommand([this.movingElement], [position]);
            CommandsController.executeCommand(moveCommand);

            //this.movingElement.move(position);
        }
        
        this.movingElement = null;
        this.selectArea.isActive = true;
        this.movingState = false;
    }   

    private onCanvasClick(event: JQuery.ClickEvent) {
        if (Input.keysPressed["ShiftLeft"] == true)
            Input.onMouseClickCanvas.preventFiringEventOnce();
        else {
            if (this.selectedElements.length > 0) {
                Input.onMouseClickCanvas.preventFiringEventOnce();
            }
            console.log("DESELECTING ALL CLICK");
            this.deselectAll();
            return;
        }

        let worldClickPos = this.editor.viewport.transform.canvasToWorld(new Vec2(event.offsetX, event.offsetY));
        this.onElementSelect(this.getClosestGridElement(worldClickPos));
    }

    private getClosestGridElement(worldPos: Vec2) : GridElement {
        let clickedElemenet = null;
        let closestLine = this.creatable.getClosestLine(worldPos.x);
        let closestTimestamp = this.timestamps.getClosestTimestamp(worldPos);

        if (closestLine != null) {
            var lineDist = Vec2.Distance(new Vec2(closestLine.transform.position.x, this.canvas.height - 5), worldPos);
            console.log(`Ditstance to closest line: ${lineDist}`);

            if (lineDist < 10)
                clickedElemenet = closestLine;
        }

        if (closestTimestamp != null) {
            var timestampDist = Vec2.Distance(closestTimestamp.transform.position, worldPos);
            console.log(`Ditstance to closest timestamp: ${timestampDist}`);

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
    }

    private onElementSelect(element: GridElement) {
        if (element == null || element == undefined)
            return;

        if (element.isSelected)
            this.deselectElement(element);

        else
            this.selectElement(element);

        console.log("Selected elements: ");
        console.log(this.selectedElements.length);
    }
}
