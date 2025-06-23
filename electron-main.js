const { app, BrowserWindow, ipcMain } = require('electron'); // Added dialog and ipcMain
const path = require('path');
const url = require('url');
const { autoUpdater } = require('electron-updater');
let mainWindow; // Make mainWindow accessible
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ // Assign to the higher-scoped mainWindow
    width: 1280, // A good default width for your game
    height: 720, // A good default height
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Important for security: keeps Node.js features out of your web content
      contextIsolation: true, // Important for security: isolates Electron APIs from your web content
      devTools: true // Enable DevTools, can be turned off for production
    }
  });

  // Construct the path to your index.html file
  const indexPath = path.join(__dirname, 'index.html');
  
  // Load the index.html file using a properly formatted file URL
  mainWindow.loadURL(url.pathToFileURL(indexPath).toString());
  // Optional: Open the DevTools automatically for debugging.
  // mainWindow.webContents.openDevTools();
}
// Configure logging for autoUpdater - useful for debugging
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";
autoUpdater.on('update-available', (info) => {
  autoUpdater.logger.info(`Update available: version ${info.version}`);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});
autoUpdater.on('update-not-available', () => {
  autoUpdater.logger.info('Update not available.');
  if (mainWindow) {
    mainWindow.webContents.send('update-not-available');
  }
});
autoUpdater.on('error', (err) => {
  const errorMessage = err.message || String(err);
  autoUpdater.logger.error('Error in auto-updater. ' + errorMessage);
  if (mainWindow) {
    if (errorMessage.includes("No published versions on GitHub")) {
      autoUpdater.logger.info("No published versions found on GitHub. This is normal if no releases have been published yet.");
      // This is not an error, it's a specific case of "not available"
      mainWindow.webContents.send('update-not-available');
    } else {
      mainWindow.webContents.send('update-error', err);
    }
  }
});
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  autoUpdater.logger.info(log_message);
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
});
autoUpdater.on('update-downloaded', (info) => {
  autoUpdater.logger.info(`Update downloaded: version ${info.version}. Ready to install.`);
  // Notify the renderer process that the update is ready.
  // The renderer will now be responsible for showing the "Restart Now" button.
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
});
// Listen for the renderer process to signal that the user wants to quit and install the update.
ipcMain.on('quit-and-install', () => {
  autoUpdater.logger.info('User triggered quit and install. Quitting and installing...');
  autoUpdater.quitAndInstall();
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();
    // Wait for the renderer process to signal that it's ready for update checks.
    ipcMain.on('renderer-ready-for-updates', () => {
        autoUpdater.logger.info("Renderer is ready. Checking for updates...");
        autoUpdater.checkForUpdates();
    });
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// You can include other main process specific code below.