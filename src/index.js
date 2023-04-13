const { app, BrowserWindow, dialog, Menu } = require("electron"),
  path = require("path"),
  fs = require("fs"),
  { validateDate, generateLicenseKey } = require("./sysutils"),
  axios = require("axios"),
  log = require("electron-log");

const menu = require("./menu");

const { LICENSE_FILE_PATH, ROOT_DIR } = require("./paths");

log.info(`DIRETORIO RAIZ: ${ROOT_DIR}`);

log.info(LICENSE_FILE_PATH);

let verificationWindow, mainWindow;

let licenseKey;

if (fs.existsSync(LICENSE_FILE_PATH)) {
  licenseKey = fs.readFileSync(LICENSE_FILE_PATH, "utf-8").trim();
} else {
  licenseKey = generateLicenseKey();
  fs.writeFileSync(LICENSE_FILE_PATH, licenseKey);
}

const createVerificationWindow = () => {
  verificationWindow = new BrowserWindow({
    width: 400,
    height: 300,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, "assets/icon.png"),
  });

  verificationWindow.setMenu(null);

  verificationWindow.loadFile(`${__dirname}/screens/verification/index.html`);

  verificationWindow.once("ready-to-show", () => {
    verificationWindow.show();
    verificationWindow.webContents.send("key", licenseKey);
  });
};

const createWindow = () => {
  require("./core");
  require("./sysutils/essentialFiles");

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, "assets/icon.png"),
  });

  mainWindow.loadFile(`${__dirname}/screens/index/index.html`);
};

const checkVersion = (actual) => {
  const atualNumbers = actual.split(".").map(Number);
  return fetch(`https://api.github.com/repos/luarrekcah/dwalt-prospect/tags`)
    .then((response) => response.json())
    .then((tags) => {
      const latestTag = tags.find((tag) => {
        const numbers = tag.name.split(".").map(Number);
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
        dialog
          .showMessageBox(mainWindow, {
            type: "info",
            message: `Nova versão disponível: ${latestTag.name}.`,
            buttons: ["Baixar", "Cancelar"],
          })
          .then((response) => {
            if (response.response === 0) {
              shell.openExternal(
                `https://github.com/luarrekcah/dwalt-prospect/releases/download/${latestTag.name}/ProspectSetup.exe`
              );
            } else {
              return;
            }
          });
      } else {
        console.log("Você está usando a versão mais recente.");
      }
    })
    .catch((error) => {
      log.warn(
        `Ocorreu um erro ao buscar as tags do repositório luarrekcah/dwalt-prospect: ${error}`
      );
    });
};

app.on("ready", () => {
  axios
    .get("https://api-dlwalt.glitch.me/verify", { params: { key: licenseKey } })
    .then(async (r) => {
      const data = r.data;
      if (data) {
        if (validateDate(data.validUntil) && data.lockedAcess === false) {
          if (data.acessUpdates) {
            await checkVersion(app.getVersion()); // Checks app version
          }
          try {
            if (verificationWindow !== undefined) {
              verificationWindow.close();
            }
          } catch (error) {
            log.warn(error);
          }
          try {
            createWindow();
          } catch (error) {
            log.warn(error);
          }
        } else {
          try {
            mainWindow.close();
          } catch (error) {
            log.warn(error);
          }
          createVerificationWindow();
        }
      } else {
        createVerificationWindow();
      }
    })
    .catch((error) => {
      createVerificationWindow();
      log.warn(error);
    });

  Menu.setApplicationMenu(menu);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
