
const genqr = require("qr-image");
const qrElement = document.getElementById("qr");

module.exports.run = (qr) => {
  divInitial.innerHTML = `<p>Para que o bot tenha acesso ao seu whatsapp, você precisa ler o <b>código QR</b>.</p><p>Já leu o QR? Aguarde alguns segundos para que o bot atualize o status.</p>`;
  const qrImage = genqr.image(qr);
  const chunks = [];
  qrImage.on("data", (chunk) => chunks.push(chunk));
  qrImage.on("end", () => {
    const buffer = Buffer.concat(chunks);
    const base64data = buffer.toString("base64");
    qrElement.src = `data:image/png;base64,${base64data}`;
  });
};
