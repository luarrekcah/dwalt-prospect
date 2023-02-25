/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
const fs = require('fs');
const {ipcRenderer} = require('electron');

const data = JSON.parse(
    fs.readFileSync(__dirname + '/../data.json', 'utf8'),
);


const {saveData, saveDb} = require('../utils');

let db;
try {
  db = JSON.parse(fs.readFileSync(__dirname + '/../datanum.json', 'utf-8'));
} catch (error) {
  saveDb({numbers: []});
  db = JSON.parse(fs.readFileSync(__dirname + '/../datanum.json', 'utf-8'));
}

// Preloads
document.getElementById('text').value = data.text;
document.getElementById('businesstype').value = data.type;
document.getElementById('where').value = data.location;
document.getElementById('apikey').value = data.apiKey;

const swithScreen = (arg) => {
  const screensID = ['indexPage',
    'SearchPage',
    'FilesPage',
    'ConfigPage',
    'Console',
    'BankNumbers'];
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


const readFiles = () => {
  formFile.value = '';
  list.innerHTML = '';
  fs.readdirSync(`${__dirname}/../medias/`).forEach((file) => {
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
  selectedFiles.forEach(async (f) => {
    const bs64 = await toBase64(f);
    const base64Image = bs64.split(';base64,').pop();
    fs.writeFile(
        `${__dirname}/../medias/${f.name}`,
        base64Image,
        {encoding: 'base64'},
        function(err) {
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

function addLineConsole(line, type, isObject) {
  const list = document.getElementById('console-list');
  const li = document.createElement('li');

  if (isObject) {
    console.dir(line);
    li.innerHTML = '<pre>' + JSON.stringify(line, null, 2) + '</pre>';
  } else {
    li.textContent = line;
  }

  if (type) {
    li.classList.add(type);
  }

  list.appendChild(li);
}

function cleanConsole() {
  document.getElementById('console-list').innerHTML = '';
}

addLineConsole('...', 'success', false);
cleanConsole();

