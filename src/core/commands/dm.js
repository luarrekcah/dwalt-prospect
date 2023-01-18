const client = require("../index");

module.exports.run = () => {
  const numero = document
  .getElementById("testNumber")
  .value;
  if(numero === '' || isNaN(numero)) return alert("Insira um número válido.")
  const testNumber = `${numero.replaceAll("+", "")
      .replaceAll(" ", "")
      .replaceAll("-", "")
      .replaceAll("(", "")
      .replaceAll(")", "")}@c.us`
  client.sendMessage(
    testNumber,
    "Essa é uma mensagem de teste do painel do Prospect BOT"
  );
  alert("Enviado.")
};
