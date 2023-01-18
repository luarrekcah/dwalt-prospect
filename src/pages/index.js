const fs = require("fs");

const infoSave = document.getElementById("infoSave");
const configSave = document.getElementById("configSave");

const testProspect = document.getElementById("sendTest");
const formFile = document.getElementById("formFile");

const list = document.getElementById("list");

const { saveData } = require("../utils");
require("../core");

const readFiles = () => {
  formFile.value = "";
  list.innerHTML = "";
  fs.readdirSync(`${__dirname}/../medias/`).forEach((file) => {
    console.log(file);
    list.innerHTML += `
  <li class="list-group-item d-flex justify-content-between align-items-center">
    ${file}
    <button class="btn btn-danger" onclick="deleteFile('${file}')">
     Apagar
    </button>
  </li>`;
  });
}
readFiles()

const deleteFile = async (file) => {
  fs.unlink(`${__dirname}/../medias/${file}`, (err) => {
    if (err) throw err;
    console.log('file deleted successfully');
    readFiles()
  });
};

infoSave.addEventListener("click", () => {
  saveData({
    text: document.getElementById("text").value,
    type: document.getElementById("businesstype").value,
    location: document.getElementById("where").value,
    apiKey: document.getElementById("apikey").value,
  });
});

configSave.addEventListener("click", () => {
  saveData({
    text: document.getElementById("text").value,
    type: document.getElementById("businesstype").value,
    location: document.getElementById("where").value,
    apiKey: document.getElementById("apikey").value,
  });
});

testProspect.addEventListener("click", () => {
  const dmCommand = require("../core/commands/dm");
  dmCommand.run();
});

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

formFile.addEventListener("change", (event) => {
  const selectedFiles = [...formFile.files];
  console.log(selectedFiles);
  selectedFiles.forEach(async (f) => {
    const bs64 = await toBase64(f);
    console.log(bs64);
    let base64Image = bs64.split(";base64,").pop();
    fs.writeFile(
      `${__dirname}/../medias/${f.name}`,
      base64Image,
      { encoding: "base64" },
      function (err) {
        console.log("File created");
        readFiles();
      }
    );
  });
});

