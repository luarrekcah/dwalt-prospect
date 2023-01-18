const SerpApi = require("google-search-results-nodejs");
const fs = require("fs");
const client = require("../index");

module.exports.run = async () => {
  const { text, type, location, apiKey } = require("../../data.json");

  const search = new SerpApi.GoogleSearch(apiKey);

  const db = require("../../db.json");

  if (!text || !type || !location) return;

  const chats = await client.getAllChats();
  const chatNumbers = db.numbers || [];

  chats.forEach((c) => {
    chatNumbers.push(c.id._serialized);
  });

  console.log(chatNumbers);

  const q = `${type} ${location}`;

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

    alert("Pesquisando...")

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
                numbers.push(`${formated}@c.us`);
              }
            }
          });
        }
      );
    }

    setTimeout(() => {
      if (numbers.length === 0)
        return alert("Ocorreu um problema com a pesquisa.");

      alert(
        `Coletei *${numbers.length}* números válidos de empresas. ${
          removed.length
        } foram removidos porque estão repetidos.\n\nConfiguração do BOT: \n\nLimite de buscas: *${
          config.pages * 20
        } empresas* || Intervalo de envio: *${
          config.intervaloEnvio
        }s*\n\n\n*⚠️Realizando envio para os números⚠️*`
      );

      numbers.forEach((num) => {
        setTimeout(async () => {
          try {
            client.sendMessage(num, text.toString());
            files.forEach(async (f) => {
              await sendImage(client, num, "", f);
            });
          } catch (error) {
            console.log(error);
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
