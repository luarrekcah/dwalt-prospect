/* eslint-disable no-unused-vars */
const fs = require('fs');
const {ipcRenderer} = require('electron');

const data = JSON.parse(
    fs.readFileSync(__dirname + '/../data.json', 'utf8'),
);

const db = JSON.parse(
    fs.readFileSync(__dirname + '/../db.json', 'utf8'),
);

// Preloads
document.getElementById('numbersSaved').innerText = db.numbers.length;

document.getElementById('text').value = data.text;
document.getElementById('businesstype').value = data.type;
document.getElementById('where').value = data.location;
document.getElementById('apikey').value = data.apiKey;

const swithScreen = (arg) => {
  const screensID = ['indexPage', 'SearchPage', 'FilesPage', 'ConfigPage'];
  screensID.forEach((s) => {
    if (s !== arg) {
      document.getElementById(s).style.display = 'none';
    }
  });
  document.getElementById(arg).style.display = 'block';
};

require('../core');

const infoSave = document.getElementById('infoSave');
const configSave = document.getElementById('configSave');

const testProspect = document.getElementById('sendTest');
const prospect = document.getElementById('sendProspect');

const reprospect = document.getElementById('sendReprospect');

const formFile = document.getElementById('formFile');

const list = document.getElementById('list');

document.getElementById('sendTime').value = data.config.intervalTime;
document.getElementById('showTime').innerText = data.config.intervalTime;
document.getElementById('blockOldNumbers').checked =
data.config.blockOldNumbers;

const {saveData} = require('../utils');

const readFiles = () => {
  formFile.value = '';
  list.innerHTML = '';
  fs.readdirSync(`${__dirname}/../medias/`).forEach((file) => {
    console.log(file);
    list.innerHTML += `
  <li class="list-group-item d-flex justify-content-between align-items-center">
    ${file}
    <button class="btn btn-danger" onclick="deleteFile('${file}')">
     Apagar
    </button>
  </li>`;
  });
};
readFiles();

// eslint-disable-next-line no-unused-vars
const deleteFile = async (file) => {
  // na vdd isso aqui é usado simkk
  fs.unlink(`${__dirname}/../medias/${file}`, (err) => {
    if (err) throw err;
    console.log('file deleted successfully');
    readFiles();
  });
};

const save = () => {
  saveData({
    text: document.getElementById('text').value,
    type: document.getElementById('businesstype').value,
    location: document.getElementById('where').value,
    apiKey: document.getElementById('apikey').value,
    config:
    {
      blockOldNumbers: document.getElementById('blockOldNumbers').checked,
      intervalTime: Number(document.getElementById('sendTime').value),
    },
  });
};

infoSave.addEventListener('click', () => {
  save();
});

configSave.addEventListener('click', () => {
  save();
});

testProspect.addEventListener('click', () => {
  const dmCommand = require('../core/commands/dm');
  dmCommand.run();
});

prospect.addEventListener('click', () => {
  const pemCommand = require('../core/commands/pem');
  pemCommand.run();
});

reprospect.addEventListener('click', () => {
  const repCommand = require('../core/commands/reprospect');
  console.log('Respropect run');
  repCommand.run();
});

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

formFile.addEventListener('change', (event) => {
  const selectedFiles = [...formFile.files];
  console.log(selectedFiles);
  selectedFiles.forEach(async (f) => {
    const bs64 = await toBase64(f);
    console.log(bs64);
    const base64Image = bs64.split(';base64,').pop();
    fs.writeFile(
        `${__dirname}/../medias/${f.name}`,
        base64Image,
        {encoding: 'base64'},
        function(err) {
          console.log('File created');
          ipcRenderer.send('notification', 'Arquivo adicionado.');
          readFiles();
        },
    );
  });
});

// eslint-disable-next-line require-jsdoc
function switchTime() {
  document.getElementById('showTime').innerText =
  document.getElementById('sendTime').value;
}
