const client = require("../index");

module.exports.run = () => {
  const testNumber = `${document
      .getElementById("testNumber")
      .value.replaceAll("+", "")
      .replaceAll(" ", "")
      .replaceAll("-", "")
      .replaceAll("(", "")
      .replaceAll(")", "")}@c.us`
  client.sendMessage(
    testNumber,
    "Essa é uma mensagem de teste do painel do Prospect BOT"
  );
};
