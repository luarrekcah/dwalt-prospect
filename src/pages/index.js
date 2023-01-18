const { Client, LocalAuth } = require("whatsapp-web.js");
const client = new Client({
  restartOnAuthFail: true,
  authStrategy: new LocalAuth(),
});
const fs = require("fs");
const genqr = require("qr-image");

const data = require("../data.json");

const qrElement = document.getElementById("qr");
const divInitial = document.getElementById("divInitial");
const mainElement = document.getElementById("main");
const nameElement = document.getElementById("namebot");

//buttons
const infoSave = document.getElementById("infoSave");
const configSave = document.getElementById("configSave");

client.on("qr", (qr) => {
  divInitial.innerHTML = `<p>Para que o bot tenha acesso ao seu whatsapp, você precisa ler o <b>código QR</b>.</p><p>Já leu o QR? Aguarde alguns segundos para que o bot atualize o status.</p>`;
  const qrImage = genqr.image(qr);
  const chunks = [];
  qrImage.on("data", (chunk) => chunks.push(chunk));
  qrImage.on("end", () => {
    const buffer = Buffer.concat(chunks);
    const base64data = buffer.toString("base64");
    qrElement.src = `data:image/png;base64,${base64data}`;
  });
});

client.on("ready", () => {
  console.log("Client is ready!");
  divInitial.style.display = "none";
  qrElement.style.display = "none";
  namebot.innerHTML = `Prospect bot <span class="badge text-bg-success">Online</span>`;
  mainElement.style.display = "block";

  document.getElementById("text").value = data.text || '';
  document.getElementById("businesstype").value = data.type || '';
  document.getElementById("where").value = data.location || '';
  document.getElementById("apiKey").value = data.apiKey || '';
});

client.on("message", (message) => {
  if (message.body === "!ping") {
    client.sendMessage(message.from, "Dados coletados.");
    console.log(message);
  }
});

client.on("disconnected", () => {
  mainElement.style.display = "none";
  namebot.innerHTML = `Prospect bot <span class="badge text-bg-danger">Desconectado</span>`;
  setTimeout(() => {
    location.reload();
  }, 3000);
});

const saveData = (data) => {
  const toStringData = JSON.stringify(data);
  fs.writeFileSync(`${__dirname}/../data.json`, toStringData);
  
  alert("Suas preferências foram salvas.");
};

infoSave.addEventListener("click", () => {
  saveData({
    text: document.getElementById("text").value,
    type: document.getElementById("businesstype").value,
    location: document.getElementById("where").value,
    apiKey: document.getElementById("apiKey").value
  });
});

configSave.addEventListener("click", () => {
  saveData({
    text: document.getElementById("text").value,
    type: document.getElementById("businesstype").value,
    location: document.getElementById("where").value,
    apiKey: document.getElementById("apiKey").value
  });
});

client.initialize();
