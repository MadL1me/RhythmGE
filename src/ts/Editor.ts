import { throws } from 'node:assert';
import { format } from 'node:path';
import { off } from 'node:process';

import $ from 'jquery';

import { RgbaColor } from "./RgbaColor";
import { Vec2 } from "./Vec2";
import { Transform } from "./Transform";
import { TopScale } from "./Scale";
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

interface ICommand {
    execute();
    undo();
}

class CommandsController {
    
    private commandsCapacity = 20;
    private commandIndex = 0;
    private commands = new Array<ICommand>();

    addCommandToList(executedCommand: ICommand) {
        if (this.commandIndex != this.commands.length-1) {
            this.commands = this.commands.slice(0, this.commandIndex);
        }

        if (this.commands.length > this.commandsCapacity) {
            this.commands.shift();
        }

        this.commands.push(executedCommand);
        this.commandIndex=this.commands.length;
    }

    undoCommand() {
        this.commands[this.commandIndex].undo();
        this.commandIndex--;
    }

    redoCommand() {
        if (this.commandIndex == this.commands.length-1) {
            return;
        }
        this.commandIndex++
        this.commands[this.commandIndex].execute();
    }
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
    private _snapSlider = new Slider('snap-lines');
    private _playbackSpeedSlider = new Slider('playback-rate');
    
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
    
        this._playbackSpeedSlider.value = 1;
        this._snapSlider.value = 1;
        
        this._playbackSpeedSlider.onValueChange.addListener((value) => { this.onPlaybackRateValueChange(value); });
        this._snapSlider.onValueChange.addListener((value) => { this.onSnapSliderValueChange(value); });
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

    private _editorModules = new Array<IEditorModule>();
    private _editorCanvas: HTMLCanvasElement;

    constructor() {
        this._editorCanvas = $("#editor-canvas")[0] as HTMLCanvasElement;
        this.transform.scale = new Vec2(10, 1);
        
        this.viewport.init(this);
        this.audio.init(this);
        this.viewport.transform.parent = this.transform;
        this.audio.transform.parent = this.transform;

        setInterval(() => {this.audio.checkForClaps();}, 5);

        Input.onCanvasWheel.addListener((event) => {this.onChangeScale(event.deltaY);});

        this.update();
    }

    addEditorModule(element: IEditorModule) {
        element.init(this);
        element.transform.parent = this.transform;
        this._editorModules.push(element)
    }

    update() {
        Input.update();
        this.audio.updateModule();
        this.viewport.updateModule();

        for(let i = 0; i<this._editorModules.length; i++) {
            this._editorModules[i].updateModule();
        }
    }

    onChangeScale(mouseDelta: number) {
        if (!Input.keysPressed["ControlLeft"])
            return;
        
        let resultedDelta = mouseDelta * this.editorData.resizingSpeed.value;
        let oldScale = this.transform.scale.x;

        const canvCenter = this.viewport.canvasToSongTime(new Vec2(this._editorCanvas.width / 2, 0));

        this.transform.scale = new Vec2(this.transform.scale.x - resultedDelta, this.transform.scale.y);
        let scaleIsChanged = true;

        if (this.transform.scale.x <= this.transform.minScale.x) {
            this.transform.scale = new Vec2(this.transform.minScale.x, this.transform.scale.y);
            scaleIsChanged = false;
        }
        if (this.transform.scale.x >= this.transform.maxScale.x) {
            this.transform.scale = new Vec2(this.transform.maxScale.x, this.transform.scale.y);
            scaleIsChanged = false;
        }

        this.viewport.position = Vec2.Substract(new Vec2(this._editorCanvas.width / 2, 0), canvCenter);
        this.update();
    }
}

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
    }

    updateModule() {
        if (this.editor.audio.isPlaying()) {
            this.timestepLine.transform.localPosition = new Vec2(this.editor.audio.seek(), 0);

            if (this.editor.editorData.followLine.value) {
                const result = new Vec2(-this.timestepLine.transform.position.x + this.canvas.width / 2, 0);
                this.editor.viewport.transform.position = result;
            }
        }

        this.timestepLine.draw(this.editor.viewport, this.canvas);
    }
}

// class PhantomTimestampModule implements IEditorModule {

// }

export class CreatableLinesModule implements IEditorModule {
    
    transform = new Transform();
    creatableLines = new Map<number, CreatableTimestampLine>();

    private editor: IEditorCore;
    private canvas: HTMLCanvasElement;

    constructor() {
        this.canvas = $("#editor-canvas")[0] as HTMLCanvasElement;  
    }

    init(editorCoreModules: IEditorCore) {
        this.editor = editorCoreModules;
        Input.onKeyDown.addListener(() => {this.handleInput();});
    }
    
