import { Transform } from "./Transform";
import { RgbaColor } from "./RgbaColor";
import { Viewport } from "./Viewport";
import { Vec2 } from "./Vec2";
import { appSettings } from "./AppSettings";

export abstract class GridElement {
    
    transform: Transform = new Transform();
    isActive: boolean = true;
    color: RgbaColor;

    constructor(parent : Transform, rgbaColor: RgbaColor) {
        this.color = rgbaColor;
        this.transform.parent = parent;
    }

    abstract draw(view : Viewport, canvas : HTMLCanvasElement);

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }
}

export class Timestamp {    
    
    id: number;
    transform: Transform = new Transform();
    width: number;
    color: RgbaColor;

    constructor(color: RgbaColor, x : number, y : number, width : number, parent: Transform) {
        this.width = width;
        this.transform.parent = parent;
        this.transform.localPosition = new Vec2(x,y);
        this.color = color;
    }

    draw(canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        const pos = new Vec2(this.transform.position.x, this.transform.position.y);
        const width = this.width*this.transform.parent.localScale.x;
        ctx.fillStyle = this.color.value();
        ctx.beginPath();
        ctx.moveTo(pos.x - width, pos.y);
        ctx.lineTo(pos.x, pos.y - width);
        ctx.lineTo(pos.x + width, pos.y);
        ctx.lineTo(pos.x, pos.y + width);
        ctx.fill();
    }
}

export class CreatableTimestampLine extends GridElement {

    constructor(x: number, parent: Transform, color: RgbaColor) {
        super(parent, color);
        this.transform.parent = parent;
        this.transform.position = new Vec2(x, 0);
    }

    draw(view: Viewport, canvas: HTMLCanvasElement) {
        var x = this.transform.position.x + view.position.x;
        const ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.fillStyle = this.color.value();
        ctx.moveTo((x), canvas.height-10);
        ctx.lineTo((x-5), canvas.height);
        ctx.lineTo((x+5), canvas.height);
        ctx.fill();

        ctx.strokeStyle = this.color.value();
        ctx.moveTo(x,0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

export class TimestepLine extends GridElement {
    
    constructor(parent: Transform, color: RgbaColor) {
        super(parent, color);
    }

    draw(view : Viewport, canvas: HTMLCanvasElement) {
        var x = this.transform.position.x + view.position.x;
        const ctx = canvas.getContext('2d');

        if (x >= canvas.width)
            x = canvas.width-5;
        if (x<=0)
            x = 0;

        ctx.beginPath();
        ctx.fillStyle = appSettings.timestepLineColor.value();
        ctx.moveTo(x, 10);
        ctx.lineTo(x-5, 0);
        ctx.lineTo(x+5, 0);
        ctx.fill();

        ctx.strokeStyle = appSettings.timestepLineColor.value();
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

    draw(view : Viewport, canvas : HTMLCanvasElement) {
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
            this.snapLines.push(new BPMLine((i+1)*distance, this.transform, appSettings.snapBpmLineColor));
        }
    }
}

export class BeatLine extends GridElement {
    
    constructor(y:number, parent: Transform, rgbaColor: RgbaColor) {
        super(parent, rgbaColor)
        this.transform.localPosition = new Vec2(0,y)
    }

    draw(view: Viewport, canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = this.color.value();
        ctx.beginPath();
        ctx.moveTo(0, this.transform.position.y);
        ctx.lineTo(canvas.width, this.transform.position.y);
        ctx.stroke();
    }
}