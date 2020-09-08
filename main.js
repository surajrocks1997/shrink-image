const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  ipcMain,
  shell,
} = require('electron');
const path = require('path');
const os = require('os');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');
const log = require('electron-log');

process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

let mainWindow;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      nodeIntegration: true,
    },
    width: isDev ? 800 : 500,
    height: 650,
    title: 'ImageShrink',
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    backgroundColor: 'white',
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.loadFile('./app/index.html');
};

app.on('ready', () => {
  createMainWindow();
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload());
  globalShortcut.register(isMac ? 'Command+Alt+I' : 'Ctrl+Shift+I', () =>
    mainWindow.toggleDevTools()
  );

  mainWindow.on('closed', () => (mainWindow = null));
});

const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    role: 'fileMenu',
    // label: 'File',
    // submenu: [
    //   {
    //     label: 'Quit',
    //     accelerator: isMac ? 'Command+W' : 'Ctrl+W',
    //     accelerator: 'CmdOrCtrl+W',
    //     click: () => app.quit(),
    //   },
    // ],
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
];

ipcMain.on('image:minimize', (e, options) => {
  options.destination = path.join(os.homedir(), 'imageshrink');
  shrinkImage(options);
});

const shrinkImage = async ({ imgPath, quality, destination }) => {
  try {
    const pngQuality = quality / 100;
    const files = await imagemin([slash(imgPath)], {
      destination: destination,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({ quality: [pngQuality, pngQuality] }),
      ],
    });

    console.log(files);
    // log.info(files);
    shell.openPath(destination);
    mainWindow.webContents.send('image:done');
  } catch (error) {
    console.log(error);
    // log.error(error);
  }
};

app.on('window-all-closed', () => {
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