    updateModule() {
        if(this.editor.editorData.hideCreatableLines.value)
            return;

        Object.values(this.creatableLines).forEach(element => {
            element.draw(this.editor.viewport, this.canvas);
        });
    }

    findClosestCreatableLine(positionX: number) {
        const objectsArr = Object.values(this.creatableLines);
        // objectsArr.forEach(el => {
        //     console.log(el);   
        // })
        if (objectsArr.length < 1)
            return;
        const indexOfElement = Utils.binaryNearestSearch(objectsArr, positionX);
        const closestCreatable = objectsArr[indexOfElement];
        return closestCreatable; 
    }

    private handleInput() {
        if (Input.keysPressed["Space"] == true) {
            this.createCustomBpmLine();
        }
    }

    private createCustomBpmLine() {
        let xPos = this.editor.audio.seek();
        let line = new CreatableTimestampLine(xPos, this.transform, editorColorSettings.creatableTimestampLineColor);
        this.creatableLines[line.transform.localPosition.x] = line;
    }

}

class TimestampPrefab {
    prefabId: number;
    color: RgbaColor;
    
    private _isSelected: boolean;
    private buttonElement: JQuery<HTMLElement>;
    private diamondElement: JQuery<HTMLElement>;

    onPrefabSelected = new Event<number>();
    onPrefabDeselected = new Event<number>();

    get isSelected() {
        return this._isSelected;
    }

    constructor(id: number, color: RgbaColor) {
        this.prefabId = id;
        this.color = color;
        this.createButton();
    }

    private createButton() {
        const prefabsContainer = $('#prefabs-container');
        
        this.buttonElement = $("<div>", {id: this.prefabId, "class": "prefab-button" });
        this.diamondElement = $("<div>", {"class": "diamond-shape"});
        this.diamondElement.attr("style", `background-color:${this.color.value()}`);
        this.buttonElement.append(this.diamondElement);
        prefabsContainer.append(this.buttonElement);
        
        this.buttonElement.on("click", () => {
            if (!this._isSelected) 
                this.select(true);
        });
    }

    select(callEvent=false) {
        this._isSelected = true;
        this.buttonElement.addClass("selected");
        if (callEvent)
            this.onPrefabSelected.invoke(this.prefabId);
    }

    deselect(callEvent=false) {
        this._isSelected = false;
        this.buttonElement.removeClass("selected");
        if (callEvent)
            this.onPrefabDeselected.invoke(this.prefabId);
    }
}

export class TimestampsModule implements IEditorModule {

    transform = new Transform();

    private static nextPrefabId = 0;
    private selectedPrefabId = 0;
    private idToPrefab = new Map<number, TimestampPrefab>();
    private timestamps = new Map<number, Map<number, Timestamp>>();
    private canvas: HTMLCanvasElement;
    
    private editorCore: IEditorCore;
    private editorGridModule: EditorGrid;
    private createableLinesModule: CreatableLinesModule;

    onExistingElementClicked = new Event<Timestamp>();

    constructor(editorGrid: EditorGrid, creatableLines: CreatableLinesModule) {
        this.editorGridModule = editorGrid;
        this.createableLinesModule = creatableLines;
        this.canvas = $("#editor-canvas")[0] as HTMLCanvasElement;

        this.createTimestampPrefab(new RgbaColor(0, 255, 26));
        this.createTimestampPrefab(new RgbaColor(252, 236, 8));
        this.createTimestampPrefab(new RgbaColor(8, 215, 252));
        this.createTimestampPrefab(new RgbaColor(134, 13, 255));
        this.createTimestampPrefab(new RgbaColor(255, 13, 166));
        this.createTimestampPrefab(new RgbaColor(255, 13, 74));

        this.selectedPrefab.select();
    }

    init(editorCoreModules: IEditorCore) {
        this.editorCore = editorCoreModules;
        Input.onMainCanvasMouseClick.addListener((event) => {this.onCanvasClick(event);});
    }

    updateModule() {
        for (const [i, value] of Object.entries(this.timestamps)) {
            for (const [j, timestamp] of Object.entries(value)) {
                (timestamp as Timestamp).draw(this.editorCore.viewport, this.canvas);
            }
        }
    }
    
    removeTimestamp(timestamp: Timestamp) {
        delete this.timestamps[timestamp.transform.localPosition.x][timestamp.transform.localPosition.y];
    }

    createTimestampPrefab(color: RgbaColor) : TimestampPrefab {
        const prefab = new TimestampPrefab(TimestampsModule.nextPrefabId++, color);
        this.idToPrefab[prefab.prefabId] = prefab;
        prefab.onPrefabSelected.addListener((id)=>{this.selectPrefab(id);});
        return prefab; 
    }

