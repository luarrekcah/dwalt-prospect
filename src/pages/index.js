const { Client, LocalAuth } = require("whatsapp-web.js");
const client = new Client({
  restartOnAuthFail: true,
  authStrategy: new LocalAuth(),
});
//buttons
const infoSave = document.getElementById("infoSave");
const configSave = document.getElementById("configSave");

const messageHandler = require(`../core/handler/message`);
const readyHandler = require(`../core/handler/ready`);
const qrHandler = require(`../core/handler/qr`);
const disconnectedHandler = require(`../core/handler/disconnected`);

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
  return disconnectedHandler.run();
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