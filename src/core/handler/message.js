const {Buttons} = require('whatsapp-web.js');
const {updateChats} = require('../../utils');

module.exports.run = async (client, message) => {
  updateChats(client);

  if (message.hasMedia) return;
  if (message.type !== 'chat') return;

  // addLineConsole(message, 'info', true);

  if (message.body === '!test') {
    const button = new Buttons('Button body', [{body: 'bt1'},
      {body: 'bt2'}, {body: 'bt3'}], 'title', 'footer');
    client.sendMessage(message.from, button);
  }
};
