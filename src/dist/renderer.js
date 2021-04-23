"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Editor_1 = require("./Editor");
var Scale_1 = require("./Scale");
var Audio_1 = require("./Audio");
//var editor = require("./dist/editor");
var editor = new Editor_1.Editor();
function setupModules() {
    editor.addEditorModule(new Editor_1.EditorGrid());
    editor.addEditorModule(new Editor_1.CreatableLinesModule());
    editor.addEditorModule(new Scale_1.TopScale(10));
    editor.addEditorModule(new Editor_1.TimestepLineModule());
    editor.addEditorModule(new Audio_1.AudioAmplitudeViewModule());
}
setupModules();
setInterval(function () { editor.update(); }, 15);
