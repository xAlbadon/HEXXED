const { app, BrowserWindow, dialog } = require('electron'); // Added dialog
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
      // preload: path.join(__dirname, 'preload.js'), // We can add a preload script later if needed
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
autoUpdater.on('update-available', () => {
  autoUpdater.logger.info('Update available.');
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: 'A new version of #HEXXED is available. It will be downloaded in the background.',
    buttons: ['OK']
  });
});
autoUpdater.on('update-not-available', () => {
  autoUpdater.logger.info('Update not available.');
});
autoUpdater.on('error', (err) => {
  autoUpdater.logger.error('Error in auto-updater. ' + err);
  dialog.showMessageBox({
    type: 'error',
    title: 'Update Error',
    message: 'Error while checking for updates: ' + err.message,
    buttons: ['OK']
  });
});
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  autoUpdater.logger.info(log_message);
  // You could potentially update a progress bar in your UI here
});
autoUpdater.on('update-downloaded', () => {
  autoUpdater.logger.info('Update downloaded; will install now');
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'A new version of #HEXXED has been downloaded. Restart the application to apply the updates.',
    buttons: ['Restart Now', 'Later']
  }).then((buttonIndex) => {
    if (buttonIndex.response === 0) { // "Restart Now" button
      autoUpdater.quitAndInstall();
    }
  });
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();
  // Check for updates after window is created
  // It's often better to check after a short delay or user action, but for simplicity, we start here.
  autoUpdater.checkForUpdatesAndNotify();
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