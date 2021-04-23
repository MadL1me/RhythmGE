import {Transform} from "./Transform";
import {Vec2} from "./Vec2";
import {IEditorModule, IEditorCore} from "./Editor";

import $ from 'jquery';
import { Input } from "./Input";

export interface IViewportModule extends IEditorModule {
    position: Vec2;
    isOutOfViewportBounds(position: Vec2) : boolean;
    canvasToSongTime(canvCoords: Vec2) : Vec2;
}

export class ViewportModule implements IViewportModule {
    
    private _canvas: HTMLCanvasElement;
    private editor: IEditorCore;

    transform = new Transform(); 
    maxDeviation: Vec2 = new Vec2(10,100);

    constructor(parent) {
        this._canvas = $("#editor-canvas")[0] as HTMLCanvasElement;
        this.transform.parent = parent;
        this.transform.position = new Vec2(100, 0);
        Input.onCanvasWheel.addListener((event) => { this.onCanvasScroll(event);});
    }

    private onCanvasScroll(event) {
        const isSpeededUp = Input.keysPressed["ShiftLeft"] == true;
        let mouseDelta = event.deltaY;

        if (this.editor.editorData.followLine.value)
            return;

        let resultedDelta = mouseDelta * this.editor.editorData.scrollingSpeed.value / this.transform.scale.x;
        if (isSpeededUp)
            resultedDelta *= this.editor.editorData.fastScrollingSpeed.value;

        this.transform.localPosition = new Vec2(this.transform.localPosition.x + resultedDelta, this.position.y);

        if (this.transform.localPosition.x > this.maxDeviation.x)
            this.transform.localPosition = new Vec2(this.maxDeviation.x, this.position.y);
    }

    get position() : Vec2 {
        return this.transform.position;
    }

    set position(pos: Vec2) {
        this.transform.position = pos; 
    }

    init(editorCore: IEditorCore) { this.editor = editorCore; }
    updateModule() {}

    canvasToSongTime(canvasCoords : Vec2) : Vec2 {
        const pos = this.transform.position;
        return new Vec2((canvasCoords.x - pos.x),
                        (canvasCoords.y - pos.y));
    }  

    isOutOfViewportBounds(position: Vec2) : boolean {
        const rightPos = new Vec2(this.transform.position.x+this._canvas.width,
            this.transform.position.y+this._canvas.height);
        
        return position.x < this.transform.position.x 
        || position.y < this.transform.position.y 
        || position.x > rightPos.x 
        || position.y > rightPos.y;
    }
}