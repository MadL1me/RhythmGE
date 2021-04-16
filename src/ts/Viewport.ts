import {Transform} from "./Transform";
import {Vec2} from "./Vec2";

import $ from 'jquery';

export class Viewport {
    
    transform = new Transform(); 
    maxDeviation: Vec2 = new Vec2(10,100);
    gridTransform: Transform;

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

    canvasToWorld2(canvasCoords : Vec2) : Vec2 {
        const pos = this.position;
        return new Vec2((pos.x - canvasCoords.x), 
                        (pos.y - canvasCoords.y));
    }


    canvasToSongTime(canvasCoords : Vec2) : Vec2 {
        const pos = this.position;
        return new Vec2((canvasCoords.x - pos.x),
                        (canvasCoords.y - pos.y));
    }  
}