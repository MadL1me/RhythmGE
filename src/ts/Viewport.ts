import {Transform} from "./Transform";
import {Vec2} from "./Vec2";

import $ from 'jquery';

export class Viewport {
    
    transform = new Transform(); 
    maxDeviation: Vec2 = new Vec2(10,100);
    gridTransform: Transform;
    editorCanvas: HTMLCanvasElement;

    constructor(editorCanvas){
        this.editorCanvas = editorCanvas;
    }

    get position() {
        return this.transform.position;
    }

    set position(value : Vec2) {
        console.log(value);
        this.transform.position = value;
        console.log(this.transform.position);
    }

    worldToCanvas(worldCoords : Vec2) : Vec2 {
        const pos = this.position;
        return new Vec2(pos.x - worldCoords.x/this.gridTransform.scale.x,
                        pos.y - worldCoords.y/this.gridTransform.scale.y);
    }

    canvasToWorld(canvasCoords : Vec2) : Vec2 {
        const pos = this.position;
        return new Vec2((pos.x - canvasCoords.x) / this.gridTransform.scale.x, 
            (pos.y - canvasCoords.y) / this.gridTransform.scale.y);
    }

    canvasToSongTime(canvasCoords : Vec2) : Vec2 {
        const pos = this.position;
        return new Vec2((canvasCoords.x - pos.x),
                        (canvasCoords.y - pos.y));
    }  

    outOfCanvasBounds(position: Vec2, canvas: HTMLCanvasElement) : boolean {
        const rightPos = new Vec2(this.transform.position.x+canvas.width,this.transform.position.y+canvas.height);
        
        return position.x < this.transform.position.x 
        || position.y < this.transform.position.y 
        || position.x > rightPos.x 
        || position.y > rightPos.y;
    }
}