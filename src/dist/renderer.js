var Howler = require("howler");
var Howl = require("howler");
var editor = require("./dist/editor");
//document.getElementById('files').addEventListener('change', handleFileSelect, false);
setInterval(function () { editor.updateLoop(); }, 15);
// window.onresize = (ev: UIEvent) => {
//     editor.onWindowResize(ev);
// }
// function handleFileSelect(event) {
//     var files = event.target.files;
//     audioLoad(files[0]);
//     console.log(files[0]);
// }
// function playButtonClick() {
//     editor.onPlay();   
// }
// function audioLoad(file) {
//     console.log("audio load");
//     editor.onAudioLoad(file.name, file.path);
// }
// var editorCanvas = document.getElementById("editor-canvas");
// let keysPressed = [];
// editorCanvas.addEventListener('wheel', onCanvasWheel);
// editorCanvas.addEventListener('click', (event) => { editor.canvasClickHandle(event); });
// window.addEventListener('keydown', onCanvasKeyDown);
// window.addEventListener('keyup', onCanvasKeyUp);
// function onCanvasKeyUp(this:GlobalEventHandlers, event:KeyboardEvent) {
//     delete keysPressed[event.key];
//     console.log("Key removed" + event.key);
// }
// function onCanvasKeyDown(event) {
//     keysPressed[event.key] = true;
//     if (event.code == "Space")
//         editor.createCustomBpmLine();
//     console.log("Key pressed!" + event.key);
// }
// function onCanvasWheel(event) {
//     // console.log(event);
//     if (keysPressed['Control'])
//         editor.onCanvasResize(parseInt(event.deltaY));
//     else if (keysPressed['Shift'])
//         editor.onCanvasScroll(parseInt(event.deltaY), true);
//     else
//         editor.onCanvasScroll(parseInt(event.deltaY), false); 
// }
// function beatLinesValueChange(event) {
//     editor.changeBeatlinesCount(event);
// }
// function bmpValueChange(event) {
//     editor.changeBpmValue(event);
// }
//# sourceMappingURL=renderer.js.map