import { app, BrowserWindow, screen, ipcMain, Notification, dialog } from 'electron';
import { Article } from '../src/app/interface/interface.module';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os'


let win: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}
ipcMain.handle('import-article', async (event, body: any) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, error: 'No file selected' };
  }

  const filePath = result.filePaths[0];
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const article = JSON.parse(fileContent); // Assuming the JSON is formatted correctly

  return { success: true, article };
});

ipcMain.handle('export-article', (event, article: Article) => {
  const { id, image_data, ...articleWithoutImage } = article; // Ottieni l'ID e rimuovi i dati dell'immagine

  try {
    const exportPath = path.join(
      os.homedir(),
      'Desktop',
      `article_${Date.now()}.json`  // Usa l'ID e la data per creare un nome file unico
    );

    const articleData = JSON.stringify(articleWithoutImage, null, 2);

    fs.writeFileSync(exportPath, articleData, 'utf8'); // Salva il file

    dialog.showMessageBox({
      type: 'info',
      title: 'Article exported',
      message: 'Article exported to: ' + exportPath,
      buttons: ['OK'],
    });

    return { success: true, path: exportPath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});


// Add notification handling
ipcMain.handle('show-notification', (event, body: { title: string; message: string }) => {
  const notification = new Notification({
    title: body.title || 'Title missing',
    body: body.message || 'Body missing',
  });

  notification.on('click', () => {
    event.sender.send('notification-clicked');
  });

  notification.show();
});

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
