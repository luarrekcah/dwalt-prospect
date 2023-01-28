module.exports.run = async (client, message) => {
  console.log(message);

  const chatNumbers = [];

  const chats = await client.getChats();

  chats.forEach((c) => {
    chatNumbers.push(c.id._serialized);
  });

  document.getElementById('myChats').innerText = chatNumbers.length;

  if (message.hasMedia) return;
  if (message.type !== 'chat') return;
  if (message.body === '!ping') {
    client.sendMessage(message.from, 'Dados coletados.');
    console.log(message);
  }
};
