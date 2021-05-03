import $ from 'jquery';
import { Vec2 } from "../Utils/Vec2";
import { Transform } from "../Transform";
import { TimestepLine } from "../GridElements";
import { editorColorSettings } from "../Utils/AppSettings";
import { IEditorModule, IEditorCore } from '../Editor';


export class TimestepLineModule implements IEditorModule {
    transform = new Transform();

    private editor: IEditorCore;
    private timestepLine = new TimestepLine(this.transform, editorColorSettings.timestepLineColor);
    private canvas: HTMLCanvasElement;

    constructor() {
        this.canvas = $("#editor-canvas")[0] as HTMLCanvasElement;
    }

    init(editorCoreModules: IEditorCore) {
        this.editor = editorCoreModules;
        this.editor.audio.onSeek.addListener(() => { this.setLinePosition(); this.timestepLine.draw(this.editor.viewport, this.canvas);});
    }

    updateModule() {
        if (this.editor.audio.isPlaying()) {
            this.setLinePosition();
        }

        this.timestepLine.draw(this.editor.viewport, this.canvas);
    }

    private setLinePosition() {
        this.timestepLine.transform.localPosition = new Vec2(this.editor.audio.seek(), 0);

        if (this.editor.editorData.followLine.value) {
            const result = new Vec2(-this.timestepLine.transform.position.x + this.canvas.width / 2, 0);
            this.editor.viewport.transform.position = result;
        }
    }
}
