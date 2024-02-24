const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
// const log = require('electron-log');
console.log(app.getAppPath());

const configFilePath = path.join(
  path.dirname(app.getPath('exe')),
  // 'resources/app/ember-dist',
  'recepies.json'
);

// log.info(app.getAppPath());

async function saveConfig(config, cb) {
  console.log(config, configFilePath);
  const write = () => {
    const configString = JSON.stringify(config, null, 2);
    fs.writeFileSync(configFilePath, configString);
  };
  fs.access(configFilePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Если файла нет, создаем его
      fs.writeFile(configFilePath, '{}', (err) => {
        if (err) {
          console.error('Ошибка при создании файла:', err);
        } else {
          write();
        }
      });
    } else {
      write();
    }
  });
}

function loadConfig() {
  try {
    const configString = fs.readFileSync(configFilePath, 'utf-8');
    return JSON.parse(configString);
  } catch (error) {
    return { cook: [] };
  }
}

module.exports = { saveConfig, loadConfig };
