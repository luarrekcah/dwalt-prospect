/* eslint-disable max-len */
/* eslint-disable new-cap */
const fs = require('fs');
const XLSX = require('xlsx');
const {MessageMedia} = require('whatsapp-web.js');
// Lê o arquivo de dados e armazena no objeto "db"

// Define a função para obter as etiquetas (nomes dos grupos de negócios)
const getLabels = () => {
  const db = JSON.parse(fs.readFileSync(__dirname + '/../datanum.json', 'utf8'));
  const groups = [...new Set(db.business.map((n) => n.group))];
  return groups;
};

// Define a função para obter os dados (contagens de negócios por grupo)
const getData = () => {
  const db = JSON.parse(fs.readFileSync(__dirname + '/../datanum.json', 'utf8'));
  const groups = {};
  db.business.forEach((n) => {
    if (!groups[n.group]) {
      groups[n.group] = 0;
    }
    groups[n.group]++;
  });
  return Object.values(groups);
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
    document.getElementById('numbersSaved').innerText = db.business.length;
    new Chart(document.getElementById('chartjs-dashboard-line'), {
      type: 'bar',
      data: {
        labels: getLabels(),
        datasets: [{
          label: 'Quantidade de negócios',
          data: getData(),
          backgroundColor: window.theme.success,
          fill: false,
        }],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Quantidade de negócios por tipo',
          },
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
            },
            scaleLabel: {
              display: true,
              labelString: 'Quantidade de negócios',
            },
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Tipo de negócio',
            },
          }],
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
  updateTable: () => {
    const db = JSON.parse(
        fs.readFileSync(__dirname + '/../datanum.json', 'utf8'),
    );

    const tbody =
    document.querySelector('#tablenumbers tbody');
    tbody.innerHTML = '';

    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }

    db.business.forEach((i) => {
      addLineTable(i.group, i.local, i.title, i.number, i.date);
    });
  },
  searchBusiness: (query) => {
    // Lê o arquivo JSON e converte em um objeto JavaScript
    const db = JSON.parse(fs.readFileSync(__dirname + '/../datanum.json', 'utf-8'));

    // Filtra os elementos do array 'business' que correspondem à pesquisa
    const results = db.business.filter((item) => {
      // Converte todas as chaves do objeto em uma string e verifica se a string inclui a pesquisa
      return Object.values(item).join('').toLowerCase().includes(query.toLowerCase());
    });

    return results;
  },
  exportTable: (table, filePath) => {
    const wb = XLSX.utils.table_to_book(table);
    XLSX.writeFile(wb, filePath );
  },
};
