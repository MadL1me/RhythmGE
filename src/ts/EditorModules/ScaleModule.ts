import { IEditorCore, IEditorModule } from "../Editor";
import { Transform } from "../Transform";

import $ from "jquery";

abstract class Scale {
    width: number;
   
    constructor(width : number) {
        this.width = width;
    }

    abstract draw(canvas : HTMLCanvasElement);
}

export class TopScale extends Scale implements IEditorModule {
    
    transform = new Transform();
   
    private editorCore: IEditorCore;
    private canvas: HTMLCanvasElement;

    constructor(width: number) {
        super(width);
        this.canvas = $("#editor-canvas")[0] as HTMLCanvasElement;
    }

    init(editorCoreModules: IEditorCore) {
        this.editorCore = editorCoreModules;
    }

    updateModule() {
        this.draw(this.canvas);
    }
    
    draw(canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1B1C21';
        ctx.fillRect(0,-5,canvas.width,this.width+5);
    }
}