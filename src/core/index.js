const { ipcMain } = require("electron");
const venom = require("venom-bot");
const { sendToRenderer } = require("./functions/electron");
const fs = require("fs");
const { getData } = require("../sysutils");
const { LICENSE_FILE_PATH, ROOT_DIR } = require("../paths");
const log = require("electron-log");

const licenseKey = fs.readFileSync(LICENSE_FILE_PATH, "utf-8").trim();

const updateApiUsage = () => {
  const data = getData("keys");
  if (data.apiKey !== "") {
    fetch(`https://serpapi.com/account?api_key=${data.apiKey}`)
      .then((strRes) => strRes.json())
      .then((jsonRes) => {
        sendToRenderer("onApiUsage", jsonRes);
      })
      .catch((error) => {
        console.error(error);
        log.warn(error);
      });
  }
};

const handleQr = (base64Qr) => {
  sendToRenderer("qrCode", base64Qr);
  console.log(base64Qr);
};

const handleStatusSession = (statusSession) => {
  sendToRenderer("statusSession", statusSession);
  switch (statusSession) {
    case "successChat":
      // Show screen dashboard normal
      console.log("Logado");
      break;
    case "deviceNotConnected":
      console.log("Aparelho não conectado");
      break;
    case "erroPageWhatsapp":
      console.log("Erro na pagina do wpp");
      break;
  }
};

const start = async (client) => {
  require("../listener").run(client, ipcMain);

  client.onMessage((message) => {
    require("./handler/message").run(client, message);
  });

  client.onStateChange((state) => {
    console.log("State changed: ", state);
    // force whatsapp take over
    if ("CONFLICT".includes(state)) client.useHere();
    // detect disconnect on whatsapp
    if ("UNPAIRED".includes(state)) console.log("logout");

    sendToRenderer("notify", { type: "info", message: state });
  });

  let time = 0;
  client.onStreamChange((state) => {
    console.log("State Connection Stream: " + state);
    sendToRenderer("notify", { type: "info", message: state });
    clearTimeout(time);
    if (state === "DISCONNECTED" || state === "SYNCING") {
      time = setTimeout(() => {
        client.close();
      }, 80000);
    }

    if (state === "LOGOUT") {
    }
  });

  client.onAddedToGroup((chatEvent) => {
    sendToRenderer("notify", {
      type: "info",
      message: "Você acabou de ser adicionado em um grupo.",
    });
  });

  client.onIncomingCall(async (call) => {
    sendToRenderer("notify", {
      type: "info",
      message: "Você está recebendo uma ligação.",
    });
  });

  const startupData = {};

  startupData.keys = getData("keys");
  startupData.bankLength = getData("db").length;
  startupData.db = getData("db");

  sendToRenderer("startupProgram", startupData);

  sendToRenderer("deviceInfos", {
    WAVersion: await client.getWAVersion(),
  });

  sendToRenderer("licenseKey", licenseKey);

  updateApiUsage();
  setInterval(() => {
    updateApiUsage();
  }, 60000);

  try {
    const chats = await client.getAllChats();
    sendToRenderer("chatLength", chats.length);
  } catch (error) {
    // Try again
    log.warn(error);
    console.log(error);
    const chats = await client.getAllChats();
    sendToRenderer("chatLength", chats.length);

    sendToRenderer("notify", {
      type: "danger",
      message:
        "Ocorreu um erro na inicialização do bot, tentamos iniciar o programa normalmente, caso seus valores fiquem zerados, reinicie o programa.",
    });
  }
};

venom
  .create(
    "prospect",
    (base64Qr) => {
      handleQr(base64Qr);
    },
    (statusSession) => {
      handleStatusSession(statusSession);
    },
    {
      logQR: false,
      multidevice: true,
      disableWelcome: true,
      mkdirFolderToken: ROOT_DIR,
    }
  )
  .then((client) => {
    start(client);
  })
  .catch((erro) => {
    console.log(erro);
    log.warn(erro);
  });
