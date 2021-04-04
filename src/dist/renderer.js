var Howler = require("howler");
var Howl = require("howler");
var editor = require("./dist/editor");
document.getElementById('files').addEventListener('change', handleFileSelect, false);
setInterval(function () { editor.updateLoop(); }, 10);
window.onresize = function (ev) {
    editor.onWindowResize(ev);
};
function handleFileSelect(event) {
    var files = event.target.files;
    audioLoad(files[0]);
    console.log(files[0]);
}
function playButtonClick() {
    editor.onPlay();
}
var analyser;
function audioLoad(file) {
    console.log("audio load");
    editor.onAudioLoad(file.path);
}
function dragOverhandler(event) {
}
function saveBeatmap(event) {
}
function importBeatmap(event) {
}
function dropHandler(event) {
}
var editorCanvas = document.getElementById("editor_canvas");
var keysPressed = [];
editorCanvas.addEventListener('wheel', onCanvasWheel);
editorCanvas.addEventListener('click', function (event) { editor.canvasClickHandle(event); });
function canvasMouseDownHandler(event) {
    editor.canvasMouseDownHandle(event);
}
window.addEventListener('keydown', onCanvasKeyDown);
window.addEventListener('keyup', onCanvasKeyUp);
function onCanvasKeyUp(event) {
    delete keysPressed[event.key];
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
var drop_zone = document.getElementById("drop_zone");
drop_zone.ondrag = function (event) {
};
drop_zone.ondrop = function (ev) {
    console.log('File(s) dropped');
    ev.preventDefault();
    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (ev.dataTransfer.items[i].kind === 'file') {
                var file = ev.dataTransfer.items[i].getAsFile();
                console.log('... file[' + i + '].name = ' + file.name);
            }
        }
    }
    else {
        // Use DataTransfer interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
        }
    }
};
drop_zone.ondragover = function (event) {
    event.preventDefault();
    console.log("fuck3");
};
//# sourceMappingURL=renderer.js.map