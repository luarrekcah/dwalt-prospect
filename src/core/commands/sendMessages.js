const client = require('../index');
const fs = require('fs');
const {sendImage, randomNumberGen} = require('../../utils');

const sleep = (s) => {
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
};

const setStatus = (arg) => {
  document.getElementById('statusShow').innerText = arg;
};

const setProgress = (step) => {
  document.getElementById('progressBar').value = step;
};


module.exports.run = async (array) => {
  setStatus('[Lendo dados anteriores]');
  const {text, config} = JSON.parse(
      fs.readFileSync(__dirname + '/../../data.json', 'utf8'),
  );
  setStatus('Checando números');
  if (array.length === 0) {
    setStatus('Nenhum número encontrado!');
    return alert('A pesquisa retornou nenhum número.');
  }

  const files = [];

  addLineConsole(array, 'success', true);

  fs.readdir(`${__dirname}/../../medias`, async (err, filesLoaded) => {
    filesLoaded.forEach((file) => {
      files.push(`${__dirname}/../../medias/${file}`);
    });

    setStatus(`Encontrei ${files.length} para envio.`);
    for (let index = 0; index < array.length; index++) {
      setProgress(1);
      setStatus(`Tempo ${config.intervalTime}s`);
      await sleep(config.intervalTime);
      setStatus('Enviando');
      setProgress(2);
      try {
        const id = randomNumberGen();
        await client.sendMessage(array[index].number,
            `${text.toString()}\n\nID:${id}`);
      } catch (err) {
        alert('Ocorreu um erro ao enviar mensagem: ' + err);
      }

      files.forEach(async (f) => {
        try {
          await sendImage(client, array[index].number, `ID:${id}`, f);
        } catch (err) {
          alert('Ocorreu um erro ao enviar arquivos: ' + err);
        }
      });

      setProgress(3);

      const numeroAtual = Number(
          document.getElementById('sendCount').innerText,
      );

      document.getElementById('sendCount').innerText = numeroAtual + 1;

      setProgress(1);
      setStatus(`Ok`);
    }
  });
};
