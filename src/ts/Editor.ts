import { throws } from 'node:assert';
import { format } from 'node:path';
import { off } from 'node:process';

import $ from 'jquery';

import { RgbaColor } from "./RgbaColor";
import { Vec2 } from "./Vec2";
import { Transform } from "./Transform";
import { TopScale, LeftScale, BottomScale } from "./Scale";
import { BPMLine, CreatableTimestampLine, Timestamp, TimestepLine, BeatLine, GridElement, IDrawable } from "./GridElements";
import { ViewportModule, IViewportModule } from "./Viewport";
import { editorColorSettings } from "./AppSettings";
import { Input } from "./Input";
import { Slider, Utils, Event } from "./Utils";
import { AudioAmplitudeViewModule, AudioModule, IAudioModule } from "./Audio";

export interface IEditorCore {
    transform: Transform;
    audio : IAudioModule;
    viewport: IViewportModule;
    editorData: EditorData;
}

export interface IEditorModule {
    transform: Transform;
    init(editorCoreModules: IEditorCore)
    updateModule();
}

class EventVar<T> {
    private _value: T;

    readonly onValueChange = new Event<T>();

    constructor(initialValue: T) {
        this._value = initialValue;
    }

    get value() {
        return this._value;
    }

    set value(value: T) {
        this._value = value;
        this.onValueChange.invoke(value);
    }
}

export class EditorData {
    private snapSlider = new Slider('snap-lines');
    private playbackSpeedSlider = new Slider('playback-rate');
    
    readonly useClaps = new EventVar<boolean>(false);
    readonly followLine = new EventVar<boolean>(false);
    readonly hideBpmLines = new EventVar<boolean>(false);
    readonly hideCreatableLines = new EventVar<boolean>(false);
    
    readonly scrollingSpeed = new EventVar<number>(0.2);
    readonly resizingSpeed = new EventVar<number>(0.01);
    readonly fastScrollingSpeed = new EventVar<number>(5);
    readonly offset = new EventVar<number>(0);
    readonly bpmValue = new EventVar<number>(60);
    readonly beatLinesCount = new EventVar<number>(5);
    readonly snapValue = new EventVar<number>(0);
    readonly playbackRate = new EventVar<number>(1);

    readonly audioFile = new EventVar<[string, string]>(null);

    constructor() {
        $('#files').on('change', (event) => { this.onAudioLoad(event); });

        $('#follow-line').on('change', (event) => { this.followLine.value = (event.target as HTMLInputElement).checked; })
        $('#use-claps').on('change', (event) => { this.useClaps.value = (event.target as HTMLInputElement).checked; })
        $('#hide-bpm').on('change', (event) => { this.hideBpmLines.value = (event.target as HTMLInputElement).checked;})
        $('#hide-creatable').on('change', (event) => { this.hideCreatableLines.value = (event.target as HTMLInputElement).checked;})
        $('#beat-lines').on('change', (event) => { this.beatLinesCount.value = parseInt((event.target as HTMLInputElement).value);})
        $('#bpm').on('change', (event) => { this.bpmValue.value = parseInt((event.target as HTMLInputElement).value); })
        $('#offset').on('change', (event) => { this.offset.value = parseInt((event.target as HTMLInputElement).value);})
    
        this.playbackSpeedSlider.value = 1;
        this.snapSlider.value = 1;
        
        this.playbackSpeedSlider.onValueChange.addListener((value) => { this.onPlaybackRateValueChange(value); });
        this.snapSlider.onValueChange.addListener((value) => { this.onSnapSliderValueChange(value); });
    }

    private onAudioLoad(event) {
        const files = event.target.files;
        const  file = files[0];

        this.audioFile.value = [file.name, file.path];
        console.log(files[0]);
    }

    private onPlaybackRateValueChange(value: number) {
        $('#playback-rate-text')[0].innerText =  'Playback rate ' + value.toString() + 'x';
        this.playbackRate.value = value;
    }

    private onSnapSliderValueChange(value: number) {
        value = Math.pow(2, value);
        $('#snap-lines-text')[0].innerText = 'Snap lines 1/' + value.toString();
        this.snapValue.value = value;
    }
} 

export class Editor implements IEditorCore {
    transform = new Transform();
    
    viewport = new ViewportModule(this.transform);
    editorData = new EditorData();
    audio = new AudioModule();

    private editorModules = new Array<IEditorModule>();
    private editorCanvas: HTMLCanvasElement;

