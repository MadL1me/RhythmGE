const { ipcRenderer, ipcMain } = require("electron") 
const Editor = require("./editor"); 

var editor = new Editor();
editor.drawEditor();

function canvasClickHandler(event) {
    var canvas = event.target;
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    editor.addTimestamp(canvas, event);
}

ipcRenderer.on("openDialog-reply", (event, arg) => {
    console.log(arg);
    
    //const player = new Audio("http://localhost/" + (arg[0] - "C:\\"));
    //player.play();

    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
})

function importAudio() {
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
