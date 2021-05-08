import { Dialog, FileFilter } from "electron";
import * as fs from "fs";
import $ from "jquery";

import { Timestamp } from "./GridElements";
const dialog = require("electron").remote.dialog as Dialog;

export abstract class Export {
    static saveFile(timestamps: Array<Timestamp>) {
        if (timestamps == null || timestamps.length < 1)
            return;

        let showDialogPromise = dialog.showSaveDialog({title: "Export File", filters:[{name:"Rhythm Beatmap File", extensions: ["rbm"]}]});
        
        showDialogPromise.then(result => {
            if (result.canceled) {
                console.log("ERROR OMG OMG");
                return;
            }
            console.log(`file path is: ${result.filePath}`);
            fs.writeFile(result.filePath+".rbm", this.getContent(timestamps), (err) => {
                if (err) {
                    console.log("FUCKING ERROR");
                    return;
                }
            });
        });
    }

    private static getContent(timestamps: Timestamp[]): string {
        const separator = ":";
        let result = new Array<string>();
        result.push("[Timestamps]");

        for(let i = timestamps.length-1; i >= 0; i--) {
            timestamps[i].id = i
        }

        timestamps.forEach(timestamp => {
            let string = Math.round(timestamp.transform.localPosition.x * 1000) + separator + timestamp.id + 
                separator + timestamp.prefab.prefabId + separator + timestamp.transform.localPosition.y + separator;
            
            if (timestamp.isLongTimestamp) {
                string += "1" + separator + timestamp.connectedTimestamps.length;
                timestamp.connectedTimestamps.forEach(connected => {
                    string += separator + connected[0].id;
                })
            }
            else
                string += "0";

            result.push(string)
        });
       
        return result.join("\n");
    }
}