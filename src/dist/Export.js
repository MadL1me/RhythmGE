"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Export = void 0;
var fs = __importStar(require("fs"));
var dialog = require("electron").remote.dialog;
var Export = /** @class */ (function () {
    function Export() {
    }
    Export.saveFile = function (timestamps) {
        var _this = this;
        if (timestamps == null || timestamps.length < 1)
            return;
        var showDialogPromise = dialog.showSaveDialog({ title: "LMAO" });
        showDialogPromise.then(function (result) {
            if (result.canceled) {
                console.log("ERROR OMG OMG");
                return;
            }
            console.log("file path is: " + result.filePath);
            fs.writeFile(result.filePath, _this.getContent(timestamps), function (err) {
                if (err) {
                    console.log("FUCKING ERROR");
                    return;
                }
            });
        });
    };
    Export.getContent = function (timestamps) {
        var result = new Array();
        result.push("[Timestamps]");
        var timestampID = 0;
        timestamps.forEach(function (timestamp) {
            var string = timestamp.transform.localPosition.x + ":" + timestampID +
                ":" + timestamp.prefab.prefabId + ":" + timestamp.transform.localPosition.y;
            result.push(string);
        });
        return result.join("\n");
    };
    return Export;
}());
exports.Export = Export;
