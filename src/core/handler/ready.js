module.exports.run = () => {
  console.log("Client is ready!");
  divInitial.style.display = "none";
  qrElement.style.display = "none";
  namebot.innerHTML = `Prospect bot <span class="badge text-bg-success">Online</span>`;
  mainElement.style.display = "block";

  document.getElementById("text").value = data.text || "";
  document.getElementById("businesstype").value = data.type || "";
  document.getElementById("where").value = data.location || "";
  document.getElementById("apikey").value = data.apiKey || "";
};
