import { Editor } from "./Editor";
import { TimestepLineModule } from "./EditorModules/TimestepLineModule";
import { CreatableLinesModule } from "./EditorModules/CreatableLinesModule";
import { TimestampsModule } from "./EditorModules/TimestampsModule";
import { ElementSelectorModule } from "./EditorModules/ElementSelectorModule";
import { EditorGrid } from "./EditorModules/EditorGridModule";
import { VisualiserEditorModule as VisualiserModule } from "./EditorModules/VisualiserEditorModule";
import { TimestepLine } from "./GridElements";
import { TopScale } from "./EditorModules/ScaleModule" 
import { AudioAmplitudeViewModule } from "./EditorModules/AudioModules";
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
    const selectorModule = new ElementSelectorModule(grid, cLines, timestampsModule);

    editor.addEditorModule(grid);
    editor.addEditorModule(selectorModule);
    editor.addEditorModule(cLines);
    editor.addEditorModule(topScale);
    editor.addEditorModule(timestampsModule);
    editor.addEditorModule(timestampLine);
    editor.addEditorModule(audio);
    editor.addEditorModule(visualiser);
}

setupModules();

setInterval(() => { editor.update(); }, 15);