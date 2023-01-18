const client = require("../index");

const data = require("../../data.json");
const { sendImage } = require("../../utils");

module.exports.run = () => {
  const numero = document.getElementById("testNumber").value;
  if (numero === "") return alert("Insira um número válido.");
  const testNumber = `${numero
    .replaceAll("+", "")
    .replaceAll(" ", "")
    .replaceAll("-", "")
    .replaceAll("(", "")
    .replaceAll(")", "")}@c.us`;

  const files = [];

  fs.readdir(`${__dirname}/../../medias`, (err, filesLoaded) => {
    filesLoaded.forEach((file) => {
      files.push(`${__dirname}/../../medias/${file}`);
    });

    client.sendMessage(testNumber, `${data.text}`);

    files.forEach(async (f) => {
      await sendImage(client, testNumber, "", f);
    });

    alert("Enviado.");
  });
};
