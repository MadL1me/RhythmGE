import $ from 'jquery';
import { RgbaColor } from "../Utils/RgbaColor";
import { Vec2 } from "../Utils/Vec2";
import { Transform } from "../Transform";
import { BPMLine, BeatLine } from "../GridElements";
import { editorColorSettings } from "../Utils/AppSettings";
import { Input } from "../Input";
import { Utils, Func } from "../Utils/Utils";
import { IEditorModule, IEditorCore } from '../Editor';



export class EditorGrid implements IEditorModule {

    private _canvas: HTMLCanvasElement;

    bpmLines = new Array<BPMLine>();
    beatLines = new Array<BeatLine>();
    transform = new Transform();

    private beatLinesRange = new Vec2(1, 20);
    private bpmRange = new Vec2(1, 10000);
    private editorCore: IEditorCore;

    constructor() {
        this._canvas = $("#editor-canvas")[0] as HTMLCanvasElement;
        this.transform = new Transform();
        this.transform.localScale = new Vec2(1, 1);
        //this.initGrid();
    }

    init(editorCoreModules: IEditorCore) {
        this.editorCore = editorCoreModules;
        this.subscribeOnEvents();
    }

    private subscribeOnEvents() {
        Input.onWindowResize.addListener(() => { this.onWindowResize(); });
        this.editorCore.editorData.offset.onValueChange.addListener((value) => { this.setOffsetValue(value); });
        this.editorCore.editorData.snapValue.onValueChange.addListener((value) => { this.setSnapValue(value); });
        this.editorCore.editorData.bpmValue.onValueChange.addListener((value) => { this.setBpmValue(value); });
        this.editorCore.editorData.beatLinesCount.onValueChange.addListener((value) => { this.setBeatLinesCount(value); });
        this.editorCore.audio.onAudioLoaded.addListener(() => { this.onAudioLoad(); });
    }

    private onAudioLoad() {
        console.log("audio loaded");
        this.initGrid();
        this.initBpmLines();
    }

    private onWindowResize() {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight - this._canvas.parentElement.offsetTop - 10;

        var div = this._canvas.parentElement;
        div.setAttribute('style', 'height:' + (h * 0.95).toString() + 'px');
        var info = this._canvas.parentElement.getBoundingClientRect();

        this._canvas.setAttribute('width', (info.width).toString());
        this._canvas.setAttribute('height', (info.height / 4 * 3).toString());

        this.initGrid();
        //this.initBpmLines();
    }

    updateModule() {
        this.onWindowResize();
        const ctx = this._canvas.getContext("2d");
        ctx.fillStyle = editorColorSettings.editorBackgroundColor.value();
        ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        this.beatLines.forEach(beatLine => {
            if (beatLine.isActive)
                beatLine.draw(this.editorCore.viewport, this._canvas);
        });

        if (!this.editorCore.editorData.hideBpmLines.value && this.editorCore.audio.isAudioLoaded()) {
            var soundLength = this.editorCore.audio.duration();
            var bpmCount = (soundLength / 60) * this.editorCore.editorData.bpmValue.value;
            var pixelsPerBeat = soundLength / bpmCount;

            this.bpmLines.forEach(bpmLine => {
                if (bpmLine.isActive)
                    bpmLine.draw(this.editorCore.viewport, this._canvas);
            });
        }
    }

    distanceBetweenBpmLines() {
        var soundLength = this.editorCore.audio.duration();
        var bpmCount = (soundLength / 60) * this.editorCore.editorData.bpmValue.value;
        var pixelsPerBeat = soundLength / bpmCount;
        return pixelsPerBeat;
    }

    distanceBetweenBeatLines() {
        return (this._canvas.height) / (this.editorCore.editorData.beatLinesCount.value + 1);
    }

    private setSnapValue(val: number) {
        console.log(val);
        const distance = this.distanceBetweenBpmLines();

        this.bpmLines.forEach(line => {
            line.setSnapLines(val, distance);
        });
    }

    private setBpmValue(value: number) {
        //var bpm = parseInt(event.target.value);
        let bpm = value;

        bpm < this.bpmRange.x ? bpm = this.bpmRange.x : bpm = bpm;
        bpm > this.bpmRange.y ? bpm = this.bpmRange.y : bpm = bpm;

        this.initBpmLines();
        console.log(bpm);
    }

