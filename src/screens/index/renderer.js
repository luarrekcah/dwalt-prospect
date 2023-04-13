const { ipcRenderer } = require("electron");
const XLSX = require("xlsx");
const log = require("electron-log");
const formFile = document.getElementById("formFile");

ipcRenderer.on("qrCode", (event, base64Qr) => {
  const qrImg = document.getElementById("qr");
  const divInitial = document.getElementById("divInitial");
  divInitial.innerHTML = `<p style="color:white;">Para que o bot tenha acesso ao seu whatsapp, você precisa ler o
   <b>código QR</b>.</p><p style="color:white;"> Já leu o QR? Aguarde alguns segundos para que
    o bot atualize o status.</p>`;
  qrImg.src = base64Qr;
  document.getElementById("imgBot").style.width = "50px";
  qrImg.style.display = "unset";
});

ipcRenderer.on("statusSession", (event, status) => {
  const logindBody = document.getElementById("loginBody");
  const loggedBody = document.getElementById("loggedBody");
  if (status === "successChat") {
    logindBody.style.display = "none";
    loggedBody.style.display = "block";
  }
});

ipcRenderer.on("startupProgram", (evnt, data) => {
  // Search inputs
  document.getElementById("text").value = data.keys.text;
  document.getElementById("businesstype").value = data.keys.forType;
  document.getElementById("where").value = data.keys.where;
  // Config inputs
  document.getElementById("apikey").value = data.keys.apiKey;
  document.getElementById("blockOldNumbers").checked =
    data.keys.checks.blockRepeat;
  document.getElementById("sendTime").checked = data.keys.interval;
  // Bank
  document.getElementById("numbersSaved").innerText = data.bankLength;

  const db = data.db;

  const labelsArray = [...new Set(db.map((n) => n.group))];

  const dataBar = {};
  db.forEach((n) => {
    if (!dataBar[n.group]) {
      dataBar[n.group] = 0;
    }
    dataBar[n.group]++;
  });

  new Chart(document.getElementById("chartjs-dashboard-line"), {
    type: "bar",
    data: {
      labels: labelsArray,
      datasets: [
        {
          label: "Quantidade de negócios",
          data: Object.values(dataBar),
          backgroundColor: window.theme.success,
          fill: false,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Quantidade de negócios por tipo",
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
            scaleLabel: {
              display: true,
              labelString: "Quantidade de negócios",
            },
          },
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Tipo de negócio",
            },
          },
        ],
      },
    },
  });

  const table = $("#tablenumbers").DataTable();
  table.clear();
  for (const business of db) {
    const phone = business.phone || "";
    table.row.add([
      business.group,
      business.local,
      business.title,
      phone,
      business.date,
      `
      <button onclick="sendMessageTo('${phone}')" class="buttonsTable"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-send align-middle"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
      <button onclick="deleteBusiness('${phone}')" class="buttonsTable"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash align-middle"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
      `,
    ]);
  }
  table.draw();
});

ipcRenderer.on("chatLength", (event, length) => {
  const chatsnum = document.getElementById("myChats");
  chatsnum.innerText = length;
});

ipcRenderer.on("notify", (event, notObj) => {
  showNotification(notObj.type, notObj.message);
});

ipcRenderer.on("addSentThisSession", () => {
  let sendCountActual = document.getElementById("sendCount").innerText;
  sendCountActual = Number(sendCountActual) + 1;
});

ipcRenderer.on("updateNumbersOnBank", (evnt, num) => {
  let numbersShow = document.getElementById("numbersSaved").innerText;
  numbersShow = num;
});

ipcRenderer.on("deviceInfos", (evnt, infos) => {
  document.getElementById("deviceInfos").innerHTML = `
  <h1 class="mt-1 mb-3">v${infos.WAVersion}</h1>
  `;
});

