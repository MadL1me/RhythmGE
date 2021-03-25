const { ipcRenderer, ipcMain } = require("electron") 
const Editor = require("./editor"); 
require("howler");

var editor = new Editor();
editor.drawEditor();

document.getElementById('files').addEventListener('change', handleFileSelect, false);

function canvasClickHandler(event) {
    editor.canvasClickHandle(event);
}

ipcRenderer.on("openDialog-reply", (event, arg) => {
    console.log(arg);

    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
})

function handleFileSelect(event) {
    var files = event.target.files;
    audioLoad(files[0]);
    console.log(files[0]);
}

function audioLoad(file) {
    
    var sound = new Howl({src: [file.path]});
    sound.play();
    
    // var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // var reader = new FileReader();
    // var rawAudioBuffer = [];
    // var audioBuffer = [];

    // reader.onload += (arrayBuffer) => {
    //     rawAudioBuffer = arrayBuffer;
    // };
    
    // reader.readAsArrayBuffer(file);
    
    // audioCtx.decodeAudioData(rawAudioBuffer, (buffer) => {
    //     audioBuffer = buffer;
    // });

    // source = audioCtx.createBufferSource();
    // source.buffer = audioBuffer;
    // source.connect(audioCtx.destination);
    // source.start(0);
}

function loadAudioFile(event) {
    //var file = event.target.files;
    ipcRenderer.send("openDialog", {})
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
}

function bmpValueChange(event) {

}

var drop_zone = document.getElementById("drop_zone")
drop_zone.ondrag = (event) => {
    
}

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
    } else {
        // Use DataTransfer interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
        }
    }
}

drop_zone.ondragover = (event) => {
    event.preventDefault()
    console.log("fuck3");
}