    private setBeatLinesCount(value: number) {
        //var beatLines = parseInt(event.target.value);
        let beatLines = value;

        beatLines < this.beatLinesRange.x ? beatLines = this.beatLinesRange.x : beatLines = beatLines;
        beatLines > this.beatLinesRange.y ? beatLines = this.beatLinesRange.y : beatLines = beatLines;

        this.initGrid();
    }

    private setOffsetValue(value: number) {
        const offset = value;
        this.transform.localPosition = new Vec2(offset / 1000, this.transform.localPosition.y);
    }

    getGridSize(): Vec2 {
        return new Vec2(this.editorCore.editorData.bpmValue.value, this.editorCore.editorData.beatLinesCount.value);
    }

    initGrid() {
        this.transform.parent.scale = new Vec2(this.transform.parent.scale.x, this.distanceBetweenBeatLines());
        for (var i = 0; i < this.editorCore.editorData.beatLinesCount.value; i++) {
            if (i + 1 > this.beatLines.length) {
                var beatLine = new BeatLine((i + 1), this.transform, editorColorSettings.beatLineColor);
                this.beatLines.push(beatLine);
            }
            this.beatLines[i].activate();
        }
        for (var i = this.editorCore.editorData.beatLinesCount.value; i < this.beatLines.length; i++) {
            this.beatLines[i].deactivate();
        }
    }

    initBpmLines() {
        if (!this.editorCore.audio.isAudioLoaded())
            return;

        console.log("init BPM");
        this.bpmLines = [];
        var soundLength = this.editorCore.audio.duration();
        var bpmCount = (soundLength / 60) * this.editorCore.editorData.bpmValue.value;

        for (var i = 0; i < bpmCount; i++) {
            var color: RgbaColor;

            if (i % 2 == 0) {
                color = editorColorSettings.mainBpmLineColorStrong;
            }

            else
                color = editorColorSettings.mainBpmLineColorWeak;

            var bpmLine = new BPMLine(i * this.distanceBetweenBpmLines(), this.transform, color);
            this.bpmLines.push(bpmLine);
        }

        console.log(this.distanceBetweenBpmLines());
        console.log(this.bpmLines.length);
    }

    findClosestBeatLine(canvasCoords: Vec2): BeatLine {
        const beatlinesCanvasDistance = this.distanceBetweenBeatLines();
        let beatlineIndex = Math.round(canvasCoords.y / beatlinesCanvasDistance) - 1;
        if (beatlineIndex < 0)
            beatlineIndex = 0;
        if (beatlineIndex > this.editorCore.editorData.beatLinesCount.value - 1)
            beatlineIndex = this.editorCore.editorData.beatLinesCount.value - 1;

        return this.beatLines[beatlineIndex];
    }

    findClosestBpmLine(worldPos: number) {
        if (this.bpmLines.length < 1)
            return;

        let getClosestBpm = () => {
            if (this.bpmLines.length - 1 > closestBpmIndex
                && Math.abs(this.bpmLines[closestBpmIndex + 1].value - worldPos) <
                Math.abs(this.bpmLines[closestBpmIndex].value - worldPos))
                closestBpm = this.bpmLines[closestBpmIndex + 1];
        };

        let closestBpmIndex = Utils.binaryNearestSearch(this.bpmLines, worldPos, Func.Floor);
        let closestBpm = this.bpmLines[closestBpmIndex];

        if (closestBpm.snapLines.length < 1) {
            getClosestBpm();
            return closestBpm;
        }

        let closestBpmSnapIndex = Utils.binaryNearestSearch(closestBpm.snapLines, worldPos);
        let closestBpmSnap = closestBpm.snapLines[closestBpmSnapIndex];

        getClosestBpm();

        if (closestBpmSnap != null && closestBpmSnap != undefined && Math.abs(worldPos - closestBpm.transform.position.x) >
            Math.abs(worldPos - closestBpmSnap.transform.position.x))
            return closestBpmSnap;

        else
            return closestBpm;
    }
}
