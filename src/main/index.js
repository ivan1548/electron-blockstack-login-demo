import {
  app,
  BrowserWindow,
  protocol,
  shell
} from 'electron'; // eslint-disable-line
import cp from 'child_process';

// Start process to serve manifest file
const server = cp.fork(`${__dirname}/server/app.js`);

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  // eslint-disable-next-line no-underscore-dangle
  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\'); // eslint-disable-line
}

let mainWindow;
const winURL =
  process.env.NODE_ENV === 'development' ?
  'http://localhost:9080' :
  `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

protocol.registerStandardSchemes(['electronblockstacklogindemo']);

// Set default protocol client for redirect
app.setAsDefaultProtocolClient('electronblockstacklogindemo');

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

function authCallback(authResponse) {
  if (typeof authResponse.authContinuation !== 'undefined') {
    shell.openExternal(authResponse.authContinuation);
  } else {
    mainWindow.focus();

    mainWindow.webContents.send('signInDone', authResponse);
  }
}

server.on('message', m => {
  authCallback(m.authResponse);
});

// Quit server process if main app will quit
app.on('will-quit', () => {
  server.kill('SIGTERM');
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */