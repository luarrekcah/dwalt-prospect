const {updateChats} = require('../../utils');

module.exports.run = async (client, message) => {
  console.log(message);

  updateChats(client);

  if (message.hasMedia) return;
  if (message.type !== 'chat') return;
  if (message.body === '!ping') {
    client.sendMessage(message.from, 'Dados coletados.');
  }
};
