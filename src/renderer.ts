var Howler = require("howler");
var Howl = require("howler");
var editor = require("./dist/editor");

document.getElementById('files').addEventListener('change', handleFileSelect, false);

setInterval(() => { editor.updateLoop(); }, 10);

window.onresize = (ev: UIEvent) => {
    editor.onWindowResize(ev);
}

function handleFileSelect(event) {
    var files = event.target.files;
    audioLoad(files[0]);
    console.log(files[0]);
}

function test() {
    editor.debug();
}

function playButtonClick() {
    editor.onPlay();   
}

var analyser;

function audioLoad(file) {
    console.log("audio load");
    editor.onAudioLoad(file.name, file.path);
}

function dragOverhandler(event) {

}

function saveBeatmap(event) {

}

function importBeatmap(event) {

}

function dropHandler(event) {

}

var editorCanvas = document.getElementById("editor-canvas");
let keysPressed = [];

editorCanvas.addEventListener('wheel', onCanvasWheel);
editorCanvas.addEventListener('click', (event) => { editor.canvasClickHandle(event); });

function canvasMouseDownHandler(event) {
    editor.canvasMouseDownHandle(event);
}

window.addEventListener('keydown', onCanvasKeyDown);
window.addEventListener('keyup', onCanvasKeyUp);

function onCanvasKeyUp(this:GlobalEventHandlers, event:KeyboardEvent) {
    delete keysPressed[event.key];
    if (event.code == "Space")
        editor.createCustomBpmLine();
    console.log("Key removed" + event.key);
}

function onCanvasKeyDown(event) {
    keysPressed[event.key] = true;
    console.log("Key pressed!" + event.key);
}

function onCanvasWheel(event) {
    // console.log(event);
    if (keysPressed['Control'])
        editor.onCanvasResize(parseInt(event.deltaY));
    else if (keysPressed['Shift'])
        editor.onCanvasScroll(parseInt(event.deltaY), true);
    else
        editor.onCanvasScroll(parseInt(event.deltaY), false); 
}

function beatLinesValueChange(event) {
    editor.changeBeatlinesCount(event);
}

function bmpValueChange(event) {
    editor.changeBpmValue(event);
}

let dropzone = document.getElementById("drop-zone")
dropzone.addEventListener('dragenter', onDragEnter, false)
dropzone.addEventListener('dragleave', onDragLeave, false)
dropzone.addEventListener('dragover', onDragOver, false)
dropzone.addEventListener('drop', onDrop, false)

function onDragEnter() {

}

function onDragLeave() {

}

function onDragOver() {

}

function onDrop() {

}
