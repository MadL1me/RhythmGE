"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Editor_1 = require("./Editor");
//var editor = require("./dist/editor");
console.log("abc");
var editor = new Editor_1.Editor();
function setupModules() {
    editor.addEditorModule(new Editor_1.EditorGrid());
}
setupModules();
setInterval(function () { editor.update(); console.log("updating lol"); }, 15);
