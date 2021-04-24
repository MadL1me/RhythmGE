import { Transform } from "./Transform";
import { RgbaColor } from "./RgbaColor";
import { IViewportModule } from "./Viewport";
import { Vec2 } from "./Vec2";
import { editorColorSettings } from "./AppSettings";

import $ from 'jquery';

export interface IDrawable {
    draw(view: IViewportModule, canvas: HTMLCanvasElement);
}

export abstract class GridElement implements IDrawable {
    
    transform: Transform = new Transform();
    isActive: boolean = true;
    color: RgbaColor;

    constructor(parent : Transform, rgbaColor: RgbaColor) {
        this.color = rgbaColor;
        this.transform.parent = parent;
    }

    draw(view : IViewportModule, canvas : HTMLCanvasElement) {
        if (view.isOutOfViewportBounds(this.transform.position)) {
            return;
        }
    }

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }
}

export class Timestamp extends GridElement {    
    
    id: number;
    width: number;

    private maxWidth = 7;
    private minWidth = 1;

    constructor(color: RgbaColor, localPosition: Vec2, width : number, parent: Transform) {
        super(parent, color);
        this.width = width;
        this.transform.parent = parent;
        this.transform.localPosition = localPosition;
        this.color = color;
    }

    draw(view: IViewportModule, canvas : HTMLCanvasElement) {
        super.draw(view, canvas)
        
        const ctx = canvas.getContext('2d');
        const pos = new Vec2(this.transform.position.x + view.position.x,
        this.transform.position.y + view.position.y);
        
        let width = this.width + this.transform.scale.x/5;
        if (width > this.maxWidth)
            width = this.maxWidth;
        if (width < this.minWidth)
            width = this.minWidth;

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
        this.transform.localPosition = new Vec2(x, 0);
    }

    draw(view: IViewportModule, canvas: HTMLCanvasElement) {
        super.draw(view, canvas)
        
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

    draw(view : IViewportModule, canvas : HTMLCanvasElement) {
        super.draw(view, canvas)

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