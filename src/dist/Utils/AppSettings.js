"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editorColorSettings = void 0;
var RgbaColor_1 = require("./RgbaColor");
exports.editorColorSettings = new /** @class */ (function () {
    function EditorColorSettings() {
        this.editorBackgroundColor = new RgbaColor_1.RgbaColor(73, 75, 90); // new RgbaColor(73, 75, 90)
        this.beatLineColor = new RgbaColor_1.RgbaColor(130, 130, 130); // (74, 74, 74)
        this.creatableTimestampLineColor = new RgbaColor_1.RgbaColor(10, 255, 206); //(116, 104, 222);
        this.loudnessBarColor = new RgbaColor_1.RgbaColor(255, 103, 0);
        this.timestepLineColor = new RgbaColor_1.RgbaColor(255, 103, 0);
        this.selectAreaColor = new RgbaColor_1.RgbaColor(92, 185, 224, 0.2);
        this.selectedCreatableLineColor = new RgbaColor_1.RgbaColor(255, 133, 204);
        this.selectedTimestampColor = new RgbaColor_1.RgbaColor(255, 186, 243);
        this.mainBpmLineColorStrong = new RgbaColor_1.RgbaColor(255, 255, 255); //(92, 92, 92);
        this.mainBpmLineColorWeak = new RgbaColor_1.RgbaColor(180, 180, 180);
        this.snapBpmLineColor = new RgbaColor_1.RgbaColor(201, 124, 40, 0.8); //(74, 189, 166);
        this.oneFourthLineColor = new RgbaColor_1.RgbaColor(35, 184, 107, 0.7);
        this.oneEighthLineColor = new RgbaColor_1.RgbaColor(32, 181, 189, 0.6);
        this.oneSixteenLineColor = new RgbaColor_1.RgbaColor(189, 56, 32, 0.5);
    }
    return EditorColorSettings;
}());
