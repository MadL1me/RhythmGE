import * as fs from "fs";
import $ from "jquery";

import { Timestamp } from "./GridElements";
const dialog = require("electron").remote.dialog;

export abstract class Export {
    static saveFile(timestamps: Array<Timestamp>) {
        if (timestamps == null || timestamps.length < 1)
            return;

        let showDialogPromise = dialog.showSaveDialog({title: "LMAO"});
        
        showDialogPromise.then(result => {
            if (result.canceled) {
                console.log("ERROR OMG OMG");
                return;
            }
            console.log(`file path is: ${result.filePath}`);
            fs.writeFile(result.filePath, this.getContent(timestamps), (err) => {
                if (err) {
                    console.log("FUCKING ERROR");
                    return;
                }
            });
        });
    }

    private static getContent(timestamps: Timestamp[]): string {
        let result = new Array<string>();
        result.push("[Timestamps]");
        let timestampID = 0;

        timestamps.forEach(timestamp => {
            let string = timestamp.transform.localPosition.x + ":" + timestampID + 
                ":" + timestamp.prefab.prefabId + ":" + timestamp.transform.localPosition.y;
            
            result.push(string)
        });
       
        return result.join("\n");
    }
}