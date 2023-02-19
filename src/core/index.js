const {Client, LocalAuth} = require('whatsapp-web.js');
const client = new Client({
  restartOnAuthFail: true,
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox'],
  },
});
const {getAccount} = require('serpapi');

const {apiKey} = JSON.parse(
    fs.readFileSync(__dirname + '/../data.json', 'utf8'),
);

const messageHandler = require(`./handler/message`);
const readyHandler = require(`./handler/ready`);
const qrHandler = require(`./handler/qr`);
const disconnectedHandler = require(`./handler/disconnected`);
const {setGraph, saveDb} = require('../utils');

client.on('qr', (qr) => {
  return qrHandler.run(qr);
});

client.on('ready', async () => {
  return readyHandler.run(client);
});

client.on('message', (message) => {
  return messageHandler.run(client, message);
});

client.on('disconnected', () => {
  return disconnectedHandler.run();
});

try {
  client.initialize();
} catch (error) {
  console.log(error);
}

setGraph();
try {
  fs.watch(__dirname + '/../datanum.json', () => {
    setGraph();
  });
} catch (error) {
  saveDb({numbers: []});
  setGraph();
}

if (apiKey === '') {
  document.getElementById('useApiBody').style.display = `none`;

  document.getElementById('useApiWarn').
      innerHTML = `<b>Adicione uma chave primeiro!</b>`;
}

setInterval(async () => {
  if (apiKey === '') {
    document.getElementById('useApiBody').
        style.display = `none`;

    document.getElementById('useApiWarn').
        innerHTML = `<b>Adicione uma chave primeiro!</b>`;
    return;
  }
  document.getElementById('useApiBody').
      style.display = `block`;

  document.getElementById('useApiWarn').
      style.display = `none`;
  let info;
  try {
    info = await getAccount({api_key: apiKey});
  } catch (error) {
    console.log(error);
  }

  if (info !== undefined) {
    document.getElementById('usedApi').innerText = info.searches_per_month -
    info.plan_searches_left;
    document.getElementById('limitApi').innerText = info.searches_per_month;
  } else {
    document.getElementById('usedApi').innerText = 'Ocorreu um erro...';
    document.getElementById('limitApi').innerText = 'Ocorreu um erro...';
  }

  new Chart(document.getElementById('chartjs-dashboard-pie'), {
    type: 'pie',
    data: {
      labels: ['Utilizado', 'Disponível'],
      datasets: [{
        data: [info === undefined ? (0, 0) : (info.searches_per_month -
          info.plan_searches_left, info.plan_searches_left)],
        backgroundColor: [
          window.theme.danger,
          window.theme.success,
        ],
        borderWidth: 5,
      }],
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
}, 60*1000);


module.exports = client;
