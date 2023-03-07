const {Buttons, MessageMedia} = require('whatsapp-web.js');
const {updateChats} = require('../../utils');

module.exports.run = async (client, message) => {
  updateChats(client);

  if (message.hasMedia) return;
  if (message.type !== 'chat') return;

  // addLineConsole(message, 'info', true);
  const responses =
  JSON.parse(
      fs.readFileSync(__dirname + '/../../responses.json', 'utf8'),
  );

  if (responses && responses.length !== 0) {
    console.log(responses);
    for (let index = 0; index < responses.length; index++) {
      if (responses[index].type === 'text') {
        // simple message
        if (message.body.toLowerCase().includes(responses[index].
            question.toLowerCase())) {
          client.sendMessage(message.from, responses[index].answer);
          if (responses[index].files.length !== 0) {
            for (let i = 0; i < responses[index].files.length; i++) {
              const file = responses[index].files[i];
              const media = new MessageMedia(file.type, file.base64);
              client
                  .sendMessage(message.from, media, {caption: ''});
            }
          }
        }
      } else {
        // buttons
      }
    }
  }


  if (message.body === '!btton') {
    const button = new Buttons('Corpo do botao', [{body: 'bt1'},
      {body: 'bt2'}, {body: 'bt3'}], 'Titulo', 'footer');
    client.sendMessage(message.from, button);
  }
};
