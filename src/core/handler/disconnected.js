const mainElement = document.getElementById('main');
const nameElement = document.getElementById('namebot');

module.exports.run = () => {
  mainElement.style.display = 'none';
  nameElement
      .innerHTML =
  `Prospect bot <span class="badge text-bg-danger">Desconectado</span>`;
  setTimeout(() => {
    location.reload();
  }, 3000);
};
