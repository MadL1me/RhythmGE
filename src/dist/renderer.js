// import { ipcRenderer, ipcMain } from "electron";
// import { editor } from "./dist/editor";
// import { Howler, Howl } from "howler";
var Howler = require("howler");
var Howl = require("howler");
var editor = require("./dist/editor");
editor.drawEditor();
editor.drawEditor();
document.getElementById('files').addEventListener('change', handleFileSelect, false);
function canvasClickHandler(event) {
    editor.canvasClickHandle(event);
}
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
    sound.on("play", () => {
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
    editor.changeBeatlinesCount(parseInt(event.target.value));
}
function bmpValueChange(event) {
    console.log(event.target.value);
    editor.changeBpmValue(parseInt(event.target.value));
}
var drop_zone = document.getElementById("drop_zone");
drop_zone.ondrag = (event) => {
};
drop_zone.ondrop = (ev) => {
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
drop_zone.ondragover = (event) => {
    event.preventDefault();
    console.log("fuck3");
};
