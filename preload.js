const { contextBridge, ipcRenderer } = require('electron');
// Whitelist of channels for sending messages from renderer to main
const validSendChannels = ['renderer-ready-for-updates', 'quit-and-install'];
contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => {
        if (validSendChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        } else {
            console.warn(`[Preload] Attempted to send on invalid channel: ${channel}`);
        }
    },
    // --- Main to Renderer ---
    onUpdateAvailable: (callback) => {
        const listener = (event, ...args) => callback(...args);
        ipcRenderer.on('update-available', listener);
        return () => ipcRenderer.removeListener('update-available', listener);
    },
    onUpdateNotAvailable: (callback) => {
        const listener = (event, ...args) => callback(...args);
        ipcRenderer.on('update-not-available', listener);
        return () => ipcRenderer.removeListener('update-not-available', listener);
    },
    onUpdateDownloaded: (callback) => {
        const listener = (event, ...args) => callback(...args);
        ipcRenderer.on('update-downloaded', listener);
        return () => ipcRenderer.removeListener('update-downloaded', listener);
    },
    onUpdateError: (callback) => {
        const listener = (event, ...args) => callback(...args);
        ipcRenderer.on('update-error', listener);
        return () => ipcRenderer.removeListener('update-error', listener);
    },
    onUpdateDownloadProgress: (callback) => {
        const listener = (event, ...args) => callback(...args);
        ipcRenderer.on('download-progress', listener);
        return () => ipcRenderer.removeListener('download-progress', listener);
    }
});