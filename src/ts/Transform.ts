import { Vec2 } from "./Vec2";

import $ from 'jquery';

export class Transform {

    private _parent: Transform = null;
    private _children: Array<Transform> = new Array<Transform>();
    private _localPosition: Vec2 = new Vec2(0,0);
    private _localScale: Vec2 = new Vec2(1,1);

    maxScale: Vec2 = new Vec2(1000, 1);
    minScale: Vec2 = new Vec2(1, 1);

    constructor(localPosition: Vec2 = new Vec2(0,0), parent = null) {
        this._parent = parent;
        this._localPosition = localPosition;
    }

    worldToCanvas(worldCoords : Vec2) : Vec2 {
        const pos = this.position;
        return new Vec2(pos.x - worldCoords.x/this.scale.x,
                        pos.y - worldCoords.y/this.scale.y);
    }

    canvasToLocal(canvasCoords : Vec2) : Vec2 {
        const pos = this.position;
        return new Vec2(-1*(canvasCoords.x/this.scale.x - this.position.x/this.scale.x), 1);
    }
    
    canvasToWorld(canvasCoords: Vec2) : Vec2 { 
        const pos = this.position;
        return new Vec2((canvasCoords.x - pos.x), canvasCoords.y - pos.y);
    }

    get localPosition() : Vec2 {
        return this._localPosition;
    }

    set localPosition(value: Vec2) {
        this._localPosition = value;
    }

    get localPositionInParent() {
        if (this._parent == null)
            return this.localPosition;
        return Vec2.Sum(this.parent.localPosition, Vec2.Multiply(this.localPosition, this.parent.localScale));
    }    

    get position() : Vec2 {
        if (this._parent == null)
            return this._localPosition;
        return Vec2.Sum(Vec2.Multiply(this._localPosition, this._parent.scale), this._parent.position);
    }

    set position(value: Vec2) {
        if (this._parent == null) {
            this.localPosition = value;
            return;
        }
        
        var pos = Vec2.Substract(value, this.parent.position);
        this.localPosition = Vec2.Divide(pos, this._parent.scale);
    } 

    get scale() {
        if (this._parent == null)
            return this._localScale;
        
        return Vec2.Multiply(this._localScale, this._parent.scale);
    }
    
    set scale(value: Vec2) {
        if (this._parent == null) {
            this.localScale = value;
            return;
        }
        
        this.localScale = Vec2.Divide(this._parent.scale, value);
    } 

    get localScale() {
        return this._localScale;
    }

    set localScale(value) {
        this._localScale = value;
    }

    get parent() {
        return this._parent;
    }

    set parent(parent : Transform) {
        
        if (parent == null && this._parent != null) {
            this._parent.removeChild(this);
            this._parent = parent;
            return;
        }

        this._parent = parent;
        this._parent?.addChild(this);
        this.position = this.localPosition;
    }

    private addChild(child : Transform) : void {
        this._children.push(child);
    }

    private removeChild(child : Transform) : void {
        let index = this._children.indexOf(child);
        if(index !== -1) {
            this._children.splice(index, 1);
        }
    }

}