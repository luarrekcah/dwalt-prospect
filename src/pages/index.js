const { Client, LocalAuth } = require("whatsapp-web.js");
const client = new Client({
  restartOnAuthFail: true,
  authStrategy: new LocalAuth(),
});

const genqr = require("qr-image");

const data = require("../data.json");

const qrElement = document.getElementById("qr");
const divInitial = document.getElementById("divInitial");
const mainElement = document.getElementById("main");
const nameElement = document.getElementById("namebot");

//buttons
const infoSave = document.getElementById("infoSave");
const configSave = document.getElementById("configSave");

const messageHandler = require(`../core/handler/message`);
const readyHandler = require(`../core/handler/ready`);
const qrHandler = require(`../core/handler/qr`);

const {saveData} = require("../utils") 

client.on("qr", (qr) => {
  return qrHandler.run(qr);
});

client.on("ready", () => {
  return readyHandler.run();
});

client.on("message", (message) => {
  return messageHandler.run(client, message);
});

client.on("disconnected", () => {
  mainElement.style.display = "none";
  namebot.innerHTML = `Prospect bot <span class="badge text-bg-danger">Desconectado</span>`;
  setTimeout(() => {
    location.reload();
  }, 3000);
});

infoSave.addEventListener("click", () => {
  saveData({
    text: document.getElementById("text").value,
    type: document.getElementById("businesstype").value,
    location: document.getElementById("where").value,
    apiKey: document.getElementById("apikey").value
  });
});

configSave.addEventListener("click", () => {
  saveData({
    text: document.getElementById("text").value,
    type: document.getElementById("businesstype").value,
    location: document.getElementById("where").value,
    apiKey: document.getElementById("apikey").value
  });
});

client.initialize();
