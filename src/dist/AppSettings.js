"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editorColorSettings = void 0;
var RgbaColor_1 = require("./RgbaColor");
exports.editorColorSettings = new /** @class */ (function () {
    function EditorColorSettings() {
        this.editorBackgroundColor = new RgbaColor_1.RgbaColor(73, 75, 90);
        this.beatLineColor = new RgbaColor_1.RgbaColor(130, 130, 130); // (74, 74, 74)
        this.mainBpmLineColorStrong = new RgbaColor_1.RgbaColor(255, 255, 255); //(92, 92, 92);
        this.mainBpmLineColorWeak = new RgbaColor_1.RgbaColor(150, 150, 150);
        this.snapBpmLineColor = new RgbaColor_1.RgbaColor(100, 100, 100); //(74, 189, 166);
        this.creatableTimestampLineColor = new RgbaColor_1.RgbaColor(10, 255, 206); //(116, 104, 222);
        this.loudnessBarColor = new RgbaColor_1.RgbaColor(255, 103, 0);
        this.timestepLineColor = new RgbaColor_1.RgbaColor(255, 103, 0);
    }
    return EditorColorSettings;
}());
