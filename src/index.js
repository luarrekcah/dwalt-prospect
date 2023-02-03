const {app, BrowserWindow, Menu, ipcMain, Notification} = require('electron');
const path = require('path');
// const electronReload = require('electron-reload');
const {production} = require('../config.json');
const fs = require('fs');
const {initializeApp} = require('@firebase/app');
const {getDatabase, ref, onValue, get, child} = require('@firebase/database');
require('dotenv').config();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId,
};

try {
  initializeApp(firebaseConfig);
  console.log('Connected to Firebase Database');
} catch (error) {
  console.error(error);
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
            fs.rmdir(
                `${__dirname}/../.wwebjs_auth`,
                {recursive: true},
                (err) => {
                  if (err) {
                    throw err;
                  }
                  console.log(`Credenciais apagadas!`);
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
    for (let j = 0; j < 5; j++) {
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
    icon: __dirname + '/assets/icon.png',
  });

  verificationWindow.setMenu(null);

  verificationWindow.loadFile(`${__dirname}/pages/verification.html`);

  verificationWindow.once('ready-to-show', () => {
    verificationWindow.show();
    verificationWindow.webContents.send('key', licenseKey);
  });
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: __dirname + '/assets/icon.png',
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '/pages/index.html'));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  /* const db = getDatabase();
  const keys = ref(db, 'prospect/keys');
   onValue(
        keys,
        (snapshot) => {
          if (snapshot.exists() && snapshot.val()) {
            console.log(snapshot.val());
            createWindow();
          } else {
            createVerificationWindow();
          }
        },
        {
          onlyOnce: true,
        },
    );*/
  const dbRef = ref(getDatabase());
  get(child(dbRef, `prospect/keys/${licenseKey}`)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
    } else {
      createVerificationWindow();
    }
  }).catch((error) => {
    console.error(error);
    createVerificationWindow();
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
