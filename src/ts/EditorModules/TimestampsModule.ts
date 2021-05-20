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
import { timeStamp } from 'node:console';
import { Export } from '../Export';
import { CommandsController, CreateElememtsCommand } from '../Command';


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
    private idToTimestamp = 0;

    constructor(editorGrid: EditorGrid, creatableLines: CreatableLinesModule) {
        this.editorGridModule = editorGrid;
        this.createableLinesModule = creatableLines;
        this.canvas = $("#editor-canvas")[0] as HTMLCanvasElement;
        $("#save-beatmap-btn").on("click", event => Export.saveFile(this.joinTimestampMap()));//Export.saveFile(this.timestamps));

        this.createTimestampPrefab(new RgbaColor(0, 255, 26));
        this.createTimestampPrefab(new RgbaColor(252, 236, 8));
        this.createTimestampPrefab(new RgbaColor(8, 215, 252));
        this.createTimestampPrefab(new RgbaColor(134, 13, 255));
        this.createTimestampPrefab(new RgbaColor(255, 13, 166));
        this.createTimestampPrefab(new RgbaColor(255, 13, 74));

        this.createTimestampPrefab(new RgbaColor(255, 157, 0));
        this.createTimestampPrefab(new RgbaColor(255, 255, 255));
        this.createTimestampPrefab(new RgbaColor(150, 150, 150));
        this.createTimestampPrefab(new RgbaColor(0, 6, 33));


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
        this.timestamps.forEach((value) => {
            value.forEach((timestamp) => {
                timestamp.draw(this.editorCore.viewport, this.canvas);
            });
        });
        // for (const [i, value] of Object.entries(this.timestamps)) {
        //     for (const [j, timestamp] of Object.entries(value)) {
        //         (timestamp as Timestamp).draw(this.editorCore.viewport, this.canvas);
        //     }
        // }
    }

    createTimestampPrefab(color: RgbaColor): TimestampPrefab {
        const prefab = new TimestampPrefab(TimestampsModule.nextPrefabId++, color);
        this.idToPrefab.set(prefab.prefabId, prefab);
        prefab.onPrefabSelected.addListener((id) => { this.selectPrefab(id); });
        return prefab;
    }

    selectPrefab(id: number) {
        this.selectedPrefabId = id;
        this.idToPrefab.forEach((value, key) => {
            value.deselect();
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

        console.log(this.clapTimings);
        console.log(xValues);

        console.log(startIndex);
        console.log(endIndex);
        console.log(xValues.length);

        if (endPos.x < this.clapTimings[0] || 
            startPos.x > this.clapTimings[this.clapTimings.length-1])
            return null;

        xValues.forEach((value) => {
            console.log(value);
            let yArray = this.timestamps.get(value);

            yArray.forEach((value) => {
                if (value.transform.localPosition.y > startPos.y
                    && value.transform.localPosition.y < endPos.y) {
                    resultTimestamps.push(value);
                }
            });
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
        let yArray = this.timestamps.get(this.clapTimings[index]);
        console.log(yArray);

        console.log(`index is ${index}`);

        let result = null;
        let min = 10000;

        yArray.forEach((timestamp) => {
            let distance = Math.abs(timestamp.transform.localPosition.y - position.y);
            if (distance < min) {
                min = distance;
                result = timestamp;
            }
        })
        return result;
    }

    private joinTimestampMap() : Array<Timestamp> {
        let result = new Array<Timestamp>();
        this.timestamps.forEach((value,key) => {
            value.forEach((value, key) => {
                result.push(value);
            })
        });
        
        return result;
    }

    private deleteTimestamp(timestamp: Timestamp) {
        console.log(timestamp.transform.localPosition.y);
        console.log(this.timestamps.get(timestamp.transform.localPosition.x).get(timestamp.transform.localPosition.y));
        let yArr = this.timestamps.get(timestamp.transform.localPosition.x);
        yArr.delete(timestamp.transform.localPosition.y);
        if (yArr.size < 1) {
            this.timestamps.delete(timestamp.transform.localPosition.x);
            console.log("KEY IS DELETED");
            console.log(`Map size is: ${yArr.size}`);
            this.clapTimings.splice(Utils.binaryNearestSearchNumber(this.clapTimings, timestamp.transform.localPosition.x, Func.Round), 1)
            console.log(`clap lenght: ${this.clapTimings.length}`);     
        }
    }

    private restoreTimestamp(timestamp: Timestamp) {
        if (this.timestamps.get(timestamp.transform.localPosition.x) == undefined) {
            this.timestamps.set(timestamp.transform.localPosition.x, new Map<number, Timestamp>());
            this.clapTimings.push(timestamp.transform.localPosition.x);
            this.clapTimings.sort((a, b) => a - b);
        }

        if (this.timestamps.get(timestamp.transform.localPosition.x).get(timestamp.transform.localPosition.y) == null) {
            this.timestamps.get(timestamp.transform.localPosition.x).set(timestamp.transform.localPosition.y, timestamp);
        }
        this.editorCore.audio.setClapTimings(this.clapTimings);
    }

    private get selectedPrefab(): TimestampPrefab {
        return this.idToPrefab.get(this.selectedPrefabId);
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
        const prefab = this.idToPrefab.get(this.selectedPrefabId);

        let newTimestamp = new Timestamp(prefab, new Vec2(position.x, position.y), this.editorGridModule.transform);
       
        if (this.timestamps.get(newTimestamp.transform.localPosition.x) == undefined) {
            this.timestamps.set(newTimestamp.transform.localPosition.x, new Map<number, Timestamp>());
            this.clapTimings.push(newTimestamp.transform.localPosition.x);
            this.clapTimings.sort((a, b) => { return a - b; });
        }

        if (this.timestamps.get(newTimestamp.transform.localPosition.x).get(newTimestamp.transform.localPosition.y) == null) {
            this.timestamps.get(newTimestamp.transform.localPosition.x).set(newTimestamp.transform.localPosition.y, newTimestamp);
            
            newTimestamp.id = this.idToTimestamp;
            newTimestamp.onDelete.addListener((element) => {this.deleteTimestamp(element as Timestamp);});
            newTimestamp.onRestore.addListener((element) => {this.restoreTimestamp(element as Timestamp);});
        
            let createCommand = new CreateElememtsCommand([newTimestamp]);
            CommandsController.executeCommand(createCommand);
            this.idToTimestamp++;
        }
        else if (this.timestamps.get(newTimestamp.transform.localPosition.x).get(newTimestamp.transform.localPosition.y)
            .prefab.prefabId != prefab.prefabId) {
                this.timestamps.get(newTimestamp.transform.localPosition.x).get(newTimestamp.transform.localPosition.y).prefab = prefab;
        }

        this.editorCore.audio.setClapTimings(this.clapTimings);
    }
}