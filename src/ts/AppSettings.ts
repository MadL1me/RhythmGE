import { RgbaColor } from "./RgbaColor";

export const appSettings = new class AppSettings {
    editorBackgroundColor = new RgbaColor(73, 75, 90);
    beatLineColor = new RgbaColor(130, 130, 130); // (74, 74, 74)
    mainBpmLineColorStrong = new RgbaColor(255,255,255);  //(92, 92, 92);
    mainBpmLineColorWeak = new RgbaColor(150, 150, 150);
    snapBpmLineColor = new RgbaColor(100,100,100);  //(74, 189, 166);
    creatableTimestampLineColor = new RgbaColor(10, 255, 206); //(116, 104, 222);
    loudnessBarColor = new RgbaColor(255, 103, 0);
    timestepLineColor = new RgbaColor(255, 103, 0);
}
