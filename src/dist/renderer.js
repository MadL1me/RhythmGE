"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Editor_1 = require("./Editor");
var Scale_1 = require("./Scale");
var Audio_1 = require("./Audio");
//var editor = require("./dist/editor");
var editor = new Editor_1.Editor();
//console.log(__dirname);
//console.log('abc');
function setupModules() {
    var grid = new Editor_1.EditorGrid();
    var cLines = new Editor_1.CreatableLinesModule();
    var topScale = new Scale_1.TopScale(10);
    var timestampsModule = new Editor_1.TimestampsModule(grid, cLines);
    var timestampLine = new Editor_1.TimestepLineModule();
    var audio = new Audio_1.AudioAmplitudeViewModule();
    editor.addEditorModule(grid);
    editor.addEditorModule(cLines);
    editor.addEditorModule(topScale);
    editor.addEditorModule(timestampsModule);
    editor.addEditorModule(timestampLine);
    editor.addEditorModule(audio);
}
setupModules();
setInterval(function () { editor.update(); }, 15);
