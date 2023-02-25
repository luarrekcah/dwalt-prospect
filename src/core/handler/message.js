const {updateChats} = require('../../utils');

module.exports.run = async (client, message) => {
  updateChats(client);

  if (message.hasMedia) return;
  if (message.type !== 'chat') return;

  // addLineConsole(message, 'info', true);

  if (message.body === '!ping') {
    client.sendMessage(message.from, 'Dados coletados.');
  }
};
