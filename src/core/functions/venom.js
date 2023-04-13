const { getData, overrideDb } = require("../../sysutils");
const { sendToRenderer } = require("./electron");
const SerpApi = require("google-search-results-nodejs");
const fs = require("fs");
const path = require("path");
const { MEDIAS_DIR_PATH } = require("../../paths");
const log = require("electron-log");

const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

module.exports = {
  sendUniqueMessage: async (client, number) => {
    sendToRenderer("notify", {
      type: "info",
      message: `Enviando o teste para o número...`,
    });
    const data = getData("keys");
    client
      .sendText(`${number}@c.us`, data.text)
      .then(() => {
        sendToRenderer("notify", {
          type: "success",
          message: "Sua mensagem foi enviada.",
        });
      })
      .catch((erro) => {
        log.warn(
          erro
        );
        sendToRenderer("notify", {
          type: "danger",
          message: `Ocorreu um erro: ${erro}`,
        });
      });

    sendToRenderer("addSentThisSession", null);

    const files = fs.readdirSync(MEDIAS_DIR_PATH);

    for (const file of files) {
      await client
        .sendFile(`${number}@c.us`, `${MEDIAS_DIR_PATH}/${file}`, "", "")
        .then((result) => {
          sendToRenderer("notify", {
            type: "success",
            message: `Um arquivo enviado com sucesso.`,
          });
        })
        .catch((erro) => {
          log.warn(
            erro
          );
          sendToRenderer("notify", {
            type: "danger",
            message: `Erro ao enviar um arquivo: ${erro.text}`,
          });
        });
    }
  },
  sendProspect: async (client, choice) => {
    const keysConfig = getData("keys");

    if (!keysConfig.apiKey || keysConfig.apiKey === "") {
      return sendToRenderer("notify", {
        type: "danger",
        message: "Nenhuma API key registrada em configurações.",
      });
    }

    if (!keysConfig.text || keysConfig.text === "") {
      return sendToRenderer("notify", {
        type: "danger",
        message: "Adicione seu texto de prospecção no menu de PESQUISA.",
      });
    }

    if (!keysConfig.forType || keysConfig.forType === "") {
      return sendToRenderer("notify", {
        type: "danger",
        message: "Adicione o nicho que você deseja buscar.",
      });
    }

    if (!keysConfig.where || keysConfig.where === "") {
      return sendToRenderer("notify", {
        type: "danger",
        message: "Adicione o local das empresas que deseja.",
      });
    }

    const chats = await client.getAllChats();

    const businessDb = getData("db");

    const onlySavedNumbers = []; // used to get all numbers saved on db

    for (const business of businessDb) {
      onlySavedNumbers.push(business.formatedPhone);
    }

    const chatsNumbers = []; // used to save only serialized numbers

    const numbers = []; // used to save numbers founded here to prospect

    for (const chat of chats) {
      chatsNumbers.push(chat.id._serialized);
    }

    // Mostrar a quantidade de contatos a serem bloqueados na repetição

    const blockRepetead = keysConfig.checks.blockRepeat;

    // Mostrar mensagem do bloqueio de repetição

    let search;
    try {
      search = new SerpApi.GoogleSearch(keysConfig.apiKey);
    } catch (e) {
      log.warn(
        e
      );
      return sendToRenderer("notify", {
        type: "danger",
        message: "Ocorreu um erro com sua API. Verifique com o suporte.",
      });
    }

    const query = `${keysConfig.forType.toLowerCase()} ${keysConfig.where.toLowerCase()}`;

    const files = fs.readdirSync(MEDIAS_DIR_PATH);

    for (let index = 0; index < 25; index++) {
      search.json(
        {
          engine: "google_maps",
          type: "search",
          ll: "@-10.3488815,-58.9089475,5.6z",
          start: index === 0 ? 0 : (index + 1) * 20,
          q: query,
        },
        (result) => {
          const localResults = result.local_results;
          if (!localResults) {
            return;
          }
          for (const business of localResults) {
            if (!business.phone) {
              continue;
            }
            let formatedPhone = business.phone.replace(/[\s()+-]/g, "");
            if (formatedPhone.slice(4).startsWith("9")) {
              formatedPhone =
                formatedPhone.slice(0, 4) + formatedPhone.slice(5);
              if (blockRepetead && chatsNumbers.includes(formatedPhone)) {
                return;
              } else {
                if (!onlySavedNumbers.includes(formatedPhone)) {
                  businessDb.push({
                    formatedPhone,
                    date: new Date().toLocaleDateString(),
                    local: keysConfig.where,
                    group: keysConfig.forType,
                    ...business,
                  });
                  numbers.push(`${formatedPhone}@c.us`);
                }
              }
            }
          }
        }
      );
    }

    setTimeout(async () => {
      if (numbers.length === 0) {
        return sendToRenderer("notify", {
          type: "danger",
          message: "Nenhum número encontrado, tente alterar a pesquisa.",
        });
      }

      overrideDb(businessDb);

      if (choice === "saveAndSend") {
        console.log(numbers);
        for (const number of numbers) {
          await sleep(Number(keysConfig.interval));
          try {
            client
              .sendText(`${number}`, keysConfig.text)
              .then(() => {
                sendToRenderer("notify", {
                  type: "success",
                  message: "Sua mensagem foi enviada.",
                });
                sendToRenderer("addSentThisSession", null);
              })
              .catch((erro) => {
                log.warn(
                  erro
                );
                sendToRenderer("notify", {
                  type: "danger",
                  message: `Ocorreu um erro: ${erro}`,
                });
              });

            for (const file of files) {
              await client
                .sendFile(`${number}`, `${MEDIAS_DIR_PATH}/${file}`, "", "")
                .then((result) => {
                  sendToRenderer("notify", {
                    type: "success",
                    message: `Um arquivo enviado com sucesso.`,
                  });
                })
                .catch((erro) => {
                  log.warn(
                    erro
                  );
                  sendToRenderer("notify", {
                    type: "danger",
                    message: `Erro ao enviar um arquivo: ${erro.text}`,
                  });
                });
            }
          } catch (error) {
            log.warn(
              error
            );
            console.log(error);
          }
        }
      }
    }, 5000);
  },
  sendProspectAll: async (client, search) => {
    const keysConfig = await getData("keys");

    if (!keysConfig.text || keysConfig.text === "") {
      return sendToRenderer("notify", {
        type: "danger",
        message: "Adicione seu texto de prospecção no menu de PESQUISA.",
      });
    }

    sendToRenderer("notify", {
      type: "info",
      message: "Preparando para fazer os envios, aguarde...",
    });

    const db = await getData("db");

    const files = fs.readdirSync(MEDIAS_DIR_PATH);

    const results = db.filter((item) => {
      return Object.values(item)
        .join("")
        .toLowerCase()
        .includes(search.toLowerCase());
    });

    for (const business of results) {
      await sleep(Number(keysConfig.interval));
      try {
        client
          .sendText(`${business.formatedPhone}`, keysConfig.text)
          .then(() => {
            sendToRenderer("notify", {
              type: "success",
              message: "Sua mensagem foi enviada.",
            });
            sendToRenderer("addSentThisSession", null);
          })
          .catch((erro) => {
            log.warn(
              erro
            );
            sendToRenderer("notify", {
              type: "danger",
              message: `Ocorreu um erro: ${erro}`,
            });
          });

        for (const file of files) {
          await client
            .sendFile(
              `${business.formatedPhone}`,
              `${MEDIAS_DIR_PATH}/${file}`,
              "",
              ""
            )
            .then((result) => {
              sendToRenderer("notify", {
                type: "success",
                message: `Um arquivo enviado com sucesso.`,
              });
            })
            .catch((erro) => {
              log.warn(
                erro
              );
              sendToRenderer("notify", {
                type: "danger",
                message: `Erro ao enviar um arquivo: ${erro.text}`,
              });
            });
        }
      } catch (error) {
        log.warn(
          error
        );
        console.log(error);
      }
    }
  },
};
