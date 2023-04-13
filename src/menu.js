const { app, Menu, clipboard, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const { LICENSE_FILE_PATH } = require("./paths");
const { generateLicenseKey } = require("./sysutils");

let licenseKey;

if (fs.existsSync(LICENSE_FILE_PATH)) {
  licenseKey = fs.readFileSync(LICENSE_FILE_PATH, "utf-8").trim();
} else {
  licenseKey = generateLicenseKey();
  fs.writeFileSync(LICENSE_FILE_PATH, licenseKey);
}

const template = [
  {
    label: "Menu",
    submenu: [
      {
        label: "Copiar chave",
        click() {
          clipboard.writeText(licenseKey);
        },
      },
      {
        type: "separator",
      },
      {
        label: "Reiniciar",
        click() {
          app.relaunch();
          app.quit();
        },
      },
      {
        label: "Sair",
        click() {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Ajuda",
    submenu: [
      {
        label: "Página do Prospect",
        click() {
          const url = "https://prospect.dlwalt.com";
          shell.openExternal(url);
        },
      },
      {
        label: "Suporte Técnico",
        click() {
          const url = "https://wa.me/+556892402096";
          shell.openExternal(url);
        },
      },
    ],
  },
  {
    label: "Filie-se",
    submenu: [
      {
        label: "Hotmart",
        click() {
          const url =
            "https://app-vlc.hotmart.com/affiliate-recruiting/view/2841P80697124";
          shell.openExternal(url);
        },
      },
    ],
  },
];

/* ONLY DEV
menu.push({
  label: "Avançado",
  submenu: [
    {
      label: "Menu de desenvolvedor",
      accelerator: "CmdOrCtrl+Shift+I",
      role: "toggleDevTools",
    },
  ],
});*/

const menu = Menu.buildFromTemplate(template);

module.exports = menu;
