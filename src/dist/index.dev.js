"use strict";

var _require = require('electron'),
    app = _require.app,
    ipcMain = _require.ipcMain,
    dialog = _require.dialog,
    BrowserWindow = _require.BrowserWindow;

var fs = require("fs");

var path = require('path'); // Handle creating/removing shortcuts on Windows when installing/uninstalling.


if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

var createWindow = function createWindow() {
  // Create the browser window.
  var mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    webSecurity: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  }); // and load the index.html of the app.

  mainWindow.loadFile(path.join(__dirname, 'index.html')); // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  ipcMain.on("openDialog", function (event, arg) {
    dialog.showOpenDialog(mainWindow, {}).then(function (result) {
      event.reply("openDialog-reply", result.filePaths[0]);
    });
  });
}; // This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.


app.on('ready', createWindow); // Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});