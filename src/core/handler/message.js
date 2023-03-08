const {Buttons} = require('whatsapp-web.js');
const {updateChats, sendImage} = require('../../utils');
const fs = require('fs');

module.exports.run = async (client, message) => {
  updateChats(client);

  if (message.hasMedia) return;
  if (message.type !== 'chat') return;

  // addLineConsole(message, 'info', true);
  const responses = JSON.parse(
      fs.readFileSync(__dirname + '/../../responses.json', 'utf8'),
  );

  if (responses && responses.length !== 0) {
    console.log(responses);
    for (let index = 0; index < responses.length; index++) {
      if (responses[index].type === 'text') {
        // simple message
        if (
          message.body
              .toLowerCase()
              .includes(responses[index].question.toLowerCase())
        ) {
          client.sendMessage(message.from, responses[index].answer);
          fs.readdir(
              `${__dirname}/../../questions/${index + 1}`,
              async (err, filesLoaded) => {
                const files = [];

                filesLoaded.forEach((file) => {
                  files.push(
                      `${__dirname}/../../questions/${index + 1}/${file}`,
                  );
                });

                for (let j = 0; j < files.length; j++) {
                  const f = files[j];
                  try {
                    await sendImage(client, message.from, ``, f);
                  } catch (err) {
                    addLineConsole(err, 'error', true);
                    console.log(err);
                  }
                }
              },
          );
        }
      } else {
        // buttons
      }
    }
  }

  if (message.body === '!btton') {
    const button = new Buttons(
        'Corpo do botao',
        [{body: 'bt1'}, {body: 'bt2'}, {body: 'bt3'}],
        'Titulo',
        'footer',
    );
    client.sendMessage(message.from, button);
  }
};
