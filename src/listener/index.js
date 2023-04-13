const { dialog, app } = require("electron");
const { sendToRenderer } = require("../core/functions/electron");
const {
  sendUniqueMessage,
  sendProspect,
  sendProspectAll,
} = require("../core/functions/venom");
const { writeData, getData, overrideDb } = require("../sysutils");
const fs = require("fs");
const XLSX = require("xlsx");
const { MEDIAS_DIR_PATH } = require("../paths");
const log = require("electron-log");

module.exports.run = (client, ipcMain) => {
  const files = fs.readdirSync(MEDIAS_DIR_PATH);
  sendToRenderer("newFileAdded", files);

  ipcMain.on("sendTest", (event, number) => {
    sendUniqueMessage(client, number);
  });

  ipcMain.on("sendUnique", (event, number) => {
    const num = number.replace(/\s|\-/g, "").slice(1);
    sendUniqueMessage(client, num);
  });

  ipcMain.on("sendProspect", (event, choice) => {
    sendProspect(client, choice);
  });

  ipcMain.on("prospectAll", (event, search) => {
    sendProspectAll(client, search);
  });

  ipcMain.on("onSaveConfig", (event, data) => {
    const result = writeData("keys", data);
    if (result) {
      sendToRenderer("notify", {
        type: "success",
        message: "Dados atualizados com sucesso.",
      });
    } else {
      sendToRenderer("notify", {
        type: "danger",
        message: "Falha ao atualizar dados!",
      });
    }
  });

  ipcMain.on("onSaveSearchInfos", (event, data) => {
    const result = writeData("keys", data);
    if (result) {
      sendToRenderer("notify", {
        type: "success",
        message: "Dados atualizados com sucesso.",
      });
    } else {
      sendToRenderer("notify", {
        type: "danger",
        message: "Falha ao atualizar dados!",
      });
    }
  });

  ipcMain.on("onNewFile", (event, data) => {
    fs.writeFile(
      `${MEDIAS_DIR_PATH}/${data.name}`,
      data.base64,
      { encoding: "base64" },
      function (err) {
        if (err) {
          sendToRenderer("notify", {
            type: "danger",
            message: "Falha ao adicionar arquivo",
          });
        } else {
          sendToRenderer("notify", {
            type: "success",
            message: "Arquivo adicionado!",
          });
        }
      }
    );
  });

  ipcMain.on("deleteFile", (event, file) => {
    fs.unlink(`${MEDIAS_DIR_PATH}/${file}`, (err) => {
      if (err) {
        sendToRenderer("notify", {
          type: "danger",
          message: "Falha ao deletar arquivo",
        });
      } else {
        sendToRenderer("notify", {
          type: "success",
          message: "Arquivo deletado!",
        });

        const files = fs.readdirSync(MEDIAS_DIR_PATH);
        sendToRenderer("newFileAdded", files);
      }
    });
  });

  ipcMain.on("deleteBusiness", (event, num) => {
    const businessList = getData("db");

    const newBusinessList = businessList.filter(
      (business) => business.phone !== num
    );

    const result = overrideDb(newBusinessList);

    if (result) {
      sendToRenderer("notify", {
        type: "success",
        message: "Empresa removida com sucesso.",
      });
    } else {
      sendToRenderer("notify", {
        type: "danger",
        message: "Falha ao remover empresa!",
      });
    }
  });

  ipcMain.on("export-excel-dialog", (event) => {
    dialog
      .showSaveDialog({
        defaultPath: app.getPath("downloads") + "/empresas.xlsx",
        filters: [{ name: "Excel Workbook", extensions: ["xlsx"] }],
      })
      .then((result) => {
        if (!result.canceled) {
          event.reply("file-dialog-result", result.filePath);
        }
      })
      .catch((err) => {
        console.error(err);
        log.warn(err);
      });
  });

  const excelDateToJSDate = (excelDate) => {
    const date = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  ipcMain.on("import-excel-dialog", (event) => {
    dialog
      .showOpenDialog({
        filters: [{ name: "Excel", extensions: ["xlsx", "xls"] }],
      })
      .then(async (result) => {
        if (!result.filePaths || result.filePaths.length === 0) {
          return;
        }
        const workbook = XLSX.readFile(result.filePaths[0]);
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const excelCellsTrated = [];

        for (unit of sheetData) {
          excelCellsTrated.push({
            title: unit.Nome,
            local: unit.Local,
            group: unit.Grupo,
            phone: unit["Número"],
            date: excelDateToJSDate(unit.Data),
            formatedPhone: unit["Número"]
              .replaceAll(" ", "")
              .replaceAll("-", "")
              .replaceAll("+", ""),
          });
        }

        writeData("db", excelCellsTrated);
      })
      .catch((err) => {
        console.log(err);
        log.warn(err);
      });
  });

  ipcMain.on("addBusiness", async (event, obj) => {
    const businessList = await getData("db");

    businessList.push(obj);

    const result = overrideDb(businessList);

    if (result) {
      sendToRenderer("notify", {
        type: "success",
        message: "Empresa adicionada com sucesso.",
      });
    } else {
      sendToRenderer("notify", {
        type: "danger",
        message: "Falha ao adicionar empresa!",
      });
    }
  });

  ipcMain.on("deleteAll", async (event, search) => {
    sendToRenderer("notify", {
      type: "info",
      message: "Preparando para apagar contatos...",
    });

    const db = await getData("db");

    const businessFiltered = db.filter((item) => {
      return Object.values(item)
        .join("")
        .toLowerCase()
        .includes(search.toLowerCase());
    });

    const newBusinessList = db.filter((business) => {
      for (let i = 0; i < businessFiltered.length; i++) {
        if (business.phone === businessFiltered[i].phone) {
          return false;
        }
      }
      return true;
    });

    const result = overrideDb(newBusinessList);

    if (result) {
      sendToRenderer("notify", {
        type: "success",
        message: "Contatos removidos com sucesso.",
      });
    } else {
      sendToRenderer("notify", {
        type: "danger",
        message: "Falha ao remover contatos!",
      });
    }
  });
};
