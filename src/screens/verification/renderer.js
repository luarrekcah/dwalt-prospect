const { ipcRenderer } = require("electron");

ipcRenderer.on("key", (event, key) => {
  document.getElementById("key").innerHTML = `Chave: ${key}`;
});
