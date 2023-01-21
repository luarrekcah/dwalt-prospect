const SerpApi = require("google-search-results-nodejs");
const fs = require("fs");
const client = require("../index");
const { ipcRenderer } = require("electron");

module.exports.run = async () => {
  const { text, type, location, apiKey, config } = JSON.parse(
    fs.readFileSync(__dirname + "/../../data.json", "utf8")
  );

  const search = new SerpApi.GoogleSearch(apiKey);

  const db = JSON.parse(fs.readFileSync(__dirname + "/../../db.json", "utf-8"));

  if (
    !text ||
    !type ||
    !location ||
    text === "" ||
    type === "" ||
    location === ""
  )
    return ipcRenderer.send("notification", "Erro, dados em falta.");

  let chatNumbers = [];

  if (config.blockOldNumbers) {
    chatNumbers = db.numbers;

    const chats = await client.getChats();

    chats.forEach((c) => {
      chatNumbers.push(c.id._serialized);
    });
  }

  const q = `${type.toLowerCase()} ${location.toLowerCase()}`;

  const numbers = [],
    removed = [],
    files = [];

  fs.readdir(`${__dirname}/../../medias`, (err, filesLoaded) => {
    console.log(filesLoaded);
    filesLoaded.forEach((file) => {
      files.push(`${__dirname}/../../medias/${file}`);
    });

    console.log(`Encontrei ${files.length} para envio.`);

    const config = {
      pages: 25,
      intervaloEnvio: 5,
    };

    alert("Pesquisando...");

    for (let index = 0; index < config.pages; index++) {
      search.json(
        {
          engine: "google_maps",
          type: "search",
          ll: "@-10.3488815,-58.9089475,5.6z",
          start: index === 0 ? 0 : (index + 1) * 20,
          q,
        },
        (result) => {
          if (result.local_results === undefined) return;
          result.local_results.forEach((i) => {
            if (i.phone === undefined) return;
            const formated = i.phone
              .replaceAll("+", "")
              .replaceAll(" ", "")
              .replaceAll("-", "")
              .replaceAll("(", "")
              .replaceAll(")", "");
            if (formated.slice(4).startsWith("9")) {
              if (chatNumbers.includes(`${formated}@c.us`)) {
                removed.push(`${formated}@c.us`);
              } else {
                numbers.push(
                  `${formated.slice(0, 4) + formated.slice(5)}@c.us`
                );
              }
            }
          });
        }
      );
    }

    setTimeout(() => {
      if (numbers.length === 0)
        return alert(
          "Nenhum número válido encontrado para sua pesquisa. Tente alterar."
        );
      alert(
        `Coletei *${numbers.length}* números válidos de empresas. ${
          removed.length
        } foram removidos porque estão repetidos.\n\nConfiguração do BOT: \n\nLimite de buscas: *${
          config.pages * 20
        } empresas* || Intervalo de envio: *${
          config.intervaloEnvio
        }s*\n\n\n*⚠️Realizando envio para os números⚠️*`
      );

      console.log(numbers);
      numbers.forEach((num, index) => {
        let intervalId = setInterval(async () => {
          try {
            client.sendMessage(num, text.toString());
            for (let index = 0; index < files.length; index++) {
              await sendImage(client, num, "", files[index]);
            }
            clearInterval(intervalId);
          } catch (error) {
            alert("Ocorreu um erro: " + err);
          }
        }, config.intervaloEnvio * 1000);
      });
    }, 10 * 1000);
    const save = {
      numbers: chatNumbers,
    };
    const toStringData = JSON.stringify(save);
    fs.writeFileSync(`${__dirname}/../../db.json`, toStringData);
  });
};
