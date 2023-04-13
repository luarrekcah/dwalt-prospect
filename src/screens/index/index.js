const swithScreen = (arg) => {
  const screensID = [
    "indexPage",
    "SearchPage",
    "FilesPage",
    "ConfigPage",
    "Console",
    "BankNumbers",
  ];
  screensID.forEach((s) => {
    if (s !== arg) {
      document.getElementById(s).style.display = "none";
    }
  });
  document.getElementById(arg).style.display = "block";
};

const showNotification = (type, message) => {
  const notification = document.querySelector(".notification");
  notification.classList.remove(
    "alert",
    "warning",
    "danger",
    "info",
    "success"
  );
  notification.classList.add(type);

  const icon = notification.querySelector(".icon");
  switch (type) {
    case "alert":
      icon.classList.add("fas", "fa-exclamation-triangle");
      break;
    case "warning":
      icon.classList.add("fas", "fa-exclamation-circle");
      break;
    case "danger":
      icon.classList.add("fas", "fa-times-circle");
      break;
    case "info":
      icon.classList.add("fas", "fa-info-circle");
      break;
    case "success":
      icon.classList.add("fas", "fa-check-circle");
      break;
  }

  notification.querySelector(".message").textContent = message;
  notification.classList.add("show");
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
};

const showDialog = (title, text, buttons, callback) => {
  // create a div for the overlay
  const overlay = document.createElement("div");
  overlay.classList.add("dialog-overlay");
  document.body.appendChild(overlay);

  // create a div for the dialog box
  const dialog = document.createElement("div");
  dialog.classList.add("dialog");

  // create the title of the dialog box
  const titleElement = document.createElement("h2");
  titleElement.textContent = title;
  dialog.appendChild(titleElement);

  // create the text of the dialog box
  const textElement = document.createElement("p");
  textElement.textContent = text;
  dialog.appendChild(textElement);

  // create the buttons of the dialog box
  buttons.forEach((button) => {
    const buttonElement = document.createElement("button");
    buttonElement.textContent = button.text;
    buttonElement.addEventListener("click", () => {
      callback(button.value);
      closeDialog();
    });
    if (button.className) {
      buttonElement.className = button.className;
    }
    dialog.appendChild(buttonElement);
  });

  // add the dialog box to the document body
  document.body.appendChild(dialog);

  // center the dialog box on the screen
  dialog.style.top = "50%";
  dialog.style.left = "50%";
  dialog.style.transform = "translate(-50%, -50%)";

  // display the dialog box and the overlay
  function closeDialog() {
    document.body.removeChild(overlay);
    document.body.removeChild(dialog);
  }
};

const switchTime = () => {
  document.getElementById("showTime").innerText =
    document.getElementById("sendTime").value;
};
switchTime();

const addLineConsole = (value, type = "") => {
  const list = document.getElementById("console-list");
  const li = document.createElement("li");

  if (typeof value === "object") {
    console.dir(value);
    li.innerHTML = "<pre>" + JSON.stringify(value, null, 2) + "</pre>";
  } else {
    li.textContent = value;
  }

  if (type) {
    li.classList.add(type);
  }

  list.appendChild(li);
};

const cleanConsole = () => {
  document.getElementById("console-list").innerHTML = "";
};

const addLineTable = (grupo, local, nome, numero, data) => {
  const newRow = document.createElement("tr");

  const digitos = numero.replace(/\D/g, "");

  const telefoneFormatado = `+${digitos.slice(0, 2)} ${digitos.slice(
    2,
    4
  )} ${digitos.slice(4, 8)}-${digitos.slice(8)}`;

  const grupoCell = document.createElement("td");
  grupoCell.textContent = grupo;
  const localCell = document.createElement("td");
  localCell.textContent = local;
  const nomeCell = document.createElement("td");
  nomeCell.textContent = nome;
  const numeroCell = document.createElement("td");
  numeroCell.textContent = telefoneFormatado;
  const dataCell = document.createElement("td");
  dataCell.textContent = data;
  const sendButtonCell = document.createElement("td");
  const sendButton = document.createElement("button");
  const deleteButton = document.createElement("button");
  sendButton.setAttribute("onclick", `sendMessageTo("${numero}")`);
  sendButton.setAttribute("class", `buttonsTable`);
  deleteButton.setAttribute("onclick", `deleteBusiness("${numero}")`);
  deleteButton.setAttribute("class", `buttonsTable`);
  const sendIcon = document.createElement("i");
  sendIcon.classList.add("align-middle");
  sendIcon.setAttribute("data-feather", "send");

  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add("align-middle");
  deleteIcon.setAttribute("data-feather", "trash");

  sendButton.appendChild(sendIcon);

  deleteButton.appendChild(deleteIcon);
  sendButtonCell.appendChild(sendButton);
  sendButtonCell.appendChild(deleteButton);

  newRow.appendChild(grupoCell);
  newRow.appendChild(localCell);
  newRow.appendChild(nomeCell);
  newRow.appendChild(numeroCell);
  newRow.appendChild(dataCell);
  newRow.appendChild(sendButtonCell);

  const tableBody = document.querySelector("#tablenumbers tbody");
  tableBody.appendChild(newRow);

  feather.replace();
};

new Chart(document.getElementById("chartjs-dashboard-pie"), {
  type: "pie",
  data: {
    labels: ["Utilizado", "Disponível"],
    datasets: [
      {
        data: [1, 1],
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

const openModalBtn = document.getElementById("open-modal");

const modal = document.getElementById("modal");

const closeModalBtn = document.getElementsByClassName("close")[0];

openModalBtn.onclick = function () {
  modal.style.display = "block";
};

closeModalBtn.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
