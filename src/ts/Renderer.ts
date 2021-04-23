import { Editor, EditorGrid, TimestepLineModule, CreatableLinesModule } from "./Editor";
import { TimestepLine } from "./GridElements";
import { TopScale } from "./Scale" 
import { AudioAmplitudeViewModule } from "./Audio";
//var editor = require("./dist/editor");

const editor = new Editor();

function setupModules() {
    editor.addEditorModule(new EditorGrid());
    editor.addEditorModule(new CreatableLinesModule());
    editor.addEditorModule(new TopScale(10));
    editor.addEditorModule(new TimestepLineModule());
    editor.addEditorModule(new AudioAmplitudeViewModule());
}

setupModules();

setInterval(() => { editor.update(); }, 15);