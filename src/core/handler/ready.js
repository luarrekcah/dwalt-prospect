const {updateChats} = require('../../utils');

const logindBody = document.getElementById('loginBody');
const loggedBody = document.getElementById('loggedBody');

module.exports.run = async (client) => {
  updateChats(client);
  logindBody.style.display = 'none';
  loggedBody.style.display = 'block';
  addLineConsole('[STATUS] Bot pronto.', 'success', false);
};
