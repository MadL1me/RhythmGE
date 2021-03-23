const { ipcRenderer } = require("electron") 

function importAudio() {
    ipcRenderer.send("openDialog", {})
}

var button = document.getElementById("import_audio_btn");
button.addEventListener("click", importAudio);