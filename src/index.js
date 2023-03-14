/* eslint-disable max-len */
const {app, BrowserWindow, Menu, ipcMain, Notification, dialog, shell} = require('electron');
const path = require('path');
// const electronReload = require('electron-reload');
const {production} = require('../config.json');
const fs = require('fs');
const {default: axios} = require('axios');
const log = require('electron-log');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

ipcMain.on('notification', (event, arg) => {
  new Notification({title: 'Notificação', body: arg}).show();
});

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
    },
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
        },
      },
      {
        label: 'Resetar login',
        accelerator: 'CmdOrCtrl+T',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            fs.rm(
                `${__dirname}/../.wwebjs_auth`,
                {recursive: true},
                (err) => {
                  if (err) {
                    throw err;
                  }
                  focusedWindow.reload();
                },
            );
          }
        },
      },
    ],
  },
];

if (!production) {
  menuList.push({
    label: 'DevTools',
    accelerator: 'CmdOrCtrl+Shift+I',
    click: (item, focusedWindow) => {
      focusedWindow.openDevTools();
    },
  });
}







let verificationWindow;
// eslint-disable-next-line require-jsdoc
function generateLicenseKey() {
  const key = [];

  for (let i = 0; i < 4; i++) {
    const part = [];
    for (let j = 0; j < 4; j++) {
      part.push(Math.random().toString(36).substring(2, 3).toUpperCase());
    }
    key.push(part.join(''));
  }

  return key.join('-');
}
let licenseKey;

try {
  licenseKey = fs.readFileSync('license.key', 'utf-8');
} catch (error) {
  licenseKey = generateLicenseKey();
  fs.writeFileSync('license.key', licenseKey);
}

// eslint-disable-next-line require-jsdoc
function createVerificationWindow() {
  verificationWindow = new BrowserWindow({
    width: 400,
    height: 300,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'assets/icon.png'),
  });

  verificationWindow.setMenu(null);

  verificationWindow.loadFile(`${__dirname}/pages/verification.html`);

  verificationWindow.once('ready-to-show', () => {
    verificationWindow.show();
    verificationWindow.webContents.send('key', licenseKey);
  });
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'assets/icon.png'),
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '/pages/index.html'));
};

const validateDate = (dateString) => {
  const dateArray = dateString.split('-');
  const day = parseInt(dateArray[0], 10);
  const month = parseInt(dateArray[1], 10) - 1;
  const year = parseInt(dateArray[2], 10);

  const inputDate = new Date(year, month, day);

  if (isNaN(inputDate.getTime())) {
    return false;
  }

  const currentDate = new Date();

  return inputDate >= currentDate;
};

const checkVersion = (actual) => {
  const atualNumbers = actual.split('.').map(Number);
  return fetch(`https://api.github.com/repos/luarrekcah/dwalt-prospect/tags`)
      .then((response) => response.json())
      .then((tags) => {
        const latestTag = tags.find((tag) => {
          const numbers = tag.name.split('.').map(Number);
          for (let i = 0; i < numbers.length; i++) {
            if (numbers[i] > atualNumbers[i]) {
              return true;
            } else if (numbers[i] < atualNumbers[i]) {
              return false;
            }
          }
          return false;
        });

        if (latestTag) {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            message: `Nova versão disponível: ${latestTag.name}.`,
            buttons: ['Baixar', 'Cancelar'],
          }).then((response) => {
            if (response.response === 0) {
              shell.openExternal(`https://github.com/luarrekcah/dwalt-prospect/releases/download/${latestTag.name}/ProspectSetup.exe`);
            } else {
              return;
            }
          });
        } else {
          console.log('Você está usando a versão mais recente.');
        }
      })
      .catch((error) => {
        console.error(`Ocorreu um erro ao buscar as tags do repositório luarrekcah/dwalt-prospect: ${error}`);
      });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  await checkVersion(app.getVersion());
  axios
      .get('https://api-dlwalt.glitch.me/verify', {params: {key: licenseKey}})
      .then((r) => {
        const data = r.data;
        if (data) {
          if (validateDate(data.validUntil) && data.lockedAcess === false) {
            try {
              if (verificationWindow !== undefined) {
                verificationWindow.close();
              }
            } catch (error) {
              console.log(error);
            }
            createWindow();
          } else {
            try {
              mainWindow.close();
            } catch (error) {
              console.log(error);
            }
            createVerificationWindow();
          }
        } else {
          createVerificationWindow();
        }
      })
      .catch((error) => {
      // Handle error
        createVerificationWindow();
        console.error(error);
      });
});

ipcMain.on('open-file-dialog', (event) => {
  dialog.showSaveDialog({defaultPath: app.getPath('downloads') + '/empresas.xlsx',
    filters: [{name: 'Excel Workbook', extensions: ['xlsx']}]})
      .then((result) => {
        if (!result.canceled) {
          event.reply('file-dialog-result', result.filePath);
        }
      }).catch((err) => {
        console.error(err);
      });
});

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
// electronReload(`${__dirname}/core`);

log.log(`App version ${app.getVersion()}`);


