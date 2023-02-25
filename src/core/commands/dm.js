/* eslint-disable max-len */
const client = require('../index');
const {sendImage} = require('../../utils');

module.exports.run = async () => {
  const chatNumbers = [];

  const chats = await client.getChats();

  chats.forEach((c) => {
    chatNumbers.push(c.id._serialized);
  });
  const data = JSON.parse(
      fs.readFileSync(__dirname + '/../../data.json', 'utf8'),
  );
  const numero = document.getElementById('testNumber').value;
  if (numero === '') return alert('Insira um número válido.');
  if (data.text === '') return alert('Defina um texto para enviar.');

  const testNumber = `${numero
      .replaceAll('+', '')
      .replaceAll(' ', '')
      .replaceAll('-', '')
      .replaceAll('(', '')
      .replaceAll(')', '')}@c.us`;

  const files = [];

  if (data.config.blockOldNumbers && chatNumbers.includes(testNumber)) {
    alert(`Bloqueio de números está ativo, desative para enviar mensagem para esse número`);
  } else {
    fs.readdir(`${__dirname}/../../medias`, (err, filesLoaded) => {
      if (err) {
        console.warn('erro: ' + err);
      } else {
        filesLoaded.forEach((file) => {
          files.push(`${__dirname}/../../medias/${file}`);
        });

        client.sendMessage(testNumber, `${data.text}`);

        files.forEach(async (f) => {
          await sendImage(client, testNumber, '', f);
        });

        document.getElementById('sendCount').innerText = numeroAtual + 1;

        alert('Enviado.');
      }
    });
  }
};
