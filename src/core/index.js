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

try {
  client.initialize();
} catch (error) {
  console.log(error);
}

const getData = () => {
  const db = JSON.parse(
      fs.readFileSync(__dirname + '/../db.json', 'utf8'),
  );

  const week = {
    pri: 0,
    seg: 0,
    ter: 0,
    qua: 0,
    qui: 0,
    sex: 0,
    set: 0,
  };

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();

  db.numbers.forEach((n) => {
    switch (n.date) {
      case `${dd-6}-${mm}-${yyyy}`:
        week.pri++;
        break;
      case `${dd-5}-${mm}-${yyyy}`:
        week.seg++;
        break;
      case `${dd-4}-${mm}-${yyyy}`:
        week.ter++;
        break;
      case `${dd-3}-${mm}-${yyyy}`:
        week.qua++;
        break;
      case `${dd-2}-${mm}-${yyyy}`:
        week.qui++;
        break;
      case `${dd-1}-${mm}-${yyyy}`:
        week.sex++;
        break;
      case `${dd}-${mm}-${yyyy}`:
        week.set++;
        break;
    }
  });

  return [week.pri, week.seg,
    week.ter, week.qua, week.qui,
    week.sex, week.set];
};

const getLabels = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');

  return [(dd-6) + '/' + mm,
    (dd-5) + '/' + mm,
    (dd-4) + '/' + mm,
    (dd-3) + '/' + mm,
    (dd-2) + '/' + mm,
    (dd-1) + '/' + mm,
    dd + '/' + mm];
};

if (apiKey === '') {
  document.getElementById('useApiBody').style.display = `none`;

  document.getElementById('useApiWarn').
      innerHTML = `<b>Adicione uma chave primeiro!</b>`;
}
// CHART DATA API
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


  new Chart(document.getElementById('chartjs-dashboard-line'), {
    type: 'line',
    data: {
      labels: getLabels(),
      datasets: [{
        label: 'Quantidade de números',
        data: getData(),
        backgroundColor: window.theme.success,
        fill: false,
      }],
    },
    options: {
      plugins: {
        filler: {
          propagate: false,
        },
        title: {
          display: true,
          text: 'Quantidade de números',
        },
      },
      interaction: {
        intersect: false,
      },
    },
  });
}, 60*1000);


module.exports = client;
