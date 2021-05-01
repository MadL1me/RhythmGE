import {Transform} from "../Transform";
import {Vec2} from "../Utils/Vec2";
import {IEditorModule, IEditorCore} from "../Editor";

import $ from 'jquery';
import { Input } from "../Input";

export interface IViewportModule extends IEditorModule {
    position: Vec2;
    isOutOfViewportBounds(position: Vec2) : [boolean, boolean];
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
        Input.onWheelCanvas.addListener((event) => { this.onCanvasScroll(event);});
    }

    private onCanvasScroll(event) {
        if (Input.keysPressed["ControlLeft"])
            return;
        
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
    
        console.log(this.transform.localPosition);
    }

    get position() : Vec2 {
        return this.transform.position;
    }

    set position(pos: Vec2) {
        this.transform.position = pos; 
    }

    init(editorCore: IEditorCore) { this.editor = editorCore; }
    
    updateModule() {
       //console.log(this.transform.position);
    }

    canvasToSongTime(canvasCoords : Vec2) : Vec2 {
        const pos = this.transform.position;
        return new Vec2((canvasCoords.x - pos.x),
                        (canvasCoords.y - pos.y));
    }  

    isOutOfViewportBounds(position: Vec2) : [boolean,boolean] {
        const objectPos = Vec2.Sum(position, this.position);
        return [objectPos.x < 0 || objectPos.x > this._canvas.width,
                objectPos.y < 0 || objectPos.y > this._canvas.height];
    }
}