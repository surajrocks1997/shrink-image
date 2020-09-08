const { app, BrowserWindow } = require('electron');

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      worldSafeExecuteJavaScript: true,
    },
    width: 500,
    height: 600,
    title: 'ImageShrink',
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
  });

  mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.loadFile('./app/index.html');
}

app.on('ready', createMainWindow);
