import $ from 'jquery';
import { RgbaColor } from "../Utils/RgbaColor";
import { Vec2 } from "../Utils/Vec2";
import { Transform } from "../Transform";
import { Timestamp, GridElement, TimestampPrefab } from "../GridElements";
import { Input } from "../Input";
import { Utils, Event, Func } from "../Utils/Utils";
import { EditorGrid } from './EditorGridModule';
import { IEditorModule, IEditorCore } from '../Editor';
import { CreatableLinesModule } from "./CreatableLinesModule";


export class TimestampsModule implements IEditorModule {

    transform = new Transform();

    private static nextPrefabId = 0;
    private selectedPrefabId = 0;
    private idToPrefab = new Map<number, TimestampPrefab>();
    private timestamps = new Map<number, Map<number, Timestamp>>();
    private clapTimings = new Array<number>();
    private canvas: HTMLCanvasElement;

    private editorCore: IEditorCore;
    private editorGridModule: EditorGrid;
    private createableLinesModule: CreatableLinesModule;

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
        Input.onMouseClickCanvas.addListener((event) => { this.onCanvasClick(event); });
        CreatableLinesModule.onCreateLineEvent.addListener(([line, key]) => {
            if (!key.includes("Digit"))
                return;

            console.log("CREATING STUFF");
            console.log(parseInt(key[5]));

            this.createTimestamp(new Vec2(line.transform.position.x,
                parseInt(key[5]) * this.editorGridModule.distanceBetweenBeatLines()));
        });
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

    createTimestampPrefab(color: RgbaColor): TimestampPrefab {
        const prefab = new TimestampPrefab(TimestampsModule.nextPrefabId++, color);
        this.idToPrefab[prefab.prefabId] = prefab;
        prefab.onPrefabSelected.addListener((id) => { this.selectPrefab(id); });
        return prefab;
    }

    selectPrefab(id: number) {
        this.selectedPrefabId = id;
        Object.values(this.idToPrefab).forEach(prefab => {
            prefab.deselect();
        });
        this.selectedPrefab.select();
    }

    getTimestampsAtRange(startPos: Vec2, endPos: Vec2) {
        if (this.clapTimings.length < 1) {
            return;
        }

        let tmpStartPos = new Vec2(Math.min(startPos.x, endPos.x), Math.min(startPos.y, endPos.y));
        endPos = new Vec2(Math.max(startPos.x, endPos.x), Math.max(startPos.y, endPos.y));
        startPos = tmpStartPos;

        startPos = this.editorGridModule.transform.worldToLocal(startPos);
        endPos = this.editorGridModule.transform.worldToLocal(endPos);

        console.log(startPos.x);
        console.log(endPos.x);

        let startIndex = Utils.binaryNearestSearchNumber(this.clapTimings, startPos.x, Func.Ceil);
        let endIndex = Utils.binaryNearestSearchNumber(this.clapTimings, endPos.x, Func.Floor);
        let xValues = this.clapTimings.slice(startIndex, endIndex + 1);
        let resultTimestamps = new Array<Timestamp>();

        console.log(startIndex);
        console.log(endIndex);
        console.log(xValues.length);

        xValues.forEach((value) => {
            let yArray = this.timestamps[value] as Map<number, Timestamp>;

            for (const [key, value] of Object.entries(yArray)) {
                if ((value as Timestamp).transform.localPosition.y > startPos.y
                    && (value as Timestamp).transform.localPosition.y < endPos.y) {
                    resultTimestamps.push(value as Timestamp);
                }
            }
        });

        return resultTimestamps;
    }

    getClosestTimestamp(position: Vec2): Timestamp {
        if (this.clapTimings.length < 1)
            return;

        console.log("try get closest timestamps");
        position = this.editorGridModule.transform.worldToLocal(position);

        let index = Utils.binaryNearestSearchNumber(this.clapTimings, position.x);
        console.log(this.clapTimings[index]);
        let yArray = this.timestamps[this.clapTimings[index]] as Map<number, Timestamp>;
        console.log(yArray);

        console.log(`index is ${index}`);

        let result = null;
        let min = 10000;

        for (const [key, timestamp] of Object.entries(yArray)) {
            let distance = Math.abs(timestamp.transform.localPosition.y - position.y);
            if (distance < min) {
                min = distance;
                result = timestamp;
            }
        }
        return result;
    }

    private get selectedPrefab(): TimestampPrefab {
        return this.idToPrefab[this.selectedPrefabId];
    }

    private onCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const click = new Vec2(event.clientX - rect.left, event.clientY - rect.top);

        let worldClickPos = this.editorCore.viewport.transform.canvasToWorld(click);
        worldClickPos = new Vec2(worldClickPos.x, worldClickPos.y);

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

        for (let i = 0; i < closestObjects.length; i++) {
            let diff = Math.abs(worldClickPos.x - closestObjects[i].transform.position.x);
            if (diff < min) {
                min = diff;
                index = i;
            }
        }
        let closestObject = closestObjects[index];

        const placeDistance = 30;

        if (Math.abs(closestObject.transform.position.x - worldClickPos.x) > placeDistance ||
            Math.abs(closestBeatline.transform.position.y - worldClickPos.y) > placeDistance)
            return;

        this.createTimestamp(new Vec2(closestObject.transform.position.x, closestBeatline.transform.position.y));
    }

    private createTimestamp(position: Vec2) {
        const prefab = this.idToPrefab[this.selectedPrefabId] as TimestampPrefab;

        let newTimestamp = new Timestamp(prefab, new Vec2(position.x, position.y), this.editorGridModule.transform);
        const yArray = this.timestamps[newTimestamp.transform.localPosition.x];

        if (yArray == undefined) {
            this.timestamps[newTimestamp.transform.localPosition.x] = {};
            this.clapTimings.push(newTimestamp.transform.localPosition.x);
            this.clapTimings.sort((a, b) => { return a - b; });
        }

        if (this.timestamps[newTimestamp.transform.localPosition.x][newTimestamp.transform.localPosition.y] == null) {
            this.timestamps[newTimestamp.transform.localPosition.x][newTimestamp.transform.localPosition.y] = newTimestamp;
        }
        else if ((this.timestamps[newTimestamp.transform.localPosition.x][newTimestamp.transform.localPosition.y] as Timestamp)
            .prefab.prefabId != prefab.prefabId) {
            
        }

        if (this.editorCore.editorData.useClaps.value)
            this.editorCore.audio.setClapTimings(this.clapTimings);
    }
}