    selectPrefab(id: number) {
        this.selectedPrefabId = id;
        Object.values(this.idToPrefab).forEach(prefab => {
            prefab.deselect();
        });
        this.selectedPrefab.select();
    }

    private get selectedPrefab() : TimestampPrefab {
        return this.idToPrefab[this.selectedPrefabId];
    }

    private onCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        const click = new Vec2(clickX, clickY);
        let worldClickPos = this.editorCore.viewport.transform.canvasToWorld(click);
        worldClickPos = new Vec2(worldClickPos.x,worldClickPos.y)
        
        //console.log(click);
        //console.log(`World click pos is: ${worldClickPos}`);
        //console.log(worldClickPos); 

        let closestBeatline = this.editorGridModule.findClosestBeatLine(click);
        let closestObjects = new Array<GridElement>();

        if (!this.editorCore.editorData.hideBpmLines.value && this.editorGridModule.bpmLines.length > 0) {
            closestObjects.push(this.editorGridModule.findClosestBpmLine(worldClickPos.x));
        }

        if (!this.editorCore.editorData.hideCreatableLines.value && Object.keys(this.createableLinesModule.creatableLines).length > 0) {
            closestObjects.push(this.createableLinesModule.findClosestCreatableLine(worldClickPos.x));
        }

        if (closestObjects.length < 1)
            return;

        let min = 100000, index = 0;
        worldClickPos = this.editorCore.viewport.transform.canvasToWorld(click);
        //console.log(worldClickPos);

        for (let i = 0; i<closestObjects.length; i++) {
            let diff = Math.abs(worldClickPos.x-closestObjects[i].transform.position.x);
            if (diff < min) {
                min = diff;
                index = i;
            }
        }
        let closestObject = closestObjects[index];

        //console.log(closestObjects);   
        //console.log(closestObject);
        const prefab = this.idToPrefab[this.selectedPrefabId] as TimestampPrefab;
        let newTimestamp =  new Timestamp(prefab.color,
            new Vec2(closestObject.transform.position.x, closestBeatline.transform.position.y), 0.5, this.editorGridModule.transform);
        //console.log(newTimestamp); 
        
        if (this.timestamps[newTimestamp.transform.localPosition.x] == undefined) {
            this.timestamps[newTimestamp.transform.localPosition.x] = {};
        }

        if (this.timestamps[newTimestamp.transform.localPosition.x][newTimestamp.transform.localPosition.y] == null)
            this.timestamps[newTimestamp.transform.localPosition.x][newTimestamp.transform.localPosition.y] = newTimestamp;
        else if (Input.keysPressed["LeftControl"])
            this.onExistingElementClicked.invoke(this.timestamps[newTimestamp.transform.localPosition.x][newTimestamp.transform.localPosition.y]);

        if(this.editorCore.editorData.useClaps.value)
            this.editorCore.audio.setClapTimings(this.getClapTimings());
    }

    private getClapTimings(): number[] {
        const obj = Object.keys(this.timestamps);
        const result = new Array<number>();
        for (let i = 0; i<obj.length; i++) {
            result[i] = parseFloat(obj[i]);
        }
        return result.sort((a, b) => {
            return a - b;
        });
    }
}

class SelectArea implements IDrawable {
    private firstPoint: Vec2;
    private secondPoint: Vec2;
    
    draw(view: IViewportModule, canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        const sizeVec = Vec2.Substract(this.secondPoint, this.firstPoint);
        ctx.fillStyle = editorColorSettings.selectAreaColor.value();
        ctx.fillRect(this.firstPoint.x, this.firstPoint.y, sizeVec.x, sizeVec.y);
    }
}

export class ElementSelectorModule implements IEditorModule {
    transform: Transform;
    
    private editor: IEditorCore;
    private selectedElements = new Array<GridElement>();
    private selectArea = new SelectArea();
    
    init(editorCoreModules: IEditorCore) {
        this.editor = editorCoreModules;
    }

    updateModule() {
        

    }

    onElementExistingElementClicked(element: GridElement) {
        this.selectedElements.push(element);
        element.select();
    }

    private selectElement(element: GridElement) {
        this.selectedElements
    }

