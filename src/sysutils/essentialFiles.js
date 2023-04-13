const fs = require("fs");
const { sendToRenderer } = require("../core/functions/electron");
const { DB_FILE, KEYS_FILE, ROOT_DIR, MEDIAS_DIR_PATH } = require("../paths");

const dbPath = DB_FILE;
const keysPath = KEYS_FILE;

const essentialFiles = ["db.json", "keys.json"];

const readAndSendFileContent = (filePath, eventName) => {
  fs.readFile(filePath, function (err, data) {
    if (err) {
      console.error(`Erro ao ler o arquivo ${filePath}: ${err}`);
      return;
    }

    sendToRenderer(eventName, data.toString());
  });
};

for (const fileName of essentialFiles) {
  fs.access(`${ROOT_DIR}/${fileName}`, (err) => {
    if (err) {
      console.log(`${fileName} dont exist. Creating...`);
      fs.writeFile(
        `${ROOT_DIR}/${fileName}`,
        fileName === "db.json"
          ? "[]"
          : '{"text":"","forType":"","where":"","apiKey":"","interval":"9","checks":{"blockRepeat":false}}',
        (err) => {
          if (err) {
            console.error(`Error ${fileName}: ${err}`);
          } else {
            console.log(`${fileName} Created with success`);
            readAndSendFileContent(dbPath, "onDbUpdate");
            readAndSendFileContent(keysPath, "onKeysUpdate");
          }
        }
      );
    } else {
      readAndSendFileContent(
        `${ROOT_DIR}/${fileName}`,
        fileName === "db.json" ? "onDbUpdate" : "onKeysUpdate"
      );
    }
  });
}

const mediasDirPath = MEDIAS_DIR_PATH;

if (!fs.existsSync(mediasDirPath)) {
  fs.mkdirSync(mediasDirPath);
  console.log(`Diretório ${mediasDirPath} criado com sucesso`);
}

if (fs.existsSync(dbPath)) {
  fs.watch(dbPath, function (eventType, filename) {
    sendToRenderer("notify", {
      type: "info",
      message: "Banco de números atualizado.",
    });
    if (eventType === "change") {
      readAndSendFileContent(dbPath, "onDbUpdate");
    }
  });
}

if (fs.existsSync(keysPath)) {
  fs.watch(keysPath, function (eventType, filename) {
    if (eventType === "change") {
      readAndSendFileContent(keysPath, "onKeysUpdate");
    }
  });
}

fs.watch(MEDIAS_DIR_PATH, function (eventType, filename) {
  if (eventType === "change") {
    const files = fs.readdirSync(MEDIAS_DIR_PATH);
    sendToRenderer("newFileAdded", files);
  }
});
