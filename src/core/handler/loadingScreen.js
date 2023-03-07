module.exports.run = async (percent) => {
  document.getElementById('divInitial').innerHTML =
   `<p>Carregando seu WhatsApp.</p>
   <b>${percent}%</b>`;
};
