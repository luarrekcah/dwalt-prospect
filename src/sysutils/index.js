const fs = require("fs");
const { DB_FILE, ROOT_DIR } = require("../paths");
const log = require("electron-log");

module.exports = {
  generateLicenseKey: () => {
    const key = [];
    for (let i = 0; i < 4; i++) {
      const part = [];
      for (let j = 0; j < 4; j++) {
        part.push(Math.random().toString(36).substring(2, 3).toUpperCase());
      }
      key.push(part.join(""));
    }
    return key.join("-");
  },
  validateDate: (dateString) => {
    if (dateString === undefined) return;
    const dateArray = dateString.split("-");
    const day = parseInt(dateArray[0], 10);
    const month = parseInt(dateArray[1], 10) - 1;
    const year = parseInt(dateArray[2], 10);

    const inputDate = new Date(year, month, day);

    if (isNaN(inputDate.getTime())) {
      return false;
    }

    const currentDate = new Date();

    return inputDate >= currentDate;
  },
  writeData: (target = "db", newData) => {
    let filename = target === "db" ? "db.json" : "keys.json";

    try {
      let fileData = fs.readFileSync(`${ROOT_DIR}/${filename}`, "utf-8");
      let jsonData = JSON.parse(fileData);

      Object.assign(jsonData, newData);

      fs.writeFileSync(`${ROOT_DIR}/${filename}`, JSON.stringify(jsonData));

      return true;
    } catch (err) {
      log.warn(err);
      console.error(err);
      return false;
    }
  },
  overrideDb: (data) => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data));
      return true;
    } catch (error) {
      console.log(error);
      log.warn(error);
      return false;
    }
  },
  getData: (target = "db") => {
    let filename = target === "db" ? "db.json" : "keys.json";
    let fileData = fs.readFileSync(`${ROOT_DIR}/${filename}`, "utf-8");
    let jsonData = JSON.parse(fileData);

    return jsonData;
  },
};
