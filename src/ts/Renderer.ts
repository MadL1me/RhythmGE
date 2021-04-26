import { Editor, EditorGrid, TimestepLineModule, CreatableLinesModule, TimestampsModule, VisualiserEditorModule as VisualiserModule } from "./Editor";
import { TimestepLine } from "./GridElements";
import { TopScale } from "./Scale" 
import { AudioAmplitudeViewModule } from "./Audio";
//var editor = require("./dist/editor");

const editor = new Editor();
//console.log(__dirname);
//console.log('abc');

function setupModules() {
    const grid = new EditorGrid();
    const cLines = new CreatableLinesModule();
    const topScale = new TopScale(10);
    const timestampsModule = new TimestampsModule(grid, cLines);
    const timestampLine = new TimestepLineModule();
    const audio = new AudioAmplitudeViewModule();
    const visualiser = new VisualiserModule();

    editor.addEditorModule(grid);
    editor.addEditorModule(cLines);
    editor.addEditorModule(topScale);
    editor.addEditorModule(timestampsModule);
    editor.addEditorModule(timestampLine);
    editor.addEditorModule(audio);
    editor.addEditorModule(visualiser);
}

setupModules();

setInterval(() => { editor.update(); }, 15);