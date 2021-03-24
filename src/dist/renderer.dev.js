"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _require = require("electron"),
    ipcRenderer = _require.ipcRenderer,
    ipcMain = _require.ipcMain;

var editor = require("./editor"); //import Editor from "./editor";


console.log(_typeof(editor));
editor.addTimestamp(100, 100);

function importAudio() {
  ipcRenderer.send("openDialog", {});
}

var button = document.getElementById("import_audio_btn");
button.addEventListener("click", importAudio);
ipcRenderer.on("openDialog-reply", function (event, arg) {
  console.log(arg); //const player = new Audio("http://localhost/" + (arg[0] - "C:\\"));
  //player.play();

  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
});

function dragOverhandler(event) {}

function dropHandler(event) {}

var drop_zone = document.getElementById("drop_zone");

drop_zone.ondrag = function (event) {};

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
  } else {
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