import $ from 'jquery';
import { Vec2 } from "../Utils/Vec2";
import { Transform } from "../Transform";
import { GridElement, IDrawable } from "../GridElements";
import { IViewportModule } from "./ViewportModule";
import { editorColorSettings } from "../Utils/AppSettings";
import { Input } from "../Input";
import { Utils, Event } from "../Utils/Utils";
import { EditorGrid } from './EditorGridModule';
import { IEditorModule, IEditorCore } from '../Editor';
import { CreatableLinesModule } from "./CreatableLinesModule";
import { TimestampsModule } from "./TimestampsModule";

class SelectArea implements IDrawable {
    private firstPoint = new Vec2(0, 0);
    private secondPoint = new Vec2(0, 0);
    private isActive: boolean;
    private canvas: HTMLCanvasElement;

    onSelect = new Event<[Vec2, Vec2]>();

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
    private selectArea;
    private grid: EditorGrid;
    private timestamps: TimestampsModule;
    private creatable: CreatableLinesModule;
    private canvas: HTMLCanvasElement;

    constructor(grid: EditorGrid, creatable: CreatableLinesModule, timestamps: TimestampsModule) {
        this.grid = grid;
        this.creatable = creatable;
        this.timestamps = timestamps;
        this.canvas = $("#editor-canvas")[0] as HTMLCanvasElement;
    }

    init(editorCoreModules: IEditorCore) {
        this.editor = editorCoreModules;
        Input.onMouseClickCanvas.addListener((event) => { this.onCanvasClick(event); });
        Input.onMouseAfterCanvasClick.addListener(() => { Input.onMouseClickCanvas.allowFiring(); });
        this.selectArea = new SelectArea();
        this.selectArea.onSelect.addListener(([a, b]) => { this.onAreaSelect(a, b); });
        //CreatableLinesModule.onLineClickEvent.addListener((line) => {this.onElementClicked(line);});
        //this.timestamps.onExistingElementClicked.addListener((element) => {this.onElementClicked(element)});
    }

    updateModule() {
        this.selectArea.draw(this.editor.viewport, this.canvas);
    }

    selectElement(element: GridElement) {
        console.log("element selected");
        this.selectedElements.push(element);
        this.selectedElements.sort((a, b) => { return a.transform.position.x - b.transform.position.x; });
        element.select();
    }

    deselectElement(element: GridElement) {
        console.log("element deselected");
        const index = Utils.binaryNearestSearch(this.selectedElements, element.transform.position.x);
        console.log(this.selectedElements);
        this.selectedElements.splice(index, 1);
        this.selectedElements.sort((a, b) => { return a.transform.position.x - b.transform.position.x; });
        console.log(this.selectedElements);
        element.deselect();
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

        let clickedElemenet = null;
        let closestLine = this.creatable.getClosestLine(worldClickPos.x);
        let closestTimestamp = this.timestamps.getClosestTimestamp(worldClickPos);

        if (closestLine != null) {
            var lineDist = Vec2.Distance(new Vec2(closestLine.transform.position.x, this.canvas.height - 5), worldClickPos);
            console.log(`Ditstance to closest line: ${lineDist}`);

            if (lineDist < 10)
                clickedElemenet = closestLine;
        }

        if (closestTimestamp != null) {
            var timestampDist = Vec2.Distance(closestTimestamp.transform.position, worldClickPos);
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

        this.onElementSelect(clickedElemenet);
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

    private deselectAll() {
        this.selectedElements.forEach(element => {
            element.deselect();
        });

        this.selectedElements = [];
    }
}
