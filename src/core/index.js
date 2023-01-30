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

client.initialize();

// CHART DATA API
setInterval(async () => {
  if (apiKey === '') return;
  const info = await getAccount({api_key: apiKey});
  document.getElementById('usedApi').innerText = info.searches_per_month -
   info.plan_searches_left;
  document.getElementById('limitApi').innerText = info.searches_per_month;

  new Chart(document.getElementById('chartjs-dashboard-pie'), {
    type: 'pie',
    data: {
      labels: ['Utilizado', 'Disponível'],
      datasets: [{
        data: [info.searches_per_month -
          info.plan_searches_left, info.plan_searches_left],
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
