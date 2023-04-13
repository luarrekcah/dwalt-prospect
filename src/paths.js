const { app } = require("electron");
const log = require("electron-log");
const path = require("path");

const ROOT_DIR = app.getPath("userData");
const LICENSE_FILE_PATH = path.join(ROOT_DIR, "license.key");
const MEDIAS_DIR_PATH = path.join(ROOT_DIR, "medias");
const DB_FILE = path.join(ROOT_DIR, "db.json");
const KEYS_FILE = path.join(ROOT_DIR, "keys.json");

log.info(
  `
  DIRECTORIES:\n
  ${ROOT_DIR}\n
  ${LICENSE_FILE_PATH}\n
  ${MEDIAS_DIR_PATH}\n
  ${DB_FILE}\n
  ${KEYS_FILE}
  `
);

module.exports = {
  ROOT_DIR,
  LICENSE_FILE_PATH,
  MEDIAS_DIR_PATH,
  DB_FILE,
  KEYS_FILE,
};
