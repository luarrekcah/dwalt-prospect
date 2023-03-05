/* eslint-disable max-len */
const SerpApi = require('google-search-results-nodejs');
const fs = require('fs');
const client = require('../index');
const {ipcRenderer} = require('electron');
const {sendImage, saveDb, randomNumberGen} = require('../../utils');

const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));
const setStatus = (arg) =>
  (document.getElementById('statusShow').innerText = arg);
const setProgress = (step) =>
  (document.getElementById('progressBar').value = step);

module.exports.run = async () => {
  setProgress(0);

  const {text, type, location, apiKey, config} = JSON.parse(
      fs.readFileSync(__dirname + '/../../data.json', 'utf8'),
  );

  let search;
  try {
    search = new SerpApi.GoogleSearch(apiKey);
  } catch (e) {
    addLineConsole(e, 'error', true);
    alert('Ocorreu um erro com a chave da API, verifique.');
  }

  setStatus('[Lendo dados anteriores]');

  let db;
  try {
    db = JSON.parse(
        fs.readFileSync(__dirname + '/../../datanum.json', 'utf-8'),
    );
  } catch (error) {
    saveDb({business: []});
    db = JSON.parse(
        fs.readFileSync(__dirname + '/../../datanum.json', 'utf-8'),
    );
  }

  if (
    !text ||
    !type ||
    !location ||
    !apiKey ||
    text === '' ||
    type === '' ||
    location === '' ||
    apiKey === ''
  ) {
    setStatus('[Cancelado]');
    ipcRenderer.send('notification', 'Erro, dados em falta.');
    return alert('Dados em falta!');
  }

  setStatus('[Dados verificados]');

  // All chats from device
  const localChats = [];
  // All files
  const files = [];
  // Load array with business stored
  const business = db.business || [];
  // Push only numbers to check
  const onlyBusinessNumbers = [];
  // Array to add numbers who will be sent
  const numbers = [];

  // check if business exists and add numbers to array
  if (business.length !== 0) {
    business.forEach((b) => {
      onlyBusinessNumbers.push(b.number);
    });
  }

  // Load chats and add to localchats
  const chats = await client.getChats();

  chats.forEach((c) => {
    localChats.push(c.id._serialized);
    addLineConsole(c.id._serialized, 'info', false);
  });

  // refresh value on front
  document.getElementById('myChats').innerText = localChats.length;

  // warn user
  setStatus(`Leitura de números concluída. ${localChats.length} chats.`);

  if (config.blockOldNumbers) {
    setStatus('[BLOQUEIO DE MENSAGENS REPETIDAS ATIVO]');
  } else {
    setStatus('[SEM BLOQUEIO DE MENSAGENS REPETIDAS ATIVO]');
  }

  // search

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
            const localResults = result.local_results;
            if (!localResults) {
              return;
            }

            localResults.forEach((i) => {
              const phone = i.phone;
              if (!phone) {
                return;
              }

              const formatted = phone.replace(/[\s()+-]/g, '');
              if (formatted.slice(4).startsWith('9')) {
                const formattedWithoutFourthDigit = formatted.slice(0, 4) + formatted.slice(5);
                if (localChats.includes(formatted)) {
                  return;
                }

                setStatus('Verificando números');
                if (config.blockOldNumbers && localChats.includes(formattedWithoutFourthDigit)) {
                  return;
                }

                addLineConsole(i, 'info', true);

                if (!onlyBusinessNumbers.includes(`${formattedWithoutFourthDigit}@c.us`)) {
                  business.push({
                    title: i.title,
                    number: `${formattedWithoutFourthDigit}@c.us`,
                    type: i.type,
                    local: location,
                    group: type,
                    date: new Date().toLocaleDateString(),
                  });
                }

                numbers.push(`${formattedWithoutFourthDigit}@c.us`);
              }
            });
          },
      );
    }

    setTimeout(async () => {
      if (numbers.length === 0) {
        alert('Nenhum número válido encontrado para sua pesquisa. Tente alterar ou verifique sua API.');
        return;
      }

      alert(`Coletei ${numbers.length} números válidos de empresas.`);
      addLineConsole(numbers, 'success', true);

      const continueProspect = confirm('Deseja enviar as mensagens agora?');

      if (continueProspect) {
        try {
          for (let i = 0; i < numbers.length; i++) {
            const number = numbers[i];
            if (chats.includes(number) && config.blockOldNumbers) {
              continue;
            }

            setProgress(1);
            setStatus(`Tempo ${config.intervalTime}s`);
            await sleep(config.intervalTime);
            setStatus('Enviando');
            setProgress(2);

            try {
              const id = randomNumberGen();
              await client.sendMessage(number, `${text.toString()}\n\nID:${id}`);
            } catch (err) {
              addLineConsole(err, 'error', true);
            }

            for (let j = 0; j < files.length; j++) {
              const f = files[j];
              try {
                await sendImage(client, number, `ID:${id}`, f);
              } catch (err) {
                addLineConsole(err, 'error', true);
              }
            }

            setProgress(3);

            const numeroAtual = Number(document.getElementById('sendCount').innerText);

            document.getElementById('sendCount').innerText = numeroAtual + 1;

            setProgress(0);
            setStatus('Ok');
          }
        } catch (err) {
          addLineConsole(err, 'error', true);
        }
      } else {
        alert('Ok, cancelei o envio mas os números foram salvos no banco e você pode consultar.');
      }

      addLineConsole(business, 'success', true);
      setStatus(`Gravando ${business.length} numeros na memória.`);

      saveDb({
        business: business,
      });

      setStatus('Gravação concluída.');
    }, 5000);
  });
};
