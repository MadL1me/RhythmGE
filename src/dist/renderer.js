"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Editor_1 = require("./Editor");
//var editor = require("./dist/editor");
console.log("abc");
var editor = new Editor_1.Editor();
function setupModules() {
    editor.addEditorModule(new Editor_1.EditorGrid());
    editor.addEditorModule(new Editor_1.TimestepLineModule());
}
setupModules();
setInterval(function () { editor.update(); }, 15);
