import { Transform } from "./Transform";
import { RgbaColor } from "./Utils/RgbaColor";
import { IViewportModule } from "./EditorModules/ViewportModule";
import { Vec2 } from "./Utils/Vec2";
import { editorColorSettings } from "./Utils/AppSettings";
import { Event } from "./Utils/Utils";
import $ from 'jquery';

export interface IDrawable {
    draw(view: IViewportModule, canvas: HTMLCanvasElement);
}

export interface IRestorable {
    onRestore: Event<IRestorable>;
    restore();
}

export interface ICompareNumberProvider {
    value: number;
}

export interface ISelectable {
    isSelected: boolean;
    onSelected: Event<ISelectable>;
    onDeselected: Event<ISelectable>;
    select();
    deselect();
}

export interface IMoveable {
    move(newLocalPos: Vec2);
    onMoved: Event<[IMoveable, Vec2]>
}

export interface IDeletable {
    delete();
    onDelete: Event<IDeletable>;
}

export abstract class GridElement implements IMoveable, IDrawable, ICompareNumberProvider, ISelectable, IDeletable, IRestorable {
    
    transform: Transform = new Transform();
    color: RgbaColor;
    
    onRestore = new Event<GridElement>();
    onDelete = new Event<GridElement>();
    onMoved = new Event<[GridElement, Vec2]>();
    onSelected = new Event<GridElement>();
    onDeselected = new Event<GridElement>();

    protected _outOfBounds: [boolean, boolean];
    protected _isActive: boolean = true;
    protected _isSelected: boolean = false;

    constructor(parent : Transform, rgbaColor: RgbaColor) {
        this.color = rgbaColor;
        this.transform.parent = parent;
    }

    get value(): number {
        return this.transform.position.x;
    };

    move(newLocalPos: Vec2) {
        this.onMoved.invoke([this, newLocalPos]);
    }

    draw(view : IViewportModule, canvas : HTMLCanvasElement) {
        this._outOfBounds = view.isOutOfViewportBounds(this.transform.position);
    }

    delete() {
        this.onDelete.invoke(this);
    }

    restore() {
        this.onRestore.invoke(this);
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get isSelected() : boolean {
        return this._isSelected;
    }

    select() {
        this._isSelected = true;
    }

    deselect() {
        this.onDeselected.invoke(this);
        this._isSelected = false;
    }

    activate() {
        this.onSelected.invoke(this);
        this._isActive = true;
    }

    deactivate() {
        this._isActive = false;
    }
}

export class TimestampPrefab {
    prefabId: number;
    color: RgbaColor;
    width = 0.2;

    private _isSelected: boolean;
    private buttonElement: JQuery<HTMLElement>;
    private diamondElement: JQuery<HTMLElement>;

    onPrefabSelected = new Event<number>();
    onPrefabDeselected = new Event<number>();

    get isSelected() {
        return this._isSelected;
    }

    constructor(id: number, color: RgbaColor) {
        this.prefabId = id;
        this.color = color;
        this.createButton();
    }

    private createButton() {
        const prefabsContainer = $('#prefabs-container');
        
        this.buttonElement = $("<div>", {id: this.prefabId, "class": "prefab-button" });
        this.diamondElement = $("<div>", {"class": "diamond-shape"});
        this.diamondElement.attr("style", `background-color:${this.color.value()}`);
        this.buttonElement.append(this.diamondElement);
        prefabsContainer.append(this.buttonElement);
        
        this.buttonElement.on("click", () => {
            if (!this._isSelected) 
                this.select(true);
        });
    }

    select(callEvent=false) {
        this._isSelected = true;
        this.buttonElement.addClass("selected");
        if (callEvent)
            this.onPrefabSelected.invoke(this.prefabId);
    }

    deselect(callEvent=false) {
        this._isSelected = false;
        this.buttonElement.removeClass("selected");
        if (callEvent)
            this.onPrefabDeselected.invoke(this.prefabId);
    }
}

export class Timestamp extends GridElement {    
    
    id: number;
    width: number;

    private _prefab: TimestampPrefab;
    private connectedTimestamps: Array<[Timestamp, number]>;
    private maxWidth = 7;
    private minWidth = 1;

    constructor(prefab: TimestampPrefab, position: Vec2, parent: Transform) {
        super(parent, prefab.color);
        this.width = prefab.width;
        this.color = prefab.color;
        this._prefab = prefab;
        this.transform.parent = parent;
        this.transform.position = position;
    }

    get prefab(): TimestampPrefab {
        return this._prefab;
    }

    set prefab(value: TimestampPrefab) {
        this._prefab = value;
        this.color = value.color;
        this.width = value.width;
    }

    get isLongTimestamp(): boolean {
        return this.connectedTimestamps != null && this.connectedTimestamps.length > 0;
    }

