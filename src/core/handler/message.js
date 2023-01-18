module.exports.run = (client, message) => {
  console.log(message);
  if (message.hasMedia) return;
  if (message.type !== "chat") return;
  if (message.isGroup) return;
  if (message.body === "!ping") {
    client.sendMessage(message.from, "Dados coletados.");
    console.log(message);
  }
};