// when Db file updates
ipcRenderer.on("onDbUpdate", (event, data) => {
  /**
   * update graph
   * update number on dashboard
   */
  const db = JSON.parse(data);
  document.getElementById("numbersSaved").innerText = db.length;

  const labelsArray = [...new Set(db.map((n) => n.group))];

  const dataBar = {};
  db.forEach((n) => {
    if (!dataBar[n.group]) {
      dataBar[n.group] = 0;
    }
    dataBar[n.group]++;
  });

  new Chart(document.getElementById("chartjs-dashboard-line"), {
    type: "bar",
    data: {
      labels: labelsArray,
      datasets: [
        {
          label: "Quantidade de negócios",
          data: Object.values(dataBar),
          backgroundColor: window.theme.success,
          fill: false,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Quantidade de negócios por tipo",
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
            scaleLabel: {
              display: true,
              labelString: "Quantidade de negócios",
            },
          },
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Tipo de negócio",
            },
          },
        ],
      },
    },
  });

  const table = $("#tablenumbers").DataTable();
  table.clear();
  for (const business of db) {
    const phone = business.phone || "";
    table.row.add([
      business.group,
      business.local,
      business.title,
      phone,
      business.date,
      `
      <button onclick="sendMessageTo('${phone}')" class="buttonsTable"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-send align-middle"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
      <button onclick="deleteBusiness('${phone}')" class="buttonsTable"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash align-middle"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
      `,
    ]);
  }
  table.draw();
});

// when key file updates (like prospecting text/vars)
ipcRenderer.on("onKeysUpdate", (event, data) => {
  //
});

ipcRenderer.on("licenseKey", (event, key) => {
  document.getElementById("licenseKey").innerText = key;
});

ipcRenderer.on("newFileAdded", (event, files) => {
  document.getElementById("list").innerHTML = "";
  files.forEach((file) => {
    document.getElementById("list").innerHTML += `
  <li class="list-group-item d-flex justify-content-between align-items-center">
    ${file}
    <button class="btn btn-danger" onclick="deleteFile('${file}')">
     Apagar
    </button>
  </li>`;
  });
});

ipcRenderer.on("onApiUsage", (event, data) => {
  const used = data.searches_per_month - data.plan_searches_left,
    remain = Number(data.searches_per_month);

  document.getElementById("usedApiHeader").innerText = used;
  document.getElementById("usedApi").innerText = used;
  document.getElementById("remainingApi").innerText = remain;
  document.getElementById("limitApi").innerText = remain;

  new Chart(document.getElementById("chartjs-dashboard-pie"), {
    type: "pie",
    data: {
      labels: ["Utilizado", "Disponível"],
      datasets: [
        {
          data: [used, remain - used],
          backgroundColor: [window.theme.danger, window.theme.success],
          borderWidth: 5,
        },
      ],
    },
    options: {
      responsive: !window.MSInputMethodContext,
      maintainAspectRatio: false,
      legend: {
        display: false,
      },
      cutoutPercentage: 75,
    },
  });
});

ipcRenderer.on("file-dialog-result", (event, filePath) => {
  const table = document.getElementById("tablenumbers");
  try {
    const wb = XLSX.utils.table_to_book(table);
    XLSX.writeFile(wb, filePath);
    showNotification("success", "Arquivo salvo.");
  } catch (error) {
    log.warn(
      error
    );
    console.log(error);
    showNotification("danger", "Ocorreu um erro ao exportar a tabela.");
  }
});

/**
 * ---
 * SEND
 * TO                    (COMUNICATION TO BACK)
 * BACKEND
 * --
 */

document.getElementById("sendTest").addEventListener("click", () => {
  let number = document.getElementById("testNumber").value;
  if (number === "") {
    showNotification("danger", "Especifique o número para enviar.");
  } else {
    ipcRenderer.send("sendTest", number);
    number = "";
  }
});

document.getElementById("sendProspect").addEventListener("click", () => {
  showDialog(
    "Prospecção",
    "O prospect vai buscar clientes para você, deseja apenas salvar os contatos no banco ou salvar e enviar?",
    [
      {
        text: "Salvar e enviar",
        value: "saveAndSend",
        className: "btn btn-primary btn-space",
      },
      {
        text: "Salvar",
        value: "onlySave",
        className: "btn btn-secondary btn-space",
      },
      {
        text: "Cancelar",
        value: false,
        className: "btn btn-danger btn-space",
      },
    ],
    (response) => {
      switch (response) {
        case "saveAndSend":
          showNotification("success", "Você escolheu salvar e enviar.");
          ipcRenderer.send("sendProspect", "saveAndSend");
          break;
        case "onlySave":
          showNotification("success", "Você escolheu apenas salvar.");
          ipcRenderer.send("sendProspect", "onlySave");
          break;
        case false:
          showNotification("info", "Ação cancelada.");
          break;
      }
    }
  );
});

