/* eslint-disable new-cap */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
const fs = require('fs');
const {ipcRenderer} = require('electron');
const {
  saveData,
  saveDb,
  updateTable,
  setGraph,
  searchBusiness,
  exportTable,
  saveQ,
} = require('../utils');
const data = JSON.parse(fs.readFileSync(__dirname + '/../data.json', 'utf8'));

let responsesq;
try {
  responsesq = JSON.parse(fs.readFileSync(__dirname + '/../responses.json', 'utf8'));
} catch (error) {
  saveQ([]);
}

const prospectAll = document.getElementById('prospectAll');

const deleteAll = document.getElementById('deleteAll');

const exportExcel = document.getElementById('exportExcel');

let db;
try {
  db = JSON.parse(fs.readFileSync(__dirname + '/../datanum.json', 'utf-8'));
} catch (error) {
  saveDb({business: []});
  db = JSON.parse(fs.readFileSync(__dirname + '/../datanum.json', 'utf-8'));
}

// Preloads
document.getElementById('text').value = data.text;
document.getElementById('businesstype').value = data.type;
document.getElementById('where').value = data.location;
document.getElementById('apikey').value = data.apiKey;

const swithScreen = (arg) => {
  const screensID = [
    'indexPage',
    'SearchPage',
    'FilesPage',
    'ConfigPage',
    'Console',
    'BankNumbers',
    'Responses',
  ];
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
    config: {
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

function sendMessageTo(n) {
  const shouldSendMessage = confirm('Enviar mensagem para essa empresa?');
  if (shouldSendMessage) {
    const sendMessage = require('../core/commands/unique');
    sendMessage.run(n);
  }
}

function sendMessages(array) {
  const sendMessages = require('../core/commands/sendMessages');
  sendMessages.run(array);
}

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

function addLineTable(grupo, local, nome, numero, data) {
  // Cria um novo elemento <tr>
  const newRow = document.createElement('tr');

  // Extrai apenas os dígitos do número de telefone
  const digitos = numero.replace(/\D/g, '');

  // Formata os dígitos em um número de telefone com código de país, código de área e número
  const telefoneFormatado = `+${digitos.slice(0, 2)} ${digitos.slice(
      2,
      4,
  )} ${digitos.slice(4, 8)}-${digitos.slice(8)}`;

  // console.log(telefoneFormatado);

  // Cria as células da nova linha e adiciona os valores correspondentes
  const grupoCell = document.createElement('td');
  grupoCell.textContent = grupo;
  const localCell = document.createElement('td');
  localCell.textContent = local;
  const nomeCell = document.createElement('td');
  nomeCell.textContent = nome;
  const numeroCell = document.createElement('td');
  numeroCell.textContent = telefoneFormatado;
  const dataCell = document.createElement('td');
  dataCell.textContent = data;
  const sendButtonCell = document.createElement('td');
  const sendButton = document.createElement('button');
  const deleteButton = document.createElement('button');
  sendButton.setAttribute('onclick', `sendMessageTo("${numero}")`);
  sendButton.setAttribute('class', `buttonsTable`);
  deleteButton.setAttribute('onclick', `deleteBusiness("${numero}")`);
  deleteButton.setAttribute('class', `buttonsTable`);
  const sendIcon = document.createElement('i');
  sendIcon.classList.add('align-middle');
  sendIcon.setAttribute('data-feather', 'send');

  const deleteIcon = document.createElement('i');
  deleteIcon.classList.add('align-middle');
  deleteIcon.setAttribute('data-feather', 'trash');

  sendButton.appendChild(sendIcon);

  deleteButton.appendChild(deleteIcon);
  sendButtonCell.appendChild(sendButton);
  sendButtonCell.appendChild(deleteButton);

  // Adiciona as células à nova linha
  newRow.appendChild(grupoCell);
  newRow.appendChild(localCell);
  newRow.appendChild(nomeCell);
  newRow.appendChild(numeroCell);
  newRow.appendChild(dataCell);
  newRow.appendChild(sendButtonCell);

  // Adiciona a nova linha à tabela
  const tableBody = document.querySelector('#tablenumbers tbody');
  tableBody.appendChild(newRow);

  // Atualiza os ícones Feather
  feather.replace();
}

function deleteBusiness(numberToDelete) {
  const shouldDelete = confirm('Você deseja deletar essa empresa?');
  if (shouldDelete) {
    const businessList = JSON.parse(
        fs.readFileSync(__dirname + '/../datanum.json', 'utf-8'),
    );
    const newBusinessList = businessList.business.filter(
        (business) => business.number !== numberToDelete,
    );
    saveDb({business: newBusinessList});
    updateTable();
  }
}

const form = document.querySelector('#addBusiness');

form.addEventListener('submit', (event) => {
  // Previne o envio do formulário e recarregamento da página
  event.preventDefault();

  // Coleta os valores dos inputs
  const grupo = document.querySelector('#grupo').value;
  const local = document.querySelector('#local').value;
  const tipo = document.querySelector('#tipo').value;
  const nome = document.querySelector('#nome').value;
  const numero = document.querySelector('#numero').value;
  let data = document.querySelector('#data').value;

  // Formata a data para o padrão DD/MM/YYYY
  data = data.split('-').reverse().join('/');

  // Remove os caracteres especiais do número e acrescenta o sufixo "@c.us"
  const numeroFormatado = numero.replace(/[+\-()]/g, '') + '@c.us';

  // Imprime os valores coletados e formatados no console
  console.log('Grupo:', grupo);
  console.log('Local:', local);
  console.log('Nome da Empresa:', nome);
  console.log('Número da empresa:', numeroFormatado);
  console.log('Data de adesão:', data);

  const db = JSON.parse(
      fs.readFileSync(__dirname + '/../datanum.json', 'utf-8'),
  );

  db.business.push({
    title: nome,
    number: numero,
    type: tipo,
    local,
    group: grupo,
    date: data,
  });

  saveDb({business: db.business});

  // Limpa os inputs após a submissão do formulário
  form.reset();
  updateTable();
  setGraph();
});

prospectAll.addEventListener('click', () => {
  // Obter uma referência para a tabela DataTable
  const table = $('#tablenumbers').DataTable();

  // Obter o valor de pesquisa atual
  const pesquisa = table.search();

  if (pesquisa === '') return alert('Digite algo no campo de pesquisa');

  addLineConsole(pesquisa, 'info', false);

  const numbers = searchBusiness(pesquisa);
  const warnBox = confirm(
      `Deseja enviar mensagens agora para ${numbers.length} empresas?`,
  );
  if (warnBox) {
    sendMessages(numbers);
  } else {
    return;
  }
});

deleteAll.addEventListener('click', () => {
  // Obter uma referência para a tabela DataTable
  const table = $('#tablenumbers').DataTable();

  // Obter o valor de pesquisa atual
  const pesquisa = table.search();

  if (pesquisa === '') return alert('Digite algo no campo de pesquisa');

  addLineConsole(pesquisa, 'info', false);

  const numbers = searchBusiness(pesquisa);
  const warnBox = confirm(`Deseja deletar ${numbers.length} empresas?`);
  if (warnBox) {
    const businessList = JSON.parse(
        fs.readFileSync(__dirname + '/../datanum.json', 'utf-8'),
    );
    const newBusinessList = businessList.business.filter((business) => {
      for (let i = 0; i < numbers.length; i++) {
        if (business.number === numbers[i].number) {
          return false;
        }
      }
      return true;
    });
    saveDb({business: newBusinessList});
    updateTable();
  } else {
    return;
  }
});

if (responsesq && responsesq.length !== 0) {
  responsesq.forEach((question, i) => {
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('card', 'mb-3');

    const questionCardBody = document.createElement('div');
    questionCardBody.classList.add('card-body');

    const questionTitle = document.createElement('h5');
    questionTitle.classList.add('card-title');
    questionTitle.textContent = `Mensagem`;

    const questionFormGroup1 = document.createElement('div');
    questionFormGroup1.classList.add('form-group');

    const questionLabel1 = document.createElement('label');
    questionLabel1.setAttribute('for', `question${i + 1}`);
    questionLabel1.textContent = 'Mensagem:';

    const questionInput = document.createElement('input');
    questionInput.setAttribute('type', 'text');
    questionInput.classList.add('form-control');
    questionInput.setAttribute('id', `question${i + 1}`);
    questionInput.setAttribute('name', `question${i + 1}`);
    questionInput.setAttribute('required', '');
    questionInput.value = question.question;

    const questionFormGroup2 = document.createElement('div');
    questionFormGroup2.classList.add('form-group');

    const questionLabel2 = document.createElement('label');
    questionLabel2.setAttribute('for', `answer${i + 1}`);
    questionLabel2.textContent = 'Resposta:';

    const answerInput = document.createElement('input');
    answerInput.setAttribute('type', 'text');
    answerInput.classList.add('form-control');
    answerInput.setAttribute('id', `answer${i + 1}`);
    answerInput.setAttribute('name', `answer${i + 1}`);
    answerInput.setAttribute('required', '');
    answerInput.value = question.answer;

    const fileFormGroup = document.createElement('div');
    fileFormGroup.classList.add('form-group');

    const fileLabel = document.createElement('label');
    fileLabel.setAttribute('for', `file${i + 1}`);
    fileLabel.textContent = 'Arquivo:';

    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.classList.add('form-control-file');
    fileInput.setAttribute('id', `file${i + 1}`);
    fileInput.setAttribute('name', `file${i + 1}`);
    fileInput.setAttribute('multiple', 'true');
    fileInput.value = question.files.join(', ');

    const removeQuestionButton = document.createElement('button');
    removeQuestionButton.classList.add('btn', 'btn-danger');
    removeQuestionButton.textContent = 'Apagar';
    removeQuestionButton.setAttribute('onclick', `removeQuestion(${i + 1})`);

    questionFormGroup1.appendChild(questionLabel1);
    questionFormGroup1.appendChild(questionInput);
    questionCardBody.appendChild(questionTitle);
    questionCardBody.appendChild(questionFormGroup1);
    questionFormGroup2.appendChild(questionLabel2);
    questionFormGroup2.appendChild(answerInput);
    questionCardBody.appendChild(questionFormGroup2);
    fileFormGroup.appendChild(fileLabel);
    fileFormGroup.appendChild(fileInput);
    questionCardBody.appendChild(fileFormGroup);
    questionCardBody.appendChild(removeQuestionButton);
    questionDiv.appendChild(questionCardBody);

    const questionList = document.getElementById('question-list');
    questionList.appendChild(questionDiv);
  });
}

document.getElementById('saveQuestions').addEventListener('click', async () => {
  const q = await getQuestionsAndAnswers();
  alert('Preferências salvas.');
  saveQ(q);
});

document.getElementById('deleteAllQuestions').addEventListener('click', async () => {
  const confirmDQ = confirm('Tem certeza que deseja apagar todas as respostas?');
  if (confirmDQ) {
    alert('Todas as respostas foram deletadas');
    saveQ([]);
  }
});


exportExcel.addEventListener('click', () => {
  ipcRenderer.send('open-file-dialog');
});

ipcRenderer.on('file-dialog-result', (event, filePath) => {
  const table = document.getElementById('tablenumbers');
  try {
    exportTable(table, filePath);
    alert('Arquivo salvo!');
  } catch (error) {
    addLineConsole(error, 'error', true);
    return alert('Ocorreu um erro ao exportar a tabela.');
  }
});