    constructor() {
        this.viewport.init(this);
        this.audio.init(this);
        this.editorCanvas = $("#editor-canvas")[0] as HTMLCanvasElement;
        this.transform.scale = new Vec2(10, 1);
        this.update();
    }

    addEditorModule(element: IEditorModule) {
        this.editorModules.push(element)
    }

    update() {
        Input.update();
        this.audio.updateModule();

        console.log("ABC");

        const ctx = this.editorCanvas.getContext("2d");
        ctx.fillStyle = "green";
        ctx.fillRect(0, 0, this.editorCanvas.width, this.editorCanvas.height)

        for(let i = 0; i<this.editorModules.length; i++) {
            this.editorModules[i].updateModule();
        }
    }

    onPlayButtonClick(playBtn) {
        playBtn.classList.add('paused');

        if (this.audio.isPlaying() == true) {
            playBtn.classList.remove('paused');
            this.audio.pause();
        }
        else {
            this.audio.play();
        }
    }

    onCanvasScroll(mouseDelta: number, isSpeededUp: boolean) {
        if (this.editorData.followLine)
            return;

        var resultedDelta = mouseDelta * this.editorData.scrollingSpeed.value / this.transform.scale.x;
        if (isSpeededUp)
            resultedDelta *= this.editorData.fastScrollingSpeed.value;

        this.viewport.transform.localPosition = new Vec2(this.viewport.transform.localPosition.x + resultedDelta, this.viewport.position.y);

        if (this.viewport.transform.localPosition.x > this.viewport.maxDeviation.x)
            this.viewport.transform.localPosition = new Vec2(this.viewport.maxDeviation.x, this.viewport.position.y);

        this.update();
    }

    onChangeScale(mouseDelta: number) {
        var resultedDelta = mouseDelta * this.editorData.resizingSpeed.value;
        var oldScale = this.transform.scale.x;

        const canvCenter = this.viewport.canvasToSongTime(new Vec2(this.editorCanvas.width / 2, 0));

        this.transform.scale = new Vec2(this.transform.scale.x - resultedDelta, this.transform.scale.y);
        var scaleIsChanged = true;

        if (this.transform.scale.x <= this.transform.minScale.x) {
            this.transform.scale = new Vec2(this.transform.minScale.x, this.transform.scale.y);
            scaleIsChanged = false;
        }
        if (this.transform.scale.x >= this.transform.maxScale.x) {
            this.transform.scale = new Vec2(this.transform.maxScale.x, this.transform.scale.y);
            scaleIsChanged = false;
        }

        this.viewport.position = Vec2.Substract(new Vec2(this.editorCanvas.width / 2, 0), canvCenter);
        this.update();
    }
}

class TimestepLineModule implements IEditorModule {
    transform = new Transform();
    
    private editor: IEditorCore;
    private timestepLine = new TimestepLine(this.transform, editorColorSettings.timestepLineColor);
    private canvas: HTMLCanvasElement;

    constructor() {
        this.canvas = $("#editor-canvas")[0] as HTMLCanvasElement;
    }

    init(editorCoreModules: IEditorCore) {
        this.editor = editorCoreModules;
    }

    updateModule() {
        if (this.editor.audio.isPlaying()) {
            this.timestepLine.transform.localPosition = new Vec2(this.editor.audio.seek(), 0);

            if (this.editor.editorData.followLine) {
                const result = new Vec2(-this.timestepLine.transform.position.x + this.canvas.width / 2, 1);
                this.editor.viewport.transform.position = result;
            }
        }
    }
}

// class PhantomTimestampModule implements IEditorModule {

// }

class CreatableLinesModule implements IEditorModule {
    
    transform = new Transform();
    creatableLines = new Map<number, CreatableTimestampLine>();

    init(editorCoreModules: IEditorCore) {
        throw new Error('Method not implemented.');
    }
    
    updateModule() {
        
    }

    findClosestCreatableLine(positionX: number) {
        const objectsArr = Object.keys(this.creatableLines);
        objectsArr.forEach(el => {
            console.log(el);   
        })
        const indexOfElement = Utils.binaryNearestSearch(objectsArr, positionX);
        const closestCreatable = this.creatableLines[objectsArr[indexOfElement]];
        return closestCreatable; 
    }

    createCustomBpmLine() {
        console.log('Custom bpm line created');
        var xPos = this.transform.position.x;
        var line = new CreatableTimestampLine(xPos, this.transform, editorColorSettings.creatableTimestampLineColor);
        this.creatableLines[line.transform.localPosition.x] = line;
    }

}

class TimestampPrefab {
    prefabId: number;
    color: RgbaColor;

