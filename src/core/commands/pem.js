const SerpApi = require('google-search-results-nodejs');
const fs = require('fs');
const client = require('../index');
const {ipcRenderer} = require('electron');
const {sendImage, saveDb} = require('../../utils');

const sleep = (s) => {
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
};

const setStatus = (arg) => {
  document.getElementById('statusShow').innerText = arg;
};

const setProgress = (step) => {
  document.getElementById('progressBar').value = step;
};

module.exports.run = async () => {
  setProgress(0);
  const {text, type, location, apiKey, config} = JSON.parse(
      fs.readFileSync(__dirname + '/../../data.json', 'utf8'),
  );

  const search = new SerpApi.GoogleSearch(apiKey);

  setStatus('[Lendo dados anteriores]');
  let db;
  try {
    db = JSON.parse(fs.readFileSync(
        __dirname + '/../../datanum.json', 'utf-8'));
  } catch (error) {
    saveDb({numbers: []});
    db = JSON.parse(fs.readFileSync(
        __dirname + '/../../datanum.json', 'utf-8'));
  }

  if (
    !text ||
    !type ||
    !location ||
    text === '' ||
    type === '' ||
    location === ''
  ) {
    setStatus('[Cancelado]');
    ipcRenderer.send('notification', 'Erro, dados em falta.');
    return alert('Dados em falta!');
  }


  setStatus('[Dados verificados]');

  const chatNumbers = [];
  let numbers = [];
  const removed = [];
  const nonWhatsapp = [];
  const files = [];
  const toDbNumbers = db.numbers || [];

  const chats = await client.getChats();

  chats.forEach((c) => {
    chatNumbers.push(c.id._serialized);
  });

  document.getElementById('myChats').innerText = chatNumbers.length;

  setStatus(`Leitura de números concluída. ${chatNumbers.length} chats.`);

  if (config.blockOldNumbers) {
    setStatus('[BLOQUEIO DE MENSAGENS REPETIDAS ATIVO]');
  } else {
    setStatus('[SEM BLOQUEIO DE MENSAGENS REPETIDAS ATIVO]');
  }

  const q = `${type.toLowerCase()} ${location.toLowerCase()}`;

  fs.readdir(`${__dirname}/../../medias`, (err, filesLoaded) => {
    filesLoaded.forEach((file) => {
      files.push(`${__dirname}/../../medias/${file}`);
    });

    setStatus(`Encontrei ${files.length} arquivos para envio.`);

    ipcRenderer.send('notification', 'Pesquisando...');

    for (let index = 0; index < 25; index++) {
      search.json(
          {
            engine: 'google_maps',
            type: 'search',
            ll: '@-10.3488815,-58.9089475,5.6z',
            start: index === 0 ? 0 : (index + 1) * 20,
            q,
          },
          (result) => {
            if (result.local_results === undefined) return;
            result.local_results.forEach((i) => {
              if (i.phone === undefined) return;
              const formated = i.phone
                  .replaceAll('+', '')
                  .replaceAll(' ', '')
                  .replaceAll('-', '')
                  .replaceAll('(', '')
                  .replaceAll(')', '');
              if (formated.slice(4).startsWith('9')) {
                if (chatNumbers.includes(`${formated}`)) {
                  removed.push(`${formated}@c.us`);
                } else {
                  setStatus('Verificando números');
                  if (config.blockOldNumbers) {
                    if (
                      chatNumbers.includes(
                          `${formated.slice(0, 4) + formated.slice(5)}`,
                      )
                    ) {
                      return;
                    }
                    numbers.push(
                        `${formated.slice(0, 4) + formated.slice(5)}@c.us`,
                    );
                  } else {
                    numbers.push(
                        `${formated.slice(0, 4) + formated.slice(5)}@c.us`,
                    );
                  }
                }
              } else {
                nonWhatsapp.push(formated);
              }
            });
          },
      );
    }

    /* TESTING
    numbers = [];
    numbers = ['556892186647@c.us'];
    */

    setTimeout(async () => {
      if (numbers.length === 0) {
        return alert(
            `Nenhum número válido encontrado
                 para sua pesquisa. Tente alterar.`,
        );
      }
      alert(
          `Coletei ${numbers.length} números válidos de empresas. 
              ${removed.length} foram removidos porque estão repetidos. 
              ${nonWhatsapp.length} removidos pois não são números de whatsapp`,
      );
      console.log('Aqui estão os números selecionados para envio: ', numbers);
      const continueProspect = confirm('Deseja enviar as mensagens agora?');

      if (continueProspect) {
        for (let index = 0; index < numbers.length; index++) {
          if (chatNumbers.includes(numbers[index]) && config.blockOldNumbers) {
            return;
          }
          setProgress(1);
          setStatus(`Tempo ${config.intervalTime}s`);
          await sleep(config.intervalTime);
          setStatus('Enviando');
          setProgress(2);
          let today = new Date();
          const dd = String(today.getDate()).padStart(2, '0');
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const yyyy = today.getFullYear();

          today = dd + '-' + mm + '-' + yyyy;

          try {
            await client.sendMessage(numbers[index], text.toString());
          } catch (err) {
            alert('Ocorreu um erro ao enviar mensagem: ' + err);
          }

          files.forEach(async (f) => {
            try {
              await sendImage(client, numbers[index], '', f);
            } catch (err) {
              alert('Ocorreu um erro ao enviar arquivos: ' + err);
            }
          });

          if (!chatNumbers.includes(numbers[index])) {
            toDbNumbers.push({number: numbers[index], date: today});
          }


          setProgress(3);

          const numeroAtual = Number(
              document.getElementById('sendCount').innerText,
          );

          document.getElementById('sendCount').innerText = numeroAtual + 1;

          setProgress(0);
          setStatus(`Ok`);
        }
      } else {
        alert('Ok, cancelado.');
      }

      console.log(toDbNumbers);
      setStatus(`Gravando ${toDbNumbers.length} numeros na memória.`);

      saveDb({
        numbers: toDbNumbers,
      });
      setStatus(`Gravação concluída.`);
    }, 5000);
  });
};
