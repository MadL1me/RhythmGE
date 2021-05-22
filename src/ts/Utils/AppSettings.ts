import { RgbaColor } from "./RgbaColor";

export const editorColorSettings = new class EditorColorSettings {
    editorBackgroundColor = new RgbaColor(73, 75, 90); // new RgbaColor(73, 75, 90)
    beatLineColor = new RgbaColor(130, 130, 130); // (74, 74, 74)
    creatableTimestampLineColor = new RgbaColor(10, 255, 206); //(116, 104, 222);
    loudnessBarColor = new RgbaColor(255, 103, 0);
    timestepLineColor = new RgbaColor(255, 103, 0);
    selectAreaColor = new RgbaColor(92, 185, 224, 0.2);
    selectedCreatableLineColor = new RgbaColor(255, 133, 204);
    selectedTimestampColor = new RgbaColor(255, 186, 243);
    mainBpmLineColorStrong = new RgbaColor(255,255,255);  //(92, 92, 92);
    mainBpmLineColorWeak = new RgbaColor(180, 180, 180);
    snapBpmLineColor = new RgbaColor(201, 124, 40, 0.8);  //(74, 189, 166);
    oneFourthLineColor = new RgbaColor(35, 184, 107, 0.7);
    oneEighthLineColor = new RgbaColor(32, 181, 189, 0.6);
    oneSixteenLineColor = new RgbaColor(32, 74, 189, 0.5);
}