    constructor(id: number, color: RgbaColor) {
        this.prefabId = id;
        this.color = color;
    }
}

class TimestampsModule implements IEditorModule {

    transform = new Transform();

    private static nextPrefabId = 0;
    private selectedPrefabId = 0;
    private idToPrefab = new Map<number, TimestampPrefab>();
    private timestamps = new Map<number, Map<number, Timestamp>>();
    private phantomTimestamp: Timestamp;
    private canvas: HTMLCanvasElement;
    
    private editorCore: IEditorCore;
    private editorGrid: EditorGrid;

    constructor(editorGrid: EditorGrid) {
        this.editorGrid = editorGrid;
        const defaultPrefab = this.createTimestampPrefab(new RgbaColor(0, 255, 26));
        this.canvas = $("#editor-canvas")[0] as HTMLCanvasElement;
        this.idToPrefab[defaultPrefab.prefabId] = defaultPrefab;
    }

    init(editorCoreModules: IEditorCore) {
        this.editorCore = editorCoreModules;
    }

    registerTimestampPrefab(timestampPrefab: TimestampPrefab) {
        this.idToPrefab[timestampPrefab.prefabId] = timestampPrefab;
    }

    selectPrefab(id: number) {
        this.selectedPrefabId = id;
    }

    getSelectedPrefab() : TimestampPrefab {
        return this.idToPrefab[this.selectedPrefabId];
    }

    onCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        const click = new Vec2(clickX, clickY);
        let worldClickPos = this.transform.canvasToWorld(click);
        worldClickPos = new Vec2(-1*worldClickPos.x,-1*worldClickPos.y)
    
        let closestBeatline = this.editorGrid.findClosestBeatLine(click);
        let closestObjects = new Array<GridElement>();

        if (!this.editorCore.editorData.hideBpmLines && this.editorGrid.bpmLines.length > 0) {
            closestObjects.push(this.editorGrid.findClosestBpmLine(worldClickPos.x));
        }

        // if (!this.editorCore.editorData.hideCreatableLines && Object.keys(this.creatableLines).length > 0) {
        //     closestObjects.push(this.editorGrid.findClosestCreatableLine(worldClickPos.x));
        // }

        let min = 100000, index = 0;
        for (let i = 0; i<closestObjects.length; i++) {
            let diff = Math.abs(worldClickPos.x-closestObjects[i].transform.localPosition.x);
            if (diff < min) {
                min = diff;
                index = i;
            }
        }
        let closestObject = closestObjects[index];

        console.log(closestObjects);   
        console.log(closestObject);
        let newTimestamp =  new Timestamp(new RgbaColor(123,123,65),
            new Vec2(closestObject.transform.localPosition.x, closestBeatline.transform.position.y), 5, this.editorGrid.transform);
        console.log(newTimestamp); 
        this.timestamps[newTimestamp.transform.position.x] = newTimestamp;
    }

    canvasPlacePhantomElementHandler() {
        if (Input.keysPressed['Alt']) {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = Input.mousePosition.x - rect.left;
            const clickY = Input.mousePosition.y - rect.top;
            const click = new Vec2(clickX, clickY); 

            var closestBeatline = this.editorGrid.findClosestBeatLine(click);
            this.phantomTimestamp = new Timestamp(new RgbaColor(158, 23, 240, 0.7), new Vec2(click.x / this.editorGrid.transform.scale.x, closestBeatline.transform.position.y), 10, this.editorGrid.transform);
        }
        else {
            this.phantomTimestamp = null;
        }
    }

    updateModule() {
        for (const [i, value] of Object.entries(this.timestamps)) {
            for (const [j, timestamp] of Object.entries(value)) {
                (timestamp as Timestamp).draw(this.editorCore.viewport, this.canvas);
            }
        }
    }

    createTimestampPrefab(color: RgbaColor) : TimestampPrefab {
        return new TimestampPrefab(TimestampsModule.nextPrefabId++, color); 
    }
}

export class EditorGrid implements IEditorModule {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private drawBpmLines: boolean;

    private audioController: AudioModule;

    bpmLines = new Array<BPMLine>();
    beatLines = new Array<BeatLine>();
    transform = new Transform();

    private beatLinesRange = new Vec2(1, 20);
    private bpmRange = new Vec2(1, 10000);
    private editorCore: IEditorCore;

    constructor() {
        this.transform = new Transform();
        this.transform.localScale = new Vec2(1, 1);
        this.initGrid();
    }

    init(editorCoreModules: IEditorCore) {
        this.editorCore = editorCoreModules;
    }

