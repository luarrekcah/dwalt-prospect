const { app, BrowserWindow, Menu, ipcMain, Notification } = require("electron");
const path = require("path");
const electronReload = require("electron-reload");
const { production } = require("../config.json");
const fs = require("fs");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

ipcMain.on("notification", (event, arg) => {
  new Notification({ title: "Notificação", body: arg }).show();
});

const menuList = [
  {
    label: "Tela Cheia",
    accelerator: (() => {
      if (process.platform === "darwin") {
        return "Ctrl+Command+F";
      } else {
        return "F11";
      }
    })(),
    click: (item, focusedWindow) => {
      if (focusedWindow) {
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
      }
    },
  },
  {
    label: "Opções",
    submenu: [
      {
        label: "Reiniciar",
        accelerator: "CmdOrCtrl+R",
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        },
      },
      {
        label: "Resetar login",
        accelerator: "CmdOrCtrl+T",
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            fs.rmdir(`${__dirname}/../.wwebjs_auth`, { recursive: true }, (err) => {
              if (err) {
                throw err;
              }
              console.log(`Credenciais apagadas!`);
              focusedWindow.reload();
            });
          }
        },
      },
    ],
  },
];

if (!production) {
  menuList.push({
    label: "DevTools",
    accelerator: "CmdOrCtrl+Shift+I",
    click: (item, focusedWindow) => {
      focusedWindow.openDevTools();
    },
  });
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: __dirname + "/assets/icon.png",
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "/pages/index.html"));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

const menu = Menu.buildFromTemplate(menuList);
Menu.setApplicationMenu(menu);

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
//electronReload(`${__dirname}/core`);

function handleSquirrelEvent(application) {
  if (process.argv.length === 1) {
    return false;
  }
  const ChildProcess = require("child_process");
  const path = require("path");
  const appFolder = path.resolve(process.execPath, "..");
  const rootAtomFolder = path.resolve(appFolder, "..");
  const updateDotExe = path.resolve(path.join(rootAtomFolder, "Update.exe"));
  const exeName = path.basename(process.execPath);
  const spawn = function (command, args) {
    let spawnedProcess, error;
    try {
      spawnedProcess = ChildProcess.spawn(command, args, {
        detached: true,
      });
    } catch (error) {}
    return spawnedProcess;
  };
  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };
  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case "--squirrel-install":
    case "--squirrel-updated":
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus
      // Install desktop and start menu shortcuts
      spawnUpdate(["--createShortcut", exeName]);
      setTimeout(application.quit, 1000);
      return true;
    case "--squirrel-uninstall":
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers
      // Remove desktop and start menu shortcuts
      spawnUpdate(["--removeShortcut", exeName]);
      setTimeout(application.quit, 1000);
      return true;
    case "--squirrel-obsolete":
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated
      application.quit();
      return true;
  }
}
