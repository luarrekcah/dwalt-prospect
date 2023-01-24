const data = JSON.parse(
    fs.readFileSync(__dirname + '/../../data.json', 'utf8'),
);
const qrElement = document.getElementById('qr');
const divInitial = document.getElementById('divInitial');
const mainElement = document.getElementById('main');
const nameElement = document.getElementById('namebot');

module.exports.run = () => {
  divInitial.style.display = 'none';
  qrElement.style.display = 'none';
  nameElement
      .innerHTML =
   `Prospect bot <span class="badge text-bg-success">Online</span>`;
  mainElement.style.display = 'block';

  document.getElementById('text').value = data.text || '';
  document.getElementById('businesstype').value = data.type || '';
  document.getElementById('where').value = data.location || '';
  document.getElementById('apikey').value = data.apiKey || '';
};
