const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const electronReload = require('electron-reload');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const menuList = [
  {
    label: 'Tela Cheia',
    accelerator: (() => {
      if (process.platform === 'darwin') {
        return 'Ctrl+Command+F';
      } else {
        return 'F11';
      }
    })(),
    click: (item, focusedWindow) => {
      if (focusedWindow) {
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
      }
    }
  },
  {
    label: 'Opções',
    submenu: [
      {
        label: 'Reiniciar',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        }
      },
      {
        label: 'DevTools',
        accelerator: 'CmdOrCtrl+Shift+I',
        click: (item, focusedWindow) => {
          focusedWindow.openDevTools();
        }
      },
    ]
  },
  {
    label: 'Ajuda',
    accelerator: 'CmdOrCtrl+H',
    click: (item, focusedWindow) => {
      //sair
    }
  }
]

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: __dirname + '/assets/icon.png'
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '/pages/index.html'));
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

const menu = Menu.buildFromTemplate(menuList);
Menu.setApplicationMenu(menu);

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
electronReload(__dirname);