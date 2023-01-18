const { Client, LocalAuth } = require("whatsapp-web.js");
const client = new Client({
  restartOnAuthFail: true,
  authStrategy: new LocalAuth(),
});

const messageHandler = require(`./handler/message`);
const readyHandler = require(`./handler/ready`);
const qrHandler = require(`./handler/qr`);
const disconnectedHandler = require(`./handler/disconnected`);

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

client.initialize();