    private deselectElement(element: GridElement) {
    
    }
}

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
        Input.onWindowResize.addListener(() => {this.onWindowResize();});
        this.editorCore.editorData.offset.onValueChange.addListener((value) => {this.setOffsetValue(value);});
        this.editorCore.editorData.snapValue.onValueChange.addListener((value)=>{this.setSnapValue(value);});
        this.editorCore.editorData.bpmValue.onValueChange.addListener((value)=>{this.setBpmValue(value);});
        this.editorCore.editorData.beatLinesCount.onValueChange.addListener((value) => {this.setBeatLinesCount(value);});
        this.editorCore.audio.onAudioLoaded.addListener(() => {this.onAudioLoad();})
    }

    private onAudioLoad() {
        console.log("audio loaded");
        this.initGrid();
        this.initBpmLines();
    }

    private onWindowResize() {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight - this._canvas.parentElement.offsetTop-10;

        var div = this._canvas.parentElement;
        div.setAttribute('style', 'height:' + (h*0.95).toString() + 'px');
        var info = this._canvas.parentElement.getBoundingClientRect();

        this._canvas.setAttribute('width', (info.width).toString());
        this._canvas.setAttribute('height', (info.height / 4 * 3).toString());

        this.initGrid();
        //this.initBpmLines();
    }

    updateModule() {
        const ctx = this._canvas.getContext("2d");
        ctx.fillStyle = editorColorSettings.editorBackgroundColor.value();
        ctx.fillRect(0, 0, this._canvas.width, this._canvas.height)

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
                    bpmLine.draw(this.editorCore.viewport, this._canvas)
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

    private setBeatLinesCount(value:number) {
        //var beatLines = parseInt(event.target.value);
        let beatLines = value;

        beatLines < this.beatLinesRange.x ? beatLines = this.beatLinesRange.x : beatLines = beatLines;
        beatLines > this.beatLinesRange.y ? beatLines = this.beatLinesRange.y : beatLines = beatLines;

        this.initGrid();
    }

    private setOffsetValue(value: number) {
        //var offset = parseInt(event);
        const offset = value;
        this.transform.localPosition = new Vec2(offset/10, this.transform.localPosition.y); 
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
        
        console.log("init BPM")
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
            if (this.bpmLines.length-1 > closestBpmIndex 
                && Math.abs(this.bpmLines[closestBpmIndex+1].value - worldPos) <
                Math.abs(this.bpmLines[closestBpmIndex].value - worldPos))
                closestBpm = this.bpmLines[closestBpmIndex+1];    
        };

        let closestBpmIndex = Utils.binaryNearestSearch(this.bpmLines, worldPos, true);
        let closestBpm = this.bpmLines[closestBpmIndex];
        
        if (closestBpm.snapLines.length < 1) {
            getClosestBpm(); 
            return closestBpm;
        }

        let closestBpmSnapIndex = Utils.binaryNearestSearch(closestBpm.snapLines, worldPos)
        let closestBpmSnap = closestBpm.snapLines[closestBpmSnapIndex];

        getClosestBpm();

        if (closestBpmSnap != null && closestBpmSnap != undefined && Math.abs(worldPos - closestBpm.transform.position.x) >
            Math.abs(worldPos - closestBpmSnap.transform.position.x))
            return closestBpmSnap;
        else 
            return closestBpm;
    }
}


export class VisualiserEditorModule implements IEditorModule {
        
    transform = new Transform();
    private editor: IEditorCore;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private spectrumData: Float32Array;
    private displayData = new Float32Array();

    private readonly sampleRate = 48000;
    private divideValue = 20;
    private samplesPerArrayValue = this.sampleRate/this.divideValue;

    constructor() {
        this.canvas = $("#visualiser-canvas")[0] as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d");
    }

    init(editorCoreModules: IEditorCore) {
        this.editor = editorCoreModules;
        Input.onWindowResize.addListener(() => {this.onWindowResize();});
        this.editor.audio.onPlay.addListener(() => {this.onAudioLoad();});
    }

    onAudioLoad() {        
        this.spectrumData = this.editor.audio.getSpectrumData();
        this.displayData = this.spectrumData;
        this.calculateDisplayDataArray();
    }

    private calculateDisplayDataArray() {

    }

    updateModule() {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = editorColorSettings.editorBackgroundColor.value();
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

        if (this.spectrumData == undefined || this.spectrumData == null)
            return;

        if (this.displayData == undefined || this.displayData == null)
            return;

        const view = this.editor.viewport;

        for (var i = 0; i<this.displayData.length; i++) {
            var interpolated = this.displayData[i]*this.canvas.height;
            var position = view.position.x + i*this.transform.scale.x/this.divideValue;
            var width = this.transform.scale.x/this.divideValue;
            var gap = Math.floor(width/3);

            if (gap < 4)
                gap = 0;

            this.ctx.fillStyle = editorColorSettings.loudnessBarColor.value();
            this.ctx.fillRect(position + gap, 0, width - gap, interpolated)
            this.ctx.fill();
        }
    } 

    private onWindowResize() {
        var div = this.canvas.parentElement;
        //div.setAttribute('style', 'height:' + (h * 0.6).toString() + 'px');
        var info = this.canvas.parentElement.getBoundingClientRect();

        this.canvas.setAttribute('width', (info.width*0.9).toString());
        this.canvas.setAttribute('height', (info.height*0.5).toString());
    }
}