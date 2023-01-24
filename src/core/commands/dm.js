const client = require('../index');
const {sendImage} = require('../../utils');

module.exports.run = () => {
  const data = JSON.parse(
      fs.readFileSync(__dirname + '/../../data.json', 'utf8'),
  );

  const numero = document.getElementById('testNumber').value;
  if (numero === '') return alert('Insira um número válido.');
  const testNumber = `${numero
      .replaceAll('+', '')
      .replaceAll(' ', '')
      .replaceAll('-', '')
      .replaceAll('(', '')
      .replaceAll(')', '')}@c.us`;

  const files = [];

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

      alert('Enviado.');
    }
  });
};
