const infoSave = document.getElementById("infoSave");
const configSave = document.getElementById("configSave");

const testProspect = document.getElementById("sendTest");

const {saveData} = require("../utils");
require("../core");

infoSave.addEventListener("click", () => {
  saveData({
    text: document.getElementById("text").value,
    type: document.getElementById("businesstype").value,
    location: document.getElementById("where").value,
    apiKey: document.getElementById("apikey").value
  });
});

configSave.addEventListener("click", () => {
  saveData({
    text: document.getElementById("text").value,
    type: document.getElementById("businesstype").value,
    location: document.getElementById("where").value,
    apiKey: document.getElementById("apikey").value
  });
});

testProspect.addEventListener("click", () => {
  const dmCommand = require("../core/commands/dm");
  dmCommand.run();
});