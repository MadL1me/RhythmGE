import $ from 'jquery';
import { Transform } from "../Transform";
import { editorColorSettings } from "../Utils/AppSettings";
import { Input } from "../Input";
import { IEditorModule, IEditorCore } from '../Editor';

export class VisualiserEditorModule implements IEditorModule {

    transform = new Transform();
    private editor: IEditorCore;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private spectrumData: Uint8Array;
    private displayData = new Uint8Array();

    private readonly sampleRate = 48000;
    private divideValue = 20;
    private samplesPerArrayValue = this.sampleRate / this.divideValue;

    constructor() {
        this.canvas = $("#visualiser-canvas")[0] as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d");
    }

    init(editorCoreModules: IEditorCore) {
        this.editor = editorCoreModules;
        Input.onWindowResize.addListener(() => { this.onWindowResize(); });
        this.editor.audio.onPlay.addListener(() => { this.onAudioLoad(); });
    }

    onAudioLoad() {
        //this.spectrumData = this.editor.audio.getSpectrumData();
        this.displayData = this.editor.audio.getSpectrumData();
        this.calculateDisplayDataArray();
    }

    private calculateDisplayDataArray() {
    }

    updateModule() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = editorColorSettings.editorBackgroundColor.value();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.displayData == undefined || this.displayData == null)
            return;

        if (this.spectrumData == undefined || this.spectrumData == null) {
            this.spectrumData = this.displayData;
            return;
        }

        const view = this.editor.viewport;

        this.onAudioLoad();

        let barHeight;
        let gap = 1; //- gap * this.displayData.length
        let barWidth = ((this.canvas.width) / (this.displayData.length - 10)) * 1;
        let x = 0;

        for (var i = 0; i < this.displayData.length - 10; i++) {
            barHeight = this.displayData[i] / 600 * this.canvas.height + 2 * (this.displayData[i] - this.spectrumData[i]);

            this.ctx.fillStyle = editorColorSettings.creatableTimestampLineColor.value();
            this.ctx.fillRect(x, this.canvas.height, barWidth, -barHeight);

            x += barWidth + gap;
        }

        this.spectrumData = this.displayData;
    }

    private onWindowResize() {
        var div = this.canvas.parentElement;
        //div.setAttribute('style', 'height:' + (h * 0.6).toString() + 'px');
        var info = this.canvas.parentElement.getBoundingClientRect();

        this.canvas.setAttribute('width', (info.width).toString());
        this.canvas.setAttribute('height', (info.height * 0.7).toString());
    }
}
