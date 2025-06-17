const { contextBridge, ipcRenderer } = require('electron');
// Whitelist of channels for sending messages from renderer to main
const validSendChannels = ['user-triggered-restart-for-update', 'renderer-ready-for-updates'];
contextBridge.exposeInMainWorld('electron', {
    // --- Renderer to Main ---
    send: (channel, data) => {
        if (validSendChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        } else {
            console.warn(`[Preload] Attempted to send on invalid channel: ${channel}`);
        }
    },
    // --- Main to Renderer ---
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, ...args) => callback(...args)),
    onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', (event, ...args) => callback(...args)),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (event, ...args) => callback(...args)),
    onUpdateError: (callback) => ipcRenderer.on('update-error', (event, ...args) => callback(...args)),
    onUpdateDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, ...args) => callback(...args)),
});