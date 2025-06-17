const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Expose a function to the renderer process that allows it to set up a listener.
  // The callback function passed from the renderer will be invoked by this script
  // when an 'update-status' event is received from the main process.
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (event, ...args) => callback(...args)),

  // Expose a function to send a message to the main process, for example,
  // to trigger a restart after an update is downloaded.
  send: (channel, data) => {
    // Whitelist channels to prevent arbitrary IPC calls.
    const validChannels = ['user-triggered-restart-for-update', 'renderer-ready-for-updates'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  }
});