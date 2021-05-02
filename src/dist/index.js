const { app, ipcMain, dialog, BrowserWindow, nativeTheme } = require('electron');
const fs = require("fs");
const path = require('path');

console.log(__dirname);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  //saveFile(null);
  
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 900,
    minHeight: 700,
    webSecurity: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      themeSource: "dark"
  }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
 
  ipcMain.on("openDialog", (event, arg) => {
    dialog.showOpenDialog(mainWindow, 
    {}).then(result => {
        event.reply("openDialog-reply", fs.readFileSync(result.filePaths[0]));
    })
  })
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function saveFile(timestamps) {
  let a = dialog.showSaveDialog({title: "LMAO"});
  let b = "LOL LOL LOL ";
  a.then(result => {
      if (result.canceled) {
          console.log("ERROR OMG OMG");
          return;
      }
      console.log(`file path is: ${result.filePath}`);
      fs.writeFile(result.filePath, b, (err) => {
          if (err) {
              console.log("FUCKING ERROR");
              return;
          }
      });
  });
}