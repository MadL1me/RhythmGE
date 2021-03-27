var _a = require("electron"), ipcRenderer = _a.ipcRenderer, ipcMain = _a.ipcMain;
var Editor = require("./dist/editor");
var howl = require("howler");
var Howler = require("howler");
var Howl = require("howler");
var editor = new Editor();
editor.drawEditor();
document.getElementById('files').addEventListener('change', handleFileSelect, false);
function canvasClickHandler(event) {
    editor.canvasClickHandle(event);
}
ipcRenderer.on("openDialog-reply", function (event, arg) {
    console.log(arg);
});
function handleFileSelect(event) {
    var files = event.target.files;
    audioLoad(files[0]);
    console.log(files[0]);
}
var analyser;
function getanalysis() {
    var dataArray = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatTimeDomainData(dataArray);
    console.log(dataArray);
    var dataArray = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(dataArray);
    console.log(dataArray);
}
function audioLoad(file) {
    console.log("audio load");
    var soundId = 0;
    var sound = new Howl({ src: [file.path] });
    sound.on("play", function () {
        analyser = Howler.ctx.createAnalyser();
        analyser.fftSize = 256;
        var dataArray = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatTimeDomainData(dataArray);
        console.log(dataArray);
        console.log(soundId);
        console.log(sound._soundById(soundId)._node.bufferSource.connect(analyser));
    });
    soundId = sound.play();
}
function loadAudioFile(event) {
    //var file = event.target.files;
    ipcRenderer.send("openDialog", {});
}
function dragOverhandler(event) {
}
function saveBeatmap(event) {
}
function importBeatmap(event) {
}
function dropHandler(event) {
}
function beatLinesValueChange(event) {
    console.log("beat line changed");
    console.log(event.target.value);
    editor.changeBeatlinesCount(event.target.value);
}
function bmpValueChange(event) {
    console.log(event.target.value);
    editor.changeBpmValue(event.target.value);
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
