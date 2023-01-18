const fs = require("fs");

module.exports = {
    saveData: (data) => {
        const toStringData = JSON.stringify(data);
        fs.writeFileSync(`${__dirname}/../data.json`, toStringData);
        
        alert("Suas preferências foram salvas.");
      }
}