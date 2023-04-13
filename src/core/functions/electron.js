const { BrowserWindow } = require("electron");

module.exports = {
  sendToRenderer: (listenerName, object) => {
    const win =
      BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (win) {
      win.webContents.send(listenerName, object);
    } else {
      console.error("No window found");
    }
  },
};
