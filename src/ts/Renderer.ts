import { Editor, EditorGrid, TimestepLineModule } from "./Editor";
import { TimestepLine } from "./GridElements";
//var editor = require("./dist/editor");

console.log("abc");

const editor = new Editor();

function setupModules() {
    editor.addEditorModule(new EditorGrid());
    editor.addEditorModule(new TimestepLineModule())
}

setupModules();

setInterval(() => { editor.update(); }, 15);