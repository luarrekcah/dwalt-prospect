const fs = require('fs');
const {MessageMedia} = require('whatsapp-web.js');

module.exports = {
  saveData: (data) => {
    const toStringData = JSON.stringify(data);
    fs.writeFileSync(`${__dirname}/../data.json`, toStringData);
    alert('Suas preferências foram salvas.');
  },
  sendImage: async (client, phone, caption = '', path) => {
    return new Promise(async function(resolve, reject) {
      const media = MessageMedia.fromFilePath(path);
      client
          .sendMessage(phone, media, {caption})
          .then((res) => resolve('Succesfully sent.'))
          // eslint-disable-next-line prefer-promise-reject-errors
          .catch((error) => reject('Can not send message.', error));
    });
  },
};
