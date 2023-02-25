const fs = require('fs');
const {MessageMedia} = require('whatsapp-web.js');


const getData = () => {
  let db;
  try {
    db = JSON.parse(fs.readFileSync(__dirname + '/../datanum.json', 'utf-8'));
  } catch (error) {
    saveDb({numbers: []});
    db = JSON.parse(fs.readFileSync(__dirname + '/../datanum.json', 'utf-8'));
  }

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

module.exports = {
  saveData: (data) => {
    const toStringData = JSON.stringify(data);
    fs.writeFileSync(`${__dirname}/../data.json`, toStringData);
    alert('Suas preferências foram salvas.');
  },
  saveDb: (data) => {
    const toStringData = JSON.stringify(data);
    try {
      fs.writeFileSync(`${__dirname}/../datanum.json`, toStringData);
    } catch (error) {
      addLineConsole('error when writing json: ', 'error', false);
      addLineConsole(error, 'error', true);
    }
  },
  sendImage: async (client, phone, caption = '', path) => {
    return new Promise(async function(resolve, reject) {
      const media = MessageMedia.fromFilePath(path);
      client
          .sendMessage(phone, media, {caption})
          .then((res) => resolve('Succesfully sent.'))
          // eslint-disable-next-line prefer-promise-reject-errors
          .catch((error) => reject('Can not send message.', error));
    });
  },
  setGraph: () => {
    const db = JSON.parse(
        fs.readFileSync(__dirname + '/../datanum.json', 'utf8'),
    );
    document.getElementById('numbersSaved').innerText = db.numbers.length;
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
  },
  updateChats: async (client) => {
    const chatNumbers = [];

    const chats = await client.getChats();

    chats.forEach((c) => {
      chatNumbers.push(c.id._serialized);
    });

    document.getElementById('myChats').innerText = chatNumbers.length;
  },
};
