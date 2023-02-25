/* eslint-disable max-len */
const client = require('../index');
const {sendImage} = require('../../utils');

module.exports.run = async (number) => {
  const data = JSON.parse(
      fs.readFileSync(__dirname + '/../../data.json', 'utf8'),
  );
  if (number === '') return alert('Insira um número válido.');
  if (data.text === '') return alert('Defina um texto para enviar.');

  const files = [];

  fs.readdir(`${__dirname}/../../medias`, (err, filesLoaded) => {
    if (err) {
      console.warn('erro: ' + err);
    } else {
      filesLoaded.forEach((file) => {
        files.push(`${__dirname}/../../medias/${file}`);
      });

      client.sendMessage(number, `${data.text}`);

      files.forEach(async (f) => {
        await sendImage(client, number, '', f);
      });

      document.getElementById('sendCount').innerText = numeroAtual + 1;

      alert('Enviado.');
    }
  });
};