    private subscribeOnEvents() {

    }

    private onWindowResize() {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;

        var div = this.canvas.parentElement;
        div.setAttribute('style', 'height:' + (h * 0.6).toString() + 'px');
        var info = this.canvas.parentElement.getBoundingClientRect();

        this.canvas.setAttribute('width', (info.width).toString());
        this.canvas.setAttribute('height', (info.height / 4 * 3).toString());

        this.initGrid();
    }

    inti(editorCore: IEditorCore) {
        this.editorCore = editorCore;
    }

    updateModule() {
        const ctx = this.canvas.getContext("2d");
        ctx.fillStyle = editorColorSettings.editorBackgroundColor.value();
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        this.beatLines.forEach(beatLine => {
            if (beatLine.isActive)
                beatLine.draw(this.editorCore.viewport, this.canvas);
        });

        if (this.drawBpmLines) {
            var soundLength = this.audioController.duration();
            var bpmCount = (soundLength / 60) * this.editorCore.editorData.bpmValue.value;
            var pixelsPerBeat = soundLength / bpmCount;

            this.bpmLines.forEach(bpmLine => {
                if (bpmLine.isActive)
                    bpmLine.draw(this.editorCore.viewport, this.canvas)
            });
        }
    }

    distanceBetweenBpmLines() {
        var soundLength = this.audioController.duration();
        var bpmCount = (soundLength / 60) * this.editorCore.editorData.bpmValue.value;
        var pixelsPerBeat = soundLength / bpmCount;
        return pixelsPerBeat;
    }

    distanceBetweenBeatLines() {
        return (this.canvas.height) / (this.editorCore.editorData.beatLinesCount.value + 1);
    }

    setSnapValue(val: number) {
        console.log(val);
        this.editorCore.editorData.snapValue.value = val;
        const distance = this.distanceBetweenBpmLines();

        this.bpmLines.forEach(line => {
            line.setSnapLines(val, distance);
        });
    }

    setBpmValue(event) {
        var bpm = parseInt(event.target.value);

        bpm < this.bpmRange.x ? bpm = this.bpmRange.x : bpm = bpm;
        bpm > this.bpmRange.y ? bpm = this.bpmRange.y : bpm = bpm;

        this.editorCore.editorData.bpmValue.value = bpm;
        this.initBpmLines();
        console.log(bpm);
    }

    setBeatLinesCount(event) {
        var beatLines = parseInt(event.target.value);

        beatLines < this.beatLinesRange.x ? beatLines = this.beatLinesRange.x : beatLines = beatLines;
        beatLines > this.beatLinesRange.y ? beatLines = this.beatLinesRange.y : beatLines = beatLines;

        this.editorCore.editorData.beatLinesCount.value = beatLines;
        this.initGrid();
    }

    getGridSize(): Vec2 {
        return new Vec2(this.editorCore.editorData.bpmValue.value, this.editorCore.editorData.beatLinesCount.value);
    }

    initGrid() {
        for (var i = 0; i < this.editorCore.editorData.beatLinesCount.value; i++) {
            if (i + 1 > this.beatLines.length) {
                console.log(`distance between lines is ${this.distanceBetweenBeatLines()}`)
                var beatLine = new BeatLine((i + 1) * this.distanceBetweenBeatLines(), this.transform, editorColorSettings.beatLineColor);
                this.beatLines.push(beatLine);
            }
            this.beatLines[i].transform.localPosition = new Vec2(0, (i + 1) * this.distanceBetweenBeatLines());
            this.beatLines[i].activate();
        }
        for (var i = this.editorCore.editorData.beatLinesCount.value; i < this.beatLines.length; i++) {
            this.beatLines[i].deactivate();
        }
    }

    initBpmLines() {
        this.bpmLines = [];
        var soundLength = this.audioController.duration();
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

    findClosestBpmLine(positionX: number) {
        let closestBpmIndex = Utils.binaryNearestSearch(Object.keys(this.bpmLines), positionX, true);
        let closestBpm = this.bpmLines[closestBpmIndex];
        
        let closestBpmSnapIndex = Utils.binaryNearestSearch(Object.keys(closestBpm.snapLines), positionX)
        let closestBpmSnap = closestBpm.snapLines[closestBpmSnapIndex];
    
        if (closestBpmSnap != null && closestBpmSnap != undefined && Math.abs(positionX - closestBpm.transform.position.x) >
            Math.abs(positionX - closestBpmSnap.transform.position.x))
            return closestBpmSnap;
        else 
            return closestBpm;
    }
}