document.getElementById("infoSave").addEventListener("click", () => {
  const text = document.getElementById("text").value,
    where = document.getElementById("where").value,
    forType = document.getElementById("businesstype").value;

  ipcRenderer.send("onSaveSearchInfos", {
    text,
    forType,
    where,
  });
});

document.getElementById("configSave").addEventListener("click", () => {
  const apikey = document.getElementById("apikey").value,
    interval = document.getElementById("sendTime").value,
    blockRepeat = document.getElementById("blockOldNumbers").checked;

  ipcRenderer.send("onSaveConfig", {
    apiKey: apikey,
    interval: interval,
    checks: {
      blockRepeat: blockRepeat,
    },
  });
});

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

formFile.addEventListener("change", (event) => {
  const selectedFiles = [...formFile.files];
  selectedFiles.forEach(async (f) => {
    try {
      const bs64 = await toBase64(f);
      const base64Image = bs64.split(";base64,").pop();
      ipcRenderer.send("onNewFile", {
        base64: base64Image,
        name: f.name,
      });
      formFile.value = "";
    } catch (error) {
      console.error(error);
      log.warn(
        error
      );
      ipcRenderer.send("notify", {
        type: "danger",
        message: "Falha ao converter arquivo",
      });
    }
  });
});

const deleteFile = async (file) => {
  ipcRenderer.send("deleteFile", file);
};

const sendMessageTo = (num) => {
  ipcRenderer.send("sendUnique", num);
  showNotification("info", "Enviando mensagem...");
};

const deleteBusiness = (num) => {
  showDialog(
    "Apagar empresa?",
    `Tem certeza que deseja apagar a empresa de número ${num}?`,
    [
      {
        text: "Deletar empresa",
        value: "yes",
        className: "btn btn-danger btn-space",
      },
      {
        text: "Cancelar",
        value: false,
        className: "btn btn-secondary btn-space",
      },
    ],
    (response) => {
      switch (response) {
        case "yes":
          ipcRenderer.send("deleteBusiness", num);
          break;
        case false:
          showNotification("info", "Ação cancelada.");
          break;
      }
    }
  );
};

document.getElementById("exportExcel").addEventListener("click", () => {
  ipcRenderer.send("export-excel-dialog");
});

document.getElementById("importExcel").addEventListener("click", () => {
  ipcRenderer.send("import-excel-dialog");
});

document.getElementById("addBusiness").addEventListener("submit", (event) => {
  event.preventDefault();

  const title = document.querySelector("#nome").value;
  const local = document.querySelector("#local").value;
  const group = document.querySelector("#grupo").value;
  const phone = document.querySelector("#numero").value;
  let date = document.querySelector("#data").value;

  date = date.split("-").reverse().join("/");

  const formatedPhone = `${phone.replace(/[^a-zA-Z0-9]/g, "")}@c.us`;

  ipcRenderer.send("addBusiness", {
    title,
    local,
    group,
    phone,
    date,
    formatedPhone,
  });

  closeModalBtn.click();
  document.getElementById("addBusiness").reset();
});

document.getElementById("prospectAll").addEventListener("click", () => {
  const table = $("#tablenumbers").DataTable();
  const pesquisa = table.search();
  if (pesquisa === "")
    return showNotification("danger", "Digite algo no campo de filtro");

  ipcRenderer.send("prospectAll", pesquisa);
});

document.getElementById("deleteAll").addEventListener("click", () => {
  const table = $("#tablenumbers").DataTable();
  const pesquisa = table.search();
  if (pesquisa === "")
    return showNotification("danger", "Digite algo no campo de filtro");

  ipcRenderer.send("deleteAll", pesquisa);
});
