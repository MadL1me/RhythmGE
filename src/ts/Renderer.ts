import { Editor, EditorGrid } from "./Editor";
//var editor = require("./dist/editor");

console.log("abc");

const editor = new Editor();

function setupModules() {
    editor.addEditorModule(new EditorGrid());
}

setupModules();

setInterval(() => { editor.update(); console.log("updating lol") }, 15);