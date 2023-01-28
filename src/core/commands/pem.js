const SerpApi = require('google-search-results-nodejs');
const fs = require('fs');
const client = require('../index');
const {ipcRenderer} = require('electron');
const {sendImage} = require('../../utils');

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
  const {text, type, location, apiKey, config} = JSON.parse(
      fs.readFileSync(__dirname + '/../../data.json', 'utf8'),
  );

  const search = new SerpApi.GoogleSearch(apiKey);

  setStatus('[Lendo dados anteriores]');
  const db = JSON.parse(fs.readFileSync(__dirname + '/../../db.json', 'utf-8'));

  if (
    !text ||
    !type ||
    !location ||
    text === '' ||
    type === '' ||
    location === ''
  ) {
    return ipcRenderer.send('notification', 'Erro, dados em falta.');
  }

  const chatNumbers = [];
  const numbers = [];
  const removed = [];
  const nonWhatsapp = [];
  const files = [];
  const customersNumbers = db.numbers;

  const chats = await client.getChats();

  chats.forEach((c) => {
    chatNumbers.push(c.id._serialized);
  });

  document.getElementById('myChats').innerText = chatNumbers.length;

  setStatus(`Leitura de números concluída. ${chatNumbers.length} serão
    bloqueados.`);

  /*
  if (config.blockOldNumbers) {
    setStatus('[BLOQUEIO DE MENSAGENS REPETIDAS ATIVO]');
    chatNumbers = db.numbers;
    setStatus(`${chatNumbers.length} foram
    encontrados em pesquisas antigas.`);

    const chats = await client.getChats();

    chats.forEach((c) => {
      if (chatNumbers.includes(c.id._serialized)) return;
      chatNumbers.push(c.id._serialized);
    });
    setStatus(`Leitura de números concluída. ${chatNumbers.length} serão
    bloqueados.`);
  }
  */

  const q = `${type.toLowerCase()} ${location.toLowerCase()}`;

  fs.readdir(`${__dirname}/../../medias`, (err, filesLoaded) => {
    console.log(`Encontrei como arquivo de envio os arquivos:`, filesLoaded);
    filesLoaded.forEach((file) => {
      files.push(`${__dirname}/../../medias/${file}`);
    });

    setStatus(`Encontrei ${files.length} para envio.`);

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
                  console.log(i);
                  setStatus('Verificando números');
                  if (config.blockOldNumbers) {
                    if (
                      chatNumbers.includes(
                          `${formated.slice(0, 4) + formated.slice(5)}`,
                      )
                    ) {
                      return;
                    }
                    customersNumbers.push(
                        `${formated.slice(0, 4) + formated.slice(5)}@c.us`,
                    );
                    numbers.push(
                        `${formated.slice(0, 4) + formated.slice(5)}@c.us`,
                    );
                  } else {
                    numbers.push(
                        `${formated.slice(0, 4) + formated.slice(5)}@c.us`,
                    );
                    customersNumbers.push(
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

    console.log(customersNumbers);

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

      const continueProspect = confirm('Deseja enviar as mensagens agora?');

      if (continueProspect) {
        console.log('Aqui estão os números selecionados para envio: ', numbers);
        // const testNumbers = ['556892402096@c.us', '556892186647@c.us'];
        /* for (let index = 0; index < numbers.length; index++) {
            await sleep(5000);
            try {
              await client.sendMessage(numbers[index], text.toString());
              for (let index = 0; index < files.length; index++) {
                await sendImage(client, numbers[index], '', files[index]);
              }
            } catch (err) {
              alert('Ocorreu um erro: ' + err);
            }
          }*/
        for (let index = 0; index < numbers.length; index++) {
          setProgress(1);
          setStatus(`Tempo ${config.intervalTime}s`);
          await sleep(config.intervalTime);
          setStatus('Enviando');
          setProgress(2);
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

          setProgress(3);

          const numeroAtual = Number(
              document.getElementById('sendCount').innerText,
          );

          document.getElementById('sendCount').innerText = numeroAtual + 1;

          setProgress(1);
          setStatus(`Ok`);
        }
      } else {
        alert('Ok, cancelado.');
      }
    }, 5000);

    console.log(customersNumbers);
    setStatus(`Gravando ${customersNumbers.length} numeros na memória.`);

    const save = {
      numbers: customersNumbers,
    };
    // const toStringData = JSON.stringify(save);
    // fs.writeFileSync(`${__dirname}/../../db.json`, toStringData);
    fs.writeFile(`${__dirname}/../../db.json`, JSON.stringify(save), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Array salvo com sucesso no arquivo db.json');
      setStatus(`Gravação concluída.`);
    });
  });
};