    draw(view: IViewportModule, canvas : HTMLCanvasElement) {
        super.draw(view, canvas)

        if (this._outOfBounds[0])
            return;

        let color = this.getColor();
        const ctx = canvas.getContext('2d');
        const pos = new Vec2(this.transform.position.x + view.position.x, this.transform.position.y + view.position.y);
        
        let width = this.getWidth();

        ctx.fillStyle = color.value();
        ctx.beginPath();
        ctx.moveTo(pos.x - width, pos.y);
        ctx.lineTo(pos.x, pos.y - width);
        ctx.lineTo(pos.x + width, pos.y);
        ctx.lineTo(pos.x, pos.y + width);
        ctx.fill();

        color = new RgbaColor(color.r, color.g, color.b, 0.6);

        width = width/2;

        this.connectedTimestamps?.forEach(element => {
            let timestamp = element[0];
            const elementPos = new Vec2(timestamp.transform.position.x + view.position.x,
                timestamp.transform.position.y + view.position.y);
            
            const directionVec = Vec2.Substract(elementPos, pos);    
            const normalVec = Vec2.Normal(directionVec).normalized;
            
            ctx.fillStyle = color.value();
            ctx.beginPath();
            ctx.moveTo(pos.x + normalVec.x * width, pos.y + normalVec.y * width);
            ctx.lineTo(elementPos.x + normalVec.x*width, elementPos.y+normalVec.y*width);
            ctx.lineTo(elementPos.x - normalVec.x*width, elementPos.y-normalVec.y*width);
            ctx.lineTo(pos.x - normalVec.x * width, pos.y - normalVec.y * width);
            ctx.fill();
            ctx.closePath();
        });
    }

    connectToTimestamp(timestamp: Timestamp) {
        if (this.connectedTimestamps == null)
            this.connectedTimestamps = new Array<[Timestamp, number]>();
        
        console.log("FUCK YEAH CONNECTED");
        let id = timestamp.onDelete.addListener((element) => this.removeConnection(element as Timestamp));
        this.connectedTimestamps.push([timestamp, id]);
    }

    removeConnection(timestamp: Timestamp) {
        let index = this.connectedTimestamps.findIndex((stamp, id) => { return stamp[0].id == timestamp.id; });
        let removed = this.connectedTimestamps.splice(index, 1);
        console.log("FUCK YEAH REMOVED");
        timestamp.onDelete.removeListener(removed[0][1]);
    }

    isConnected(timestamp: Timestamp) {
        let index = this.connectedTimestamps.findIndex((stamp, id) => { return stamp[0].id == timestamp.id; });
        return index != -1;
    }
    
    private getColor() {
        return this._isSelected ? editorColorSettings.selectedTimestampColor : this.color;
    }

    private getWidth() : number {
        let width = this.width + this.transform.scale.x/5;
        if (width > this.maxWidth)
            width = this.maxWidth;
        if (width < this.minWidth)
            width = this.minWidth;
        return width;
    }
}

export class CreatableTimestampLine extends GridElement {

    constructor(x: number, parent: Transform, color: RgbaColor) {
        super(parent, color);
        this.transform.parent = parent;
        this.transform.localPosition = new Vec2(x, 0);
    }

    draw(view: IViewportModule, canvas: HTMLCanvasElement) {
        super.draw(view, canvas)
        
        if (this._outOfBounds[0])
            return;
        
        var x = this.transform.position.x + view.position.x;
        const ctx = canvas.getContext('2d');
        const color = this._isSelected ? editorColorSettings.selectedCreatableLineColor : this.color

        ctx.beginPath();
        ctx.fillStyle = color.value();
        ctx.moveTo((x), canvas.height-10);
        ctx.lineTo((x-5), canvas.height);
        ctx.lineTo((x+5), canvas.height);
        ctx.fill();

        ctx.strokeStyle = color.value();
        ctx.moveTo(x,0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

export class TimestepLine extends GridElement {
    
    constructor(parent: Transform, color: RgbaColor) {
        super(parent, color);
    }

    draw(view : IViewportModule, canvas: HTMLCanvasElement) {
        super.draw(view, canvas)
        
        var x = this.transform.position.x + view.position.x;
        const ctx = canvas.getContext('2d');

        if (x >= canvas.width)
            x = canvas.width-5;
        if (x<=0)
            x = 0;

        ctx.beginPath();
        ctx.fillStyle = editorColorSettings.timestepLineColor.value();
        ctx.moveTo(x, 10);
        ctx.lineTo(x-5, 0);
        ctx.lineTo(x+5, 0);
        ctx.fill();

        ctx.strokeStyle = editorColorSettings.timestepLineColor.value();
        ctx.moveTo(x,0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

export class BPMLine extends GridElement {
    
    snapLines = new Array<BPMLine>();

    constructor(x : number, parent : Transform, rgbaColor: RgbaColor) {
        super(parent, rgbaColor)
        this.transform.localPosition = new Vec2(x, 0);
    }

    get value() : number {
        return this.transform.position.x;
    };

    draw(view : IViewportModule, canvas : HTMLCanvasElement) {
        super.draw(view, canvas)

        if (this._outOfBounds[0])
            return;

        if (!this.isActive)
            return;

        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = this.color.value();
        ctx.beginPath();
        ctx.moveTo(this.transform.position.x+view.position.x, 0);
        ctx.lineTo(this.transform.position.x+view.position.x, canvas.height);
        ctx.stroke();

        this.snapLines.forEach(line => { line.draw(view, canvas); });
    }

    setSnapLines(snapValue: number, distanceBetweenBpmLines) : void {
        this.snapLines = new Array<BPMLine>();
        
        const distance = distanceBetweenBpmLines/snapValue;

        for (var i = 0; i<snapValue-1; i++) {
            this.snapLines.push(new BPMLine((i+1)*distance, this.transform, editorColorSettings.snapBpmLineColor));
        }
    }
}

export class BeatLine extends GridElement {
    
    constructor(y:number, parent: Transform, rgbaColor: RgbaColor) {
        super(parent, rgbaColor)
        this.transform.localPosition = new Vec2(0,y)
    }

    draw(view: IViewportModule, canvas : HTMLCanvasElement) {
        super.draw(view, canvas)
       
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = this.color.value();
        ctx.beginPath();
        ctx.moveTo(0, this.transform.position.y);
        ctx.lineTo(canvas.width, this.transform.position.y);
        ctx.stroke();
    }
}